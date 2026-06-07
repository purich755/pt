import { useEffect, useState } from 'react';
import { fetchUserById, fetchUserListings } from '../lib/api';
import type { Plate } from '../types';
import { PlateCard } from './PlateCard';

interface SellerScreenProps {
  sellerId: number;
  onClose: () => void;
  onFav: (id: string) => void;
}

export function SellerScreen({ sellerId, onClose, onFav }: SellerScreenProps) {
  const [user, setUser] = useState<any>(null);
  const [listings, setListings] = useState<Plate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [u, plates] = await Promise.all([
          fetchUserById(sellerId),
          fetchUserListings(sellerId),
        ]);
        setUser(u);
        setListings(plates);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [sellerId]);

  const fullName = user
    ? [user.first_name, user.last_name].filter(Boolean).join(' ')
    : '...';

  const initials = user
    ? [user.first_name?.[0], user.last_name?.[0]]
        .filter(Boolean)
        .join('')
        .toUpperCase()
    : '?';

  return (
    <div className="screen">
      <div className="header" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={onClose}
          style={{
            background: 'var(--tg-surface2)',
            border: 'none',
            borderRadius: 10,
            padding: '6px 12px',
            color: 'var(--tg-text)',
            fontWeight: 700,
            fontSize: 16,
            cursor: 'pointer',
          }}
        >
          ←
        </button>
        <div>
          <h1 style={{ fontSize: 18 }}>Профиль продавца</h1>
        </div>
      </div>

      {loading ? (
        <div className="empty-state">
          <div className="empty-icon">⏳</div>
          <h3>Загрузка...</h3>
        </div>
      ) : (
        <>
          <div style={{ textAlign: 'center', padding: '16px 16px 8px' }}>
            <div className="avatar-circle">
              {user?.photo_url ? (
                <img src={user.photo_url} alt={fullName} />
              ) : (
                initials
              )}
            </div>
            <p style={{ fontWeight: 800, fontSize: 18 }}>{fullName}</p>
            {user?.username && (
              <p style={{ color: 'var(--tg-muted)', fontSize: 14, marginTop: 2 }}>
                @{user.username}
              </p>
            )}
            <p style={{ color: 'var(--tg-muted)', fontSize: 13, marginTop: 8 }}>
              Объявлений: {listings.length}
            </p>
          </div>

          <p className="section-title">ОБЪЯВЛЕНИЯ</p>

          {listings.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <h3>Нет активных объявлений</h3>
            </div>
          ) : (
            <div className="plates-grid">
              {listings.map((p) => (
                <PlateCard key={p.id} plate={p} onFav={onFav} onClick={() => {}} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}