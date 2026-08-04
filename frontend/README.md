# Frontend — Calendar Booking Service

Отдельное SPA-приложение (Vite + React + TypeScript), которое общается с бэкендом
только через HTTP API, описанный в `../typespec`. Бэкенд может быть запущен
отдельно (адрес задаётся через `VITE_API_BASE_URL`) либо заменён локальным
мок-сервером на базе OpenAPI-спецификации.

Архитектурные решения и поэтапный план реализации — в [`docs/PLAN.md`](./docs/PLAN.md).

## Стек

- Vite + React + TypeScript (strict)
- Tailwind CSS + shadcn/ui (radix-nova)
- React Router, TanStack Query, react-hook-form + zod
- oxlint (линт) + prettier (форматирование)
- Prism — мок-сервер API по контракту, для разработки без реального бэкенда

## Быстрый старт

```bash
npm install
cp .env.example .env   # при необходимости поправить VITE_API_BASE_URL

# Вариант A: работать с мок-сервером (без бэкенда)
npm run mock:api        # поднимет мок на http://127.0.0.1:4010 по ../typespec/tsp-output/schema/openapi.yaml
npm run dev              # в другом терминале

# Вариант B: работать с реальным бэкендом
# укажите его адрес в .env → VITE_API_BASE_URL, затем
npm run dev
```

## Скрипты

| Скрипт                            | Назначение                                                    |
| --------------------------------- | ------------------------------------------------------------- |
| `npm run dev`                     | dev-сервер Vite                                               |
| `npm run build`                   | typecheck + продакшн-сборка                                   |
| `npm run preview`                 | превью собранного билда                                       |
| `npm run typecheck`               | проверка типов без сборки                                     |
| `npm run lint`                    | oxlint                                                        |
| `npm run format` / `format:check` | prettier                                                      |
| `npm run mock:api`                | Prism-мок API из `../typespec/tsp-output/schema/openapi.yaml` |

## Компоненты UI

Компоненты shadcn/ui добавляются командой:

```bash
npx shadcn@latest add <component>
```

Файлы попадают в `src/components/ui` (алиас `@/*` → `./src/*`, настроен в
`tsconfig.json`/`tsconfig.app.json` и `vite.config.ts`).
