import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ShareButtonProps {
  title: string;
  text: string;
  url?: string;
  className?: string;
  variant?: "default" | "ghost" | "outline";
  size?: "default" | "sm" | "lg" | "icon";
}

export const ShareButton = ({ 
  title, 
  text, 
  url, 
  className,
  variant = "ghost",
  size = "icon"
}: ShareButtonProps) => {
  const shareUrl = url || window.location.href;

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Try Telegram WebApp share first
    const tg = window.Telegram?.WebApp;
    if (tg) {
      const shareText = `${title}\n${text}\n${shareUrl}`;
      // Use Telegram's native share
      if (navigator.share) {
        try {
          await navigator.share({
            title,
            text,
            url: shareUrl,
          });
          return;
        } catch (err) {
          // User cancelled or error, try clipboard
        }
      }
      
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(shareText);
        toast.success("Ссылка скопирована!");
      } catch {
        toast.error("Не удалось скопировать");
      }
      return;
    }

    // Web Share API
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(`${title}\n${shareUrl}`);
        toast.success("Ссылка скопирована!");
      } catch {
        toast.error("Не удалось скопировать");
      }
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleShare}
      title="Поделиться"
    >
      <Share2 className="h-4 w-4" />
      {size !== "icon" && <span className="ml-1">Поделиться</span>}
    </Button>
  );
};

export default ShareButton;
