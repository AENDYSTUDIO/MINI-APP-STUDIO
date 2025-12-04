import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GripVertical, Music, Trash2, Play } from "lucide-react";

interface Track {
  id: string;
  title: string;
  artist: string;
  duration: number | null;
  file_path: string;
  cover_url: string | null;
  cover_color: string | null;
}

interface SortableTrackItemProps {
  id: string;
  track: Track;
  isPlaying?: boolean;
  onPlay: () => void;
  onRemove: () => void;
  formatDuration: (sec?: number | null) => string;
}

export const SortableTrackItem = ({
  id,
  track,
  isPlaying,
  onPlay,
  onRemove,
  formatDuration,
}: SortableTrackItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`hover:bg-accent/50 transition-all ${isPlaying ? "ring-2 ring-primary" : ""}`}
    >
      <CardContent className="p-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="cursor-grab active:cursor-grabbing touch-none"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </Button>
          <div
            className="h-14 w-14 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden cursor-pointer"
            style={{ background: track.cover_color || "#111827" }}
            onClick={onPlay}
          >
            {track.cover_url ? (
              <img
                src={track.cover_url}
                alt={track.title}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            ) : (
              <Music className="h-6 w-6 text-primary" />
            )}
          </div>
          <div className="flex-1 min-w-0 cursor-pointer" onClick={onPlay}>
            <div className="font-medium truncate">{track.title}</div>
            <div className="text-sm text-muted-foreground truncate">{track.artist}</div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onPlay}
            className={isPlaying ? "text-primary" : ""}
          >
            <Play className="h-4 w-4" />
          </Button>
          <div className="text-xs text-muted-foreground w-12 text-right">
            {formatDuration(track.duration)}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onRemove}
            title="Удалить из плейлиста"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
