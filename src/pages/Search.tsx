import { useState, useEffect } from "react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import MusicPlayer from "@/components/MusicPlayer";
import TrackCard from "@/components/TrackCard";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search as SearchIcon } from "lucide-react";
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

const Search = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [tracks, setTracks] = useState<Track[]>([]);
  const [filteredTracks, setFilteredTracks] = useState<Track[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<string>("newest");

  useEffect(() => {
    loadTracks();
  }, []);

  useEffect(() => {
    let filtered = tracks;

    // Apply search filter
    if (searchQuery.trim() !== "") {
      filtered = filtered.filter(
        (track) =>
          track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          track.artist.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return 0; // Already sorted by created_at desc
        case "oldest":
          return -1;
        case "title":
          return a.title.localeCompare(b.title);
        case "artist":
          return a.artist.localeCompare(b.artist);
        case "duration":
          return a.duration - b.duration;
        default:
          return 0;
      }
    });

    setFilteredTracks(sorted);
  }, [searchQuery, tracks, sortBy]);

  const loadTracks = async () => {
    try {
      const { data, error } = await supabase
        .from('tracks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTracks(data || []);
      setFilteredTracks(data || []);
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
    if (currentTrackIndex < filteredTracks.length - 1) {
      const nextIndex = currentTrackIndex + 1;
      setCurrentTrack(filteredTracks[nextIndex]);
      setCurrentTrackIndex(nextIndex);
    }
  };

  const handlePrevious = () => {
    if (currentTrackIndex > 0) {
      const prevIndex = currentTrackIndex - 1;
      setCurrentTrack(filteredTracks[prevIndex]);
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

  return (
    <div className="min-h-screen bg-background pb-32">
      <Header />
      
      <main className="pt-4 px-4">
        <div className="mb-6 max-w-2xl mx-auto space-y-3">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Поиск треков или исполнителей..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-base"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground whitespace-nowrap">Сортировка:</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Сначала новые</SelectItem>
                <SelectItem value="oldest">Сначала старые</SelectItem>
                <SelectItem value="title">По названию</SelectItem>
                <SelectItem value="artist">По исполнителю</SelectItem>
                <SelectItem value="duration">По длительности</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <section className="max-w-2xl mx-auto">
          <h2 className="mb-3 text-xl font-semibold">
            {searchQuery ? `Результаты поиска (${filteredTracks.length})` : 'Все треки'}
          </h2>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : filteredTracks.length === 0 ? (
            <div className="text-center py-12">
              <SearchIcon className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                {searchQuery ? "Ничего не найдено" : "Треков пока нет"}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTracks.map((track, index) => (
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
        </section>
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

export default Search;
