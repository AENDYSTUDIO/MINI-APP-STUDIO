import { Play, Pause, SkipBack, SkipForward, Volume2, X, BarChart3, Waves, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import AudioVisualizer, { VisualizerStyle } from "./AudioVisualizer";

interface Track {
  id: string;
  title: string;
  artist: string;
  file_path: string;
  cover_color: string;
  cover_url?: string | null;
}

interface FullscreenPlayerProps {
  currentTrack: Track;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  visualizerStyle: VisualizerStyle;
  audioElement: HTMLAudioElement | null;
  onClose: () => void;
  onTogglePlay: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  onSeek: (value: number[]) => void;
  onVolumeChange: (value: number) => void;
  onStyleChange: (style: VisualizerStyle) => void;
}

const FullscreenPlayer = ({
  currentTrack,
  isPlaying,
  currentTime,
  duration,
  volume,
  visualizerStyle,
  audioElement,
  onClose,
  onTogglePlay,
  onNext,
  onPrevious,
  onSeek,
  onVolumeChange,
  onStyleChange,
}: FullscreenPlayerProps) => {
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-6 w-6" />
        </Button>
        <span className="text-sm text-muted-foreground">Сейчас играет</span>
        <div className="w-10" />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 gap-8">
        {/* Cover */}
        {currentTrack.cover_url ? (
          <img
            src={currentTrack.cover_url}
            alt={currentTrack.title}
            className="w-64 h-64 rounded-2xl object-cover shadow-2xl"
          />
        ) : (
          <div
            className="w-64 h-64 rounded-2xl shadow-2xl"
            style={{ background: currentTrack.cover_color }}
          />
        )}

        {/* Track Info */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">{currentTrack.title}</h2>
          <p className="text-lg text-muted-foreground">{currentTrack.artist}</p>
        </div>

        {/* Visualizer */}
        <div className="flex justify-center">
          <AudioVisualizer
            audioElement={audioElement}
            isPlaying={isPlaying}
            color={currentTrack.cover_color || "hsl(var(--primary))"}
            style={visualizerStyle}
            size="large"
          />
        </div>

        {/* Style Selector */}
        <div className="flex items-center gap-2">
          <Button
            variant={visualizerStyle === "bars" ? "default" : "ghost"}
            size="icon"
            onClick={() => onStyleChange("bars")}
          >
            <BarChart3 className="h-5 w-5" />
          </Button>
          <Button
            variant={visualizerStyle === "wave" ? "default" : "ghost"}
            size="icon"
            onClick={() => onStyleChange("wave")}
          >
            <Waves className="h-5 w-5" />
          </Button>
          <Button
            variant={visualizerStyle === "circle" ? "default" : "ghost"}
            size="icon"
            onClick={() => onStyleChange("circle")}
          >
            <Circle className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Controls */}
      <div className="p-8 space-y-6">
        {/* Progress */}
        <div className="space-y-2">
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={1}
            onValueChange={onSeek}
            className="cursor-pointer"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center justify-center gap-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={onPrevious}
            disabled={!onPrevious}
            className="h-12 w-12"
          >
            <SkipBack className="h-6 w-6" />
          </Button>
          <Button
            variant="default"
            size="icon"
            className="h-16 w-16"
            onClick={onTogglePlay}
          >
            {isPlaying ? (
              <Pause className="h-8 w-8" />
            ) : (
              <Play className="h-8 w-8" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onNext}
            disabled={!onNext}
            className="h-12 w-12"
          >
            <SkipForward className="h-6 w-6" />
          </Button>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-3 max-w-xs mx-auto">
          <Volume2 className="h-5 w-5 text-muted-foreground" />
          <Slider
            value={[volume]}
            max={100}
            step={1}
            onValueChange={(v) => onVolumeChange(v[0])}
            className="cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};

export default FullscreenPlayer;
