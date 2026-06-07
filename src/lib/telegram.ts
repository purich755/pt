import type { TgUser } from '../types';

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready: () => void;
        expand: () => void;
        disableVerticalSwipes: () => void;
        initDataUnsafe: {
          user?: {
            id: number;
            first_name?: string;
            last_name?: string;
            username?: string;
            photo_url?: string;
            is_premium?: boolean;
            language_code?: string;
          };
        };
        HapticFeedback?: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy') => void;
          notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
        };
        openTelegramLink: (url: string) => void;
        showConfirm: (message: string, cb: (ok: boolean) => void) => void;
      };
    };
  }
}

export const tgApp = window.Telegram?.WebApp;

if (tgApp) {
  tgApp.ready();
  tgApp.expand();
  tgApp.disableVerticalSwipes();
}

export function getTgUser(): TgUser {
  if (tgApp?.initDataUnsafe?.user) {
    const u = tgApp.initDataUnsafe.user;
    return {
      id: u.id,
      firstName: u.first_name || '',
      lastName: u.last_name || '',
      username: u.username || '',
      photoUrl: u.photo_url || null,
      isPremium: u.is_premium || false,
      langCode: u.language_code || 'ru',
    };
  }

  return {
    id: 0,
    firstName: 'Александр',
    lastName: 'Волков',
    username: 'alex_volkov',
    photoUrl: null,
    isPremium: false,
    langCode: 'ru',
  };
}

export function haptic(type: 'light' | 'medium' | 'success' | 'error' | 'warning') {
  if (!tgApp?.HapticFeedback) return;

  if (type === 'light') tgApp.HapticFeedback.impactOccurred('light');
  if (type === 'medium') tgApp.HapticFeedback.impactOccurred('medium');
  if (type === 'success') tgApp.HapticFeedback.notificationOccurred('success');
  if (type === 'error') tgApp.HapticFeedback.notificationOccurred('error');
  if (type === 'warning') tgApp.HapticFeedback.notificationOccurred('warning');
}

export function openTgProfile(username: string) {
  if (tgApp && username) {
    tgApp.openTelegramLink(`https://t.me/${username}`);
  } else {
    window.open(`tg://resolve?domain=${username}`, '_blank');
  }
}

export function tgConfirm(message: string, cb: (ok: boolean) => void) {
  if (tgApp?.showConfirm) {
    tgApp.showConfirm(message, cb);
  } else {
    cb(window.confirm(message));
  }
}
