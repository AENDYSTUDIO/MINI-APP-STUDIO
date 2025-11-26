import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getTelegramWebApp, getTelegramUser } from "@/lib/telegram";
import { toast } from "sonner";

export const useTelegramAuth = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initTelegramAuth = async () => {
      console.log("🚀 Starting Telegram auth...");
      const webApp = getTelegramWebApp();
      
      // Initialize Telegram WebApp if available
      if (webApp) {
        console.log("✅ Telegram WebApp detected");
        webApp.ready();
        webApp.expand();
      } else {
        console.log("⚠️ No Telegram WebApp, checking for dev mode...");
      }
      
      // Get Telegram user (real or mock in dev mode)
      const telegramUser = getTelegramUser();
      console.log("👤 Telegram user:", telegramUser);
      
      if (telegramUser) {
        try {
          // Check if user exists
          const { data: { session } } = await supabase.auth.getSession();
          console.log("🔐 Current session:", session ? "exists" : "none");
          
          if (!session) {
            console.log(`🔑 Attempting sign in for ${telegramUser.id}@telegram.user`);
            // Try to sign in with existing account
            const { error: signInError } = await supabase.auth.signInWithPassword({
              email: `${telegramUser.id}@telegram.user`,
              password: `tg_${telegramUser.id}`,
            });

            if (signInError) {
              console.log("❌ Sign in failed, attempting sign up...", signInError.message);
              // Sign up if doesn't exist
              const { error: signUpError, data: signUpData } = await supabase.auth.signUp({
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
                console.error("❌ Telegram signup error:", signUpError);
                toast.error(`Ошибка авторизации: ${signUpError.message}`);
              } else {
                console.log("✅ Sign up successful:", signUpData);
                toast.success(`Добро пожаловать, ${telegramUser.first_name}!`);
              }
            } else {
              console.log("✅ Sign in successful");
              toast.success(`С возвращением, ${telegramUser.first_name}!`);
            }
          } else {
            console.log("✅ Already authenticated");
          }
        } catch (error) {
          console.error("❌ Telegram auth error:", error);
          toast.error("Ошибка авторизации");
        }
      } else {
        console.log("⚠️ No Telegram user found");
      }
      
      setLoading(false);
      console.log("🏁 Auth process completed");
    };

    initTelegramAuth();
  }, []);

  return { loading };
};
