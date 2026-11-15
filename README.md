# WorkFlow — Система управления заявками (Nuxt 4 + TypeScript)

Проект веб-приложения **WorkFlow** выполнен строго по техническим заданиям и исходникам вёрстки для трёх разрешений (`1280px` Desktop, `768px` Tablet, `360px` Mobile).

## Стек технологий
- **Фреймворк**: Nuxt 4 (`compatibilityVersion: 4`) + Vue 3 + TypeScript + Pinia.
- **Типизация**: строгий TypeScript без использования `any` во всех ответах API, хранилищах, утилитах и composables (проверено через `vue-tsc --noEmit`).
- **Синтаксис компонентов**: во всех `.vue` файлах используется `<script setup lang="ts">`.

## Выполненные задания

### Задание №1 (Этап 1): Базовая архитектура, экраны и адаптивная вёрстка
1. **Публичный и внутренний layouts**:
   - `app/layouts/public.vue` — публичный шаблон для главной страницы (`/`) и страницы входа (`/login`).
   - `app/layouts/default.vue` — основной шаблон приложения с шапкой, навигацией, мобильным меню и уведомлениями для страниц `/dashboard`, `/requests`, `/requests/[id]` и `/profile`.
2. **Страницы и маршрутизация**:
   - `app/pages/index.vue` — главная страница (лендинг WorkFlow).
   - `app/pages/login.vue` — страница авторизации с клиентской валидацией полей.
   - `app/pages/dashboard.vue` — дашборд с KPI-карточками, последними обращениями и быстрыми переходами.
   - `app/pages/requests/index.vue` — страница списка всех заявок с фильтрами, модальным окном создания заявки (`WFGPTCreateRequestModal.vue`) и состояниями `Loading`, `Empty` и `Error`.
   - `app/pages/requests/[id].vue` — детальная карточка заявки с историей изменений (`timeline`) и комментариями.
   - `app/pages/profile.vue` — страница профиля оператора с настройками интерфейса.
   - `app/error.vue` — кастомная страница ошибки `404`.
3. **Адаптивность и UI-состояния**:
   - Все экраны и компоненты объединены из трёх `.txt` макетов (`1280px`, `768px`, `360px`).
   - Реализованы интерактивные состояния `default`, `hover`, `focus` (`:focus-visible`) и `disabled`, а также управление с клавиатуры (`Tab`, `Enter`, `Escape`, `ArrowUp`/`ArrowDown`).

### Задание №2 (Этап 2): Реальные данные и API
1. **Серверные API-маршруты чтения (`server/api/`)**:
   - `GET /api/requests` (`server/api/requests/index.get.ts`): возвращает 24 заявки (`#1042`–`#1019`), поддерживает фильтрацию по `status`, `priority`, `assignee`, поиск по `search`, сортировку по `sort` (`newest` / `oldest` / `priority`), пагинацию (`page`, `limit`), запись `#1038` без необязательных полей `title` и `customer`, а также симуляцию ошибок HTTP `429` и `500` (`?simulateError=429`, `?simulateError=500`).
   - `GET /api/requests/:id` (`server/api/requests/[id].get.ts`): возвращает детальную карточку заявки с `timeline` и `comments`, статус `404` для несуществующих ID, симуляцию ошибок `429` и `500`, а также режим проверки длинного заголовка и ФИО исполнителя (`?long=1`).
   - `GET /api/users`, `GET /api/customers`, `GET /api/categories`: серверные справочники сотрудников, компаний-клиентов и категорий.
2. **Data Fetching (`useFetch`) и единая нормализация данных**:
   - Список заявок, дашборд и детальная страница переведены на реактивный `useFetch`.
   - Все DTO и клиентские модели строго типизированы в `app/types/workflow.ts` и `app/types/index.ts` без `any`.
   - Преобразование данных из API вынесено в единый модуль `app/utils/normalizeRequests.ts`: при отсутствии необязательных полей (`title`, `customer`) автоматически подставляются значения `«Без названия»` и `«Клиент не указан»` и выставляется флаг `hasIncompleteData`.
3. **Синхронизация с URL и `useDebounce`**:
   - Реализован `app/composables/useDebounce.ts` (задержка `300 мс`) для поиска без отправки запроса на каждый введённый символ.
   - В `app/composables/useRequests.ts` поиск, фильтрация, сортировка и номер страницы синхронизированы с `route.query` и восстанавливают состояние при переходе по прямой ссылке.

### Задание №3 (Этап 3): Состояние приложения и взаимодействия
1. **Разделение хранилищ Pinia по доменам (`app/stores/`)**:
   - `app/stores/preferences.ts` (`usePreferencesStore`) — пользовательские настройки интерфейса (`density`: `'comfortable' | 'compact'`, имя, почта, инициалы, роль оператора) с автоматическим сохранением и восстановлением из `localStorage` (`wf-user-preferences-v1`).
   - `app/stores/requestUi.ts` (`useRequestUiStore`) — общее межстраничное UI-состояние взаимодействий с заявками (оптимистичные переопределения `optimisticOverrides`, баннер успешного изменения `feedbackBanner`, снимок последнего действия `lastUndoAction` для **Undo**, состояние ошибки отката `rollbackError` при ответах `409` и `500`).
