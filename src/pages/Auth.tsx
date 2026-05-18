import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Music2 } from "lucide-react";
import { z } from "zod";
import { isTelegramWebApp } from "@/lib/telegram";
import { lovable } from "@/integrations/lovable";
import { TelegramLoginButton } from "@/components/TelegramLoginButton";

const emailSchema = z.string().email("Некорректный email");
const passwordSchema = z.string().min(6, "Пароль должен быть не менее 6 символов");

const Auth = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        navigate("/");
        return;
      }
      
      // Auto-login in dev mode
      if (import.meta.env.DEV) {
        console.log("🔧 Dev mode: Attempting auto-login...");
        const devEmail = "dev@normaldance.local";
        const devPassword = "devpassword123";
        
        // Try to sign in
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: devEmail,
          password: devPassword,
        });
        
        if (signInError) {
          console.log("🔧 Dev user doesn't exist, creating...");
          // Create dev user
          const { error: signUpError } = await supabase.auth.signUp({
            email: devEmail,
            password: devPassword,
          });
          
          if (signUpError) {
            console.error("❌ Failed to create dev user:", signUpError);
          } else {
            console.log("✅ Dev user created and logged in");
            toast.success("Добро пожаловать в режим разработки!");
          }
        } else {
          console.log("✅ Dev user logged in");
          toast.success("Автоматический вход в режиме разработки");
        }
      }
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          navigate("/");
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  const validateForm = () => {
    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      }
      return false;
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/`;
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) {
        if (error.message.includes("already registered")) {
          toast.error("Пользователь уже зарегистрирован. Попробуйте войти.");
        } else {
          toast.error(error.message);
        }
      } else {
        toast.success("Регистрация успешна! Перенаправление...");
        setTimeout(() => navigate("/"), 1000);
      }
    } catch (error) {
      toast.error("Произошла ошибка при регистрации");
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          toast.error("Неверный email или пароль");
        } else {
          toast.error(error.message);
        }
      } else {
        toast.success("Вход выполнен успешно!");
        navigate("/");
      }
    } catch (error) {
      toast.error("Произошла ошибка при входе");
    } finally {
      setLoading(false);
    }
  };

  const inTelegram = isTelegramWebApp();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-border/40 bg-card/50 backdrop-blur">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <Music2 className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-gradient">
            NORMAL DANCE
          </CardTitle>
          <CardDescription>
            {inTelegram 
              ? "Авторизация через Telegram..." 
              : isLogin ? "Войдите в свой аккаунт" : "Создайте новый аккаунт"}
          </CardDescription>
          {!inTelegram && import.meta.env.DEV && (
            <div className="mt-2 text-xs text-yellow-500 border border-yellow-500/30 rounded p-2 bg-yellow-500/10">
              🔧 Режим разработки: Используйте email/пароль или откройте в Telegram
            </div>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={isLogin ? handleSignIn : handleSignUp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Загрузка..." : isLogin ? "Войти" : "Зарегистрироваться"}
            </Button>
          </form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">или</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={loading}
            onClick={async () => {
              setLoading(true);
              const result = await lovable.auth.signInWithOAuth("google", {
                redirect_uri: window.location.origin,
              });
              if (result.error) {
                toast.error("Ошибка входа через Google");
                setLoading(false);
                return;
              }
              if (result.redirected) return;
              navigate("/");
            }}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Войти через Google
          </Button>

          <div className="mt-3">
            <TelegramLoginButton
              botUsername="aendy_studio_bot"
              onSuccess={() => navigate("/")}
            />
          </div>

          <div className="mt-4 text-center text-sm">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary hover:underline"
              disabled={loading}
            >
              {isLogin ? "Нет аккаунта? Зарегистрируйтесь" : "Уже есть аккаунт? Войдите"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
