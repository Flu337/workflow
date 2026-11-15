# WorkFlow — Система управления заявками (Этап 2: Реальные данные и API, Nuxt 4 + TypeScript)

Проект дополнен функционалом Этапа 2 строго по техническому заданию и исходникам вёрстки (`1280px`, `768px`, `360px`).

## Что реализовано в Этапе 2
1. **Серверные API-роуты (`server/api/`)**:
   - `GET /api/requests` (`server/api/requests/index.get.ts`): 24 заявки (`#1042`–`#1019`), фильтрация по `status`, `priority`, `assignee`, поиск по `search`, сортировка по `sort` (`newest` / `oldest` / `priority`), пагинация (`page`, `limit`), проверка неполных данных на заявке `#1038` (отсутствуют `title` и `customer`), а также симуляция ошибок HTTP `429` и `500` через `?simulateError=429` или `?simulateError=500`.
   - `GET /api/requests/:id` (`server/api/requests/[id].get.ts`): детальная карточка заявки с `timeline` и `comments`, возврат `404` для несуществующих ID, симуляция `429` и `500`, а также режим проверки длинного заголовка и ФИО (`?long=1`).
   - `GET /api/users` (`server/api/users/index.get.ts`), `GET /api/customers` (`server/api/customers/index.get.ts`), `GET /api/categories` (`server/api/categories/index.get.ts`): серверные справочники.
2. **Типы и единая нормализация данных**:
   - Строгие TypeScript-интерфейсы DTO и клиентских моделей в `app/types/workflow.ts` (без `any`).
   - Единая функция преобразования `normalizeRequestItem` и `normalizeRequestsListResponse` в `app/utils/normalizeRequests.ts` с подстановкой `«Без названия»` и `«Клиент не указан»` и возвратом флага `hasIncompleteData`.
3. **Composables и синхронизация с URL**:
   - `app/composables/useDebounce.ts` для задержки поискового запроса.
   - `app/composables/useRequests.ts` с синхронизацией фильтров, поиска, сортировки и страницы с `route.query` и восстановлением состояния по прямой ссылке.
4. **Новые состояния UI из архива**:
   - Баннер активного поиска (`«По запросу «...» найдено: N»` + кнопка `«Сбросить поиск»`).
   - Плашка неполных данных (`«Часть данных заявки недоступна. Остальные обращения отображаются.»`).
   - Пустой результат фильтрации/поиска (`OctagonIconSearch` + `«Ничего не найдено»` + кнопка `«Сбросить фильтры»`).
   - Пагинация на 2 страницы (`«Показано 1–12 из 24»` и `«Показано 13–24 из 24»`).
   - Skeleton loading и Error state (HTTP 429 / 500 + повторная загрузка через `refresh()`) для списка заявок и карточки заявки `/requests/[id]`.
   - Корректный перенос длинных заголовков и длинных ФИО исполнителей.

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
├── types/
│   ├── index.ts
│   └── workflow.ts
└── utils/
    ├── mockData.ts
    ├── normalizeRequests.ts
    └── types.ts
server/
├── api/
│   ├── categories/
│   │   └── index.get.ts
│   ├── customers/
│   │   └── index.get.ts
│   ├── requests/
│   │   ├── [id].get.ts
│   │   └── index.get.ts
│   └── users/
│       └── index.get.ts
└── utils/
    └── db.ts
```

## Запуск проекта

```bash
npm install && npm run dev
```
