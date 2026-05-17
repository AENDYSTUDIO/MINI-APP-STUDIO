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
    start_param?: string;
  };
  ready: () => void;
  close: () => void;
  expand: () => void;
  showPopup: (params: { title?: string; message: string; buttons?: Array<{ type?: string; text: string; id: string }> }, callback?: (buttonId: string) => void) => void;
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
  HapticFeedback: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
    selectionChanged: () => void;
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

  if (!webApp?.initDataUnsafe?.user && import.meta.env.DEV) {
    console.log('🔧 Development mode: Using mock Telegram user');
    return {
      id: 123456789,
      first_name: 'Dev',
      last_name: 'User',
      username: 'devuser',
      language_code: 'ru',
      photo_url: undefined,
    };
  }

  return webApp?.initDataUnsafe?.user || null;
};

export const isTelegramWebApp = (): boolean => {
  return !!window.Telegram?.WebApp;
};

/**
 * Reads a start parameter from either the Telegram WebApp SDK or the URL.
 * Supports values like "trackId_<uuid>" and "<uuid>".
 */
export const getTelegramStartParam = (): string | null => {
  const wa = getTelegramWebApp();
  const sdkParam = wa?.initDataUnsafe?.start_param;
  if (sdkParam) return sdkParam;

  const url = new URL(window.location.href);
  return (
    url.searchParams.get('tgWebAppStartParam') ||
    url.searchParams.get('startapp') ||
    url.searchParams.get('start') ||
    url.searchParams.get('track') ||
    null
  );
};

/** Extracts a track UUID from a start param like "trackId_<uuid>" or a bare uuid. */
export const parseTrackIdFromStartParam = (param: string | null): string | null => {
  if (!param) return null;
  const cleaned = param.startsWith('trackId_') ? param.slice('trackId_'.length) : param;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(cleaned) ? cleaned : null;
};
