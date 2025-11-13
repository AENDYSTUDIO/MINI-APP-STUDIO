import { Sparkles, Music } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const MemorialSection = () => {
  return (
    <section className="py-16 px-4">
      <div className="container mx-auto">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
            G.Rave Memorial
          </h2>
          <p className="text-lg text-muted-foreground">
            Создавайте вечные музыкальные воспоминания на блокчейне
          </p>
        </div>
        
        <Card className="overflow-hidden border-border/40 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur">
          <CardContent className="p-8 md:p-12">
            <div className="grid gap-8 md:grid-cols-2 md:items-center">
              <div>
                <div className="mb-6 flex items-center gap-3">
                  <div className="rounded-full bg-primary/20 p-3">
                    <Sparkles className="h-8 w-8 text-primary" />
                  </div>
                  <div className="rounded-full bg-secondary/20 p-3">
                    <Music className="h-8 w-8 text-secondary" />
                  </div>
                </div>
                <h3 className="mb-4 text-2xl font-bold text-foreground">
                  Вечная память в музыке
                </h3>
                <p className="mb-6 text-muted-foreground">
                  3D винил визуализация с 27 дорожками свечей. Смарт контракты обеспечивают 
                  98% наследования наследникам и надёжное хранение в IPFS.
                </p>
                <Button className="gap-2 bg-gradient-to-r from-primary to-secondary hover:opacity-90 glow-primary">
                  Создать мемориал
                </Button>
              </div>
              
              <div className="relative">
                <div className="aspect-square overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20">
                  <div className="flex h-full items-center justify-center">
                    <div className="relative">
                      <div className="absolute inset-0 animate-pulse rounded-full bg-primary/30 blur-2xl" />
                      <div className="relative h-48 w-48 rounded-full bg-gradient-to-br from-primary via-secondary to-accent shadow-2xl">
                        <div className="absolute inset-4 rounded-full bg-background/90 backdrop-blur" />
                        <div className="absolute inset-8 flex items-center justify-center rounded-full bg-gradient-to-br from-primary/50 via-secondary/50 to-accent/50">
                          <Music className="h-16 w-16 text-foreground" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default MemorialSection;
