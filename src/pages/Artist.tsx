import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import TrackCard from "@/components/TrackCard";
import { SkeletonCard } from "@/components/SkeletonCard";
import { supabase } from "@/integrations/supabase/client";
import { usePlayerStore, PlayerTrack } from "@/stores/playerStore";
import { ArtistSubscribeButton } from "@/components/ArtistSubscribeButton";
import ShareButton from "@/components/ShareButton";
import { useTelegramBackButton } from "@/hooks/useTelegramBackButton";
import { Music } from "lucide-react";

interface Track extends PlayerTrack {
  duration: number;
}

const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

const Artist = () => {
  useTelegramBackButton();
  const { name } = useParams<{ name: string }>();
  const artistName = decodeURIComponent(name || "");
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const playTrack = usePlayerStore((s) => s.playTrack);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("tracks")
        .select("*")
        .eq("artist", artistName)
        .order("created_at", { ascending: false });
      setTracks((data as any) || []);
      setLoading(false);
    })();
  }, [artistName]);

  return (
    <div className="min-h-screen bg-background pb-40">
      <Header />
      <main className="pt-4 px-4 max-w-2xl mx-auto space-y-4">
        <div className="telegram-card p-6 text-center space-y-3">
          <div className="mx-auto h-24 w-24 rounded-full bg-gradient-to-br from-[hsl(var(--neon-blue))] to-[hsl(var(--neon-pink))] flex items-center justify-center shadow-[0_0_32px_hsl(var(--neon-pink)/0.5)]">
            <Music className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-2xl font-bold neon-text">{artistName}</h1>
          <p className="text-sm text-muted-foreground">{tracks.length} треков на платформе</p>
          <div className="flex justify-center gap-2">
            <ArtistSubscribeButton artistName={artistName} />
            <ShareButton title={artistName} text={`Artist: ${artistName}`} url={`${window.location.origin}/artist/${encodeURIComponent(artistName)}`} />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Треки</h2>
          {loading ? (
            <div className="space-y-2">{[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}</div>
          ) : tracks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">У этого артиста пока нет треков</div>
          ) : (
            tracks.map((track, index) => (
              <div
                key={track.id}
                className="cursor-pointer"
                onClick={() => playTrack(track, tracks, index)}
              >
                <TrackCard
                  title={track.title}
                  artist={track.artist}
                  duration={formatTime(track.duration)}
                  coverColor={track.cover_color}
                  coverUrl={track.cover_url}
                  trackId={track.id}
                  bpm={track.bpm}
                  musicalKey={track.musical_key}
                  energyLevel={track.energy_level}
                  showSubscribe={false}
                />
              </div>
            ))
          )}
        </div>
      </main>
      <BottomNav />
    </div>
  );
};

export default Artist;
