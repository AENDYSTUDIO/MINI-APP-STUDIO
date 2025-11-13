import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden py-20 px-4">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 blur-3xl" />
      <div className="container relative z-10 mx-auto text-center">
        <h2 className="mb-6 text-5xl font-bold leading-tight text-gradient md:text-6xl lg:text-7xl">
          Dance to the Beat
          <br />
          Feel the Rhythm
        </h2>
        <p className="mb-8 text-lg text-muted-foreground md:text-xl">
          Откройте мир танцевальной музыки и создайте свои незабываемые моменты
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Button size="lg" className="gap-2 bg-gradient-to-r from-primary to-secondary hover:opacity-90 glow-primary">
            <Play className="h-5 w-5" />
            Начать слушать
          </Button>
          <Button size="lg" variant="outline" className="border-primary/50 hover:bg-primary/10">
            Узнать больше
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
