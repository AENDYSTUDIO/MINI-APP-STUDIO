import { Bell, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useArtistSubscription } from "@/hooks/useArtistSubscription";

interface ArtistSubscribeButtonProps {
  artistName: string;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
}

export const ArtistSubscribeButton = ({
  artistName,
  className,
  size = "icon",
}: ArtistSubscribeButtonProps) => {
  const { isSubscribed, loading, toggleSubscription } = useArtistSubscription(artistName);

  return (
    <Button
      variant="ghost"
      size={size}
      className={className}
      onClick={(e) => {
        e.stopPropagation();
        toggleSubscription();
      }}
      disabled={loading}
      title={isSubscribed ? "Отписаться от исполнителя" : "Подписаться на исполнителя"}
    >
      {isSubscribed ? (
        <Bell className="h-4 w-4 text-primary fill-primary" />
      ) : (
        <BellOff className="h-4 w-4" />
      )}
    </Button>
  );
};
