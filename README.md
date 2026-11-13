# WorkFlow — Система управления заявками (Этап 1, Nuxt 4 + TypeScript)

Проект выполнен строго по техническому заданию Этапа 1 и исходникам вёрстки для трёх разрешений (`1280px`, `768px`, `360px`).

## Стек и архитектура
- **Фреймворк**: Nuxt 4 (`compatibilityVersion: 4`) + Vue 3 + TypeScript.
- **Синтаксис компонентов**: во всех `.vue` файлах используется `<script setup lang="ts">`.
- **Локальные данные**: 24 реалистичные заявки в `app/utils/mockData.ts` (первые 12 полностью повторяют макет `#1042`–`#1031`, включая данные для `timeline` и `comments`).
- **Адаптивность**: все экраны объединены из трёх `.txt` файлов (`1280px` Desktop, `768px` Tablet, `360px` Mobile).
- **UI-состояния и доступность**: реализованы состояния `default`, `hover`, `focus` (`:focus-visible`) и `disabled`, а также навигация с клавиатуры (`Tab`, `Enter`, `Escape`, стрелки `ArrowUp`/`ArrowDown` в выпадающих фильтрах и модальном окне).

## Структура проекта

```text
app/
├── app.vue
├── error.vue                        # Страница системной ошибки 404
├── assets/
│   ├── css/
│   │   └── main.css                 # Глобальные CSS-переменные и интерактивные состояния
│   └── images/                      # Исходные SVG и PNG ассеты
├── components/
│   ├── OctagonAvatar.vue
│   ├── OctagonButton.vue
│   ├── OctagonIconAlert.vue
│   ├── OctagonIconBell.vue
│   ├── OctagonIconInboxEmpty.vue
│   ├── OctagonIconMenu.vue
│   ├── OctagonPriorityBadge.vue
│   ├── OctagonStatusBadge.vue
│   ├── WFGPTCreateRequestModal.vue
│   ├── WFGPTField.vue
│   ├── WFGPTKpiCards.vue
│   ├── WFGPTRequestRow.vue
│   └── WFGPTTextarea.vue
├── composables/
│   └── useRequests.ts               # Реактивное состояние, фильтрация, сортировка, состояния списка
├── layouts/
│   ├── default.vue                  # Общий layout приложения (/dashboard, /requests, /requests/:id, /profile)
│   └── public.vue                   # Публичный layout (/ и /login)
├── pages/
│   ├── index.vue                    # Главная страница (/)
│   ├── login.vue                    # Страница входа (/login)
│   ├── dashboard.vue                # Обзор (/dashboard)
│   ├── profile.vue                  # Профиль (/profile)
│   └── requests/
│       ├── index.vue                # Все заявки (/requests) + состояния Loading, Empty, Error
│       └── [id].vue                 # Детали заявки (/requests/:id) с timeline и комментариями
└── utils/
    ├── mockData.ts                  # Локальные mock-данные (24 заявки)
    └── types.ts                     # TypeScript-интерфейсы и константы
```

## Запуск проекта локально

```bash
npm install && npm run dev
```

Приложение будет доступно по адресу `http://localhost:3000`.
