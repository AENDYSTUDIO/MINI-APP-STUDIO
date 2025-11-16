import { Sparkles, Music } from "lucide-react";
import { Button } from "@/components/ui/button";

const MemorialSection = () => {
  return (
    <section className="px-4 py-6">
      <h2 className="mb-3 text-xl font-semibold">G.Rave Memorial</h2>
      <div className="telegram-card p-4">
        <div className="mb-4 flex items-center gap-2">
          <div className="rounded-full bg-primary/10 p-2">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div className="rounded-full bg-primary/10 p-2">
            <Music className="h-5 w-5 text-primary" />
          </div>
        </div>
        <h3 className="mb-2 text-lg font-semibold">
          Вечная память в музыке
        </h3>
        <p className="mb-4 text-sm text-muted-foreground">
          3D винил визуализация с 27 дорожками свечей. Смарт контракты обеспечивают 
          98% наследования наследникам.
        </p>
        <Button className="telegram-button w-full bg-primary hover:bg-primary/90">
          Создать мемориал
        </Button>
      </div>
    </section>
  );
};

export default MemorialSection;
