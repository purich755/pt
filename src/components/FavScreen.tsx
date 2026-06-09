import { PlateSkeleton } from './Skeleton';
import type { Plate } from '../types';
import { PlateCard } from './PlateCard';

interface FavScreenProps {
  plates: Plate[];
  loading: boolean;
  onFav: (id: string) => void;
  onClick: (plate: Plate) => void;
}

export function FavScreen({ plates, loading, onFav, onClick }: FavScreenProps) {
  return (
    <div className="screen">
      <div className="header">
        <h1>❤️ Избранное</h1>
        <p>
          {loading
            ? 'Загрузка...'
            : plates.length > 0
              ? `${plates.length} сохранённых номеров`
              : 'Пока ничего не добавлено'}
        </p>
      </div>
      {loading ? (
  <div className="plates-grid">
    {[0,1,2].map(i => <PlateSkeleton key={i} />)}
  </div>
      ) : plates.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🤍</div>
          <h3>Избранное пусто</h3>
          <p>Нажмите ❤️ на карточке, чтобы сохранить номер</p>
        </div>
      ) : (
        <div className="plates-grid">
          {plates.map((p) => (
            <PlateCard key={p.id} plate={p} onFav={onFav} onClick={onClick} />
          ))}
        </div>
      )}
    </div>
  );
}
