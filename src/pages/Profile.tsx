import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Music, Heart, Upload, Edit, List } from "lucide-react";
import { toast } from "sonner";

interface UserProfile {
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  photo_url: string | null;
}

interface UserStats {
  tracksCount: number;
  favoritesCount: number;
}

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats>({ tracksCount: 0, favoritesCount: 0 });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }
      
      setUser(user);
      await loadProfile(user.id);
      await loadStats(user.id);
    } catch (error: any) {
      console.error("Auth error:", error);
      toast.error("Ошибка авторизации");
      navigate("/auth");
    } finally {
      setLoading(false);
    }
  };

  const loadProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('username, first_name, last_name, photo_url')
      .eq('id', userId)
      .single();

    if (error) {
      console.error("Profile load error:", error);
    } else {
      setProfile(data);
    }
  };

  const loadStats = async (userId: string) => {
    const [tracksResult, favoritesResult] = await Promise.all([
      supabase.from('tracks').select('id', { count: 'exact' }).eq('user_id', userId),
      supabase.from('favorites').select('id', { count: 'exact' }).eq('user_id', userId)
    ]);

    setStats({
      tracksCount: tracksResult.count || 0,
      favoritesCount: favoritesResult.count || 0
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Вы вышли из аккаунта");
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    );
  }

  const displayName = profile?.first_name 
    ? `${profile.first_name} ${profile.last_name || ''}`.trim()
    : profile?.username || "Пользователь";

  const initials = profile?.first_name 
    ? `${profile.first_name[0]}${profile.last_name?.[0] || ''}`
    : profile?.username?.[0] || "U";

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header />
      
      <main className="pt-8 px-4 max-w-2xl mx-auto">
        <Card className="mb-6">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile?.photo_url || undefined} />
                <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </div>
            <CardTitle className="text-2xl">{displayName}</CardTitle>
            {profile?.username && (
              <CardDescription className="text-base">@{profile.username}</CardDescription>
            )}
          </CardHeader>
        </Card>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 text-primary">
                <Music className="h-5 w-5" />
                <CardTitle className="text-lg">Треки</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.tracksCount}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 text-primary">
                <Heart className="h-5 w-5" />
                <CardTitle className="text-lg">Избранное</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.favoritesCount}</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-3">
          <Button 
            className="w-full" 
            variant="outline"
            onClick={() => navigate("/edit-profile")}
          >
            <Edit className="mr-2 h-4 w-4" />
            Редактировать профиль
          </Button>

          <Button 
            className="w-full" 
            variant="outline"
            onClick={() => navigate("/playlists")}
          >
            <List className="mr-2 h-4 w-4" />
            Мои плейлисты
          </Button>

          <Button
            className="w-full" 
            variant="outline"
            onClick={() => navigate("/favorites")}
          >
            <Heart className="mr-2 h-4 w-4" />
            Мои избранные
          </Button>

          <Button 
            className="w-full" 
            variant="outline"
            onClick={() => navigate("/")}
          >
            <Upload className="mr-2 h-4 w-4" />
            Мои треки
          </Button>

          <Button 
            className="w-full" 
            variant="destructive"
            onClick={handleLogout}
          >
            Выйти из аккаунта
          </Button>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Profile;
