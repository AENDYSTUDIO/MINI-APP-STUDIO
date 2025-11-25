import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import MusicPlayer from "@/components/MusicPlayer";
import TrackCard from "@/components/TrackCard";
import { SkeletonCard } from "@/components/SkeletonCard";
import { supabase } from "@/integrations/supabase/client";
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

const Favorites = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkUser();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          loadFavorites();
        } else {
          navigate("/auth");
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }
    setUser(user);
    loadFavorites();
  };

  const loadFavorites = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: favorites, error: favError } = await supabase
        .from('favorites')
        .select('track_id')
        .eq('user_id', user.id);

      if (favError) throw favError;

      if (favorites && favorites.length > 0) {
        const trackIds = favorites.map(f => f.track_id);
        const { data: tracksData, error: tracksError } = await supabase
          .from('tracks')
          .select('*')
          .in('id', trackIds)
          .order('created_at', { ascending: false });

        if (tracksError) throw tracksError;
        setTracks(tracksData || []);
      } else {
        setTracks([]);
      }
    } catch (error: any) {
      console.error("Load favorites error:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить избранное",
        variant: "destructive",
      });
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
      if (!user) return;

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
        
        // Обновляем список
        loadFavorites();
      }
    } catch (error: any) {
      console.error("Favorite error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      <Header />
      <main className="pt-4 px-4">
        <h1 className="text-2xl font-bold mb-6">Избранное</h1>
        
        {loading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : tracks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">Избранных треков пока нет</p>
            <button
              onClick={() => navigate("/")}
              className="text-primary hover:underline"
            >
              Перейти к списку треков
            </button>
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
                  onFavoriteClick={() => handleToggleFavorite(track.id)}
                />
              </div>
            ))}
          </div>
        )}
      </main>
      <BottomNav />
      <MusicPlayer
        currentTrack={currentTrack}
        onNext={handleNext}
        onPrevious={handlePrevious}
      />
    </div>
  );
};

export default Favorites;
