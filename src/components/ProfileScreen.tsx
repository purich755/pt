import { ListingSkeleton, ProfileSkeleton } from './Skeleton';
import { useState } from 'react';
import type { Plate, TgUser } from '../types';
import { haptic, tgConfirm } from '../lib/telegram';
import { formatPrice } from '../utils/format';
import { RuPlate } from './RuPlate';

interface ProfileScreenProps {
  myListings: Plate[];
  soldCount: number;
  loading: boolean;
  tgUser: TgUser;
  onDelete: (id: string) => Promise<void>;
  onPriceEdit: (id: string, price: number) => Promise<void>;
  onMarkSold: (id: string) => Promise<void>;
}

export function ProfileScreen({
  myListings,
  soldCount,
  loading,
  tgUser,
  onDelete,
  onPriceEdit,
  onMarkSold,
}: ProfileScreenProps) {
  const [editId, setEditId] = useState<string | null>(null);
  const [newPrice, setNewPrice] = useState('');
  const [toast, setToast] = useState('');

  const fullName = [tgUser.firstName, tgUser.lastName].filter(Boolean).join(' ');
  const initials =
    [tgUser.firstName[0], tgUser.lastName ? tgUser.lastName[0] : '']
      .filter(Boolean)
      .join('')
      .toUpperCase() || '??';

  const savePrice = async (id: string) => {
    if (!newPrice || Number(newPrice) <= 0) return;
    try {
      await onPriceEdit(id, Number(newPrice));
      setEditId(null);
      setNewPrice('');
      haptic('success');
      setToast('Цена обновлена!');
      setTimeout(() => setToast(''), 2500);
    } catch {
      haptic('error');
      setToast('Ошибка обновления цены');
      setTimeout(() => setToast(''), 2500);
    }
  };

  const handleDelete = (id: string) => {
    tgConfirm('Удалить объявление?', async (ok) => {
      if (!ok) return;
      try {
        haptic('warning');
        await onDelete(id);
        setToast('Объявление удалено');
        setTimeout(() => setToast(''), 2500);
      } catch {
        haptic('error');
        setToast('Ошибка удаления');
        setTimeout(() => setToast(''), 2500);
      }
    });
  };

  const handleMarkSold = (id: string) => {
    tgConfirm('Отметить как продано?', async (ok) => {
      if (!ok) return;
      try {
        haptic('success');
        await onMarkSold(id);
        setToast('✅ Отмечено как продано!');
        setTimeout(() => setToast(''), 2500);
      } catch {
        haptic('error');
        setToast('Ошибка');
        setTimeout(() => setToast(''), 2500);
      }
    });
  };

  return (
    <div className="screen">
      <div className="header">
        <h1>👤 Профиль</h1>
        <p>Ваши объявления и настройки</p>
      </div>

      {loading ? (
        <>
          <ProfileSkeleton />
          <p className="section-title">МОИ ОБЪЯВЛЕНИЯ</p>
          {[0, 1, 2].map(i => <ListingSkeleton key={i} />)}
        </>
      ) : (
        <>
          <div style={{ textAlign: 'center', padding: '10px 16px 0' }}>
            <div className="avatar-circle">
              {tgUser.photoUrl ? (
                <img src={tgUser.photoUrl} alt={fullName} />
              ) : (
                initials
              )}
            </div>
            <p style={{ fontWeight: 800, fontSize: 18 }}>{fullName}</p>
            {tgUser.username && (
              <p style={{ color: 'var(--tg-muted)', fontSize: 14, marginTop: 2 }}>
                @{tgUser.username}
              </p>
            )}
            {tgUser.isPremium && (
              <span
                style={{
                  display: 'inline-block',
                  marginTop: 6,
                  background: 'rgba(255,215,0,.15)',
                  color: '#ffd60a',
                  fontSize: 12,
                  fontWeight: 700,
                  padding: '3px 10px',
                  borderRadius: 20,
                }}
              >
                ⭐ Premium
              </span>
            )}
            <div className="stat-row">
              <div className="stat-card">
                <div className="stat-num">{myListings.length}</div>
                <div className="stat-lbl">Активных</div>
              </div>
              <div className="stat-card">
                <div className="stat-num" style={{ color: 'var(--tg-green)', fontSize: 14 }}>
                  {myListings.reduce((s, p) => s + p.price, 0).toLocaleString('ru-RU')} ₽
                </div>
                <div className="stat-lbl">Сумма</div>
              </div>
              <div className="stat-card">
                <div className="stat-num" style={{ color: 'var(--tg-yellow)' }}>
                  {soldCount}
                </div>
                <div className="stat-lbl">Продано</div>
              </div>
            </div>
          </div>

          <p className="section-title">МОИ ОБЪЯВЛЕНИЯ</p>

          {myListings.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <h3>Нет объявлений</h3>
              <p>Подайте объявление через вкладку «Продать»</p>
            </div>
          ) : (
            myListings.map((p) => (
              <div key={p.id} className="listing-item">
                <div style={{ flexShrink: 0 }}>
                  <RuPlate
                    letters={p.letters}
                    digits={p.digits}
                    series={p.series}
                    region={p.region}
                    size="sm"
                  />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {editId === p.id ? (
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <input
                        type="number"
                        value={newPrice}
                        onChange={(e) => setNewPrice(e.target.value)}
                        placeholder="Новая цена"
                        style={{ fontSize: 13, padding: '6px 10px' }}
                      />
                      <button
                        onClick={() => savePrice(p.id)}
                        style={{
                          background: 'var(--tg-green)',
                          color: '#fff',
                          padding: '6px 10px',
                          borderRadius: 8,
                          fontWeight: 700,
                          fontSize: 13,
                          flexShrink: 0,
                        }}
                      >
                        ✓
                      </button>
                      <button
                        onClick={() => setEditId(null)}
                        style={{
                          background: 'var(--tg-surface3)',
                          color: 'var(--tg-text)',
                          padding: '6px 10px',
                          borderRadius: 8,
                          fontWeight: 700,
                          fontSize: 13,
                          flexShrink: 0,
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <>
                     <>
                  <p style={{ fontWeight: 700, fontSize: 15 }}>{formatPrice(p.price)}</p>
                  <p
                    style={{
                      color: 'var(--tg-muted)',
                      fontSize: 12,
                      marginTop: 2,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {p.desc}
                  </p>
                  <p style={{ color: 'var(--tg-muted)', fontSize: 11, marginTop: 3 }}>
                    👁 {p.views} просмотров
                  </p>
                </>
                  )}
                </div>
                {editId !== p.id && (
                  <div className="listing-actions">
                    <button
                      className="btn-secondary"
                      style={{ padding: '6px 10px', fontSize: 12 }}
                      onClick={() => {
                        haptic('light');
                        setEditId(p.id);
                        setNewPrice(String(p.price));
                      }}
                    >
                      ✏️
                    </button>
                    <button
                      style={{
                        padding: '6px 10px',
                        fontSize: 12,
                        background: 'rgba(48,209,88,0.15)',
                        color: 'var(--tg-green)',
                        borderRadius: 10,
                        fontWeight: 700,
                        border: '1.5px solid rgba(48,209,88,0.3)',
                        cursor: 'pointer',
                      }}
                      onClick={() => handleMarkSold(p.id)}
                    >
                      ✅
                    </button>
                    <button
                      className="btn-danger"
                      style={{ padding: '6px 10px', fontSize: 12 }}
                      onClick={() => handleDelete(p.id)}
                    >
                      🗑️
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </>
      )}

      <div style={{ height: 16 }} />
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
