export interface KnowledgeSection {
  heading: string
  body: string
}

export interface KnowledgeArticle {
  slug: string
  title: string
  category: string
  readingTime: string
  updatedLabel: string
  updatedIso: string
  description: string
  sections: KnowledgeSection[]
}

export interface KnowledgeCategory {
  id: string
  title: string
  subtitle: string
  defaultArticleSlug: string
}

export interface FaqQuestionItem {
  id: string
  question: string
  answer: string
}

// детерминированные данные категорий базы знаний для ssr и клиента без расхождений гидратации
export const KNOWLEDGE_CATEGORIES: KnowledgeCategory[] = [
  {
    id: 'getting-started',
    title: 'Начало работы',
    subtitle: 'Вход, профиль и первая заявка',
    defaultArticleSlug: 'kak-sozdat-pervuiu-zaiavku'
  },
  {
    id: 'working-with-requests',
    title: 'Работа с заявками',
    subtitle: 'Статусы, комментарии и результат',
    defaultArticleSlug: 'kak-otslezhivat-status-obrashcheniia'
  },
  {
    id: 'sla-and-priorities',
    title: 'Сроки и приоритеты',
    subtitle: 'Как устроены SLA и эскалация',
    defaultArticleSlug: 'kak-podtverdit-reshenie'
  }
]

// статьи и инструкции базы знаний рендерящиеся на сервере при первом запросе
export const KNOWLEDGE_ARTICLES: KnowledgeArticle[] = [
  {
    slug: 'kak-sozdat-pervuiu-zaiavku',
    title: 'Как создать первую заявку',
    category: 'Работа с заявками',
    readingTime: '3 минуты',
    updatedLabel: 'Начало работы · Обновлено 5 октября 2026',
    updatedIso: '2026-10-05',
    description:
      'Пошаговая инструкция по созданию первого сервисного обращения в WorkFlow: вход в аккаунт клиента, заполнение названия, категории и описания проблемы.',
    sections: [
      {
        heading: 'Перед началом',
        body: 'Для создания заявки войдите в аккаунт клиента. Подготовьте описание проблемы и ожидаемый результат.'
      },
      {
        heading: '1. Откройте раздел «Заявки»',
        body: 'Нажмите «Создать заявку».'
      },
      {
        heading: '2. Опишите проблему',
        body: 'Укажите понятное название, выберите категорию и добавьте подробности: что произошло и как повторить ошибку.'
      },
      {
        heading: '3. Отправьте обращение',
        body: 'Проверьте данные и нажмите «Создать». Заявка появится в списке со статусом «Новая».'
      },
      {
        heading: '4. Следите за обновлениями',
        body: 'Откройте карточку заявки, чтобы читать комментарии и проверять статус.'
      }
    ]
  },
  {
    slug: 'kak-otslezhivat-status-obrashcheniia',
    title: 'Как отслеживать статус обращения',
    category: 'Работа с заявками',
    readingTime: '3 минуты',
    updatedLabel: 'Работа с заявками · Обновлено 5 октября 2026',
    updatedIso: '2026-10-05',
    description:
      'Узнайте, что означают статусы «Новая», «Назначена», «В работе», «Ожидание», «Решена» и «Закрыта» в системе управления заявками WorkFlow.',
    sections: [
      {
        heading: 'Перед началом',
        body: 'Каждое обращение в WorkFlow проходит прозрачный жизненный цикл от регистрации до подтверждения результата.'
      },
      {
        heading: '1. Откройте раздел «Заявки»',
        body: 'В таблице «Мои заявки» отображается актуальный бейдж статуса и приоритета по каждому обращению.'
      },
      {
        heading: '2. Опишите проблему',
        body: 'Если заявка переведена в статус «Ожидание», ознакомьтесь с причиной ожидания и добавьте недостающие данные.'
      },
      {
        heading: '3. Отправьте обращение',
        body: 'После ответа клиента исполнитель продолжает диагностику и переводит обращение обратно в статус «В работе».'
      },
      {
        heading: '4. Следите за обновлениями',
        body: 'Полная хронология переходов и назначений фиксируется в блоке «История заявки» внутри карточки.'
      }
    ]
  },
  {
    slug: 'kak-dobavit-kommentarii',
    title: 'Как добавить комментарий',
    category: 'Работа с заявками',
    readingTime: '3 минуты',
    updatedLabel: 'Работа с заявками · Обновлено 5 октября 2026',
    updatedIso: '2026-10-05',
    description:
      'Как общаться с исполнителем и оператором в карточке заявки WorkFlow, прикладывать уточнения и получать ответы без потери контекста.',
    sections: [
      {
        heading: 'Перед началом',
        body: 'Переписка по обращению ведётся прямо внутри карточки заявки, чтобы вся команда видела единый контекст.'
      },
      {
        heading: '1. Откройте раздел «Заявки»',
        body: 'Выберите нужное обращение в списке и перейдите на его детальную страницу.'
      },
      {
        heading: '2. Опишите проблему',
        body: 'В блоке «Комментарии» введите сообщение в поле «Ваш комментарий» и укажите дополнительные детали.'
      },
      {
        heading: '3. Отправьте обращение',
        body: 'Нажмите «Отправить комментарий». Система защищает форму от случайной повторной отправки.'
      },
      {
        heading: '4. Следите за обновлениями',
        body: 'Новое сообщение сразу отобразится в ленте комментариев и зафиксируется в истории заявки.'
      }
    ]
  },
  {
    slug: 'kak-podtverdit-reshenie',
    title: 'Как подтвердить решение',
    category: 'Работа с заявками',
    readingTime: '3 минуты',
    updatedLabel: 'Сроки и приоритеты · Обновлено 5 октября 2026',
    updatedIso: '2026-10-05',
    description:
      'Порядок проверки результата работы исполнителя, ознакомления с блоком «Результат решения» и завершения обращения в WorkFlow.',
    sections: [
      {
        heading: 'Перед началом',
        body: 'Когда исполнитель устраняет проблему, заявка переходит в статус «Решена», а в карточке появляется итоговое описание.'
      },
      {
        heading: '1. Откройте раздел «Заявки»',
        body: 'Найдите обращение со статусом «Решена» и откройте его карточку.'
      },
      {
        heading: '2. Опишите проблему',
        body: 'Проверьте блок «Результат решения» и убедитесь, что доступ или функциональность полностью восстановлены.'
      },
      {
        heading: '3. Отправьте обращение',
        body: 'Если вопрос решён, подтвердите выполнение; если проблема сохраняется — напишите комментарий для возврата в работу.'
      },
      {
        heading: '4. Следите за обновлениями',
        body: 'После проверки оператор закрывает обращение с фиксацией причины в истории заявки.'
      }
    ]
  }
]

