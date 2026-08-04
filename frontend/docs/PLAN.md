# Фронтенд Calendar Booking Service — архитектура и план реализации

Этот документ фиксирует принятые архитектурные решения и поэтапный план
реализации фронтенда. Обновляется по мере продвижения по этапам.

Источники:

- Контракт API: `../../typespec/*.tsp` → `../../typespec/tsp-output/schema/openapi.yaml`
- Референс UI: `../../ui-prototype/*.png`

## Требования (из ТЗ)

- Фронтенд реализуется как отдельная часть приложения.
- Получает данные и выполняет действия **только через API** по контракту.
- Должен корректно работать с отдельно запущенным бэкендом.

## Архитектурные решения

| Область           | Решение                                                                                                                                      |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Расположение      | `frontend/` в корне монорепо — независимый пакет, не знает о бэкенде кроме API                                                               |
| Стек              | Vite + React + TypeScript (strict), Tailwind CSS, shadcn/ui, React Router, TanStack Query, react-hook-form + zod                             |
| Пакетный менеджер | npm (совпадает с `typespec/package.json`)                                                                                                    |
| Контракт          | источник истины — `typespec/tsp-output/schema/openapi.yaml`; типы генерируются оттуда (`openapi-typescript`), руками не пишутся              |
| Мок бэкенда       | **Prism** (`@stoplight/prism-cli`) поднимает мок-сервер прямо по openapi.yaml — фронтенд разрабатывается и тестируется без реального бэкенда |
| Реальный бэкенд   | адрес задаётся через `VITE_API_BASE_URL` (.env), переключение mock/real — только через переменную окружения, кода не касается                |
| Компоненты UI     | добавляются через `shadcn` CLI (при наличии — через shadcn MCP server) — код компонентов живёт в репо, а не в node_modules                   |
| Линт/формат       | oxlint (линтер) + prettier (форматирование)                                                                                                  |

### Заметки по окружению

- Node.js не был установлен в системе — поставлен локально в
  `~/.local/opt/node` (v22.14.0), добавлен в `PATH` через `~/.bashrc`.
  При работе в другом окружении может понадобиться установить Node.js заново.
- Баг shadcn CLI: без `paths` в корневом `tsconfig.json` (там были только
  `references` на `tsconfig.app.json`/`tsconfig.node.json`) CLI не резолвил
  алиас `@/*` и писал файлы в буквальную папку `./@/...` в корне проекта.
  Исправлено добавлением `compilerOptions.paths` в корневой `tsconfig.json`
  (алиас также объявлен в `tsconfig.app.json` и `vite.config.ts`).
- `npm audit`: react-router (RSC Mode CSRF Bypass, GHSA-qwww-vcr4-c8h2) —
  не применимо, т.к. используется декларативный клиентский роутинг без RSC.
  Уязвимости в транзитивных зависимостях `@stoplight/prism-cli` — это dev-only
  инструмент для мока API, в продакшн-бандл не попадает.

---

## Этапы

### Этап 0. Инициализация проекта — ✅ выполнено

- `frontend/`: Vite (`react-ts`), `tsconfig` strict, алиас `@/*` → `./src/*`
- ESLint заменён на oxlint (дефолт в актуальном create-vite) + Prettier
- Tailwind v4 + `shadcn init` (стиль `radix-nova`, тема с оранжевым акцентом)
- Базовые компоненты shadcn/ui: button, card, badge, separator, dialog, tabs,
  avatar, tooltip, input, textarea, label, sonner, table, skeleton, switch
- Скрипты: `dev`, `build`, `preview`, `typecheck`, `lint`, `format`,
  `format:check`, `mock:api`
- `.env.example` (`VITE_API_BASE_URL`), Prism-мок проверен на всех 5 маршрутах
  контракта
- Проверено: typecheck, lint, build, dev-запуск — все проходят чисто

### Этап 1. Контракт и API-слой — ✅ выполнено

- Скрипт `generate:api` → `openapi-typescript ../typespec/tsp-output/schema/openapi.yaml -o src/api/schema.d.ts`
  (типы `paths`/`components` в `src/api/schema.d.ts`, файл авто-генерируемый,
  исключён из Prettier через `.prettierignore`)
