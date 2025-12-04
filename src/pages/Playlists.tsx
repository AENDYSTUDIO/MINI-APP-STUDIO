import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Music } from "lucide-react";
import { toast } from "sonner";
import CreatePlaylistDialog from "@/components/CreatePlaylistDialog";
import { SkeletonCard } from "@/components/SkeletonCard";
import ShareButton from "@/components/ShareButton";

interface PlaylistRow {
  id: string;
  name: string;
  description: string | null;
  cover_url: string | null;
  created_at: string;
  playlist_tracks?: { id: string }[];
}

interface Playlist extends Omit<PlaylistRow, 'playlist_tracks'> {
  track_count: number;
}

const Playlists = () => {
  const navigate = useNavigate();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  useEffect(() => {
    checkAuthAndLoad();
  }, []);

  const checkAuthAndLoad = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }
      await loadPlaylists();
    } catch (error) {
      console.error("Auth error:", error);
      navigate("/auth");
    }
  };

  const loadPlaylists = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: playlistsData, error } = await supabase
        .from('playlists')
        .select('id,name,description,cover_url,created_at, playlist_tracks ( id )')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const playlistsWithCount: Playlist[] = (playlistsData as PlaylistRow[]).map((pl) => ({
        id: pl.id,
        name: pl.name,
        description: pl.description,
        cover_url: pl.cover_url,
        created_at: pl.created_at,
        track_count: pl.playlist_tracks?.length || 0,
      }));

      setPlaylists(playlistsWithCount);
    } catch (error: any) {
      console.error("Load playlists error:", error);
      toast.error("Ошибка загрузки плейлистов");
    } finally {
      setLoading(false);
    }
  };

  const handlePlaylistCreated = () => {
    setShowCreateDialog(false);
    loadPlaylists();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <Header />
        <main className="pt-4 px-4 max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Мои плейлисты</h1>
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

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header />
      
      <main className="pt-4 px-4 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Мои плейлисты</h1>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Создать
          </Button>
        </div>

        {playlists.length === 0 ? (
          <div className="text-center py-12">
            <Music className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Нет плейлистов</h3>
            <p className="text-muted-foreground mb-4">
              Создайте свой первый плейлист
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Создать плейлист
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {playlists.map((playlist) => (
              <Card
                key={playlist.id}
                className="cursor-pointer hover:bg-accent/50 transition-all duration-200 hover:scale-[1.02] animate-fade-in"
                onClick={() => navigate(`/playlist/${playlist.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      {playlist.cover_url ? (
                        <img
                          src={playlist.cover_url}
                          alt={playlist.name}
                          className="h-full w-full object-cover rounded-lg"
                          loading="lazy"
                        />
                      ) : (
                        <Music className="h-8 w-8 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{playlist.name}</h3>
                      {playlist.description && (
                        <p className="text-sm text-muted-foreground truncate">
                          {playlist.description}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {playlist.track_count} {playlist.track_count === 1 ? 'трек' : 'треков'}
                      </p>
                    </div>
                    <ShareButton
                      title={playlist.name}
                      text={playlist.description || `Плейлист: ${playlist.name}`}
                      url={`${window.location.origin}/playlist/${playlist.id}`}
                      className="h-10 w-10"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <CreatePlaylistDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onPlaylistCreated={handlePlaylistCreated}
      />

      <BottomNav />
    </div>
  );
};

export default Playlists;
