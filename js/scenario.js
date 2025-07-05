const createState = ({ key, showStatus = false, messages, options = [], requiresInput = false, next = null, autoNext = false, actionRedirect = false }) => ({
  key,
  showStatus,
  messages,
  options,
  requiresInput,
  next,
  autoNext,
  actionRedirect,
});

const createOption = (label, value, next) => ({
  label,
  value,
  next,
});

const chatScenario = (() => {
  const states = {};

  const addState = (stateConfig) => {
    const state = createState(stateConfig);
    states[state.key] = state;
  };

  addState({
    key: "start",
    messages: [],
    options: [
      createOption("Кто вы такие и как вам удалось построить крупную сеть?", "aboutCompany", "aboutCompany"),
      createOption("Какие инвестиции нужны для открытия одного магазина?", "investments", "city"),
      createOption("Какую прибыль может приносить рыбный магазин?", "profit", "city2"),
      createOption("Какую помощь мы окажем вам при открытии магазина?", "help", "help"),
      createOption("Как выглядят действующие магазины, которые вы открыли?", "gallery", "gallery"),
      createOption("Могу ли я пообщаться с владельцами магазинов сети?", "feedback", "feedback"),
      createOption("Хочу задать свой вопрос", "question", "question"),
    ],
  });

  addState({
    key: "aboutCompany",
    messages: [
      {
        type: 'text',
        value: "Магазины «ШефПорт» работают с 2018 года, а с 2020 мы развиваем франшизу. Продаем рыбу и морепродукты высокого качества и сами производим полуфабрикаты. Полуфабрикаты – это фишка нашего магазина 🙃, которая привлекает много клиентов! <br> <br> Мы хотим сделать так, чтобы о нашей продукции узнало как можно больше людей, поэтому развиваем франшизу по всей России, сейчас работают уже 100 точек. Помогаем нашим партнерам развить максимально успешные магазины и, тем самым, делаем так, чтобы о нас узнали все! Организуем максимально выгодное партнерство для обеих сторон 😉",
      },
      {
        type: 'text',
        value: "Мы можем направить вам подробную презентацию с подробным описанием, примерами, цифрами и прочим. Хотите ее получить? 🙂",
      },
    ],
    options: [
      createOption("Да", "yes", "contactOptions"),
      createOption("Нет", "no", "responseChoice"),
    ],
  });

  addState({
    key: "investments",
    messages: [
      {
        type: 'text',
        value: "Средний размер инвестиций для открытия магазинов = 1,2 млн рублей, точные расчеты зависят от размера города. Мы можем прислать вам финансовую модель с расчетами и сделать разбор конкретно для вашего города.",
      },
      {
        type: 'text',
        value: "Хотите получить финансовую модель франшизы? Там мы посчитали как быстро вы сможете окупить бизнес, какой будет ваша прибыль и что будет входить в стартовые инвестиции. Это интересно 🙂",
      },
    ],
    options: [
      createOption("Да", "yes", "contactOptions3"),
      createOption("Нет", "no", "responseChoice2"),
    ],
  });

  addState({
    key: "profit",
    messages: [
      {
        type: 'text',
        value: "Средний размер чистой прибыли наших партнеров = от 300 000 рублей. Мы имеем успешные кейсы даже в супер-маленьких городах! <br> <br> Поэтому если сомневаетесь, не сомневайтесь ❤️ Мы очень дорожим нашими партнерами и помогаем каждому достичь результатов!",
      },
      {
        type: 'text',
        value: "Хотите узнать, сколько вы можете зарабатывать в вашем городе?",
      },
    ],
    options: [
      createOption("Да", "yes", "contactOptions5"),
      createOption("Нет", "no", "responseChoice3"),
    ],
  });

  addState({
    key: "help",
    messages: [
      {
        type: 'text',
        value: "Наша команда сопровождает новых франчайзи буквально на каждом этапе работы 🙂Мы помогаем найти лучшее помещение, правильно оборудовать и оформить его в нашем фирменном стиле 💥Еще помогаем собрать сильную команду, настроить работу маркетинга и вообще полностью организовать работу бизнеса. <br> <br> В среднем, запуск одного магазина занимает около 3-х месяцев, но сроки опять же зависят от ваших стартовых условий (город, регион и прочее).",
      },
      {
        type: 'text',
        value: "У нас есть максимально подробный план открытия магазина и договор с условиями сотрудничества, где описаны все наши обязательства. Мы можем направить вам эти документы. Хотите?",
      },
    ],
    options: [
      createOption("Да", "yes", "contactOptions7"),
      createOption("Нет", "no", "questionFranchise4"),
    ],
  });

  addState({
    key: "gallery",
    messages: [
      {
        type: 'text',
        value: "Уже 100+ магазинов «ШефПорт» ведут свою работу по всей России. Вот так они выглядят:",
      },
      {
        type: 'swiper',
        value: [
          { src: "images/gallery-img-1.jpg" },
          { src: "images/gallery-img-2.jpg" },
          { src: "images/gallery-img-3.jpg" },
          { src: "images/gallery-img-4.jpg" },
          { src: "images/gallery-img-5.jpg" },
          { src: "images/gallery-img-6.jpg" },
        ],
      },
      {
        type: 'text',
        value: "К сожалению, возможности чат-бота не позволяют отправить больше фотографий, <br> но мы можем направить их вам лично.",
      },
      {
        type: 'text',
        value: "Хотите получить фотографии?",
      },
    ],
    options: [
      createOption("Да", "yes", "contactOptions8"),
      createOption("Нет", "no", "questionFranchise5"),
    ],
  });

  addState({
    key: "feedback",
    messages: [
      {
        type: 'text',
        value: "Конечно! Мы регулярно проводим закрытые онлайн-встречи с нашими партнерами, где можно обсудить все детали и задать абсолютно любой вопрос о работе бизнеса.",
      },
      {
        type: 'text',
        value: "Записать вас на нашу встречу? 🥰",
      },
    ],
    options: [
      createOption("Да", "yes", "contactOptions9"),
      createOption("Нет", "no", "responseChoice4"),
    ],
  });

  addState({
    key: "question",
    messages: [
      {
        type: 'text',
        value: "Что вас интересует?",
      },
    ],
    requiresInput: true,
    next: "contactOptions11",
  });

  addState({
    key: "responseChoice",
    messages: [
      {
        type: 'text',
        value: "Может вы хотите получить каталог продукции и ознакомиться с нашими товарами?",
      },
    ],
    options: [
      createOption("Да", "yes", "contactOptions2"),
      createOption("Нет", "no", "questionFranchise"),
    ],
  });

  addState({
    key: "responseChoice2",
    messages: [
      {
        type: 'text',
        value: "Может вы хотите посмотреть на реальные кейсы нашей франшизы?",
      },
    ],
    options: [
      createOption("Да", "yes", "contactOptions4"),
      createOption("Нет", "no", "questionFranchise2"),
    ],
  });

  addState({
    key: "responseChoice3",
    messages: [
      {
        type: 'text',
        value: "Может вы хотите получить подробную презентацию франшизы? Мы там подробно все описали, привели цифры, примеры и прочее",
      },
    ],
    options: [
      createOption("Да", "yes", "contactOptions6"),
      createOption("Нет", "no", "questionFranchise3"),
    ],
  });

  addState({
    key: "responseChoice4",
    messages: [
      {
        type: 'text',
        value: "Может вы хотите получить видео-отзывы наших партнеров?",
      },
    ],
    options: [
      createOption("Да", "yes", "contactOptions10"),
      createOption("Нет", "no", "questionFranchise6"),
    ],
  });

  addState({
    key: "responseChoice5",
    messages: [
      {
        type: 'text',
        value: "Вам лучше позвонить или написать?",
      },
    ],
    options: [
      createOption("Позвонить", "call", "name7"),
      createOption("Написать", "write", "name7"),

    ],
  });

  addState({
    key: "contactOptions",
    messages: [
      {
        type: 'text',
        value: "Отлично! В какой мессенджер вам отправить презентацию?",
      },
    ],
    options: [
      createOption("Telegram", "telegram", "phone"),
      createOption("WhatsApp", "whatsapp", "phone"),
      createOption("Viber", "viber", "phone"),
    ],
  });

  addState({
    key: "contactOptions2",
    messages: [
      {
        type: 'text',
        value: "Отлично! В какой мессенджер вам отправить каталог?",
      },
    ],
    options: [
      createOption("Telegram", "telegram", "phone2"),
      createOption("WhatsApp", "whatsapp", "phone2"),
      createOption("Viber", "viber", "phone2"),
    ],
  });

  addState({
    key: "contactOptions3",
    messages: [
      {
        type: 'text',
        value: "В какой мессенджер вам отправить финансовую модель франшизы?",
      },
    ],
    options: [
      createOption("Telegram", "telegram", "phone4"),
      createOption("WhatsApp", "whatsapp", "phone4"),
      createOption("Viber", "viber", "phone4"),
    ],
  });

  addState({
    key: "contactOptions4",
    messages: [
      {
        type: 'text',
        value: "В какой мессенджер вам направить фото магазинов и отзывы наших партнеров?",
      },
    ],
    options: [
      createOption("Telegram", "telegram", "phone3"),
      createOption("WhatsApp", "whatsapp", "phone3"),
      createOption("Viber", "viber", "phone3"),
    ],
  });

  addState({
    key: "contactOptions5",
    messages: [
      {
        type: 'text',
        value: "У нас для этого есть классная фин.модель 🙂 Куда вам ее направить?",
      },
    ],
    options: [
      createOption("Telegram", "telegram", "phone4"),
      createOption("WhatsApp", "whatsapp", "phone4"),
      createOption("Viber", "viber", "phone4"),
    ],
  });

  addState({
    key: "contactOptions6",
    messages: [
      {
        type: 'text',
        value: "Куда вам ее направить?",
      },
    ],
    options: [
      createOption("Telegram", "telegram", "phone5"),
      createOption("WhatsApp", "whatsapp", "phone5"),
      createOption("Viber", "viber", "phone5"),
    ],
  });

  addState({
    key: "contactOptions7",
    messages: [
      {
        type: 'text',
        value: "В какой мессенджер вам направить план запуска и договор сотрудничества?",
      },
    ],
    options: [
      createOption("Telegram", "telegram", "phone6"),
      createOption("WhatsApp", "whatsapp", "phone6"),
      createOption("Viber", "viber", "phone6"),
    ],
  });

  addState({
    key: "contactOptions8",
    messages: [
      {
        type: 'text',
        value: "Где вам удобнее получить фотографии?",
      },
    ],
    options: [
      createOption("Telegram", "telegram", "phone7"),
      createOption("WhatsApp", "whatsapp", "phone7"),
      createOption("Viber", "viber", "phone7"),
    ],
  });

  addState({
    key: "contactOptions9",
    messages: [
      {
        type: 'text',
        value: "Где вам будет удобнее назначить дату и время встречи?",
      },
    ],
    options: [
      createOption("Telegram", "telegram", "phone6"),
      createOption("WhatsApp", "whatsapp", "phone6"),
      createOption("Viber", "viber", "phone6"),
    ],
  });

  addState({
    key: "contactOptions10",
    messages: [
      {
        type: 'text',
        value: "Куда их лучше направить?",
      },
    ],
    options: [
      createOption("Telegram", "telegram", "phone8"),
      createOption("WhatsApp", "whatsapp", "phone8"),
      createOption("Viber", "viber", "phone8"),
    ],
  });

  addState({
    key: "contactOptions11",
    messages: [
      {
        type: 'text',
        value: "Мы передали ваш вопрос менеджеру и он уже готов связаться с вами, чтобы ответить на него лично. Где вам удобнее связаться?",
      },
    ],
    options: [
      createOption("Telegram", "telegram", "phone8"),
      createOption("WhatsApp", "whatsapp", "phone8"),
      createOption("Viber", "viber", "phone8"),
    ],
  });

  addState({
    key: "phone",
    messages: [
      {
        type: 'text',
        value: "Оставьте, пожалуйста, свой номер телефона и мы сейчас же пришлем вам презентацию 👍",
      },
    ],
    requiresInput: true,
    next: "name",
  });

  addState({
    key: "phone2",
    messages: [
      {
        type: 'text',
        value: "Оставьте, пожалуйста, свой номер телефона и мы сейчас же пришлем вам каталог👍",
      },
    ],
    requiresInput: true,
    next: "name2",
  });

  addState({
    key: "phone3",
    messages: [
      {
        type: 'text',
        value: "Оставьте, пожалуйста, ваш номер телефона и мы сразу же свяжемся с вами!",
      },
    ],
    requiresInput: true,
    next: "name3",
  });

  addState({
    key: "phone4",
    messages: [
      {
        type: 'text',
        value: "Оставьте, пожалуйста, свой номер телефона и мы сейчас же отправим вам фин.модель 👍",
      },
    ],
    requiresInput: true,
    next: "name4",
  });

  addState({
    key: "phone5",
    messages: [
      {
        type: 'text',
        value: "Оставьте, пожалуйста, свой номер телефона и мы сейчас же отправим вам презентацию 👍",
      },
    ],
    requiresInput: true,
    next: "name",
  });

  addState({
    key: "phone6",
    messages: [
      {
        type: 'text',
        value: "Оставьте ваш номер телефона 😉",
      },
    ],
    requiresInput: true,
    next: "name5",
  });

  addState({
    key: "phone7",
    messages: [
      {
        type: 'text',
        value: "Оставьте ваш номер телефона, и мы с минуты на минуту направим вам фото других магазинов 😉",
      },
    ],
    requiresInput: true,
    next: "name6",
  });

  addState({
    key: "phone8",
    messages: [
      {
        type: 'text',
        value: "Оставьте ваш номер телефона 😉",
      },
    ],
    requiresInput: true,
    next: "responseChoice5",
  });

  addState({
    key: "name",
    messages: [
      {
        type: 'text',
        value: "Как мы можем к вам обращаться?",
      },
    ],
    requiresInput: true,
    next: "end",
  });

  addState({
    key: "name2",
    messages: [
      {
        type: 'text',
        value: "Как мы можем к вам обращаться?",
      },
    ],
    requiresInput: true,
    next: "end2",
  });

  addState({
    key: "name3",
    messages: [
      {
        type: 'text',
        value: "Как мы можем к вам обращаться?",
      },
    ],
    requiresInput: true,
    next: "end3",
  });

  addState({
    key: "name4",
    messages: [
      {
        type: 'text',
        value: "Как мы можем к вам обращаться?",
      },
    ],
    requiresInput: true,
    next: "end4",
  });

  addState({
    key: "name5",
    messages: [
      {
        type: 'text',
        value: "Как мы можем к вам обращаться?",
      },
    ],
    requiresInput: true,
    next: "end5",
  });

  addState({
    key: "name6",
    messages: [
      {
        type: 'text',
        value: "Как мы можем к вам обращаться?",
      },
    ],
    requiresInput: true,
    next: "end6",
  });

  addState({
    key: "name7",
    messages: [
      {
        type: 'text',
        value: "Как мы можем к вам обращаться?",
      },
    ],
    requiresInput: true,
    next: "end7",
  });

  addState({
    key: "city",
    messages: [
      {
        type: 'text',
        value: "В каком городе вы проживаете?",
      },
    ],
    requiresInput: true,
    next: "investments",
  });

  addState({
    key: "city2",
    messages: [
      {
        type: 'text',
        value: "В каком городе вы проживаете?",
      },
    ],
    requiresInput: true,
    next: "profit",
  });

  addState({
    key: "end",
    showStatus: true,
    messages: [
      {
        type: 'text',
        value: "Спасибо! Ожидайте презентацию с минуты на минуту 😉",
      },
    ],
    actionRedirect: true,
  });

  addState({
    key: "end2",
    showStatus: true,
    messages: [
      {
        type: 'text',
        value: "Спасибо! Ожидайте каталог с минуты на минуту 😉",
      },
    ],
    actionRedirect: true,
  });

  addState({
    key: "end3",
    showStatus: true,
    messages: [
      {
        type: 'text',
        value: "Спасибо🙂",
      },
    ],
    actionRedirect: true,
  });

  addState({
    key: "end4",
    showStatus: true,
    messages: [
      {
        type: 'text',
        value: "Спасибо! Ожидайте фин.модель с минуты на минуту 😉",
      },
    ],
    actionRedirect: true,
  });

  addState({
    key: "end5",
    showStatus: true,
    messages: [
      {
        type: 'text',
        value: "Наш менеджер уже ждет вас в вашем личном чате😉",
      },
    ],
    actionRedirect: true,
  });

  addState({
    key: "end6",
    showStatus: true,
    messages: [
      {
        type: 'text',
        value: "Уже скоро вы получите фото 🙂",
      },
    ],
    actionRedirect: true,
  });

  addState({
    key: "end7",
    showStatus: true,
    messages: [
      {
        type: 'text',
        value: "Спасибо! Скоро мы свяжемся с вами😉",
      },
    ],
    actionRedirect: true,
  });

  addState({
    key: "questionFranchise",
    messages: [
      {
        type: 'text',
        value: "Может вас заинтересуют другие вопросы о работе франшизы?",
      },
      {
        type: 'options',
        value: [
          createOption("Какие инвестиции нужны для открытия одного магазина?", "investments", "city"),
          createOption("Какую прибыль может приносить рыбный магазин?", "profit", "city2"),
          createOption("Какую помощь мы окажем вам при открытии магазина?", "help", "help"),
          createOption("Как выглядят действующие магазины, которые вы открыли?", "gallery", "gallery"),
          createOption("Могу ли я пообщаться с владельцами магазинов сети?", "feedback", "feedback"),
          createOption("Хочу задать свой вопрос", "question", "question"),
        ]
      },
      {
        type: 'text',
        value: "Если вы не нашли то, что искали, вы можете задать вопрос напрямую нашему менеджеру 😉",
      },
      {
        type: 'text',
        value: "Оставьте, пожалуйста, ваш номер телефона и мы сразу же свяжемся с вами!",
      },
    ],
    requiresInput: true,
    next: "name3",
  });

  addState({
    key: "questionFranchise2",
    messages: [
      {
        type: 'text',
        value: "Может вас заинтересуют другие вопросы о работе франшизы?",
      },
      {
        type: 'options',
        value: [
          createOption("Кто вы такие и как вам удалось построить крупную сеть?", "aboutCompany", "aboutCompany"),
          createOption("Какую прибыль может приносить рыбный магазин?", "profit", "city2"),
          createOption("Какую помощь мы окажем вам при открытии магазина?", "help", "help"),
          createOption("Как выглядят действующие магазины, которые вы открыли?", "gallery", "gallery"),
          createOption("Могу ли я пообщаться с владельцами магазинов сети?", "feedback", "feedback"),
          createOption("Хочу задать свой вопрос", "question", "question"),
        ]
      },
      {
        type: 'text',
        value: "Если вы не нашли то, что искали, вы можете задать вопрос напрямую нашему менеджеру 😉",
      },
      {
        type: 'text',
        value: "Оставьте, пожалуйста, ваш номер телефона и мы сразу же свяжемся с вами!",
      },
    ],
    requiresInput: true,
    next: "name3",
  });

  addState({
    key: "questionFranchise3",
    messages: [
      {
        type: 'text',
        value: "Может вас заинтересуют другие вопросы о работе франшизы?",
      },
      {
        type: 'options',
        value: [
          createOption("Кто вы такие и как вам удалось построить крупную сеть?", "aboutCompany", "aboutCompany"),
          createOption("Какие инвестиции нужны для открытия одного магазина?", "investments", "city"),
          createOption("Какую помощь мы окажем вам при открытии магазина?", "help", "help"),
          createOption("Как выглядят действующие магазины, которые вы открыли?", "gallery", "gallery"),
          createOption("Могу ли я пообщаться с владельцами магазинов сети?", "feedback", "feedback"),
          createOption("Хочу задать свой вопрос", "question", "question"),
        ]
      },
      {
        type: 'text',
        value: "Если вы не нашли то, что искали, вы можете задать вопрос напрямую нашему менеджеру 😉",
      },
      {
        type: 'text',
        value: "Оставьте, пожалуйста, ваш номер телефона и мы сразу же свяжемся с вами!",
      },
    ],
    requiresInput: true,
    next: "name3",
  });

  addState({
    key: "questionFranchise4",
    messages: [
      {
        type: 'text',
        value: "Может вас заинтересуют другие вопросы о работе франшизы?",
      },
      {
        type: 'options',
        value: [
          createOption("Кто вы такие и как вам удалось построить крупную сеть?", "aboutCompany", "aboutCompany"),
          createOption("Какие инвестиции нужны для открытия одного магазина?", "investments", "city"),
          createOption("Какую прибыль может приносить рыбный магазин?", "profit", "city2"),
          createOption("Как выглядят действующие магазины, которые вы открыли?", "gallery", "gallery"),
          createOption("Могу ли я пообщаться с владельцами магазинов сети?", "feedback", "feedback"),
          createOption("Хочу задать свой вопрос", "question", "question"),
        ]
      },
      {
        type: 'text',
        value: "Если вы не нашли то, что искали, вы можете задать вопрос напрямую нашему менеджеру 😉",
      },
      {
        type: 'text',
        value: "Оставьте, пожалуйста, ваш номер телефона и мы сразу же свяжемся с вами!",
      },
    ],
    requiresInput: true,
    next: "name3",
  });

  addState({
    key: "questionFranchise5",
    messages: [
      {
        type: 'text',
        value: "Может вас заинтересуют другие вопросы о работе франшизы?",
      },
      {
        type: 'options',
        value: [
          createOption("Кто вы такие и как вам удалось построить крупную сеть?", "aboutCompany", "aboutCompany"),
          createOption("Какие инвестиции нужны для открытия одного магазина?", "investments", "city"),
          createOption("Какую помощь мы окажем вам при открытии магазина?", "help", "help"),
          createOption("Какую прибыль может приносить рыбный магазин?", "profit", "city2"),
          createOption("Могу ли я пообщаться с владельцами магазинов сети?", "feedback", "feedback"),
          createOption("Хочу задать свой вопрос", "question", "question"),
        ]
      },
      {
        type: 'text',
        value: "Если вы не нашли то, что искали, вы можете задать вопрос напрямую нашему менеджеру 😉",
      },
      {
        type: 'text',
        value: "Оставьте, пожалуйста, ваш номер телефона и мы сразу же свяжемся с вами!",
      },
    ],
    requiresInput: true,
    next: "name3",
  });

  addState({
    key: "questionFranchise6",
    messages: [
      {
        type: 'text',
        value: "Может вас заинтересуют другие вопросы о работе франшизы?",
      },
      {
        type: 'options',
        value: [
          createOption("Кто вы такие и как вам удалось построить крупную сеть?", "aboutCompany", "aboutCompany"),
          createOption("Какие инвестиции нужны для открытия одного магазина?", "investments", "city"),
          createOption("Какую прибыль может приносить рыбный магазин?", "profit", "city2"),
          createOption("Какую помощь мы окажем вам при открытии магазина?", "help", "help"),
          createOption("Как выглядят действующие магазины, которые вы открыли?", "gallery", "gallery"),
          createOption("Хочу задать свой вопрос", "question", "question"),
        ]
      },
      {
        type: 'text',
        value: "Если вы не нашли то, что искали, вы можете задать вопрос напрямую нашему менеджеру 😉",
      },
      {
        type: 'text',
        value: "Оставьте, пожалуйста, ваш номер телефона и мы сразу же свяжемся с вами!",
      },
    ],
    requiresInput: true,
    next: "name3",
  });

  return states;
})();
