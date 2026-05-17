import { useState, useEffect, useCallback, useMemo } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import StatsSection from "@/components/StatsSection";
import BottomNav from "@/components/BottomNav";
import UploadTrack from "@/components/UploadTrack";
import TrackCard from "@/components/TrackCard";
import TrackFilters, { defaultFilters, TrackFilterValues } from "@/components/TrackFilters";
import EditTrackDialog from "@/components/EditTrackDialog";
import { SkeletonCard } from "@/components/SkeletonCard";
import { supabase } from "@/integrations/supabase/client";
import { useTelegramAuth } from "@/hooks/useTelegramAuth";
import { useTelegramMainButton } from "@/hooks/useTelegramMainButton";
import { useToast } from "@/hooks/use-toast";
import { usePlayerStore, PlayerTrack } from "@/stores/playerStore";
import { getTelegramStartParam, parseTrackIdFromStartParam } from "@/lib/telegram";
import { Loader2 } from "lucide-react";

interface Track extends PlayerTrack {
  duration: number;
}

const Index = () => {
  const { toast } = useToast();
  const { loading: telegramLoading } = useTelegramAuth();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [editingTrackId, setEditingTrackId] = useState<string | null>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [filters, setFilters] = useState<TrackFilterValues>(defaultFilters);
  const [deepLinkLoading, setDeepLinkLoading] = useState(false);

  const playTrack = usePlayerStore((s) => s.playTrack);

  const handleMainButtonClick = useCallback(() => {
    if (user) setShowUploadDialog(true);
  }, [user]);

  useTelegramMainButton({
    text: "Загрузить трек",
    onClick: handleMainButtonClick,
    isVisible: !!user && !telegramLoading,
    isActive: !!user,
  });

  useEffect(() => {
    checkUser();
    loadTracks();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Deep-link autoplay: parse start_param / URL and autoplay track
  useEffect(() => {
    const startParam = getTelegramStartParam();
    const trackId = parseTrackIdFromStartParam(startParam);
    if (!trackId) return;

    setDeepLinkLoading(true);
    (async () => {
      const { data, error } = await supabase
        .from("tracks")
        .select("*")
        .eq("id", trackId)
        .maybeSingle();
      if (!error && data) {
        playTrack(data as any, [data as any], 0);
      }
      setDeepLinkLoading(false);
    })();
  }, [playTrack]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const loadTracks = async () => {
    try {
      const { data, error } = await supabase
        .from("tracks")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setTracks((data as any) || []);
    } catch (error: any) {
      console.error("Load tracks error:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTracks = useMemo(() => {
    return tracks.filter((t) => {
      if (t.bpm != null) {
        if (t.bpm < filters.bpmRange[0] || t.bpm > filters.bpmRange[1]) return false;
      }
      if (filters.energy !== "all" && String(t.energy_level ?? "") !== filters.energy) return false;
      if (filters.key !== "all" && (t.musical_key ?? "") !== filters.key) return false;
      return true;
    });
  }, [tracks, filters]);

  const handleToggleFavorite = async (trackId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Необходима авторизация", description: "Войдите для добавления в избранное", variant: "destructive" });
        return;
      }
      const { data: existing } = await supabase
        .from("favorites").select("id")
        .eq("user_id", user.id).eq("track_id", trackId).maybeSingle();
      if (existing) {
        await supabase.from("favorites").delete().eq("id", existing.id);
        toast({ title: "Удалено из избранного" });
      } else {
        await supabase.from("favorites").insert({ user_id: user.id, track_id: trackId });
        toast({ title: "Добавлено в избранное" });
      }
    } catch (error: any) {
      console.error("Favorite error:", error);
      toast({ title: "Ошибка", description: error.message, variant: "destructive" });
    }
  };

  if (telegramLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-40">
      <Header />
      <main className="pt-4">
        <HeroSection />

        <section className="px-4 pb-6 space-y-4">
          {user && (
            <UploadTrack
              onUploadComplete={loadTracks}
              open={showUploadDialog}
              onOpenChange={setShowUploadDialog}
            />
          )}

          <TrackFilters value={filters} onChange={setFilters} onReset={() => setFilters(defaultFilters)} />

          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Лента треков</h2>
            {deepLinkLoading && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" /> Открываем трек...
              </span>
            )}
          </div>

          {loading ? (
            <div className="space-y-2">{[...Array(5)].map((_, i) => <SkeletonCard key={i} />)}</div>
          ) : filteredTracks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {tracks.length === 0 ? `Треков пока нет. ${user ? "Загрузите первый!" : ""}` : "Ничего не найдено по фильтрам"}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTracks.map((track, index) => (
                <div key={track.id} onClick={() => playTrack(track, filteredTracks, index)} className="cursor-pointer">
                  <TrackCard
                    title={track.title}
                    artist={track.artist}
                    duration={`${Math.floor(track.duration / 60)}:${(track.duration % 60).toString().padStart(2, "0")}`}
                    coverColor={track.cover_color}
                    coverUrl={track.cover_url}
                    trackId={track.id}
                    bpm={track.bpm}
                    musicalKey={track.musical_key}
                    energyLevel={track.energy_level}
                    onFavoriteClick={() => handleToggleFavorite(track.id)}
                    onEditClick={() => setEditingTrackId(track.id)}
                    showEdit={user !== null}
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        <StatsSection />
      </main>
      <BottomNav />
      <EditTrackDialog
        trackId={editingTrackId}
        open={editingTrackId !== null}
        onOpenChange={(open) => !open && setEditingTrackId(null)}
        onTrackUpdated={loadTracks}
      />
    </div>
  );
};

export default Index;
