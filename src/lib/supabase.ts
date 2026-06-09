import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

export function getSupabaseConfigError(): string | null {
  if (!supabaseUrl || supabaseUrl.includes('your-project-id')) {
    return 'Не задан VITE_SUPABASE_URL. Скопируйте Project URL из Supabase → Settings → API.';
  }

  if (!supabaseAnonKey || supabaseAnonKey.includes('your-anon-key')) {
    return 'Не задан VITE_SUPABASE_ANON_KEY. Скопируйте ключ «anon public» из Supabase → Settings → API.';
  }

  if (supabaseAnonKey.startsWith('sb_secret_')) {
    return (
      'В .env указан secret-ключ (sb_secret_...). Для фронтенда нужен публичный ключ: ' +
      '«anon public» (начинается с eyJ) или «publishable» (sb_publishable_...). ' +
      'Secret-ключ нельзя использовать в браузере.'
    );
  }

  if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('.supabase.co')) {
    return 'VITE_SUPABASE_URL выглядит неверно. Должен быть вида https://xxxxx.supabase.co';
  }

  return null;
}

export function formatSupabaseError(err: unknown): string {
  const message =
    err && typeof err === 'object' && 'message' in err
      ? String((err as { message: string }).message)
      : String(err);

  if (message.includes('relation') && message.includes('does not exist')) {
    return (
      'Таблицы в базе не созданы. Откройте Supabase → SQL Editor и выполните ' +
      'файл supabase/migrations/001_initial_schema.sql'
    );
  }

  if (
    message.includes('Invalid API key') ||
    message.includes('JWT') ||
    message.includes('401') ||
    message.includes('Unauthorized')
  ) {
    return 'Неверный API-ключ. Проверьте VITE_SUPABASE_ANON_KEY — нужен «anon public», не secret.';
  }

  if (message.includes('Failed to fetch') || message.includes('NetworkError')) {
    return 'Нет сети или неверный URL проекта Supabase.';
  }

  return message || 'Неизвестная ошибка подключения к Supabase.';
}

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!client) {
    client = createClient(
      supabaseUrl || 'https://placeholder.supabase.co',
      supabaseAnonKey || 'placeholder-key',
    );
  }
  return client;
}

/** @deprecated используйте getSupabase() */
export const supabase = getSupabase();

export interface DbUser {
  id: number;
  first_name: string;
  last_name: string;
  username: string;
  photo_url: string | null;
  created_at: string;
}

export interface DbPlate {
  id: string;
  seller_id: number;
  letters: string;
  digits: string;
  series: string;
  region: string;
  price: number;
  description: string;
  status: 'active' | 'sold';
  created_at: string;
   views: number;
  users?: DbUser | DbUser[] | null;
}

export interface DbFavorite {
  id: string;
  user_id: number;
  plate_id: string;
  created_at: string;
}
