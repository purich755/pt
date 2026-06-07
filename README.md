# Маркетплейс автомобильных номеров (Telegram Mini App)

Полнофункциональное приложение для покупки и продажи красивых автомобильных номеров с базой данных Supabase (PostgreSQL).

## Стек

- **Frontend:** React 18 + TypeScript + Vite
- **Backend / DB:** Supabase (PostgreSQL)
- **Платформа:** Telegram Mini App

## Быстрый старт

### 1. Создайте проект в Supabase

1. Перейдите на [supabase.com](https://supabase.com) и создайте бесплатный аккаунт.
2. Нажмите **New Project**, выберите имя и пароль для БД.
3. Дождитесь создания проекта (~2 минуты).

### 2. Выполните миграцию базы данных

1. В панели Supabase откройте **SQL Editor**.
2. Скопируйте содержимое файла `supabase/migrations/001_initial_schema.sql`.
3. Вставьте в редактор и нажмите **Run**.

Это создаст таблицы `users`, `plates`, `favorites`, индексы и политики RLS.

### 3. Получите API-ключи

1. В Supabase откройте **Project Settings** → **API**.
2. Скопируйте:
   - **Project URL** → это `VITE_SUPABASE_URL`
   - **anon public** key → это `VITE_SUPABASE_ANON_KEY`

> **Важно:** используйте только **anon public** (начинается с `eyJ`) или **publishable** (`sb_publishable_...`).
> **НЕ** вставляйте **secret** / **service_role** ключ (`sb_secret_...`) — он для сервера и не работает во фронтенде.

### 4. Настройте переменные окружения

В корне проекта создайте файл `.env`:

```env
VITE_SUPABASE_URL=https://ваш-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=ваш-anon-ключ
```

> Можно скопировать `.env.example` и заменить значения.

### 5. Установите зависимости и запустите

```bash
cd plates-marketplace
npm install
npm run dev
```

Приложение откроется на `http://localhost:5173`.

Для тестирования в браузере без Telegram используется мок-пользователь (id: 0). В Telegram Mini App подставляются реальные данные из `initDataUnsafe.user`.

### 6. Сборка для продакшена

```bash
npm run build
```

Папка `dist/` готова для деплоя на Vercel, Netlify, Cloudflare Pages или любой статический хостинг.

## Подключение к Telegram Bot

1. Создайте бота через [@BotFather](https://t.me/BotFather).
2. Команда `/newapp` → выберите бота → укажите URL задеплоенного приложения.
3. Откройте Mini App из меню бота.

## Структура базы данных

| Таблица     | Описание |
|-------------|----------|
| `users`     | Пользователи Telegram (id = Telegram User ID) |
| `plates`    | Объявления номеров |
| `favorites` | Избранное (уникальная пара user_id + plate_id) |

## Реализованные функции

- Синхронизация пользователя Telegram при загрузке (upsert в `users`)
- Лента объявлений из БД с поиском и фильтрами (буквы, цифры, цена, регион)
- Публикация объявлений с привязкой к Telegram User ID
- Профиль: только свои объявления, редактирование цены и удаление
- Избранное с сохранением в БД
- Сохранены оригинальные стили, `haptic()` и компонент `RuPlate`

## Устранение ошибок

| Ошибка | Решение |
|--------|---------|
| `secret-ключ (sb_secret_...)` | В `.env` указан серверный ключ. Замените на **anon public** из Settings → API |
| `Таблицы в базе не созданы` | Выполните SQL из `supabase/migrations/001_initial_schema.sql` |
| `Invalid API key` | Проверьте, что скопирован именно anon public, без пробелов |
| Изменения `.env` не применяются | Остановите и снова запустите `npm run dev` |

## Структура проекта

```
plates-marketplace/
├── supabase/migrations/001_initial_schema.sql
├── src/
│   ├── components/     # UI-компоненты
│   ├── lib/
│   │   ├── api.ts      # Запросы к Supabase
│   │   ├── supabase.ts # Клиент Supabase
│   │   └── telegram.ts # Telegram WebApp SDK
│   ├── App.tsx
│   └── main.tsx
├── .env.example
└── README.md
```
