import { SellerScreen } from './components/SellerScreen';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { NewPlateData, Plate, PlateFilters, TgUser } from './types';
import {
  createPlate,
  deletePlate,
  fetchFavoriteIds,
  fetchFavoritePlates,
  fetchMyListings,
  fetchPlates,
  fetchSoldCount,
  toggleFavorite,
  updatePlatePrice,
  upsertUser,
} from './lib/api';
import { getTgUser, haptic } from './lib/telegram';
import { formatSupabaseError, getSupabaseConfigError } from './lib/supabase';
import { AddScreen } from './components/AddScreen';
import { DetailModal } from './components/DetailModal';
import { FavScreen } from './components/FavScreen';
import { FeedScreen } from './components/FeedScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { SellerScreen } from './components/SellerScreen';

const EMPTY_FILTERS: PlateFilters = {
  search: '',
  filterRegion: '',
  minPrice: '',
  maxPrice: '',
  filterLetters: '',
  filterDigits: '',
};

export default function App() {
  const [tab, setTab] = useState(0);
  const [tgUser] = useState<TgUser>(() => getTgUser());
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [plates, setPlates] = useState<Plate[]>([]);
  const [myListings, setMyListings] = useState<Plate[]>([]);
  const [favoritePlates, setFavoritePlates] = useState<Plate[]>([]);
  const [filters, setFilters] = useState<PlateFilters>(EMPTY_FILTERS);
  const [detailPlate, setDetailPlate] = useState<Plate | null>(null);
  const [sellerProfileId, setSellerProfileId] = useState<number | null>(null);
  const [loadingFeed, setLoadingFeed] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingFavs, setLoadingFavs] = useState(true);
  const [soldCount, setSoldCount] = useState(0);
  const [ready, setReady] = useState(false);
  const [initError, setInitError] = useState('');

  const tabs = useMemo(
    () => [
      { label: 'Лента', icon: '🏠' },
      { label: 'Продать', icon: '➕' },
      { label: 'Избранное', icon: '❤️' },
      { label: 'Профиль', icon: '👤' },
    ],
    [],
  );

  const loadFavorites = useCallback(async (userId: number) => {
    const ids = await fetchFavoriteIds(userId);
    setFavoriteIds(ids);
    return ids;
  }, []);

  const loadFeed = useCallback(
    async (currentFilters: PlateFilters, favIds: Set<string>) => {
      setLoadingFeed(true);
      try {
        const data = await fetchPlates(currentFilters, favIds);
        setPlates(data);
      } finally {
        setLoadingFeed(false);
      }
    },
    [],
  );

  const loadMyListings = useCallback(async (userId: number, favIds: Set<string>) => {
    setLoadingProfile(true);
    try {
      const data = await fetchMyListings(userId, favIds);
      setMyListings(data);
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  const loadFavoritePlates = useCallback(async (userId: number) => {
    setLoadingFavs(true);
    try {
      const data = await fetchFavoritePlates(userId);
      setFavoritePlates(data);
    } finally {
      setLoadingFavs(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const configError = getSupabaseConfigError();
      if (configError) {
        if (!cancelled) setInitError(configError);
        return;
      }

      try {
        await upsertUser(tgUser);
        const sold = await fetchSoldCount(tgUser.id);
setSoldCount(sold);
        const favIds = await loadFavorites(tgUser.id);
        if (cancelled) return;

        await Promise.all([
          loadFeed(EMPTY_FILTERS, favIds),
          loadMyListings(tgUser.id, favIds),
          loadFavoritePlates(tgUser.id),
        ]);

        if (!cancelled) setReady(true);
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setInitError(formatSupabaseError(err));
        }
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, [tgUser, loadFavorites, loadFeed, loadMyListings, loadFavoritePlates]);

  useEffect(() => {
    if (!ready) return;

    const timer = setTimeout(() => {
      loadFeed(filters, favoriteIds);
    }, 300);

    return () => clearTimeout(timer);
  }, [filters, favoriteIds, ready, loadFeed]);

  const refreshAll = useCallback(
    async (favIds?: Set<string>) => {
      const ids = favIds ?? favoriteIds;
      await Promise.all([
        loadFeed(filters, ids),
        loadMyListings(tgUser.id, ids),
        loadFavoritePlates(tgUser.id),
      ]);
    },
    [favoriteIds, filters, loadFeed, loadMyListings, loadFavoritePlates, tgUser.id],
  );

  const handleToggleFav = useCallback(
    async (plateId: string) => {
      const isFav = favoriteIds.has(plateId);
      haptic('medium');

      try {
        const nowFav = await toggleFavorite(tgUser.id, plateId, isFav);
        const nextIds = new Set(favoriteIds);
        if (nowFav) nextIds.add(plateId);
        else nextIds.delete(plateId);
        setFavoriteIds(nextIds);

        setPlates((prev) =>
          prev.map((p) => (p.id === plateId ? { ...p, fav: nowFav } : p)),
        );
        setMyListings((prev) =>
          prev.map((p) => (p.id === plateId ? { ...p, fav: nowFav } : p)),
        );
        await loadFavoritePlates(tgUser.id);
      } catch (err) {
        console.error(err);
        haptic('error');
      }
    },
    [favoriteIds, loadFavoritePlates, tgUser.id],
  );

  const handleAddListing = useCallback(
    async (data: NewPlateData) => {
      await createPlate(tgUser.id, data);
      await refreshAll();
    },
    [refreshAll, tgUser.id],
  );

  const handleDeleteListing = useCallback(
    async (id: string) => {
      await deletePlate(id);
      const nextIds = new Set(favoriteIds);
      nextIds.delete(id);
      setFavoriteIds(nextIds);
      await refreshAll(nextIds);
    },
    [favoriteIds, refreshAll],
  );

  const handleEditPrice = useCallback(
    async (id: string, price: number) => {
      await updatePlatePrice(id, price);
      await refreshAll();
    },
    [refreshAll],
  );

  if (initError) {
    return (
      <div className="screen" style={{ padding: 24 }}>
        <div className="empty-state">
          <div className="empty-icon">⚠️</div>
          <h3>Ошибка подключения</h3>
          <p>{initError}</p>
          <p style={{ marginTop: 12, fontSize: 13, lineHeight: 1.5 }}>
            1. Supabase → <strong>Settings → API</strong><br />
            2. Скопируйте <strong>Project URL</strong> → <code>VITE_SUPABASE_URL</code><br />
            3. Скопируйте <strong>anon public</strong> (начинается с <code>eyJ</code>) →{' '}
            <code>VITE_SUPABASE_ANON_KEY</code><br />
            4. Выполните SQL из <code>supabase/migrations/001_initial_schema.sql</code><br />
            5. Перезапустите <code>npm run dev</code>
          </p>
        </div>
      </div>
    );
  }

  return (
   <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
  <div style={{ flex: 1, position: 'relative' }}>
        {tab === 0 && sellerProfileId === null && (
  <FeedScreen
    plates={plates}
    loading={loadingFeed || !ready}
    filters={filters}
    onFiltersChange={setFilters}
    onFav={handleToggleFav}
    onSellerClick={setSellerProfileId}
  />
)}
{tab === 0 && sellerProfileId !== null && (
  <SellerScreen
    sellerId={sellerProfileId}
    onClose={() => setSellerProfileId(null)}
    onFav={handleToggleFav}
  />
)}
        )}
        {tab === 1 && <AddScreen onAdd={handleAddListing} />}
        {tab === 2 && (
          <FavScreen
            plates={favoritePlates}
            loading={loadingFavs || !ready}
            onFav={handleToggleFav}
            onClick={setDetailPlate}
          />
        )}
        {tab === 3 && (
          <ProfileScreen
  myListings={myListings}
  soldCount={soldCount}
  loading={loadingProfile || !ready}
            tgUser={tgUser}
            onDelete={handleDeleteListing}
            onPriceEdit={handleEditPrice}
          />
        )}
      </div>

      {detailPlate && (
        <DetailModal
          plate={detailPlate}
          onClose={() => setDetailPlate(null)}
          onFav={(id) => {
            handleToggleFav(id);
            setDetailPlate((prev) => (prev ? { ...prev, fav: !prev.fav } : null));
          }}
        />
      )}

      <nav className="bottom-nav">
        {tabs.map((t, i) => (
          <button
            key={t.label}
            className={`nav-item${tab === i ? ' active' : ''}`}
            onClick={() => {
              haptic('light');
              setTab(i);
            }}
          >
            <span className="nav-icon">{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
