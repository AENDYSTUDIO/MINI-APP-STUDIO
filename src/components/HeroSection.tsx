import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <section className="px-4 py-6">
      <div className="telegram-card overflow-hidden p-6">
        <div className="mb-4 flex items-center justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <Play className="h-10 w-10 text-primary" />
          </div>
        </div>
        <h2 className="mb-2 text-center text-2xl font-bold">
          Создано с  для сообщества драм-н-бейс
        </h2>
        <p className="mb-4 text-center text-sm text-muted-foreground">
          У нас есть ритм, который заставит тебя подпрыгнуть!
        </p>
        <Button className="telegram-button w-full bg-primary hover:bg-primary/90">
          Начать слушать
        </Button>
      </div>
    </section>
  );
};

export default HeroSection;
