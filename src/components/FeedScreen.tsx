import { PlateSkeleton } from './Skeleton';
import { useEffect, useState } from 'react';
import type { Plate, PlateFilters } from '../types';
import { haptic } from '../lib/telegram';
import { DetailModal } from './DetailModal';
import { PlateCard } from './PlateCard';

interface FeedScreenProps {
  plates: Plate[];
  loading: boolean;
  filters: PlateFilters;
  onFiltersChange: (filters: PlateFilters) => void;
  onFav: (id: string) => void;
  onSellerClick?: (sellerId: number) => void;
}

export function FeedScreen({
  plates,
  loading,
  filters,
  onFiltersChange,
  onFav,
  onSellerClick,
}: FeedScreenProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [selected, setSelected] = useState<Plate | null>(null);

  const updateFilter = <K extends keyof PlateFilters>(key: K, value: PlateFilters[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const resetFilters = () => {
    onFiltersChange({
      search: filters.search,
      filterRegion: '',
      minPrice: '',
      maxPrice: '',
      filterLetters: '',
      filterDigits: '',
    });
  };

  const hasAdvancedFilters =
    filters.filterRegion ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.filterLetters ||
    filters.filterDigits;

  useEffect(() => {
    if (selected) {
      const updated = plates.find((p) => p.id === selected.id);
      if (updated) setSelected(updated);
    }
  }, [plates, selected?.id]);

  return (
    <div className="screen">
      <div className="header">
        <h1>🚗 Маркетплейс</h1>
        <p>Красивые автомобильные номера</p>
        <div style={{ marginTop: 12 }} className="search-wrap">
          <span className="search-icon">🔍</span>
          <input
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            placeholder="Поиск по номеру, региону..."
          />
        </div>
        <button
          className="filter-chip"
          style={{ marginTop: 8, width: '100%' }}
          onClick={() => {
            haptic('light');
            setShowFilters(!showFilters);
          }}
        >
          {showFilters ? '▲ Скрыть фильтры' : '▼ Расширенный поиск'}
        </button>
      </div>

      {showFilters && (
        <div className="filter-panel">
          <div className="input-row" style={{ marginBottom: 10 }}>
            <div>
              <label className="form-label">Буквы</label>
              <input
                value={filters.filterLetters}
                onChange={(e) => updateFilter('filterLetters', e.target.value)}
                placeholder="А, ВВ..."
              />
            </div>
            <div>
              <label className="form-label">Цифры</label>
              <input
                value={filters.filterDigits}
                onChange={(e) => updateFilter('filterDigits', e.target.value)}
                placeholder="777, 001..."
              />
            </div>
          </div>
          <div className="input-row" style={{ marginBottom: 10 }}>
            <div>
              <label className="form-label">Цена от (₽)</label>
              <input
                type="number"
                value={filters.minPrice}
                onChange={(e) => updateFilter('minPrice', e.target.value)}
                placeholder="50 000"
              />
            </div>
            <div>
              <label className="form-label">Цена до (₽)</label>
              <input
                type="number"
                value={filters.maxPrice}
                onChange={(e) => updateFilter('maxPrice', e.target.value)}
                placeholder="1 000 000"
              />
            </div>
          </div>
          <div>
            <label className="form-label">Регион</label>
            <input
              value={filters.filterRegion}
              onChange={(e) => updateFilter('filterRegion', e.target.value)}
              placeholder="77, 99, 116..."
            />
          </div>
        </div>
      )}

      <div
        style={{
          padding: '0 16px 8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span style={{ fontSize: 13, color: 'var(--tg-muted)', fontWeight: 600 }}>
          {loading ? 'Загрузка...' : `Найдено: ${plates.length} объявлений`}
        </span>
        {hasAdvancedFilters && (
          <button
            onClick={resetFilters}
            style={{
              background: 'none',
              color: 'var(--tg-red)',
              fontSize: 13,
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            ✕ Сбросить
          </button>
        )}
      </div>

      <div className="plates-grid">
        {loading ? (
          {loading ? (
  <>
    {[0,1,2,3].map(i => <PlateSkeleton key={i} />)}
  </>
) : plates.length === 0 ? (
  <div className="empty-state">
    <div className="empty-icon">🔎</div>
    <h3>Ничего не найдено</h3>
    <p>Попробуйте изменить параметры поиска</p>
  </div>
        ) : (
          plates.map((p) => (
            <PlateCard
  key={p.id}
  plate={p}
  onFav={onFav}
  onClick={setSelected}
  onSellerClick={onSellerClick}
/>
          ))
        )}
      </div>

      {selected && (
        <DetailModal
          plate={selected}
          onClose={() => setSelected(null)}
          onFav={(id) => {
            onFav(id);
            setSelected((prev) => (prev ? { ...prev, fav: !prev.fav } : null));
          }}
        />
      )}
    </div>
  );
}
