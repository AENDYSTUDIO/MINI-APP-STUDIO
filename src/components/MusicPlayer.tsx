import { useRef, useEffect, useState } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2, Repeat, Shuffle, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import AudioVisualizer from "./AudioVisualizer";
import FullscreenPlayer from "./FullscreenPlayer";
import { usePlayerStore } from "@/stores/playerStore";

/**
 * Global persistent music player.
 * Mount ONCE at the app root. The <audio> element lives here so audio
 * never cuts off when navigating between pages.
 */
const MusicPlayer = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    repeat,
    shuffle,
    visualizerStyle,
    seekRequest,
    setIsPlaying,
    togglePlay,
    next,
    previous,
    setCurrentTime,
    setDuration,
    setVolume,
    toggleRepeat,
    toggleShuffle,
    setVisualizerStyle,
    requestSeek,
    clearSeekRequest,
  } = usePlayerStore();

  // Volume sync
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume / 100;
  }, [volume]);

  // Load new track
  useEffect(() => {
    if (currentTrack && audioRef.current) {
      audioRef.current.src = currentTrack.file_path;
      audioRef.current.load();
      audioRef.current.play().then(() => setIsPlaying(true)).catch((err) => {
        console.log("Auto-play prevented:", err);
        setIsPlaying(false);
      });
    }
  }, [currentTrack?.id]);

  // Play / pause sync
  useEffect(() => {
    if (!audioRef.current || !currentTrack) return;
    if (isPlaying) {
      audioRef.current.play().catch(() => setIsPlaying(false));
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentTrack?.id]);

  // Seek request
  useEffect(() => {
    if (seekRequest != null && audioRef.current) {
      audioRef.current.currentTime = seekRequest;
      clearSeekRequest();
    }
  }, [seekRequest]);

  const formatTime = (t: number) => {
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  if (!currentTrack) {
    // Always render the audio element so the visualizer connection survives
    return <audio ref={audioRef} crossOrigin="anonymous" />;
  }

  return (
    <>
      <div className="fixed bottom-16 left-0 right-0 z-40 bg-card/95 backdrop-blur border-t border-primary/30 p-3 shadow-[0_-4px_24px_hsl(var(--neon-blue)/0.15)]">
        <audio
          ref={audioRef}
          crossOrigin="anonymous"
          onTimeUpdate={() => audioRef.current && setCurrentTime(audioRef.current.currentTime)}
          onLoadedMetadata={() => audioRef.current && setDuration(audioRef.current.duration)}
          onEnded={() => {
            if (repeat && audioRef.current) {
              audioRef.current.currentTime = 0;
              audioRef.current.play();
            } else {
              next();
            }
          }}
        />

        <div className="max-w-4xl mx-auto space-y-2">
          <div className="flex items-center gap-3">
            <div
              className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
              onClick={() => setIsFullscreen(true)}
            >
              {currentTrack.cover_url ? (
                <img
                  src={currentTrack.cover_url}
                  alt={currentTrack.title}
                  className="w-12 h-12 rounded-lg object-cover flex-shrink-0 ring-1 ring-primary/40"
                />
              ) : (
                <div
                  className="w-12 h-12 rounded-lg flex-shrink-0 ring-1 ring-primary/40"
                  style={{ background: currentTrack.cover_color }}
                />
              )}
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm truncate">{currentTrack.title}</h4>
                <p className="text-xs text-muted-foreground truncate">{currentTrack.artist}</p>
              </div>
            </div>
            <AudioVisualizer
              audioElement={audioRef.current}
              isPlaying={isPlaying}
              color={`hsl(var(--neon-pink))`}
              style={visualizerStyle}
              size="small"
            />
            <Button variant="ghost" size="icon" onClick={() => setIsFullscreen(true)} className="flex-shrink-0">
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-1">
            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={1}
              onValueChange={(v) => requestSeek(v[0])}
              className="cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 w-28">
              <Volume2 className="h-4 w-4 text-muted-foreground" />
              <Slider value={[volume]} max={100} step={1} onValueChange={(v) => setVolume(v[0])} />
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={previous}>
                <SkipBack className="h-5 w-5" />
              </Button>
              <Button
                variant="default"
                size="icon"
                className="h-11 w-11 rounded-full bg-gradient-to-br from-[hsl(var(--neon-blue))] to-[hsl(var(--neon-pink))] text-white shadow-[0_0_16px_hsl(var(--neon-pink)/0.55)]"
                onClick={togglePlay}
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={next}>
                <SkipForward className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex items-center gap-1 w-28 justify-end">
              <Button variant="ghost" size="icon" onClick={toggleRepeat} className={repeat ? "text-primary" : ""}>
                <Repeat className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={toggleShuffle} className={shuffle ? "text-accent" : ""}>
                <Shuffle className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {isFullscreen && (
        <FullscreenPlayer
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          volume={volume}
          visualizerStyle={visualizerStyle}
          audioElement={audioRef.current}
          onClose={() => setIsFullscreen(false)}
          onTogglePlay={togglePlay}
          onNext={next}
          onPrevious={previous}
          onSeek={(v) => requestSeek(v[0])}
          onVolumeChange={setVolume}
          onStyleChange={setVisualizerStyle}
        />
      )}
    </>
  );
};

export default MusicPlayer;
