import type { NewPlateData, Plate, PlateFilters, TgUser } from '../types';
import { getSupabase, type DbPlate } from './supabase';

const supabase = getSupabase();

function getSeller(dbPlate: DbPlate) {
  const user = Array.isArray(dbPlate.users) ? dbPlate.users[0] : dbPlate.users;
  return {
    seller: user?.username || `user_${dbPlate.seller_id}`,
    sellerName:
      [user?.first_name, user?.last_name].filter(Boolean).join(' ') || 'Продавец',
  };
}

export function mapDbPlate(dbPlate: DbPlate, favoriteIds: Set<string>): Plate {
  const { seller, sellerName } = getSeller(dbPlate);
  return {
    id: dbPlate.id,
    letters: dbPlate.letters,
    digits: dbPlate.digits,
    series: dbPlate.series,
    region: dbPlate.region,
    price: dbPlate.price,
    desc: dbPlate.description,
    seller,
    sellerName,
    fav: favoriteIds.has(dbPlate.id),
    sellerId: dbPlate.seller_id,
  };
}

export async function upsertUser(user: TgUser) {
  const { error } = await supabase.from('users').upsert(
    {
      id: user.id,
      first_name: user.firstName,
      last_name: user.lastName,
      username: user.username,
      photo_url: user.photoUrl,
    },
    { onConflict: 'id' },
  );

  if (error) throw error;
}

export async function fetchFavoriteIds(userId: number): Promise<Set<string>> {
  const { data, error } = await supabase
    .from('favorites')
    .select('plate_id')
    .eq('user_id', userId);

  if (error) throw error;
  return new Set((data || []).map((row) => row.plate_id as string));
}

export async function fetchPlates(
  filters: PlateFilters,
  favoriteIds: Set<string>,
): Promise<Plate[]> {
  let query = supabase
    .from('plates')
    .select('*, users(first_name, last_name, username)')
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (filters.filterRegion.trim()) {
    query = query.eq('region', filters.filterRegion.trim());
  }

  if (filters.minPrice.trim()) {
    query = query.gte('price', Number(filters.minPrice));
  }

  if (filters.maxPrice.trim()) {
    query = query.lte('price', Number(filters.maxPrice));
  }

  if (filters.filterLetters.trim()) {
    const letters = filters.filterLetters.trim().toUpperCase();
    query = query.or(`letters.eq.${letters},series.ilike.%${letters}%`);
  }

  if (filters.filterDigits.trim()) {
    query = query.ilike('digits', `%${filters.filterDigits.trim()}%`);
  }

  if (filters.search.trim()) {
    const q = filters.search.trim();
    query = query.or(
      `letters.ilike.%${q}%,digits.ilike.%${q}%,series.ilike.%${q}%,region.ilike.%${q}%,description.ilike.%${q}%`,
    );
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data as DbPlate[]).map((plate) => mapDbPlate(plate, favoriteIds));
}

export async function fetchMyListings(
  userId: number,
  favoriteIds: Set<string>,
): Promise<Plate[]> {
  const { data, error } = await supabase
    .from('plates')
    .select('*, users(first_name, last_name, username)')
    .eq('seller_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data as DbPlate[]).map((plate) => mapDbPlate(plate, favoriteIds));
}

export async function fetchFavoritePlates(userId: number): Promise<Plate[]> {
  const { data, error } = await supabase
    .from('favorites')
    .select(
      'plate_id, plates(*, users(first_name, last_name, username))',
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data || [])
    .map((row) => {
     const plate = (row.plates as unknown) as DbPlate | null;
      if (!plate || plate.status !== 'active') return null;
      return mapDbPlate(plate, new Set([plate.id]));
    })
    .filter((plate): plate is Plate => plate !== null);
}

export async function createPlate(userId: number, data: NewPlateData): Promise<Plate> {
  const { data: inserted, error } = await supabase
    .from('plates')
    .insert({
      seller_id: userId,
      letters: data.letters,
      digits: data.digits,
      series: data.series,
      region: data.region,
      price: data.price,
      description: data.desc || 'Новое объявление. Быстрая сделка.',
      status: 'active',
    })
    .select('*, users(first_name, last_name, username)')
    .single();

  if (error) throw error;
  return mapDbPlate(inserted as DbPlate, new Set());
}

export async function updatePlatePrice(plateId: string, price: number) {
  const { error } = await supabase.from('plates').update({ price }).eq('id', plateId);
  if (error) throw error;
}

export async function deletePlate(plateId: string) {
  const { error } = await supabase.from('plates').delete().eq('id', plateId);
  if (error) throw error;
}

export async function toggleFavorite(
  userId: number,
  plateId: string,
  isFavorite: boolean,
) {
  if (isFavorite) {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('plate_id', plateId);
    if (error) throw error;
    return false;
  }

  const { error } = await supabase.from('favorites').insert({
    user_id: userId,
    plate_id: plateId,
  });
  if (error) throw error;
  return true;
}
export async function fetchSoldCount(userId: number): Promise<number> {
  const { count, error } = await supabase
    .from('plates')
    .select('*', { count: 'exact', head: true })
    .eq('seller_id', userId)
    .eq('status', 'sold');
  if (error) throw error;
  return count || 0;
}