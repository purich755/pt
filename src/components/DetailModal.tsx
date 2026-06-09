import type { Plate } from '../types';
import { haptic, openTgProfile } from '../lib/telegram';
import { formatPrice } from '../utils/format';
import { RuPlate } from './RuPlate';

interface DetailModalProps {
  plate: Plate | null;
  onClose: () => void;
  onFav: (id: string) => void;
}

export function DetailModal({ plate, onClose, onFav }: DetailModalProps) {
  if (!plate) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-handle" />
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <RuPlate
            letters={plate.letters}
            digits={plate.digits}
            series={plate.series}
            region={plate.region}
            size="lg"
          />
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 16,
          }}
        >
          <span style={{ fontSize: 26, fontWeight: 800 }}>{formatPrice(plate.price)}</span>
          <button
            className="heart-btn"
            onClick={() => {
              haptic('medium');
              onFav(plate.id);
            }}
            style={{ fontSize: 24 }}
          >
            {plate.fav ? '❤️' : '🤍'}
          </button>
        </div>
        <div
          className="card"
          style={{
            marginBottom: 14,
            marginLeft: 0,
            marginRight: 0,
            background: 'var(--tg-surface2)',
          }}
        >
          <p style={{ fontWeight: 700, marginBottom: 4, fontSize: 14, color: 'var(--tg-muted)' }}>
            ОПИСАНИЕ
          </p>
          <p style={{ lineHeight: 1.6, color: '#ffffff' }}>{plate.desc}</p>
        </div>
        <div
          className="card"
          style={{
            marginBottom: 16,
            marginLeft: 0,
            marginRight: 0,
            background: 'var(--tg-surface2)',
          }}
        >
          <p style={{ fontWeight: 700, marginBottom: 8, fontSize: 14, color: 'var(--tg-muted)' }}>
            ДЕТАЛИ
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, color: '#ffffff' }}>
            <div>
              <p style={{ fontSize: 12, color: 'var(--tg-muted)' }}>Серия</p>
              <p style={{ fontWeight: 700, fontSize: 16 }}>
                {plate.letters} ●●● {plate.series}
              </p>
            </div>
            <div>
              <p style={{ fontSize: 12, color: 'var(--tg-muted)' }}>Цифры</p>
              <p style={{ fontWeight: 700, fontSize: 16 }}>{plate.digits}</p>
            </div>
            <div>
              <p style={{ fontSize: 12, color: 'var(--tg-muted)' }}>Регион</p>
              <p style={{ fontWeight: 700, fontSize: 16 }}>{plate.region}</p>
            </div>
            <div>
              <p style={{ fontSize: 12, color: 'var(--tg-muted)' }}>Продавец</p>
              <p style={{ fontWeight: 700, fontSize: 16 }}>@{plate.seller}</p>
            </div>
          </div>
        </div>
        <button
          className="btn-primary"
          style={{ marginBottom: 10 }}
          onClick={() => {
            haptic('light');
            openTgProfile(plate.seller);
          }}
        >
          💬 Связаться с продавцом
        </button>
        <button
          className="btn-secondary"
          style={{ width: '100%', marginBottom: 10 }}
          onClick={() => {
            haptic('light');
            const text = `🚗 Номер ${plate.letters} ${plate.digits} ${plate.series} | Регион ${plate.region}\n💰 ${formatPrice(plate.price)}\n📝 ${plate.desc}\n👤 Продавец: @${plate.seller}`;
            const url = `https://t.me/share/url?url=https://t.me/avtonomera_bot&text=${encodeURIComponent(text)}`;
            (window.Telegram?.WebApp as any)?.openLink?.(url);
          }}
        >
          📤 Поделиться
        </button>
        <button className="btn-secondary" style={{ width: '100%' }} onClick={onClose}>
          Закрыть
        </button>
      </div>
    </div>
  );
}