2. **Мутации заявки и серверные маршруты**:
   - `PATCH /api/requests/:id` (`server/api/requests/[id].patch.ts`) — изменение приоритета (`priority`), статуса (`status`) и исполнителя (`assignee`) с записью события в историю заявки (`timeline`) и поддержкой симуляции конфликта `409 Conflict` и ошибки `500 Internal Server Error`.
   - `POST /api/requests/:id/comments` (`server/api/requests/[id]/comments.post.ts`) — отправка нового комментария с индикацией процесса отправки (`«Отправляем…»` / `«Отправляем комментарий…»`), уведомлением `«Комментарий отправлен»` и сохранением введённого текста при ошибке отправки.
3. **Optimistic Update, Rollback и Undo**:
   - При изменении приоритета новое значение и пересчитанный срок решения (`Сегодня, 10:14` для критического, `Сегодня, 13:14` для высокого) отображаются в UI мгновенно до завершения сетевого запроса.
   - При ответе сервера `409` или `500` выполняется автоматический **rollback** к предыдущему значению и выводится плашка `«Изменение не сохранено»` с описанием причины и кнопкой `«Обновить заявку»`.
   - Для последнего изменения статуса или приоритета доступна кнопка `«Отменить изменение»` (**Undo**) как внутри карточки заявки (`/requests/[id]`), так и в списке заявок (`/requests`).

## Распределение типов состояния (State Architecture)

| Тип состояния | Какие данные относятся | Где хранится (единый источник истины) |
| :--- | :--- | :--- |
| **URL state** | Поисковый запрос (`search`), фильтры (`status`, `priority`, `assignee`), сортировка (`sort`), страница пагинации (`page`) | Query-параметры адресной строки (`route.query`) через `app/composables/useRequests.ts` |
| **Server state** | Список заявок, детальная карточка заявки (`timeline`, `comments`), справочники пользователей, клиентов и категорий | Nuxt Server API (`server/api/*`) + кэш `useFetch` на страницах `/requests`, `/requests/[id]`, `/dashboard` |
| **App state (Pinia)** | Настройки интерфейса (`density` списка, профиль оператора) + межстраничные баннеры мутаций, оптимистичные обновления, снимки **Undo** и **Rollback** | Два отдельных специализированных store: `app/stores/preferences.ts` (синхронизирован с `localStorage`) и `app/stores/requestUi.ts` |
| **Local state** | Черновик текста комментария (`commentText`), флаг отправки (`isSubmittingComment`), открытие дропдауна (`isDropdownOpen`), поля модалки и логина | Локальные `ref()` непосредственно внутри соответствующих Vue-компонентов |

## Структура проекта

```text
app/
├── app.vue
├── error.vue
├── assets/
│   ├── css/
│   │   └── main.css
│   └── images/
├── components/
│   ├── OctagonAvatar.vue
│   ├── OctagonButton.vue
│   ├── OctagonIconAlert.vue
│   ├── OctagonIconBell.vue
│   ├── OctagonIconInboxEmpty.vue
│   ├── OctagonIconMenu.vue
│   ├── OctagonIconSearch.vue
│   ├── OctagonPriorityBadge.vue
│   ├── OctagonStatusBadge.vue
│   ├── WFGPTCreateRequestModal.vue
│   ├── WFGPTField.vue
│   ├── WFGPTKpiCards.vue
│   ├── WFGPTRequestRow.vue
│   └── WFGPTTextarea.vue
├── composables/
│   ├── useDebounce.ts
│   └── useRequests.ts
├── layouts/
│   ├── default.vue
│   └── public.vue
├── pages/
│   ├── index.vue
│   ├── login.vue
│   ├── dashboard.vue
│   ├── profile.vue
│   └── requests/
│       ├── index.vue
│       └── [id].vue
├── stores/
│   ├── preferences.ts
│   └── requestUi.ts
├── types/
│   ├── index.ts
│   └── workflow.ts
└── utils/
    ├── mockData.ts
    ├── normalizeRequests.ts
    ├── pinia.ts
    └── types.ts
server/
├── api/
│   ├── categories/
│   │   └── index.get.ts
│   ├── customers/
│   │   └── index.get.ts
│   ├── requests/
│   │   ├── [id]/
│   │   │   └── comments.post.ts
│   │   ├── [id].get.ts
│   │   ├── [id].patch.ts
│   │   ├── index.get.ts
│   │   └── index.post.ts
│   └── users/
│       └── index.get.ts
└── utils/
    └── db.ts
```

## Запуск и проверка проекта

```bash
npm install && npm run dev
```

Проверка строгой типизации TypeScript:

```bash
npx vue-tsc --noEmit
```
