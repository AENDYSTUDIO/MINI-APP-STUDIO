import { Play, Heart, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import ShareButton from "@/components/ShareButton";
import { ArtistSubscribeButton } from "@/components/ArtistSubscribeButton";

interface TrackCardProps {
  title: string;
  artist: string;
  duration: string;
  coverColor: string;
  coverUrl?: string | null;
  trackId?: string;
  bpm?: number | null;
  musicalKey?: string | null;
  energyLevel?: number | null;
  onFavoriteClick?: () => void;
  onEditClick?: () => void;
  showEdit?: boolean;
  showShare?: boolean;
  showSubscribe?: boolean;
}

const TrackCard = ({
  title,
  artist,
  duration,
  coverColor,
  coverUrl,
  trackId,
  bpm,
  musicalKey,
  energyLevel,
  onFavoriteClick,
  onEditClick,
  showEdit,
  showShare = true,
  showSubscribe = true,
}: TrackCardProps) => {
  return (
    <div className="telegram-card flex items-center gap-3 p-3 transition-all active:scale-98 animate-fade-in">
      <div
        className="h-12 w-12 flex-shrink-0 rounded-lg overflow-hidden ring-1 ring-primary/30"
        style={{ background: coverUrl ? "transparent" : coverColor }}
      >
        {coverUrl && (
          <img src={coverUrl} alt={title} className="h-full w-full object-cover" loading="lazy" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-semibold">{title}</h3>
        <p className="truncate text-xs text-muted-foreground">{artist}</p>
        {(bpm || musicalKey || energyLevel) && (
          <div className="mt-1 flex flex-wrap items-center gap-1">
            {bpm && (
              <span className="rounded-full px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-[hsl(var(--neon-blue)/0.15)] text-[hsl(var(--neon-blue))]">
                {bpm} BPM
              </span>
            )}
            {musicalKey && (
              <span className="rounded-full px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-[hsl(var(--neon-green)/0.15)] text-[hsl(var(--neon-green))]">
                {musicalKey}
              </span>
            )}
            {energyLevel && (
              <span className="rounded-full px-1.5 py-0.5 text-[10px] font-semibold bg-[hsl(var(--neon-pink)/0.15)] text-[hsl(var(--neon-pink))]">
                {"⚡".repeat(energyLevel)}
              </span>
            )}
          </div>
        )}
      </div>
      <div className="flex items-center gap-1">
        <span className="text-xs text-muted-foreground font-mono">{duration}</span>
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-[hsl(var(--neon-pink))]">
          <Play className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 text-muted-foreground hover:text-[hsl(var(--neon-pink))]"
          onClick={(e) => {
            e.stopPropagation();
            onFavoriteClick?.();
          }}
        >
          <Heart className="h-4 w-4" />
        </Button>
        {showSubscribe && (
          <ArtistSubscribeButton artistName={artist} className="h-8 w-8 shrink-0 text-muted-foreground" />
        )}
        {showShare && (
          <ShareButton
            title={title}
            text={`${artist} - ${title}`}
            url={trackId ? `${window.location.origin}/?track=${trackId}` : undefined}
            className="h-8 w-8 shrink-0 text-muted-foreground hover:text-primary"
          />
        )}
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