- Типобезопасный клиент `openapi-fetch` (`src/api/client.ts`) с базовым URL
  из `import.meta.env.VITE_API_BASE_URL`
- Модуль `src/api/` с методами один-в-один к интерфейсам TypeSpec:
  - `eventTypes.list / get / create` (`src/api/eventTypes.ts`)
  - `slots.list(eventTypeId)` (`src/api/slots.ts`)
  - `bookings.listUpcoming / create` (`src/api/bookings.ts`)
- Единая обработка ошибок в `src/api/errors.ts`: `unwrap()` разворачивает
  результат `openapi-fetch` и бросает нормализованный `ApiError`
  (`status`, `code`, `kind`: `'slot_already_booked'` 409 /
  `'slot_not_available'` 400 / `'unknown'`) либо `NetworkError` при сбое
  самого запроса
- TanStack Query: `queryClient` (`src/api/queryClient.ts`,
  `staleTime: 30s`, `ApiError` не ретраится) и `queryKeys`
  (`src/api/queryKeys.ts`); `QueryClientProvider` подключён в `main.tsx`
- **Критерий готовности:** проверено — все 5 операций контракта
  (`EventTypes_create/list/read`, `Slots_list`, `Bookings_create/listUpcoming`)
  выполнены против Prism-мока через реальный код `src/api/*` (загружен
  Vite SSR module runner) с типизированным ответом; отдельно curl+
  `Prefer: code=409/400` подтвердил корректный разбор `ApiError.kind`
  для `SlotAlreadyBookedError`/`SlotNotAvailableError`
- Проверено: `typecheck`, `lint`, `format:check`, `build` — все проходят чисто

### Этап 2. Каркас UI и роутинг

- Общий layout: хедер (лого «Calendar», ссылки «Записаться» / «Админка»)
- React Router:
  - `/` — лендинг
  - `/book` — список типов событий (гость)
  - `/book/:eventTypeId` — календарь + слоты + подтверждение
  - `/admin` — типы событий (управление) + предстоящие встречи
- Общие состояния: skeleton/empty/error-виды для карточек и списков
- **Критерий готовности:** навигация между всеми экранами работает на
  статичных заглушках

### Этап 3. Гостевой флоу — запись на встречу

1. Лендинг — hero + блок «Возможности», CTA «Записаться»
2. Список типов событий — карточки из `GET /event-types`
3. Выбор слота:
   - месячный календарь (кастомный грид на `date-fns`)
   - `GET /event-types/{id}/slots` → группировка по дням
   - список времени выбранного дня, сводка выбора
4. Подтверждение брони — `POST /bookings`, обработка 201 / 409 / 400

- **Критерий готовности:** полный сценарий «выбрать тип → выбрать слот →
  забронировать» проходит на Prism-моке

### Этап 4. Админский флоу

- Список типов событий с формой создания (`id, name, description,
durationMinutes`) — react-hook-form + zod, `POST /event-types`
- Список предстоящих встреч — `GET /bookings/listUpcoming`
- **Критерий готовности:** созданный тип события сразу виден в гостевом
  флоу и в списке встреч после бронирования

### Этап 5. Сквозные требования

- Валидация форм зеркалит ограничения моделей TypeSpec
- Доступность (фокус, aria-атрибуты, клавиатура)
- Адаптивность (3 колонки → стек на мобильных)
- Единая точка текстов (RU) для будущей локализации
- Обработка сетевых сбоев — понятный экран ошибки

### Этап 6. Тесты

- Vitest: утилиты (группировка слотов, форматирование дат, API-клиент)
- React Testing Library: ключевые компоненты
- Playwright E2E (против Prism-мока в CI): гостевой и админский сценарии
- `typecheck`, `lint`, `test` — в общий CI рядом с `hexlet-check`

### Этап 7. Интеграция с реальным бэкендом и релиз

- Прогон против настоящего бэкенда только через смену `VITE_API_BASE_URL`
- Требования к бэкенду: CORS для origin фронтенда, соответствие ответов
  `openapi.yaml`
- Продакшн-сборка, статика отдаётся отдельно от бэкенда
- Обновление корневого `README.md`
