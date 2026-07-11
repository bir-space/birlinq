export const ru = {
  brand: "birlinq",
  brandMove: "birlinq Move",

  nav: {
    home: "Главная",
    activate: "Активировать",
    dashboard: "Кабинет",
    admin: "Админ",
    partner: "Партнёр",
    login: "Войти",
    logout: "Выйти",
  },

  landing: {
    hero: {
      chip: "birlinq Move",
      title: "Безопасная связь с владельцем авто через QR",
      subtitle:
        "Приватный QR-стикер вместо номера под стеклом. Сообщения доходят до владельца — контакты скрыты по умолчанию.",
      buyCta: "Получить стикер",
      activateCta: "Активировать QR",
    },
    features: {
      privacy: {
        title: "Приватность по умолчанию",
        desc: "Номер телефона и госномер скрыты. Только то, что разрешите показывать.",
      },
      speed: {
        title: "Мгновенное сканирование",
        desc: "Без регистрации для сканирующего. Сценарий выбирается в два клика.",
      },
      safety: {
        title: "Антиспам и контроль",
        desc: "Лимиты, блокировка, журнал обращений в вашем личном кабинете.",
      },
    },
    scenarios: {
      title: "Кто сканирует ваш QR и зачем?",
    },
    cta: {
      title: "Готовы подключить birlinq Move?",
      subtitle: "Оставьте заявку — получите партию QR-стикеров и доступ к кабинету.",
      btn: "Оставить заявку",
    },
    faq: {
      title: "Частые вопросы",
    },
  },

  auth: {
    loginTitle: "Войти в аккаунт",
    registerTitle: "Создать аккаунт",
    emailLabel: "E-mail",
    nameLabel: "Имя",
    passwordLabel: "Пароль",
    loginBtn: "Войти",
    registerBtn: "Зарегистрироваться",
    noAccount: "Нет аккаунта?",
    hasAccount: "Уже есть аккаунт?",
    registerLink: "Создать",
    loginLink: "Войти",
    errors: {
      invalid: "Неверный e-mail или пароль",
      conflict: "Пользователь с таким e-mail уже существует",
      generic: "Что-то пошло не так. Попробуйте снова.",
    },
  },

  activation: {
    steps: {
      lookup: "Проверка QR",
      auth: "Аккаунт",
      vehicle: "Авто",
      privacy: "Приватность",
      done: "Готово",
    },
    lookup: {
      title: "Активировать QR-стикер",
      codeLabel: "Код с наклейки",
      tokenLabel: "Токен активации",
      codePlaceholder: "Например: ABCD1234",
      tokenPlaceholder: "Введите токен из упаковки",
      submitBtn: "Проверить",
      errors: {
        notFound: "QR не найден. Проверьте код и токен.",
        alreadyActivated: "Этот QR уже активирован.",
        rateLimited: "Слишком много попыток. Подождите немного.",
        generic: "Ошибка проверки. Попробуйте снова.",
      },
    },
    vehicle: {
      title: "Данные автомобиля",
      makeLabel: "Марка",
      modelLabel: "Модель",
      colorLabel: "Цвет",
      plateLabel: "Госномер (опционально)",
      submitBtn: "Продолжить",
    },
    privacy: {
      title: "Настройки приватности",
      subtitle: "По умолчанию всё скрыто. Вы можете разрешить показывать отдельные данные.",
      showOwnerName: "Показывать имя владельца",
      showPhone: "Показывать телефон",
      showWhatsapp: "Показывать WhatsApp",
      showTelegram: "Показывать Telegram",
      showPlate: "Показывать госномер",
      showVehicleDetails: "Показывать марку/модель авто",
      submitBtn: "Сохранить и активировать",
    },
    success: {
      title: "QR активирован!",
      subtitle: "Ваш QR-стикер готов к работе.",
      dashboardBtn: "Перейти в кабинет",
      qrPageBtn: "Посмотреть публичную страницу",
    },
  },

  qr: {
    blockedTitle: "QR недоступен",
    blockedMsg: "Этот QR заблокирован или не активирован.",
    notFoundMsg: "QR-стикер не найден.",
    title: "Связаться с владельцем",
    privacyBadge: "Ваши данные защищены",
    vehicleSection: "Автомобиль",
    plateHidden: "Скрыто",
    scenarioTitle: "Выберите причину обращения",
    messageLabel: "Сообщение",
    messagePlaceholder: "Опишите ситуацию (необязательно для некоторых сценариев)",
    charsLeft: (n: number) => `Осталось: ${n}`,
    submitBtn: "Отправить",
    submitting: "Отправка…",
    success: "Сообщение отправлено. Владелец получит уведомление.",
    rateLimited: "Слишком много попыток. Подождите немного.",
    error: "Ошибка отправки. Проверьте соединение.",
    wantStickerTitle: "Хотите такую же наклейку?",
    wantStickerCta: "Узнать подробнее",
    reportAbuse: "Пожаловаться",
  },

  scenarios: {
    car_blocking: {
      title: "Блокирует проезд",
      desc: "Ваш автомобиль мешает другим",
      icon: "🚧",
    },
    window_open: {
      title: "Открыто окно",
      desc: "Забытое открытое окно",
      icon: "🪟",
    },
    alarm_triggered: {
      title: "Сработала сигнализация",
      desc: "Постоянный сигнал тревоги",
      icon: "🔔",
    },
    accident_urgent: {
      title: "Срочно: ДТП",
      desc: "Повреждение или авария",
      icon: "🚨",
    },
    custom_message: {
      title: "Другое сообщение",
      desc: "Свободный текст",
      icon: "✉️",
    },
    want_same_sticker: {
      title: "Хочу такую же наклейку",
      desc: "Оставить заявку",
      icon: "⭐",
    },
  },

  dashboard: {
    title: "Мой кабинет",
    totalQrs: "QR всего",
    activeQrs: "Активных QR",
    scans7d: "Сканирований (7 дн.)",
    scans30d: "Сканирований (30 дн.)",
    submissions7d: "Обращений (7 дн.)",
    unresolved: "Необработанных",
    myCars: "Мои автомобили",
    interactions: "Обращения",
    privacySettings: "Настройки приватности",
    noQrs: "Нет активных QR. Активируйте первый стикер.",
    noInteractions: "Нет обращений.",
    resolveBtn: "Решено",
    pauseBtn: "Приостановить",
    resumeBtn: "Возобновить",
    scanCount: (n: number) => `${n} сканирований`,
  },

  admin: {
    title: "Панель администратора",
    subtitle: "Управление QR, обращениями и партнёрами осуществляется через Filament Admin.",
    filamentLink: "Открыть Filament Admin",
  },

  partner: {
    title: "Партнёрский кабинет",
    subtitle: "Управление партиями и активациями.",
    filamentLink: "Открыть Partner Portal",
    batches: "Мои партии",
    total: "Всего QR",
    activated: "Активировано",
  },

  states: {
    loading: "Загрузка…",
    empty: "Нет данных",
    error: "Ошибка загрузки",
    retry: "Повторить",
    success: "Готово",
  },

  errors: {
    generic: "Что-то пошло не так.",
    network: "Нет соединения. Проверьте интернет.",
    unauthorized: "Необходима авторизация.",
    forbidden: "Недостаточно прав.",
    notFound: "Ресурс не найден.",
  },
};

export type RuDictionary = typeof ru;

