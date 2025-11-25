import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getTelegramWebApp, getTelegramUser } from "@/lib/telegram";
import { toast } from "sonner";

export const useTelegramAuth = () => {
  const [loading, setLoading] = useState(true);

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
              // Try to sign in with existing account
              const { error: signInError } = await supabase.auth.signInWithPassword({
                email: `${telegramUser.id}@telegram.user`,
                password: `tg_${telegramUser.id}`,
              });

              if (signInError) {
                // Sign up if doesn't exist
                const { error: signUpError } = await supabase.auth.signUp({
                  email: `${telegramUser.id}@telegram.user`,
                  password: `tg_${telegramUser.id}`,
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

                if (signUpError) {
                  console.error("Telegram signup error:", signUpError);
                  toast.error("Ошибка авторизации через Telegram");
                } else {
                  toast.success(`Добро пожаловать, ${telegramUser.first_name}!`);
                }
              } else {
                toast.success(`С возвращением, ${telegramUser.first_name}!`);
              }
            }
          } catch (error) {
            console.error("Telegram auth error:", error);
            toast.error("Ошибка авторизации");
          }
        }
      }
      
      setLoading(false);
    };

    initTelegramAuth();
  }, []);

  return { loading };
};
