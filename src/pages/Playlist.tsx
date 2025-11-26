import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SkeletonCard } from "@/components/SkeletonCard";
import { Music, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Track {
  id: string;
  title: string;
  artist: string;
  duration: number | null;
  file_path: string;
  cover_url: string | null;
  cover_color: string | null;
}

interface PlaylistTrackRow {
  id: string;
  position: number | null;
  added_at: string;
  tracks: Track; // via foreign table mapping tracks:track_id
}

interface Playlist {
  id: string;
  name: string;
  description: string | null;
  cover_url: string | null;
  created_at: string;
}

const formatDuration = (sec?: number | null) => {
  if (!sec || sec <= 0) return "--:--";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
};

const PlaylistPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [items, setItems] = useState<PlaylistTrackRow[]>([]);

  useEffect(() => {
    if (!id) return;
    loadPlaylist(id);
  }, [id]);

  const loadPlaylist = async (playlistId: string) => {
    try {
      setLoading(true);
      // ensure auth
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      // fetch playlist meta
      const { data: playlistData, error: pErr } = await supabase
        .from("playlists")
        .select("id,name,description,cover_url,created_at")
        .eq("id", playlistId)
        .single();
      if (pErr) throw pErr;
      setPlaylist(playlistData as Playlist);

      // fetch tracks via join
      const { data: pts, error: tErr } = await supabase
        .from("playlist_tracks")
        .select("id, position, added_at, tracks:track_id ( id, title, artist, duration, file_path, cover_url, cover_color )")
        .eq("playlist_id", playlistId)
        .order("position", { ascending: true, nullsFirst: true });
      if (tErr) throw tErr;

      setItems((pts as any) || []);
    } catch (e: any) {
      console.error("Load playlist error", e);
      toast.error("Не удалось загрузить плейлист");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (trackId: string) => {
    if (!id) return;
    try {
      const { error } = await supabase
        .from("playlist_tracks")
        .delete()
        .match({ playlist_id: id, track_id: trackId });
      if (error) throw error;
      toast.success("Трек удалён из плейлиста");
      // refresh list
      await loadPlaylist(id);
    } catch (e: any) {
      console.error("Remove from playlist error", e);
      toast.error("Ошибка при удалении трека");
    }
  };

  const trackCount = useMemo(() => items.length, [items]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <Header />
        <main className="pt-4 px-4 max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Плейлист</h1>
          </div>
          <div className="grid gap-4">
            {[...Array(3)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <Header />
        <main className="pt-4 px-4 max-w-2xl mx-auto">
          <p className="text-muted-foreground">Плейлист не найден</p>
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header />
      <main className="pt-4 px-4 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">{playlist.name}</h1>
            <p className="text-sm text-muted-foreground">
              {trackCount} {trackCount === 1 ? "трек" : "треков"}
            </p>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-12">
            <Music className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Пока пусто</h3>
            <p className="text-muted-foreground">Добавьте треки в этот плейлист</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {items.map((pt) => (
              <Card key={pt.id} className="hover:bg-accent/50 transition-all">
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-14 w-14 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden"
                      style={{ background: pt.tracks.cover_color || "#111827" }}
                    >
                      {pt.tracks.cover_url ? (
                        <img
                          src={pt.tracks.cover_url}
                          alt={pt.tracks.title}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <Music className="h-6 w-6 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{pt.tracks.title}</div>
                      <div className="text-sm text-muted-foreground truncate">{pt.tracks.artist}</div>
                    </div>
                    <div className="text-xs text-muted-foreground w-12 text-right">
                      {formatDuration(pt.tracks.duration)}
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleRemove(pt.tracks.id)} title="Удалить из плейлиста">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
};

export default PlaylistPage;
