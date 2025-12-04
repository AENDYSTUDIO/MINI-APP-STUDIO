import { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getTelegramWebApp } from "@/lib/telegram";

export const useTelegramBackButton = (enabled: boolean = true) => {
  const navigate = useNavigate();
  const webApp = getTelegramWebApp();

  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  useEffect(() => {
    if (!webApp || !enabled) return;

    const backButton = webApp.BackButton;
    
    backButton.onClick(handleBack);
    backButton.show();

    return () => {
      backButton.offClick(handleBack);
      backButton.hide();
    };
  }, [webApp, enabled, handleBack]);

  return { isSupported: !!webApp };
};
