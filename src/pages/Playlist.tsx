import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import MusicPlayer from "@/components/MusicPlayer";
import { SortableTrackItem } from "@/components/SortableTrackItem";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { SkeletonCard } from "@/components/SkeletonCard";
import { Music, Play } from "lucide-react";
import { toast } from "sonner";
import { useTelegramBackButton } from "@/hooks/useTelegramBackButton";
import ShareButton from "@/components/ShareButton";

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
  track_id: string;
  tracks: Track;
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
  useTelegramBackButton();
  
  const [loading, setLoading] = useState(true);
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [items, setItems] = useState<PlaylistTrackRow[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (!id) return;
    loadPlaylist(id);
  }, [id]);

  const loadPlaylist = async (playlistId: string) => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data: playlistData, error: pErr } = await supabase
        .from("playlists")
        .select("id,name,description,cover_url,created_at")
        .eq("id", playlistId)
        .single();
      if (pErr) throw pErr;
      setPlaylist(playlistData as Playlist);

      const { data: pts, error: tErr } = await supabase
        .from("playlist_tracks")
        .select("id, position, added_at, track_id, tracks:track_id ( id, title, artist, duration, file_path, cover_url, cover_color )")
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
      await loadPlaylist(id);
    } catch (e: any) {
      console.error("Remove from playlist error", e);
      toast.error("Ошибка при удалении трека");
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !id) return;

    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);

    const newItems = arrayMove(items, oldIndex, newIndex);
    setItems(newItems);

    // Update positions in database
    try {
      const updates = newItems.map((item, index) => ({
        id: item.id,
        playlist_id: id,
        track_id: item.track_id,
        position: index,
      }));

      for (const update of updates) {
        await supabase
          .from("playlist_tracks")
          .update({ position: update.position })
          .eq("id", update.id);
      }
    } catch (error) {
      console.error("Update positions error:", error);
      toast.error("Ошибка при сохранении порядка");
      loadPlaylist(id);
    }
  };

  const handlePlayTrack = (track: Track, index: number) => {
    setCurrentTrack({
      ...track,
      cover_color: track.cover_color || "hsl(207, 90%, 50%)",
    });
    setCurrentTrackIndex(index);
  };

  const handlePlayAll = () => {
    if (items.length > 0) {
      handlePlayTrack(items[0].tracks, 0);
    }
  };

  const handleNext = () => {
    if (currentTrackIndex < items.length - 1) {
      const nextIndex = currentTrackIndex + 1;
      handlePlayTrack(items[nextIndex].tracks, nextIndex);
    }
  };

  const handlePrevious = () => {
    if (currentTrackIndex > 0) {
      const prevIndex = currentTrackIndex - 1;
      handlePlayTrack(items[prevIndex].tracks, prevIndex);
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
    <div className="min-h-screen bg-background pb-32">
      <Header />
      <main className="pt-4 px-4 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">{playlist.name}</h1>
            <p className="text-sm text-muted-foreground">
              {trackCount} {trackCount === 1 ? "трек" : "треков"}
            </p>
          </div>
          <div className="flex gap-2">
            <ShareButton
              title={playlist.name}
              text={playlist.description || `Плейлист: ${playlist.name}`}
              url={`${window.location.origin}/playlist/${playlist.id}`}
            />
            {items.length > 0 && (
              <Button onClick={handlePlayAll}>
                <Play className="h-4 w-4 mr-2" />
                Воспроизвести
              </Button>
            )}
          </div>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-12">
            <Music className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Пока пусто</h3>
            <p className="text-muted-foreground">Добавьте треки в этот плейлист</p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={items.map((item) => item.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="grid gap-3">
                {items.map((pt, index) => (
                  <SortableTrackItem
                    key={pt.id}
                    id={pt.id}
                    track={pt.tracks}
                    isPlaying={currentTrack?.id === pt.tracks.id}
                    onPlay={() => handlePlayTrack(pt.tracks, index)}
                    onRemove={() => handleRemove(pt.tracks.id)}
                    formatDuration={formatDuration}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
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

export default PlaylistPage;
