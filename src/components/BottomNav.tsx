import { Home, Compass, Heart, User, ListMusic } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { icon: Home, label: "Главная", path: "/" },
    { icon: Compass, label: "Explore", path: "/explore" },
    { icon: ListMusic, label: "Плейлисты", path: "/playlists" },
    { icon: Heart, label: "Любимое", path: "/favorites" },
    { icon: User, label: "Профиль", path: "/profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-primary/20 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="flex items-center justify-around px-1 py-1.5">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 transition-all ${
                isActive
                  ? "text-[hsl(var(--neon-pink))] drop-shadow-[0_0_8px_hsl(var(--neon-pink)/0.6)]"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
