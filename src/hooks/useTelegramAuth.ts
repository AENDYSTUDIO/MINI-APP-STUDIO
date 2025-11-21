import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { getTelegramWebApp, getTelegramUser } from "@/lib/telegram";
import { toast } from "@/hooks/use-toast";

export const useTelegramAuth = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initTelegramAuth = async () => {
      const webApp = getTelegramWebApp();
      
      if (webApp) {
        webApp.ready();
        webApp.expand();
        
        const telegramUser = getTelegramUser();
        
        if (telegramUser) {
          try {
            // Check if user exists
            const { data: { session } } = await supabase.auth.getSession();
            
            if (!session) {
              // Sign up with Telegram data
              const { data, error } = await supabase.auth.signUp({
                email: `${telegramUser.id}@telegram.user`,
                password: `tg_${telegramUser.id}_${Date.now()}`,
                options: {
                  data: {
                    telegram_id: telegramUser.id,
                    username: telegramUser.username,
                    first_name: telegramUser.first_name,
                    last_name: telegramUser.last_name,
                    photo_url: telegramUser.photo_url,
                  },
                },
              });

              if (error) {
                // Try to sign in if user already exists
                const { error: signInError } = await supabase.auth.signInWithPassword({
                  email: `${telegramUser.id}@telegram.user`,
                  password: `tg_${telegramUser.id}_${Date.now()}`,
                });

                if (signInError) {
                  toast({
                    title: "Ошибка авторизации",
                    description: "Не удалось войти через Telegram",
                    variant: "destructive",
                  });
                }
              }
            }
          } catch (error) {
            console.error("Telegram auth error:", error);
          }
        }
      }
      
      setLoading(false);
    };

    initTelegramAuth();
  }, [navigate]);

  return { loading };
};
