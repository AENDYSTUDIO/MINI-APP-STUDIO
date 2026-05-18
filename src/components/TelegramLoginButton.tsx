import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TelegramAuthUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

declare global {
  interface Window {
    onTelegramAuth?: (user: TelegramAuthUser) => void;
  }
}

interface Props {
  botUsername: string;
  onSuccess?: () => void;
}

export const TelegramLoginButton = ({ botUsername, onSuccess }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.onTelegramAuth = async (user) => {
      try {
        const { data, error } = await supabase.functions.invoke("telegram-login", {
          body: user,
        });
        if (error || !data?.token_hash) {
          toast.error("Не удалось войти через Telegram");
          return;
        }
        const { error: otpErr } = await supabase.auth.verifyOtp({
          type: "magiclink",
          token_hash: data.token_hash,
        });
        if (otpErr) {
          toast.error(otpErr.message);
          return;
        }
        toast.success(`Добро пожаловать, ${user.first_name ?? ""}!`);
        onSuccess?.();
      } catch (e) {
        toast.error("Ошибка авторизации Telegram");
      }
    };

    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.async = true;
    script.setAttribute("data-telegram-login", botUsername);
    script.setAttribute("data-size", "large");
    script.setAttribute("data-radius", "8");
    script.setAttribute("data-onauth", "onTelegramAuth(user)");
    script.setAttribute("data-request-access", "write");
    containerRef.current?.appendChild(script);

    return () => {
      if (containerRef.current) containerRef.current.innerHTML = "";
      delete window.onTelegramAuth;
    };
  }, [botUsername, onSuccess]);

  return <div ref={containerRef} className="flex justify-center" />;
};
