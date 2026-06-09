import type { Plate } from '../types';
import { haptic } from '../lib/telegram';
import { formatPrice } from '../utils/format';
import { RuPlate } from './RuPlate';

interface PlateCardProps {
  plate: Plate;
  onFav: (id: string) => void;
  onClick: (plate: Plate) => void;
  onSellerClick?: (sellerId: number) => void;
}

export function PlateCard({ plate, onFav, onClick, onSellerClick }: PlateCardProps) {
  return (
    <div
      className="plate-card"
      onClick={() => {
        haptic('light');
        onClick(plate);
      }}
    >
      <div className="plate-visual">
        <RuPlate
          letters={plate.letters}
          digits={plate.digits}
          series={plate.series}
          region={plate.region}
          size="md"
        />
      </div>
      <div className="price-row">
        <span className="price">{formatPrice(plate.price)}</span>
        <button
          className="heart-btn"
          onClick={(e) => {
            e.stopPropagation();
            haptic('medium');
            onFav(plate.id);
          }}
          aria-label="В избранное"
        >
          {plate.fav ? '❤️' : '🤍'}
        </button>
      </div>
      <p className="plate-desc">{plate.desc}</p>
      <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <span className="badge">🗺️ Регион {plate.region}</span>
        <span className="badge">👁 {plate.views}</span>
        <button
  className="badge"
  style={{ cursor: 'pointer', color: 'var(--tg-blue)', border: 'none', background: 'var(--tg-surface2)' }}
  onClick={(e) => {
    e.stopPropagation();
    e.preventDefault();
    haptic('light');
    console.log('seller click', plate.sellerId, onSellerClick);
    if (plate.sellerId) onSellerClick?.(plate.sellerId);
  }}
>
  👤 {plate.sellerName}
</button>
      </div>
    </div>
  );
}
