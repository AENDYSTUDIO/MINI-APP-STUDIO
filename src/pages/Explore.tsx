import { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import TrackCard from "@/components/TrackCard";
import TrackFilters, { defaultFilters, TrackFilterValues } from "@/components/TrackFilters";
import { SkeletonCard } from "@/components/SkeletonCard";
import { supabase } from "@/integrations/supabase/client";
import { usePlayerStore, PlayerTrack } from "@/stores/playerStore";
import { Compass } from "lucide-react";

interface Track extends PlayerTrack {
  duration: number;
}

const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

const Explore = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<TrackFilterValues>(defaultFilters);
  const playTrack = usePlayerStore((s) => s.playTrack);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("tracks")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error) setTracks((data as any) || []);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    return tracks.filter((t) => {
      if (t.bpm != null) {
        if (t.bpm < filters.bpmRange[0] || t.bpm > filters.bpmRange[1]) return false;
      }
      if (filters.energy !== "all" && String(t.energy_level ?? "") !== filters.energy) return false;
      if (filters.key !== "all" && (t.musical_key ?? "") !== filters.key) return false;
      return true;
    });
  }, [tracks, filters]);

  return (
    <div className="min-h-screen bg-background pb-40">
      <Header />
      <main className="pt-4 px-4 max-w-2xl mx-auto space-y-4">
        <div className="flex items-center gap-2">
          <Compass className="h-6 w-6 text-[hsl(var(--neon-pink))]" />
          <h1 className="text-2xl font-bold neon-text">Explore</h1>
        </div>
        <p className="text-sm text-muted-foreground">Найди свой саунд по BPM, тональности и энергии</p>

        <TrackFilters value={filters} onChange={setFilters} onReset={() => setFilters(defaultFilters)} />

        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">Найдено: {filtered.length}</div>
          {loading ? (
            <div className="space-y-2">{[...Array(5)].map((_, i) => <SkeletonCard key={i} />)}</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">Ничего не найдено. Поменяй фильтры.</div>
          ) : (
            filtered.map((track, index) => (
              <div
                key={track.id}
                className="cursor-pointer"
                onClick={() => playTrack(track, filtered, index)}
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

export default Explore;
