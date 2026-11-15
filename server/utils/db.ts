import type {
  RequestItemDto,
  UserDirectoryItemDto,
  CustomerDirectoryItemDto,
  CategoryDirectoryItemDto
} from '../../shared/types/workflow'

export interface ServerUserRecord extends UserDirectoryItemDto {
  password: string
}

// серверные данные заявок включая запись 1038 без необязательных полей
export const SERVER_REQUESTS_DB: RequestItemDto[] = [
  {
    id: '1042',
    code: '#1042',
    title: 'Не работает доступ к CRM',
    customer: 'АО «Вектор»',
    assignee: 'Не назначен',
    status: 'new',
    priority: 'high',
    category: 'Доступ и учётные записи',
    createdAt: 'Создана 5 октября, 09:14',
    dueAt: 'Сегодня, 13:14',
    description: 'После обновления не удаётся войти в CRM. При попытке входа появляется сообщение «Доступ запрещён». Проблема затрагивает отдел продаж.',
    resolutionSummary: 'Восстановлены права группы отдела продаж. Доступ к CRM проверен, ошибка больше не воспроизводится.',
    attachments: [
      {
        id: 'att-1042-1',
        fileName: 'error-login.png',
        fileSizeLabel: '245 КБ'
      }
    ],
    comments: [
      {
        id: 'c-1042-1',
        author: 'Мария Смирнова',
        time: '09:14',
        text: 'Не можем войти с рабочих компьютеров. Нужна помощь.'
      },
      {
        id: 'c-1042-2',
        author: 'Брунгильда Брунгильдовна',
        time: '09:25',
        text: 'Заявку приняла. Проверяем права доступа.'
      },
      {
        id: 'c-1042-3',
        author: 'Брунгильда Брунгильдовна',
        time: '10:05',
        text: 'Нашла причину: после обновления сбросилась группа доступа.'
      }
    ],
    timeline: [
      {
        id: 't-1042-1',
        time: '09:14',
        text: 'Мария создала заявку'
      },
      {
        id: 't-1042-2',
        time: '09:25',
        text: 'Оператор назначил Брунгильду Брунгильдовну'
      },
      {
        id: 't-1042-3',
        time: '10:00',
        text: 'Брунгильда начала работу'
      }
    ]
  },
  {
    id: '1041',
    code: '#1041',
    title: 'Ошибка выгрузки отчёта',
    customer: 'ООО «Сфера»',
    assignee: 'Не назначен',
    status: 'new',
    priority: 'critical',
    category: 'Отчётность и аналитика',
    createdAt: 'Создана 5 октября, 09:02',
    dueAt: 'Сегодня, 11:00',
    description: 'При формировании ежемесячного финансового отчёта в формате XLSX система выдаёт ошибку 502. Выгрузка прерывается на 80%.',
    comments: [
      {
        id: 'c-1041-1',
        author: 'Игорь Петров',
        time: '09:05',
        text: 'Отчёт нужен для совещания в 12:00, прошу взять в работу как можно скорее.'
      }
    ],
    timeline: [
      {
        id: 't-1041-1',
        time: '09:02',
        text: 'Игорь создал заявку'
      },
      {
        id: 't-1041-2',
        time: '09:05',
        text: 'Игорь добавил комментарий'
      }
    ]
  },
  {
    id: '1040',
    code: '#1040',
    title: 'Подключить нового сотрудника',
    customer: 'АО «Вектор»',
    assignee: 'Брунгильда Б.',
    status: 'assigned',
    priority: 'normal',
    category: 'Доступ и учётные записи',
    createdAt: 'Создана 4 октября, 17:40',
    dueAt: 'Сегодня, 18:00',
    description: 'Необходимо создать корпоративную учётную запись, настроить почту и выдать базовые права доступа в CRM для нового менеджера отдела сопровождения.',
    comments: [
      {
        id: 'c-1040-1',
        author: 'Елена Морозова',
        time: '17:42',
        text: 'Анкету сотрудника и список групп доступа приложила во внутреннем запросе.'
      },
      {
        id: 'c-1040-2',
        author: 'Брунгильда Б.',
        time: '18:05',
        text: 'Заявка принята, почтовый ящик создан, настраиваю роли в CRM.'
      }
    ],
    timeline: [
      {
        id: 't-1040-1',
        time: '17:40',
        text: 'Елена создала заявку'
      },
      {
        id: 't-1040-2',
        time: '17:55',
        text: 'Назначен исполнитель Брунгильда Б.'
      }
    ]
  },
  {
    id: '1039',
    code: '#1039',
    title: 'Обновить сертификат',
    customer: 'ООО «Пульс»',
    assignee: 'Брунгильда Б.',
    status: 'waiting',
    priority: 'high',
    category: 'Инфраструктура и безопасность',
    createdAt: 'Создана 4 октября, 16:15',
    dueAt: 'Сегодня, 16:00',
    description: 'Срок действия SSL-сертификата для шлюза документооборота истекает через 48 часов. Требуется перевыпуск и установка на боевой контур.',
    comments: [
      {
        id: 'c-1039-1',
        author: 'Брунгильда Б.',
        time: '16:45',
        text: 'Запросила подтверждение технологического окна для перезапуска прокси-сервера.'
      }
    ],
    timeline: [
      {
        id: 't-1039-1',
        time: '16:15',
        text: 'Система мониторинга создала заявку'
      },
      {
        id: 't-1039-2',
        time: '16:30',
        text: 'Назначен исполнитель Брунгильда Б.'
      },
      {
        id: 't-1039-3',
        time: '16:45',
        text: 'Статус изменён на «Ожидание»'
      }
    ]
  },
  {
    id: '1038',
    code: '#1038',
    title: undefined,
    customer: undefined,
    assignee: 'Олег С.',
    status: 'in-progress',
    priority: 'normal',
    category: 'Инфраструктура и безопасность',
    createdAt: 'Создана 4 октября, 14:20',
    dueAt: 'Завтра, 14:00',
    description: 'Требуется настроить ежедневное инкрементальное резервное копирование базы данных проектов на выделенное хранилище в 02:00 МСК.',
    comments: [
      {
        id: 'c-1038-1',
        author: 'Олег С.',
        time: '15:10',
        text: 'Настроил расписание cron и проверил тестовый дамп, ожидаю завершения полной проверки.'
      }
    ],
    timeline: [
      {
        id: 't-1038-1',
        time: '14:20',
        text: 'Алексей создал заявку'
      },
      {
        id: 't-1038-2',
        time: '14:35',
        text: 'Назначен исполнитель Олег С.'
      },
      {
        id: 't-1038-3',
        time: '14:50',
        text: 'Статус изменён на «В работе»'
      }
    ]
  },
  {
    id: '1037',
    code: '#1037',
    title: 'Сбой печати документов',
    customer: 'ООО «Пульс»',
    assignee: 'Брунгильда Б.',
    status: 'resolved',
    priority: 'low',
    category: 'Офисное оборудование',
    createdAt: 'Создана 4 октября, 11:30',
    dueAt: '4 октября, 17:30',
    description: 'Сетевой принтер на 3 этаже зависает при отправке многостраничных PDF-накладных из учётной системы.',
    comments: [
      {
        id: 'c-1037-1',
        author: 'Брунгильда Б.',
        time: '13:15',
        text: 'Очищена очередь спулера и обновлён драйвер PCL6 на сервере печати. Печать работает штатно.'
      }
    ],
    timeline: [
      {
        id: 't-1037-1',
        time: '11:30',
        text: 'Дмитрий создал заявку'
      },
      {
        id: 't-1037-2',
        time: '11:45',
        text: 'Назначен исполнитель Брунгильда Б.'
      },
      {
        id: 't-1037-3',
        time: '13:15',
        text: 'Статус изменён на «Решена»'
      }
    ]
  },
  {
    id: '1036',
    code: '#1036',
    title: 'Изменить права доступа',
    customer: 'АО «Вектор»',
    assignee: 'Не назначен',
    status: 'new',
    priority: 'normal',
    category: 'Доступ и учётные записи',
    createdAt: 'Создана 4 октября, 10:50',
    dueAt: 'Сегодня, 15:00',
    description: 'Прошу открыть доступ на редактирование реестра договоров для старшего юриста отдела корпоративного права.',
    comments: [
      {
        id: 'c-1036-1',
        author: 'Ольга Белова',
        time: '10:52',
        text: 'Согласование от руководителя департамента получено.'
      }
    ],
    timeline: [
      {
        id: 't-1036-1',
        time: '10:50',
        text: 'Ольга создала заявку'
      }
    ]
  },
  {
    id: '1035',
    code: '#1035',
    title: 'Ошибка авторизации в кабинете',
    customer: 'ООО «Пульс»',
    assignee: 'Олег С.',
    status: 'assigned',
    priority: 'high',
    category: 'Доступ и учётные записи',
    createdAt: 'Создана 3 октября, 18:12',
    dueAt: 'Сегодня, 12:00',
    description: 'Клиенты сообщают о циклическом редиректе при входе в личный кабинет через двухфакторную аутентификацию по SMS.',
    comments: [
      {
        id: 'c-1035-1',
        author: 'Олег С.',
        time: '18:30',
        text: 'Проверяю логи сервиса авторизации и синхронизацию времени токенов.'
      }
    ],
    timeline: [
      {
        id: 't-1035-1',
        time: '18:12',
        text: 'Дежурный оператор создал заявку'
      },
      {
        id: 't-1035-2',
        time: '18:20',
        text: 'Назначен исполнитель Олег С.'
      }
    ]
  },
  {
    id: '1034',
    code: '#1034',
    title: 'Подключить почтовый ящик',
    customer: 'ООО «Сфера»',
    assignee: 'Брунгильда Б.',
    status: 'closed',
    priority: 'low',
    category: 'Почта и коммуникации',
    createdAt: 'Создана 3 октября, 15:00',
    dueAt: '3 октября, 19:00',
    description: 'Подключить общий почтовый ящик support-billing@sfera.demo для группы расчётов с клиентами.',
    comments: [
      {
        id: 'c-1034-1',
        author: 'Брунгильда Б.',
        time: '16:10',
        text: 'Ящик создан, переадресация и права делегирования настроены. Заявка закрыта.'
      }
    ],
    timeline: [
      {
        id: 't-1034-1',
        time: '15:00',
        text: 'Наталья создала заявку'
      },
      {
        id: 't-1034-2',
        time: '16:10',
        text: 'Статус изменён на «Закрыта»'
      }
    ]
  },
  {
    id: '1033',
    code: '#1033',
    title: 'Недоступен файловый сервер',
    customer: 'АО «Вектор»',
    assignee: 'Брунгильда Б.',
    status: 'in-progress',
    priority: 'critical',
    category: 'Инфраструктура и безопасность',
    createdAt: 'Создана 3 октября, 12:40',
    dueAt: 'Сегодня, 10:30',
    description: 'Отсутствует подключение к сетевому диску Z: у сотрудников проектного офиса после плановой перезагрузки коммутатора.',
    comments: [
      {
        id: 'c-1033-1',
        author: 'Брунгильда Б.',
        time: '13:05',
        text: 'Восстанавливаем маршрутизацию между VLAN 20 и файловым кластером.'
      }
    ],
    timeline: [
      {
        id: 't-1033-1',
        time: '12:40',
        text: 'Сергей создал заявку'
      },
      {
        id: 't-1033-2',
        time: '12:45',
        text: 'Назначен исполнитель Брунгильда Б.'
      },
      {
        id: 't-1033-3',
        time: '12:50',
        text: 'Статус изменён на «В работе»'
      }
    ]
  },
  {
    id: '1032',
    code: '#1032',
    title: 'Изменить контакты компании',
    customer: 'ООО «Пульс»',
    assignee: 'Олег С.',
    status: 'closed',
    priority: 'low',
    category: 'Настройки профиля',
    createdAt: 'Создана 2 октября, 16:05',
    dueAt: '3 октября, 12:00',
    description: 'Обновить юридический адрес и телефон горячей линии в карточке организации ООО «Пульс» для печатных форм.',
    comments: [
      {
        id: 'c-1032-1',
        author: 'Олег С.',
        time: '16:40',
        text: 'Реквизиты обновлены во всех шаблонах закрывающих документов.'
      }
    ],
    timeline: [
      {
        id: 't-1032-1',
        time: '16:05',
        text: 'Анна создала заявку'
      },
      {
        id: 't-1032-2',
        time: '16:40',
        text: 'Статус изменён на «Закрыта»'
      }
    ]
  },
  {
    id: '1031',
    code: '#1031',
    title: 'Проверить интеграцию',
    customer: 'ООО «Сфера»',
    assignee: 'Брунгильда Б.',
    status: 'waiting',
    priority: 'normal',
    category: 'Интеграции и API',
    createdAt: 'Создана 2 октября, 11:18',
    dueAt: 'Сегодня, 17:00',
    description: 'Задерживается синхронизация статусов заказов между интернет-магазином и складским модулем через вебхуки.',
    comments: [
      {
        id: 'c-1031-1',
        author: 'Брунгильда Б.',
        time: '12:00',
        text: 'Ожидаем тестовый запрос со стороны внешнего провайдера логистики.'
      }
    ],
    timeline: [
      {
        id: 't-1031-1',
        time: '11:18',
        text: 'Максим создал заявку'
      },
      {
        id: 't-1031-2',
        time: '11:30',
        text: 'Назначен исполнитель Брунгильда Б.'
      },
      {
        id: 't-1031-3',
        time: '12:00',
        text: 'Статус изменён на «Ожидание»'
      }
    ]
  },
  {
    id: '1030',
    code: '#1030',
    title: 'Настроить VPN',
    customer: 'АО «Вектор»',
    assignee: 'Не назначен',
    status: 'new',
    priority: 'high',
    category: 'Инфраструктура и безопасность',
    createdAt: 'Создана 2 октября, 09:45',
    dueAt: 'Сегодня, 19:00',
    description: 'Требуется настроить VPN-подключение для удалённых сотрудников отдела аналитики.',
    comments: [],
    timeline: [
      {
        id: 't-1030-1',
        time: '09:45',
        text: 'Кирилл создал заявку'
      }
    ]
  },
  {
    id: '1029',
    code: '#1029',
    title: 'Заменить картридж принтера',
    customer: 'ООО «Сфера»',
    assignee: 'Не назначен',
    status: 'new',
    priority: 'low',
    category: 'Офисное оборудование',
    createdAt: 'Создана 1 октября, 18:20',
    dueAt: 'Сегодня, 18:00',
    description: 'В переговорной комнате закончился тонер в сетевом МФУ.',
    comments: [],
    timeline: [
      {
        id: 't-1029-1',
        time: '18:20',
        text: 'Виктор создал заявку'
      }
    ]
  },
  {
    id: '1028',
    code: '#1028',
    title: 'Восстановить доступ к почте',
    customer: 'АО «Вектор»',
    assignee: 'Брунгильда Б.',
    status: 'in-progress',
    priority: 'high',
    category: 'Почта и коммуникации',
    createdAt: 'Создана 1 октября, 15:10',
    dueAt: 'Сегодня, 12:00',
    description: 'Учётная запись заблокирована после смены пароля на мобильном устройстве.',
    comments: [],
    timeline: [
      {
        id: 't-1028-1',
        time: '15:10',
        text: 'Финансовый отдел создал заявку'
      }
    ]
  },
  {
    id: '1027',
    code: '#1027',
    title: 'Обновить антивирус',
    customer: 'ООО «Пульс»',
    assignee: 'Брунгильда Б.',
    status: 'resolved',
    priority: 'normal',
    category: 'Инфраструктура и безопасность',
    createdAt: 'Создана 1 октября, 12:00',
    dueAt: '2 октября, 12:00',
    description: 'Обновить базы антивирусной защиты на рабочих станциях бухгалтерии.',
    comments: [],
    timeline: [
      {
        id: 't-1027-1',
        time: '12:00',
        text: 'Системный администратор создал заявку'
      }
    ]
  },
  {
    id: '1026',
    code: '#1026',
    title: 'Подключить второй монитор',
    customer: 'ООО «Сфера»',
    assignee: 'Олег С.',
    status: 'assigned',
    priority: 'low',
    category: 'Офисное оборудование',
    createdAt: 'Создана 30 сентября, 16:45',
    dueAt: 'Завтра, 15:00',
    description: 'Выдать кабель DisplayPort и настроить второй экран на рабочем месте дизайнера.',
    comments: [],
    timeline: [
      {
        id: 't-1026-1',
        time: '16:45',
        text: 'Павел создал заявку'
      }
    ]
  },
  {
    id: '1025',
    code: '#1025',
    title: 'Проверить резервную копию',
    customer: 'ООО «Пульс»',
    assignee: 'Брунгильда Б.',
    status: 'in-progress',
    priority: 'high',
    category: 'Инфраструктура и безопасность',
    createdAt: 'Создана 30 сентября, 14:12',
    dueAt: 'Сегодня, 16:00',
    description: 'Провести плановую проверку восстановления архива базы данных на тестовом стенде.',
    comments: [],
    timeline: [
      {
        id: 't-1025-1',
        time: '14:12',
        text: 'Мониторинг создал заявку'
      }
    ]
  },
  {
    id: '1024',
    code: '#1024',
    title: 'Настроить общую папку',
    customer: 'АО «Вектор»',
    assignee: 'Не назначен',
    status: 'new',
    priority: 'normal',
    category: 'Доступ и учётные записи',
    createdAt: 'Создана 30 сентября, 11:05',
    dueAt: 'Завтра, 12:00',
    description: 'Создать сетевую директорию для обмена макетами между отделом маркетинга и подрядчиками.',
    comments: [],
    timeline: [
      {
        id: 't-1024-1',
        time: '11:05',
        text: 'Руководитель смены создал заявку'
      }
    ]
  },
  {
    id: '1023',
    code: '#1023',
    title: 'Продлить сертификат',
    customer: 'ООО «Пульс»',
    assignee: 'Олег С.',
    status: 'waiting',
    priority: 'high',
    category: 'Инфраструктура и безопасность',
    createdAt: 'Создана 29 сентября, 17:30',
    dueAt: '29 сентября, 19:00',
    description: 'Продлить корпоративный сертификат электронной подписи для портала отчётности.',
    comments: [],
    timeline: [
      {
        id: 't-1023-1',
        time: '17:30',
        text: 'Тестировщик создал заявку'
      }
    ]
  },
  {
    id: '1022',
    code: '#1022',
    title: 'Подключить IP-телефон',
    customer: 'ООО «Сфера»',
    assignee: 'Брунгильда Б.',
    status: 'assigned',
    priority: 'normal',
    category: 'Почта и коммуникации',
    createdAt: 'Создана 29 сентября, 13:15',
    dueAt: 'Сегодня, 18:00',
    description: 'Зарегистрировать новый SIP-аппарат на внутренний номер 412.',
    comments: [],
    timeline: [
      {
        id: 't-1022-1',
        time: '13:15',
        text: 'HR-отдел создал заявку'
      }
    ]
  },
  {
    id: '1021',
    code: '#1021',
    title: 'Исправить печать счетов',
    customer: 'АО «Вектор»',
    assignee: 'Брунгильда Б.',
    status: 'resolved',
    priority: 'normal',
    category: 'Отчётность и аналитика',
    createdAt: 'Создана 29 сентября, 10:20',
    dueAt: 'Завтра, 10:00',
    description: 'Скорректировать отступы таблицы в печатной форме счёта на оплату.',
    comments: [],
    timeline: [
      {
        id: 't-1021-1',
        time: '10:20',
        text: 'Андрей создал заявку'
      }
    ]
  },
  {
    id: '1020',
    code: '#1020',
    title: 'Настроить права в CRM',
    customer: 'ООО «Пульс»',
    assignee: 'Олег С.',
    status: 'waiting',
    priority: 'high',
    category: 'Доступ и учётные записи',
    createdAt: 'Создана 28 сентября, 16:00',
    dueAt: 'Пятница, 18:00',
    description: 'Настроить разграничение видимости сделок в CRM по региональным группам.',
    comments: [],
    timeline: [
      {
        id: 't-1020-1',
        time: '16:00',
        text: 'Системный архитектор создал заявку'
      }
    ]
  },
  {
    id: '1019',
    code: '#1019',
    title: 'Проверить синхронизацию',
    customer: 'ООО «Сфера»',
    assignee: 'Брунгильда Б.',
    status: 'closed',
    priority: 'low',
    category: 'Интеграции и API',
    createdAt: 'Создана 28 сентября, 11:10',
    dueAt: '28 сентября, 18:00',
    description: 'Проверить ночную синхронизацию справочника номенклатуры между ERP и витриной.',
    comments: [],
    timeline: [
      {
        id: 't-1019-1',
        time: '11:10',
        text: 'Екатерина создала заявку'
      }
    ]
  }
]

