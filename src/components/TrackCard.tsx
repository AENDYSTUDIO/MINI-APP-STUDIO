import { Play, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface TrackCardProps {
  title: string;
  artist: string;
  duration: string;
  coverColor: string;
}

const TrackCard = ({ title, artist, duration, coverColor }: TrackCardProps) => {
  return (
    <Card className="group overflow-hidden border-border/40 bg-card/50 backdrop-blur transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20">
      <CardContent className="p-0">
        <div className="relative aspect-square overflow-hidden">
          <div 
            className="h-full w-full transition-transform duration-500 group-hover:scale-110"
            style={{ 
              background: `linear-gradient(135deg, ${coverColor}, ${adjustColor(coverColor, 20)})`
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
            <Button size="icon" className="h-16 w-16 rounded-full bg-primary text-primary-foreground shadow-lg glow-primary">
              <Play className="h-8 w-8 ml-1" fill="currentColor" />
            </Button>
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="truncate font-semibold text-foreground">{title}</h3>
              <p className="truncate text-sm text-muted-foreground">{artist}</p>
            </div>
            <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground hover:text-primary">
              <Heart className="h-5 w-5" />
            </Button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">{duration}</p>
        </div>
      </CardContent>
    </Card>
  );
};

// Helper function to adjust color brightness
const adjustColor = (color: string, amount: number) => {
  return color.replace(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/, (_, h, s, l) => {
    return `hsl(${h}, ${s}%, ${Math.min(100, parseInt(l) + amount)}%)`;
  });
};

export default TrackCard;
