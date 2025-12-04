import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useArtistSubscription = (artistName: string) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSubscription();
  }, [artistName]);

  const checkSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("artist_subscriptions")
        .select("id")
        .eq("user_id", user.id)
        .eq("artist_name", artistName)
        .maybeSingle();

      if (error) throw error;
      setIsSubscribed(!!data);
    } catch (error) {
      console.error("Check subscription error:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSubscription = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Необходима авторизация");
        return;
      }

      if (isSubscribed) {
        const { error } = await supabase
          .from("artist_subscriptions")
          .delete()
          .eq("user_id", user.id)
          .eq("artist_name", artistName);

        if (error) throw error;
        setIsSubscribed(false);
        toast.success(`Вы отписались от ${artistName}`);
      } else {
        const { error } = await supabase
          .from("artist_subscriptions")
          .insert({ user_id: user.id, artist_name: artistName });

        if (error) throw error;
        setIsSubscribed(true);
        toast.success(`Вы подписались на ${artistName}`);
      }
    } catch (error: any) {
      console.error("Toggle subscription error:", error);
      toast.error("Ошибка при изменении подписки");
    }
  }, [artistName, isSubscribed]);

  return { isSubscribed, loading, toggleSubscription };
};
