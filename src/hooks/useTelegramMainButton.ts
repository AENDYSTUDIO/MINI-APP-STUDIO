import { useEffect, useCallback } from "react";
import { getTelegramWebApp } from "@/lib/telegram";

interface UseTelegramMainButtonOptions {
  text: string;
  onClick: () => void;
  isVisible?: boolean;
  isActive?: boolean;
}

export const useTelegramMainButton = ({
  text,
  onClick,
  isVisible = true,
  isActive = true,
}: UseTelegramMainButtonOptions) => {
  const webApp = getTelegramWebApp();

  useEffect(() => {
    if (!webApp) return;

    const mainButton = webApp.MainButton;
    mainButton.setText(text);
    
    if (isActive) {
      mainButton.enable();
    } else {
      mainButton.disable();
    }

    if (isVisible) {
      mainButton.show();
    } else {
      mainButton.hide();
    }

    mainButton.onClick(onClick);

    return () => {
      mainButton.offClick(onClick);
      mainButton.hide();
    };
  }, [webApp, text, onClick, isVisible, isActive]);

  const show = useCallback(() => {
    webApp?.MainButton.show();
  }, [webApp]);

  const hide = useCallback(() => {
    webApp?.MainButton.hide();
  }, [webApp]);

  const setText = useCallback((newText: string) => {
    webApp?.MainButton.setText(newText);
  }, [webApp]);

  return { show, hide, setText, isSupported: !!webApp };
};
