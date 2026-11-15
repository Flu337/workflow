# WorkFlow — Система управления заявками (Этапы 1–4: Nuxt 4 + Nitro + PostgreSQL + Auth + RBAC + TypeScript)

Полный проект системы управления обращениями **WorkFlow**, последовательно дополненный функционалом **Этапов 1, 2, 3 и 4** в единой кодовой базе строго по техническому заданию и исходным макетам (`1280px`, `768px`, `360px`).

---

## Что реализовано в Этапе 4 (Full-stack Nuxt: Nitro, PostgreSQL, Auth, RBAC)

### 1. Схема PostgreSQL и seed-данные (`server/utils/postgresSchema.ts`, `server/utils/db.ts`)
- В `server/utils/postgresSchema.ts` описана полная реляционная DDL-схема PostgreSQL для основных сущностей:
  - `customers` (клиентские компании);
  - `categories` (категории обращений);
  - `users` (сотрудники и клиенты с ролями `Client`, `Operator`, `Agent`, `Admin` и флагом активности `is_active`);
  - `sessions` (серверные пользовательские сессии с токеном и сроком действия `expires_at`);
  - `requests` (обращения с внешними ключами на клиента, категорию и исполнителя, полями `waiting_reason`, `resolution_summary`, `closing_reason`);
  - `request_comments`, `request_timeline`, `request_attachments`.
- В `server/utils/db.ts` настроены seed-данные для локальной разработки:
  - **Оператор (`Operator`)**: `Анна Кузнецова` (`0000@mail.demo`, активна)
  - **Исполнитель (`Agent`)**: `Брунгильда Брунгильдовна` (`agent@mail.demo`, активна)
  - **Деактивированный исполнитель (`Agent`, `isActive: false`)**: `Олег Соколов` (`oleg@mail.demo`)
  - **Клиент (`Client`)**: `Мария Смирнова` (`client@mail.demo`, компания `АО «Вектор»`)
  - **Администратор (`Admin`)**: `Кирилл Серёгин` (`admin@mail.demo`, активен)

### 2. Общий слой `shared/` и разделение `app` / `server` / `shared`
- **`shared/types/workflow.ts`**: единые строгие TypeScript-интерфейсы без `any` для ролей (`UserRole`), статусов (`RequestStatus`), приоритетов (`RequestPriority`), DTO заявок (`RequestItemDto`), комментариев, истории действий, вложений (`RequestAttachmentDto`) и сессии (`AuthSessionUserDto`).
- **`shared/utils/statusTransitions.ts`**: матрица разрешённых переходов статусов (`ALLOWED_STATUS_TRANSITIONS`), допустимых переходов по ролям (`ROLE_STATUS_TRANSITIONS`) и проверка обязательных полей перехода (`waitingReason` при переводе в `waiting`, `resolutionSummary` при переводе в `resolved`, `closingReason` при переводе в `closed`).
- **`shared/utils/permissions.ts`**: функции проверки ролевого доступа (`canAssignExecutor`, `canChangePriority`, `canCloseRequest`, `canResolveRequest`, `canCreateClientRequest`, `canAccessDashboard`, `canReadRequest`).
- **`shared/utils/validation.ts`**: типобезопасные схемы валидации входных данных (`Schema<T>`, `safeParse` с детальными ошибками по полям `fieldErrors`) для `loginSchema`, `registerSchema`, `createRequestSchema`, `patchRequestSchema` и `createCommentSchema`.
- Соблюдена изоляция слоёв: `server/` не импортирует клиентский код из `app/`, а `app/` не импортирует серверный код из `server/`.

### 3. Серверная авторизация, сессии и ролевой контроль доступа (`RBAC`)
- **`server/middleware/auth.ts` и `server/utils/auth.ts`**:
  - Управление серверной сессией через HTTP-cookie `wf_session`.
  - Защита приватных маршрутов `/api/requests*`, `/api/users*`, `/api/customers*`, `/api/categories*`, `/api/comments*` — неавторизованный запрос получает `HTTP 401` (`Сессия истекла. Войдите снова, чтобы продолжить работу.`).
