-- Plates Marketplace — начальная схема БД
-- Выполните в Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

-- Пользователи Telegram
CREATE TABLE IF NOT EXISTS users (
  id BIGINT PRIMARY KEY,
  first_name TEXT NOT NULL DEFAULT '',
  last_name TEXT NOT NULL DEFAULT '',
  username TEXT NOT NULL DEFAULT '',
  photo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Объявления номеров
CREATE TABLE IF NOT EXISTS plates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  letters TEXT NOT NULL,
  digits TEXT NOT NULL,
  series TEXT NOT NULL,
  region TEXT NOT NULL,
  price INTEGER NOT NULL CHECK (price > 0),
  description TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'sold')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Избранное
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plate_id UUID NOT NULL REFERENCES plates(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, plate_id)
);

-- Индексы для быстрого поиска и фильтрации
CREATE INDEX IF NOT EXISTS idx_plates_status ON plates(status);
CREATE INDEX IF NOT EXISTS idx_plates_seller_id ON plates(seller_id);
CREATE INDEX IF NOT EXISTS idx_plates_region ON plates(region);
CREATE INDEX IF NOT EXISTS idx_plates_price ON plates(price);
CREATE INDEX IF NOT EXISTS idx_plates_letters ON plates(letters);
CREATE INDEX IF NOT EXISTS idx_plates_digits ON plates(digits);
CREATE INDEX IF NOT EXISTS idx_plates_series ON plates(series);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_plate_id ON favorites(plate_id);

-- Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE plates ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Политики: публичное чтение активных объявлений
CREATE POLICY "users_select_all" ON users FOR SELECT USING (true);
CREATE POLICY "users_upsert_own" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "users_update_own" ON users FOR UPDATE USING (true);

CREATE POLICY "plates_select_active" ON plates FOR SELECT USING (true);
CREATE POLICY "plates_insert_own" ON plates FOR INSERT WITH CHECK (true);
CREATE POLICY "plates_update_own" ON plates FOR UPDATE USING (true);
CREATE POLICY "plates_delete_own" ON plates FOR DELETE USING (true);

CREATE POLICY "favorites_select_own" ON favorites FOR SELECT USING (true);
CREATE POLICY "favorites_insert_own" ON favorites FOR INSERT WITH CHECK (true);
CREATE POLICY "favorites_delete_own" ON favorites FOR DELETE USING (true);

-- Демо-данные (опционально — удалите, если не нужны)
INSERT INTO users (id, first_name, last_name, username) VALUES
  (100001, 'Антон', 'К.', 'nomera_777'),
  (100002, 'Дмитрий', 'В.', 'plates_msk'),
  (100003, 'Михаил', 'С.', 'krd_plates'),
  (100004, 'Алексей', 'Р.', 'vip_nomer'),
  (100005, 'Ринат', 'Х.', 'kazan_plates')
ON CONFLICT (id) DO NOTHING;

INSERT INTO plates (seller_id, letters, digits, series, region, price, description) VALUES
  (100001, 'О', '777', 'ОО', '77', 450000, 'Тройки — редкость! Идеально для подарка или себя. Документы в порядке.'),
  (100002, 'А', '111', 'АА', '99', 320000, 'Единицы — символ первенства. Чистый регион Москва.'),
  (100003, 'Х', '001', 'АМ', '23', 85000, 'Краснодарский край. Перерегистрация за мой счёт.'),
  (100004, 'М', '999', 'ММ', '197', 1200000, 'Тройки 999 — топовый номер! Регион 197 — Москва. Срочно.'),
  (100005, 'Е', '555', 'КХ', '116', 95000, 'Пятёрки. Татарстан, Казань. Возможен торг.');
