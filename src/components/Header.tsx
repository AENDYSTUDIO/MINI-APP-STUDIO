import { Music2, LogOut, Heart, User as UserIcon } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Profile {
  username?: string;
  first_name?: string;
  photo_url?: string;
}

const Header = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const loadProfile = async (userId: string) => {
      const { data } = await supabase
        .from("profiles")
        .select("username, first_name, photo_url")
        .eq("id", userId)
        .single();
      
      if (data) {
        setProfile(data);
      }
    };

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        loadProfile(user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          loadProfile(session.user.id);
        } else {
          setProfile(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Вы вышли из аккаунта");
    navigate("/auth");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background backdrop-blur">
      <div className="flex h-14 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <Music2 className="h-6 w-6 text-primary" />
          <h1 className="text-lg font-semibold">NORMAL DANCE</h1>
        </Link>
        
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/favorites")}
                title="Избранное"
              >
                <Heart className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/profile")}
                title="Профиль"
              >
                {profile?.photo_url ? (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile.photo_url} alt={profile.first_name || "User"} />
                    <AvatarFallback>
                      {profile.first_name?.[0] || <UserIcon className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <UserIcon className="h-5 w-5" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                title="Выйти"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <Button
              variant="ghost"
              onClick={() => navigate("/auth")}
            >
              Войти
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
