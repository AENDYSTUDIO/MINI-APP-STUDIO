import { Users, Music2, Heart, Zap } from "lucide-react";

const StatsSection = () => {
  const stats = [
    {
      icon: Users,
      value: "50K+",
      label: "Пользователей",
    },
    {
      icon: Music2,
      value: "10K+",
      label: "Треков",
    },
    {
      icon: Heart,
      value: "1M+",
      label: "Лайков",
    },
    {
      icon: Zap,
      value: "24/7",
      label: "Онлайн",
    },
  ];

  return (
    <section className="px-4 pb-20">
      <div className="telegram-card p-4">
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="mb-2 flex justify-center">
                <div className="rounded-full bg-primary/10 p-3">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="mb-1 text-xl font-bold">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
