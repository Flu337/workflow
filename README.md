# WorkFlow — система управления сервисными заявками

Полноценное full-stack веб-приложение на **Nuxt 4 + Nitro + TypeScript + Pinia + PostgreSQL**, разработанное последовательно через все **6 этапов (Задания №1–№6)** в единой кодовой базе.

---

## Содержание
- [Стек и архитектура проекта](#стек-и-архитектура-проекта)
- [Этапы разработки (Задания №1–№6)](#этапы-разработки-задания-16)
  - [Задание №1. Вёрстка, дизайн-система и маршрутизация](#задание-1-вёрстка-дизайн-система-и-маршрутизация)
  - [Задание №2. Реальные данные, API и асинхронные состояния](#задание-2-реальные-данные-api-и-асинхронные-состояния)
  - [Задание №3. Состояние приложения, Optimistic UI, Rollback и Undo](#задание-3-состояние-приложения-optimistic-ui-rollback-и-undo)
  - [Задание №4. Full-stack Nuxt: Nitro, PostgreSQL, Auth и RBAC](#задание-4-full-stack-nuxt-nitro-postgresql-auth-и-rbac)
  - [Задание №5. Debugging, testing и надёжность](#задание-5-debugging-testing-и-надёжность)
  - [Задание №6. SSR, SEO, hydration и performance](#задание-6-ssr-seo-hydration-и-performance)
- [Демо-аккаунты и проверка состояний](#демо-аккаунты-и-проверка-состояний)
- [Запуск, сборка и тестирование](#запуск-сборка-и-тестирование)

---

## Стек и архитектура проекта

- **Фреймворк**: Nuxt 4 (`compatibilityVersion: 4`), Vue 3 (`<script setup lang="ts">`), Vue Router
- **Сервер**: Nitro (`server/api/`, `server/middleware/`, `server/utils/`)
- **База данных**: PostgreSQL (DDL-схема в `server/utils/postgresSchema.ts`, seed-данные для локальной разработки в `server/utils/db.ts`)
- **Состояние**: Pinia (`app/stores/auth.ts`, `app/stores/preferences.ts`, `app/stores/requestUi.ts`)
- **Типизация и валидация**: строгий TypeScript (без `any`), схемы валидации в `shared/utils/validation.ts`
- **Стилизация**: чистый CSS, вынесенный из всех `.vue` файлов в отдельные `.css` файлы в `app/assets/css/{components,layouts,pages}/`
- **Тестирование**: `node:test` + `jiti` (unit / integration / regression) и Playwright (E2E)

```text
├── app/
│   ├── assets/css/          # отдельные .css файлы для main, error, layouts, components и pages
│   ├── components/          # UI-компоненты (OctagonButton, WFGPTField, WFGPTRequestRow, модалки и др.)
│   ├── composables/         # useRequests, useDebounce, usePublicSeo
│   ├── layouts/             # public.vue (публичный каркас) и default.vue (рабочая область)
│   ├── middleware/          # auth.global.ts (защита приватных маршрутов и ролевой доступ)
│   ├── pages/               # /, /faq, /help, /articles, /articles/[slug], /login, /register, /dashboard, /requests, /requests/[id], /profile
│   ├── stores/              # auth.ts, preferences.ts, requestUi.ts
│   └── utils/               # normalizeRequests.ts, mockData.ts, pinia.ts
├── shared/
│   ├── types/               # workflow.ts (единые DTO, модели и константы для app и server)
│   └── utils/               # permissions.ts, statusTransitions.ts, validation.ts, asyncGuards.ts, publicContent.ts
├── server/
│   ├── api/                 # auth/*, requests/*, users, customers, categories, comments
│   ├── middleware/          # auth.ts (серверная проверка сессии wf_session)
│   └── utils/               # postgresSchema.ts, db.ts, auth.ts
├── public/
│   ├── images/              # hero-1280.png, hero-768.png, hero-360.png
│   ├── robots.txt
│   └── sitemap.xml
├── tests/
│   ├── unit/                # businessRules.test.ts, seoAndSsr.test.ts
│   ├── integration/         # regressionBugs.test.ts
│   └── e2e/                 # workflow.spec.ts
└── docs/
    └── PERFORMANCE.md       # отчёт по производительности (baseline до/после, hydration, routeRules)
```

---

## Этапы разработки (Задания №1–№6)

### Задание №1. Вёрстка, дизайн-система и маршрутизация
- Реализованы публичные и внутренние экраны на всех 3 брейкпоинтах (`1280px`, `768px`, `360px`):
  - Главная (`/`), вход (`/login`), обзор (`/dashboard`), все заявки (`/requests`), карточка заявки (`/requests/[id]`), профиль (`/profile`), системная ошибка (`app/error.vue`).
- Построена библиотека переиспользуемых компонентов (`OctagonButton`, `OctagonAvatar`, `OctagonStatusBadge`, `OctagonPriorityBadge`, `WFGPTField`, `WFGPTTextarea`, `WFGPTKpiCards`, `WFGPTRequestRow`, иконки).
- Все стили вынесены из `.vue` файлов в `app/assets/css/` и подключаются через `<style scoped src="~/assets/css/..."></style>`.

### Задание №2. Реальные данные, API и асинхронные состояния
- Подключены серверные эндпоинты: `GET /api/requests`, `GET /api/requests/:id`, `GET /api/users`, `GET /api/customers`, `GET /api/categories`.
- Список и карточка заявки переведены на Nuxt 4 `useFetch` с дебаунсом поиска (`useDebounce`, 300 мс).
- Реализованы поиск, фильтрация (статус, приоритет, исполнитель), сортировка (`newest`, `oldest`, `priority`) и пагинация с полной синхронизацией в `route.query` (состояние восстанавливается при переходе по прямой ссылке).
- Централизована нормализация DTO в `app/utils/normalizeRequests.ts` со строгими TypeScript-интерфейсами без `any`.
- Реализованы состояния интерфейса: `skeleton loading`, `empty state`, `no-results`, обработка `HTTP 429`, `HTTP 500` с кнопкой повтора, `HTTP 404` и режим неполных данных (`?incomplete=1`).

### Задание №3. Состояние приложения, Optimistic UI, Rollback и Undo
- Подключены Pinia-сторы с чётким разделением ответственности:
  - `usePreferencesStore` (`app/stores/preferences.ts`) — локальные настройки профиля и плотности списка (`comfortable` / `compact`) с сохранением в `localStorage`;
  - `useRequestUiStore` (`app/stores/requestUi.ts`) — кросс-страничное состояние мутаций и баннеров между списком и карточкой заявки.
- Реализован **Optimistic Update** при изменении приоритета с мгновенным обновлением UI и пересчётом SLA.
- При ошибках `HTTP 409` / `500` выполняется автоматический **Rollback** к предыдущему значению с понятным сообщением.
- Добавлен **Undo** («Отменить изменение») для последнего изменения приоритета или статуса, а также отправка комментариев.

### Задание №4. Full-stack Nuxt: Nitro, PostgreSQL, Auth и RBAC
- Описана реляционная схема PostgreSQL в `server/utils/postgresSchema.ts` (`customers`, `categories`, `users`, `sessions`, `requests`, `request_comments`, `request_timeline`, `request_attachments`) и подготовлены seed-данные в `server/utils/db.ts`.
- Реализованы маршруты авторизации и мутаций:
  - `POST /api/auth/login`, `POST /api/auth/register`, `POST /api/auth/logout`, `GET /api/auth/session`;
  - `POST /api/requests`, `PATCH /api/requests/:id`, `POST /api/requests/:id/comments`, `POST /api/comments`.
- Реализованы 4 роли (`Client`, `Operator`, `Agent`, `Admin`) с серверной проверкой прав на каждом защищённом маршруте (`server/middleware/auth.ts`, `server/utils/auth.ts`, `shared/utils/permissions.ts`):
  - Неавторизованный запрос к приватному API получает `HTTP 401`;
  - `Client` видит только заявки своей компании и получает `HTTP 403` при попытке прямого запроса чужой заявки;
  - `Agent` не может выполнять административные действия (`HTTP 403`);
  - Назначение деактивированного сотрудника (`Олег Соколов · деактивирован`) запрещено на сервере (`HTTP 422`).
- В `shared/utils/statusTransitions.ts` описаны правила переходов статусов и обязательные поля (`waitingReason`, `resolutionSummary`, `closingReason`).
- Соблюдена строгая изоляция слоёв: общие типы и утилиты вынесены в `shared/`, клиент и сервер не импортируют код друг друга.
- Реализованы экраны `/register`, баннер истёкшей сессии (`/login?expired=1`), ролевые представления списков и модальные окна («Новая заявка», «Назначить исполнителя», «Зафиксировать решение», «Изменить статус», «Закрыть заявку», страница `403`).

### Задание №5. Debugging, testing и надёжность
Найдены, задокументированы и исправлены 5 ключевых проблем, для каждой написан автоматический regression-тест:

1. **Двойная отправка комментария при быстрых кликах**
   - *Воспроизведение*: открыть `/requests/1042`, ввести комментарий и быстро дважды нажать «Отправить комментарий».
   - *Root Cause*: проверка реактивного флага без синхронного лока и серверного ключа идемпотентности позволяла двум вызовам пройти до обновления состояния.
   - *Исправление*: синхронный блокировщик `createSubmissionLock()` в `shared/utils/asyncGuards.ts` + серверная дедупликация по `idempotencyKey` (`server/utils/auth.ts`, `comments.post.ts`).
2. **Устаревший ответ поиска перезаписывает более новый результат (Race Condition)**
   - *Воспроизведение*: быстро ввести `CRM`, затем `1041` при разном времени ответа сервера.
   - *Root Cause*: отсутствие отмены предыдущего запроса и проверки актуальности ответа.
   - *Исправление*: `createSearchRaceGuard()` (`AbortController` + монотонный `requestId`) в `shared/utils/asyncGuards.ts` и `app/pages/requests/index.vue`.
3. **Доступ к приватному маршруту после `logout`**
   - *Воспроизведение*: выйти через `/profile` → «Выйти из аккаунта», затем перейти на `/requests` или `/dashboard`.
   - *Root Cause*: при выходе не очищалась вспомогательная cookie `wf_role`, а клиент не проверял маркер `logged_out`.
   - *Исправление*: очистка `wf_session` и `wf_role` в `clearServerSession` и проверка в `app/middleware/auth.global.ts`.
4. **Потеря или рассинхронизация состояния после `refresh`**
   - *Воспроизведение*: войти под ролью `Client`, применить фильтры URL и обновить страницу (`F5`).
   - *Root Cause*: при SSR не прокидывались cookies и не восстанавливалась сессия из токена `sess_<userId>_<timestamp>`.
   - *Исправление*: передача `useRequestHeaders(['cookie'])` в `authStore.fetchSession()` и восстановление пользователя по токену на сервере.
5. **Потеря данных формы и отсутствие обработки `500`, `401`, `409`**
   - *Воспроизведение*: отправить форму «Новая заявка» с пустыми полями или при ошибке `500`; выполнить мутацию при `409` или `401`.
   - *Исправление*: в `WFGPTCreateRequestModal.vue` реализованы валидация полей (`Укажите название заявки.`, `Опишите проблему.`), состояние отправки (`Создаём…`) и плашка ошибки с сохранением введённых данных и кнопкой `Повторить`; при `401` выполняется редирект на `/login?expired=1`.

### Задание №6. SSR, SEO, hydration и performance
- Реализованы **SSR-first** публичные страницы: Landing (`/`), FAQ (`/faq`), Центр помощи (`/help`), каталог статей (`/articles`) и детальные статьи (`/articles/[slug]`) с общим компонентом навигации `WFGPTPublicNav.vue`.
- Добавлены уникальные `title`, `description`, `canonical` и Open Graph метатеги для каждой публичной страницы (`app/composables/usePublicSeo.ts`).
- Созданы `public/robots.txt` и `public/sitemap.xml`.
- Настроен корректный **HTTP 404** для несуществующих статей (`/articles/:slug` → экран «404 · Статья не найдена · К списку статей» в `app/error.vue`).
- Настроены `routeRules` в `nuxt.config.ts` (`prerender: true` для `/`, `/faq`, `/help`, `/articles`; `swr: 3600` для `/articles/**`; `ssr: false` для `/profile`).
- Устранены причины **hydration mismatch** (детерминированные даты в `shared/utils/publicContent.ts`, чтение `localStorage` только в `onMounted`, валидная семантическая вёрстка).
- Оптимизированы изображения (`<picture>` + `<img width="460" height="460" fetchpriority="high">` с `hero-360.png` / `hero-768.png` / `hero-1280.png`) и добавлена ленивая загрузка модалки создания заявки (`defineAsyncComponent`).
- Результаты замеров до и после оптимизации зафиксированы в [`docs/PERFORMANCE.md`](./docs/PERFORMANCE.md).

---

## Демо-аккаунты и проверка состояний

На странице `/login` можно войти под любой из 4 ролей (пароль: `demo1234`):
- **Оператор (`Operator`)**: `0000@mail.demo` — Анна Кузнецова (полное управление заявками и назначениями)
- **Клиент (`Client`)**: `client@mail.demo` — Мария Смирнова (компания `АО «Вектор»`, видит только свои заявки)
- **Исполнитель (`Agent`)**: `agent@mail.demo` — Брунгильда Брунгильдовна (работа со статусами и фиксация решения)
- **Администратор (`Admin`)**: `admin@mail.demo` — Кирилл Серёгин
- **Деактивированный сотрудник**: `oleg@mail.demo` — Олег Соколов (`isActive: false`, нельзя войти и нельзя назначить исполнителем)

Специальные query-параметры для ручной проверки edge-case сценариев:
- `/requests?simulateError=500` или `429` — ошибка загрузки списка и кнопка повтора
- `/requests?simulateError=401` — имитация истёкшей сессии и редирект на `/login?expired=1`
- `/requests?incomplete=1` — проверка отображения заявки `#1038` с неполными данными
- `/requests/1042?long=1` — проверка длинного заголовка и ФИО
- `/articles/unknown` — публичная ошибка `404 Статья не найдена`

---

## Запуск, сборка и тестирование

```bash
# 1. Установка зависимостей
npm install

# 2. Запуск в режиме разработки
npm run dev

# 3. Запуск unit, integration и regression тестов (19 автотестов)
npm test

# 4. Проверка TypeScript (клиент + сервер + shared)
npm run typecheck

# 5. Запуск Playwright E2E-сценария (login -> create -> assign -> status -> comment -> logout)
npm run test:e2e

# 6. Production-сборка
npm run build
```
