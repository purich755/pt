import { useState } from 'react';
import type { NewPlateData } from '../types';
import { haptic } from '../lib/telegram';
import { RuPlate } from './RuPlate';

interface AddScreenProps {
  onAdd: (data: NewPlateData) => Promise<void>;
}

export function AddScreen({ onAdd }: AddScreenProps) {
  const [letters, setLetters] = useState('');
  const [digits, setDigits] = useState('');
  const [series, setSeries] = useState('');
  const [region, setRegion] = useState('');
  const [price, setPrice] = useState('');
  const [desc, setDesc] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!letters.trim()) e.letters = 'Укажите букву';
    if (!digits.trim() || digits.length < 3) e.digits = 'Нужно 3 цифры';
    if (!series.trim()) e.series = 'Укажите серию';
    if (!region.trim()) e.region = 'Укажите регион';
    if (!price || Number(price) <= 0) e.price = 'Укажите цену';
    return e;
  };

  const submit = async () => {
    const e = validate();
    if (Object.keys(e).length) {
      haptic('error');
      setErrors(e);
      return;
    }

    setSubmitting(true);
    try {
      await onAdd({
        letters: letters.toUpperCase(),
        digits,
        series: series.toUpperCase(),
        region,
        price: Number(price),
        desc: desc || 'Новое объявление. Быстрая сделка.',
      });
      setLetters('');
      setDigits('');
      setSeries('');
      setRegion('');
      setPrice('');
      setDesc('');
      setErrors({});
      haptic('success');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
    } catch {
      haptic('error');
      setErrors({ form: 'Не удалось опубликовать. Проверьте подключение к базе.' });
    } finally {
      setSubmitting(false);
    }
  };

  const previewReady = letters && digits.length >= 3 && series && region;

  return (
    <div className="screen">
      <div className="header">
        <h1>➕ Подать объявление</h1>
        <p>Продайте свой красивый номер</p>
      </div>

      {previewReady && (
        <div style={{ textAlign: 'center', padding: '10px 16px 4px' }}>
          <p
            style={{
              fontSize: 12,
              color: 'var(--tg-muted)',
              marginBottom: 8,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            Предпросмотр
          </p>
          <RuPlate
            letters={letters.toUpperCase()}
            digits={digits}
            series={series.toUpperCase()}
            region={region}
            size="lg"
          />
        </div>
      )}

      <div style={{ padding: '14px 16px' }}>
        <div className="input-row" style={{ marginBottom: 14 }}>
          <div>
            <label className="form-label">Буква (1 шт.)</label>
            <input
              value={letters}
              onChange={(e) => setLetters(e.target.value.slice(0, 1).toUpperCase())}
              placeholder="А"
              maxLength={1}
              style={{
                textAlign: 'center',
                fontSize: 20,
                fontWeight: 700,
                fontFamily: "'Oswald',sans-serif",
              }}
            />
            {errors.letters && (
              <p style={{ color: 'var(--tg-red)', fontSize: 12, marginTop: 4 }}>{errors.letters}</p>
            )}
          </div>
          <div>
            <label className="form-label">Цифры (3 шт.)</label>
            <input
              value={digits}
              onChange={(e) => setDigits(e.target.value.replace(/\D/g, '').slice(0, 3))}
              placeholder="777"
              maxLength={3}
              style={{
                textAlign: 'center',
                fontSize: 20,
                fontWeight: 700,
                fontFamily: "'Oswald',sans-serif",
              }}
            />
            {errors.digits && (
              <p style={{ color: 'var(--tg-red)', fontSize: 12, marginTop: 4 }}>{errors.digits}</p>
            )}
          </div>
        </div>
        <div className="input-row" style={{ marginBottom: 14 }}>
          <div>
            <label className="form-label">Серия (2 буквы)</label>
            <input
              value={series}
              onChange={(e) => setSeries(e.target.value.slice(0, 2).toUpperCase())}
              placeholder="АА"
              maxLength={2}
              style={{
                textAlign: 'center',
                fontSize: 20,
                fontWeight: 700,
                fontFamily: "'Oswald',sans-serif",
              }}
            />
            {errors.series && (
              <p style={{ color: 'var(--tg-red)', fontSize: 12, marginTop: 4 }}>{errors.series}</p>
            )}
          </div>
          <div>
            <label className="form-label">Регион</label>
            <input
              value={region}
              onChange={(e) => setRegion(e.target.value.replace(/\D/g, '').slice(0, 3))}
              placeholder="77"
              maxLength={3}
              style={{
                textAlign: 'center',
                fontSize: 20,
                fontWeight: 700,
                fontFamily: "'Oswald',sans-serif",
              }}
            />
            {errors.region && (
              <p style={{ color: 'var(--tg-red)', fontSize: 12, marginTop: 4 }}>{errors.region}</p>
            )}
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Цена (₽)</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="150 000"
          />
          {errors.price && (
            <p style={{ color: 'var(--tg-red)', fontSize: 12, marginTop: 4 }}>{errors.price}</p>
          )}
          {price && (
            <p style={{ color: 'var(--tg-blue)', fontSize: 13, marginTop: 5, fontWeight: 600 }}>
              = {Number(price).toLocaleString('ru-RU')} ₽
            </p>
          )}
        </div>
        <div className="form-group">
          <label className="form-label">Описание</label>
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Перерегистрация за мой счёт. Документы в порядке..."
            rows={3}
            style={{ resize: 'none', lineHeight: 1.5 }}
          />
        </div>
        {errors.form && (
          <p style={{ color: 'var(--tg-red)', fontSize: 13, marginBottom: 10 }}>{errors.form}</p>
        )}
        <button
          className="btn-primary"
          onClick={submit}
          style={{ marginTop: 6, opacity: submitting ? 0.7 : 1 }}
          disabled={submitting}
        >
          {submitting ? '⏳ Публикуем...' : '🚀 Опубликовать объявление'}
        </button>
      </div>

      {success && <div className="toast">✅ Объявление опубликовано!</div>}
    </div>
  );
}