export const SERVER_USERS_DB: ServerUserRecord[] = [
  {
    id: 'u-1',
    name: 'Анна Кузнецова',
    shortName: 'Анна К.',
    role: 'Operator',
    roleLabel: 'Оператор',
    email: '0000@mail.demo',
    password: 'demo1234',
    initials: 'АК',
    company: 'WorkFlow Support',
    isActive: true
  },
  {
    id: 'u-2',
    name: 'Брунгильда Брунгильдовна',
    shortName: 'Брунгильда Б.',
    role: 'Agent',
    roleLabel: 'Исполнитель',
    email: 'agent@mail.demo',
    password: 'demo1234',
    initials: 'ББ',
    company: 'WorkFlow Support',
    isActive: true
  },
  {
    id: 'u-3',
    name: 'Олег Соколов',
    shortName: 'Олег С.',
    role: 'Agent',
    roleLabel: 'Исполнитель',
    email: 'oleg@mail.demo',
    password: 'demo1234',
    initials: 'ОС',
    company: 'WorkFlow Support',
    isActive: false
  },
  {
    id: 'u-4',
    name: 'Мария Смирнова',
    shortName: 'Мария С.',
    role: 'Client',
    roleLabel: 'Клиент',
    email: 'client@mail.demo',
    password: 'demo1234',
    initials: 'МС',
    company: 'АО «Вектор»',
    isActive: true
  },
  {
    id: 'u-5',
    name: 'Кирилл Серёгин',
    shortName: 'Кирилл С.',
    role: 'Admin',
    roleLabel: 'Администратор',
    email: 'admin@mail.demo',
    password: 'demo1234',
    initials: 'КС',
    company: 'WorkFlow Support',
    isActive: true
  },
  {
    id: 'u-6',
    name: 'Александра Константиновна Рождественская-Соколова',
    shortName: 'Александра Константиновна Рождественская-Соколова',
    role: 'Agent',
    roleLabel: 'Исполнитель',
    email: 'aleksandra@mail.demo',
    password: 'demo1234',
    initials: 'АР',
    company: 'WorkFlow Support',
    isActive: true
  }
]

export const SERVER_CUSTOMERS_DB: CustomerDirectoryItemDto[] = [
  { id: 'cust-1', name: 'АО «Вектор»', inn: '7701234567', contactPerson: 'Мария Смирнова' },
  { id: 'cust-2', name: 'ООО «Сфера»', inn: '7709876543', contactPerson: 'Игорь Петров' },
  { id: 'cust-3', name: 'ООО «Пульс»', inn: '7723456789', contactPerson: 'Елена Волкова' }
]

export const SERVER_CATEGORIES_DB: CategoryDirectoryItemDto[] = [
  { id: 'cat-1', name: 'Доступ и учётные записи', slaHours: 4 },
  { id: 'cat-2', name: 'Инфраструктура и безопасность', slaHours: 2 },
  { id: 'cat-3', name: 'Отчётность и аналитика', slaHours: 6 },
  { id: 'cat-4', name: 'Интеграции и API', slaHours: 8 },
  { id: 'cat-5', name: 'Почта и коммуникации', slaHours: 4 },
  { id: 'cat-6', name: 'Офисное оборудование', slaHours: 12 },
  { id: 'cat-7', name: 'Настройки профиля', slaHours: 24 }
]
