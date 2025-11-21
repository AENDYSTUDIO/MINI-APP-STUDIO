// Telegram WebApp SDK types
interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    user?: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
      language_code?: string;
      photo_url?: string;
    };
  };
  ready: () => void;
  close: () => void;
  expand: () => void;
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    show: () => void;
    hide: () => void;
    enable: () => void;
    disable: () => void;
    setText: (text: string) => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
  };
  BackButton: {
    isVisible: boolean;
    show: () => void;
    hide: () => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
  };
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

export const getTelegramWebApp = (): TelegramWebApp | null => {
  return window.Telegram?.WebApp || null;
};

export const getTelegramUser = () => {
  const webApp = getTelegramWebApp();
  return webApp?.initDataUnsafe?.user || null;
};

export const isTelegramWebApp = (): boolean => {
  return !!window.Telegram?.WebApp;
};
