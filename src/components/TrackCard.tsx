import { Play, Heart, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TrackCardProps {
  title: string;
  artist: string;
  duration: string;
  coverColor: string;
  coverUrl?: string | null;
  onFavoriteClick?: () => void;
  onEditClick?: () => void;
  showEdit?: boolean;
}

const TrackCard = ({ title, artist, duration, coverColor, coverUrl, onFavoriteClick, onEditClick, showEdit }: TrackCardProps) => {
  return (
    <div className="telegram-card flex items-center gap-3 p-3 transition-all active:scale-98">
      <div
        className="h-12 w-12 flex-shrink-0 rounded-lg overflow-hidden"
        style={{ background: coverUrl ? 'transparent' : coverColor }}
      >
        {coverUrl && (
          <img src={coverUrl} alt={title} className="h-full w-full object-cover" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-medium">{title}</h3>
        <p className="truncate text-xs text-muted-foreground">{artist}</p>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">{duration}</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
        >
          <Play className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 text-muted-foreground hover:text-primary"
          onClick={(e) => {
            e.stopPropagation();
            onFavoriteClick?.();
          }}
        >
          <Heart className="h-4 w-4" />
        </Button>
        {showEdit && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              onEditClick?.();
            }}
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default TrackCard;
