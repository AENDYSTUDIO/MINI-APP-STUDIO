import { Users, Music2, Heart, Zap } from "lucide-react";

const StatsSection = () => {
  const stats = [
    {
      icon: Users,
      value: "50K+",
      label: "Активных пользователей",
      color: "text-primary",
    },
    {
      icon: Music2,
      value: "10K+",
      label: "Треков в библиотеке",
      color: "text-secondary",
    },
    {
      icon: Heart,
      value: "1M+",
      label: "Лайков от фанатов",
      color: "text-accent",
    },
    {
      icon: Zap,
      value: "24/7",
      label: "Музыка без остановки",
      color: "text-primary",
    },
  ];

  return (
    <section className="py-16 px-4">
      <div className="container mx-auto">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="group rounded-2xl border border-border/40 bg-card/50 p-6 text-center backdrop-blur transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10"
            >
              <div className="mb-4 flex justify-center">
                <div className="rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 p-4 transition-transform group-hover:scale-110">
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </div>
              <div className="mb-2 text-3xl font-bold text-foreground md:text-4xl">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
