import { useState, useEffect, useCallback } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import StatsSection from "@/components/StatsSection";
import BottomNav from "@/components/BottomNav";
import MusicPlayer from "@/components/MusicPlayer";
import UploadTrack from "@/components/UploadTrack";
import TrackCard from "@/components/TrackCard";
import EditTrackDialog from "@/components/EditTrackDialog";
import { SkeletonCard } from "@/components/SkeletonCard";
import { supabase } from "@/integrations/supabase/client";
import { useTelegramAuth } from "@/hooks/useTelegramAuth";
import { useTelegramMainButton } from "@/hooks/useTelegramMainButton";
import { useToast } from "@/hooks/use-toast";

interface Track {
  id: string;
  title: string;
  artist: string;
  duration: number;
  file_path: string;
  cover_color: string;
  cover_url: string | null;
}

const Index = () => {
  const { toast } = useToast();
  const { loading: telegramLoading } = useTelegramAuth();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [editingTrackId, setEditingTrackId] = useState<string | null>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);

  const handleMainButtonClick = useCallback(() => {
    if (user) {
      setShowUploadDialog(true);
    }
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const loadTracks = async () => {
    try {
      const { data, error } = await supabase
        .from('tracks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTracks(data || []);
    } catch (error: any) {
      console.error("Load tracks error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayTrack = (track: Track, index: number) => {
    setCurrentTrack(track);
    setCurrentTrackIndex(index);
  };

  const handleNext = () => {
    if (currentTrackIndex < tracks.length - 1) {
      const nextIndex = currentTrackIndex + 1;
      setCurrentTrack(tracks[nextIndex]);
      setCurrentTrackIndex(nextIndex);
    }
  };

  const handlePrevious = () => {
    if (currentTrackIndex > 0) {
      const prevIndex = currentTrackIndex - 1;
      setCurrentTrack(tracks[prevIndex]);
      setCurrentTrackIndex(prevIndex);
    }
  };

  const handleToggleFavorite = async (trackId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Необходима авторизация",
          description: "Войдите для добавления в избранное",
          variant: "destructive",
        });
        return;
      }

      const { data: existing } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('track_id', trackId)
        .single();

      if (existing) {
        await supabase
          .from('favorites')
          .delete()
          .eq('id', existing.id);
        
        toast({
          title: "Удалено из избранного",
        });
      } else {
        await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            track_id: trackId,
          });
        
        toast({
          title: "Добавлено в избранное",
        });
      }
    } catch (error: any) {
      console.error("Favorite error:", error);
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
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
    <div className="min-h-screen bg-background pb-32">
      <Header />
      <main className="pt-4">
        <HeroSection />
        
        <section className="px-4 pb-6">
          {user && (
            <div className="mb-4">
              <UploadTrack 
                onUploadComplete={loadTracks} 
                open={showUploadDialog}
                onOpenChange={setShowUploadDialog}
              />
            </div>
          )}
          
          <h2 className="mb-3 text-xl font-semibold">
            Все треки
          </h2>
          
          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : tracks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Треков пока нет. {user && "Загрузите первый!"}
            </div>
          ) : (
            <div className="space-y-2">
              {tracks.map((track, index) => (
                <div
                  key={track.id}
                  onClick={() => handlePlayTrack(track, index)}
                  className="cursor-pointer"
                >
                  <TrackCard
                    title={track.title}
                    artist={track.artist}
                    duration={`${Math.floor(track.duration / 60)}:${(track.duration % 60).toString().padStart(2, '0')}`}
                    coverColor={track.cover_color}
                    coverUrl={track.cover_url}
                    trackId={track.id}
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
      <MusicPlayer
        currentTrack={currentTrack}
        onNext={handleNext}
        onPrevious={handlePrevious}
      />
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