- **Серверные API-роуты (`server/api/`)**:
  - `POST /api/auth/login`, `POST /api/auth/register`, `POST /api/auth/logout`, `GET /api/auth/session`;
  - `GET /api/requests` — фильтрация заявок с учётом роли (`Client` видит только обращения своей компании `АО «Вектор»`, `Agent` может переключать режим «Назначенные мне»);
  - `POST /api/requests` — создание новой заявки (`Client`, `Operator`, `Admin`; для `Agent` возвращается `HTTP 403`);
  - `GET /api/requests/:id` — проверка владельца для роли `Client` (при попытке открыть чужую заявку по прямому вызову API возвращается `HTTP 403`);
  - `PATCH /api/requests/:id` — серверная проверка прав на назначение исполнителя, смену приоритета, переходы статусов, проверка обязательных причин (`waitingReason`, `resolutionSummary`, `closingReason`) и запрет назначения деактивированного сотрудника (`Олег Соколов · деактивирован` возвращает `HTTP 422`);
  - `POST /api/requests/:id/comments` и `POST /api/comments` — добавление комментария с проверкой доступа к заявке;
  - `GET /api/users`, `GET /api/customers`, `GET /api/categories`.

### 4. Новые экраны и состояния интерфейса Этапа 4 (по макетам `workflow 4 задание.zip`)
- **Страница регистрации (`/register`, `app/pages/register.vue`)**: адаптивная вёрстка `1280px` / `768px` / `360px` (`Имя и фамилия`, `Рабочая почта`, `Компания`, `Пароль`, `Повторите пароль`) с мгновенным созданием сессии.
- **Истёкшая сессия (`/login?expired=1`, `app/pages/login.vue`)**: баннер предупреждения `Сессия истекла. Войдите снова, чтобы продолжить работу.` + быстрый переключатель демо-аккаунтов по ролям (`Оператор`, `Клиент`, `Исполнитель`, `Администратор`) и кнопка проверки истёкшей сессии.
- **Режим клиента (`Client` — «Мои заявки» + модальное окно «Новая заявка»)**: заголовок «Мои заявки», отображение только заявок компании клиента (`АО «Вектор»`) и модальное окно `WFGPTCreateRequestModal.vue` (`Название`, `Категория`, `Описание`, `Приоритет`).
- **Режим исполнителя (`Agent` — «Назначенные вам обращения»)**: подзаголовок «Назначенные вам обращения», фильтр «Назначенные мне», скрытие административных действий, модальное окно **«Зафиксировать решение»** (с валидацией `Опишите результат решения.`) и **«Изменить статус»** (с валидацией `Укажите причину ожидания.`).
- **Режим оператора (`Operator`) в карточке заявки (`/requests/[id]`)**:
  - Модальное окно **«Назначить исполнителя»** с проверкой деактивированного сотрудника (`Олег Соколов · деактивирован` → блок ошибки `Деактивированный сотрудник не может получить новое назначение. Выберите активного исполнителя.`);
  - Отображение блока **«Результат решения»** и карточек **«Вложения · 1»** (`error-login.png · 245 КБ`);
  - Модальное окно **«Закрыть заявку»** с обязательной причиной ручного закрытия (`Укажите причину ручного закрытия.`).
- **Страница ошибки доступа `403` (`app/error.vue` и `/requests/[id]?simulateError=403`)**: экран `403 — Нет доступа` (`Эта страница недоступна вашей роли.` и кнопка `Вернуться к заявкам`).

---

## Что сохранено из Этапов 1, 2 и 3
- **Этап 1**: публичные и внутренние страницы (`/`, `/login`, `/dashboard`, `/requests`, `/requests/[id]`, `/profile`, `error.vue`) на всех брейкпоинтах `1280px`, `768px`, `360px`.
- **Этап 2**: `useFetch` + `useDebounce`, синхронизация фильтров, поиска, сортировки и пагинации с URL (`route.query`), единая нормализация DTO (`app/utils/normalizeRequests.ts`), skeleton loading, empty state, error state (`429`, `500`, `404`), проверка длинных строк (`?long=1`) и неполных данных (`#1038`).
- **Этап 3**: Pinia stores (`usePreferencesStore` с сохранением настроек в `localStorage` и `useRequestUiStore`), мгновенный **Optimistic Update** приоритета с **Rollback** при ошибках `409`/`500` и кнопка **«Отменить» (Undo)** последнего изменения приоритета или статуса.

---

## Запуск и проверка

```bash
npm install
npm run dev
```

Проверка типов TypeScript (клиент + сервер + shared):
```bash
npx vue-tsc --noEmit
npx tsc -p .nuxt/tsconfig.server.json --noEmit
```
