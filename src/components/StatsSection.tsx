import { useState, useEffect } from "react";
import { Users, Music2, Heart, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const StatsSection = () => {
  const [stats, setStats] = useState([
    {
      icon: Users,
      value: "0",
      label: "Пользователей",
    },
    {
      icon: Music2,
      value: "0",
      label: "Треков",
    },
    {
      icon: Heart,
      value: "0",
      label: "Лайков",
    },
    {
      icon: Zap,
      value: "24/7",
      label: "Онлайн",
    },
  ]);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Загружаем количество пользователей
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Загружаем количество треков
      const { count: tracksCount } = await supabase
        .from('tracks')
        .select('*', { count: 'exact', head: true });

      // Загружаем количество лайков
      const { count: likesCount } = await supabase
        .from('favorites')
        .select('*', { count: 'exact', head: true });

      setStats([
        {
          icon: Users,
          value: formatNumber(usersCount || 0),
          label: "Пользователей",
        },
        {
          icon: Music2,
          value: formatNumber(tracksCount || 0),
          label: "Треков",
        },
        {
          icon: Heart,
          value: formatNumber(likesCount || 0),
          label: "Лайков",
        },
        {
          icon: Zap,
          value: "24/7",
          label: "Онлайн",
        },
      ]);
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1).replace('.0', '') + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace('.0', '') + 'K';
    }
    return num.toString();
  };

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