// частые вопросы для страницы faq рендерящиеся на сервере
export const FAQ_ITEMS: FaqQuestionItem[] = [
  {
    id: 'faq-create',
    question: 'Как создать заявку?',
    answer:
      'Войдите в аккаунт, откройте «Заявки» и нажмите «Создать заявку». Укажите название, описание и категорию проблемы.'
  },
  {
    id: 'faq-status',
    question: 'Где посмотреть статус обращения?',
    answer: 'В разделе «Мои заявки» или в карточке обращения.'
  },
  {
    id: 'faq-waiting',
    question: 'Что означает «Ожидание»?',
    answer:
      'Для продолжения работы нужна дополнительная информация или действие. Причину ожидания можно посмотреть в заявке.'
  },
  {
    id: 'faq-confirm',
    question: 'Как подтвердить решение?',
    answer: 'Откройте решённую заявку и нажмите «Подтвердить решение».'
  },
  {
    id: 'faq-sla',
    question: 'Что такое SLA?',
    answer: 'Это установленные сроки реакции на обращение и решения проблемы.'
  }
]

export function findKnowledgeArticleBySlug(rawSlug: string): KnowledgeArticle | null {
  const clean = decodeURIComponent(String(rawSlug || '')).trim().toLowerCase()
  if (!clean) return null
  if (clean === '1' || clean === 'first') {
    return KNOWLEDGE_ARTICLES[0] || null
  }
  return KNOWLEDGE_ARTICLES.find(item => item.slug.toLowerCase() === clean) || null
}

export function filterKnowledgeArticles(query: string): KnowledgeArticle[] {
  const q = query.trim().toLowerCase()
  if (!q) return KNOWLEDGE_ARTICLES
  return KNOWLEDGE_ARTICLES.filter(
    item =>
      item.title.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q)
  )
}

export function filterFaqItems(query: string): FaqQuestionItem[] {
  const q = query.trim().toLowerCase()
  if (!q) return FAQ_ITEMS
  return FAQ_ITEMS.filter(
    item =>
      item.question.toLowerCase().includes(q) ||
      item.answer.toLowerCase().includes(q)
  )
}
