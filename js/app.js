// Хранение данных
const chatHistory = [];

const chatContent = document.getElementById("chatContent");
const typingIndicator = document.getElementById("typingIndicator");
const botNotificationSound = new Audio('audio/ringtone.mp3');
let lastOptions = null;
let isBotBusy = false;
let allowedScroll = false;
let botMessageCount = 0;
let swiperInstance = null;
let isProcessingBreak = false; // Флаг для отслеживания обработки [BREAK]

// Флаг для отслеживания режима работы (AI или сценарий)
let isScenarioMode = false;

import startQuestions from './startQuestions.js';
import messengerOptions from './messengerOptions.js';
import cityInput from './cityInput.js';
import nameInput from './nameInput.js';
import phoneInput from './phoneInput.js';
import freeQuestionInput from './freeQuestionInput.js';
import renderGallerySwiper from './gallerySwiper.js';
import renderYesNoOptions from './yesNoOptions.js';

$(document).one("click", ".response-options button", function() {
  allowedScroll = true
});

function animateFadeIn(element) {
  anime({
    targets: element,
    opacity: [0, 1],
    translateY: [-10, 0],
    duration: 600,
    easing: "easeOutQuad",
  });
}

function smoothScrollToBottom() {
  if (!allowedScroll) {
    return
  }

  anime({
    targets: [document.documentElement, document.body],
    scrollTop: chatContent.scrollHeight + 40,
    duration: 800,
    easing: "easeInOutQuad",
  });
}

function displayStatus(status) {
  const statusContainer = document.querySelector('#status');
  
  if (statusContainer) {
    if (status) {

      statusContainer.style.display = 'block';
      anime({
        targets: statusContainer,
        opacity: [0, 1],
        translateY: [8, 0],
        duration: 800,
        easing: 'easeOutQuad',
      });
    } else {
      statusContainer.style.display = 'none';
    }
  }
}

function clearOptions() {
  if (lastOptions) {
    lastOptions.remove();
    lastOptions = null;
  }
}

// Парсер спецсимволов для markdown-стиля (жирный, списки)
function parseSpecialFormatting(text) {
  if (typeof text !== 'string') return text;
  
  // Сначала обрабатываем специальные теги, которые должны остаться
  let safe = text;
  
  // Защищаем <br> теги от экранирования
  safe = safe.replace(/<br>/gi, '___BR___');
  
  // Экранирование HTML (кроме защищенных тегов)
  safe = safe.replace(/[&<>]/g, function(tag) {
    const chars = { '&': '&amp;', '<': '&lt;', '>': '&gt;' };
    return chars[tag] || tag;
  });
  
  // Восстанавливаем <br> теги
  safe = safe.replace(/___BR___/g, '<br>');
  
  // Жирный текст **текст**
  safe = safe.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
  
  // Перенос нумерованных списков (1. ... 2. ...)
  // В начале строки или после \n, ищем "число. " и переносим на новую строку
  safe = safe.replace(/(\d+\.) /g, '\n$1 ');
  
  // Удаляем лишний перенос в начале
  safe = safe.replace(/^\n+/, '');
  
  // Переводим \n в <br>
  safe = safe.replace(/\n/g, '<br>');
  
  return safe;
}

function appendMessage({ text, value, key, isUser, skipScroll, isBreakPart }) {
  // Скрыть [END_CONVERSATION] для пользователя
  if (typeof text === 'string' && text.includes('[END_CONVERSATION]')) {
    const cleaned = text.replace(/\[END_CONVERSATION\]/g, '').trim();
    if (cleaned) {
      appendMessage({ text: cleaned, value, key, isUser, skipScroll });
    }
    return;
  }
  // Парсер меток для интерактивных элементов
  if (!isUser && typeof text === 'string') {
    // [BREAK] - с задержкой между частями для сообщений от бота
    if (text.includes('[BREAK]')) {
      const parts = text.split('[BREAK]').map(part => part.trim()).filter(Boolean);
      isProcessingBreak = true; // Устанавливаем флаг
      (async function showPartsWithDelay() {
        for (let i = 0; i < parts.length; i++) {
          const part = parts[i];
          // Показываем индикатор печати перед каждым пузырьком
          const delay = Math.min(part.length * 15, 3800);
          await showTypingIndicator(delay);
          // Задержка 300мс после индикатора
          await new Promise(resolve => setTimeout(resolve, 300));
          // Используем рекурсивный вызов appendMessage для обработки всех меток в каждой части
          // Передаем флаг isProcessingBreak чтобы индикатор не скрывался
          appendMessage({ text: part, value, key, isUser, skipScroll, isBreakPart: true });
        }
        // Скрываем индикатор печати только после обработки ВСЕХ частей
        isProcessingBreak = false; // Сбрасываем флаг
        setTimeout(() => {
          hideTypingIndicator();
        }, 600);
      })();
      return;
    }
    // [START_QUESTIONS]
    if (text.includes('[START_QUESTIONS]')) {
      const parts = text.split('[START_QUESTIONS]');
      const before = parts[0]?.trim();
      const after = parts[1]?.trim();
      if (before) {
        const message = document.createElement("div");
        message.className = `message bot-message`;
        message.innerHTML = `<p>${before}</p>`;
        chatContent.appendChild(message);
        animateFadeIn(message);
        botNotificationSound.play();
        if (!skipScroll) smoothScrollToBottom();
      }
      // Централизованная задержка через appendBotMessageWithDelay
      appendBotMessageWithDelay({ type: 'startQuestions' }, 'startQuestions');
      if (after) {
        const message = document.createElement("div");
        message.className = `message bot-message`;
        message.innerHTML = `<p>${after}</p>`;
        chatContent.appendChild(message);
        animateFadeIn(message);
        botNotificationSound.play();
        if (!skipScroll) smoothScrollToBottom();
      }
      chatHistory.push({ sender: "bot", key: key, message: '[START_QUESTIONS]', timestamp: new Date().toISOString() });
      return;
    }
    // [ASK_CITY]
    if (text.includes('[ASK_CITY]')) {
      const parts = text.split('[ASK_CITY]');
      const before = parts[0]?.trim();
      const after = parts[1]?.trim();
      if (before) {
        const message = document.createElement("div");
        message.className = `message bot-message`;
        message.innerHTML = `<p>${before}</p>`;
        chatContent.appendChild(message);
        animateFadeIn(message);
        botNotificationSound.play();
        if (!skipScroll) smoothScrollToBottom();
      }
      renderCityInputWithAI(key || 'city', (userCity) => {});
      if (after) {
        const message = document.createElement("div");
        message.className = `message bot-message`;
        message.innerHTML = `<p>${after}</p>`;
        chatContent.appendChild(message);
        animateFadeIn(message);
        botNotificationSound.play();
        if (!skipScroll) smoothScrollToBottom();
      }
      chatHistory.push({ sender: "bot", key: key, message: '[ASK_CITY]', timestamp: new Date().toISOString() });
      return;
    }
    // [ASK_PHONE]
    if (text.includes('[ASK_PHONE]')) {
      const parts = text.split('[ASK_PHONE]');
      const before = parts[0]?.trim();
      const after = parts[1]?.trim();
      if (before) {
        const message = document.createElement("div");
        message.className = `message bot-message`;
        message.innerHTML = `<p>${before}</p>`;
        chatContent.appendChild(message);
        animateFadeIn(message);
        botNotificationSound.play();
        if (!skipScroll) smoothScrollToBottom();
      }
      renderPhoneInputWithAI(key || 'phone', (userPhone) => {});
      if (after) {
        const message = document.createElement("div");
        message.className = `message bot-message`;
        message.innerHTML = `<p>${after}</p>`;
        chatContent.appendChild(message);
        animateFadeIn(message);
        botNotificationSound.play();
        if (!skipScroll) smoothScrollToBottom();
      }
      chatHistory.push({ sender: "bot", key: key, message: '[ASK_PHONE]', timestamp: new Date().toISOString() });
      return;
    }
    // [ASK_MESSENGER]
    if (text.includes('[ASK_MESSENGER]')) {
      const parts = text.split('[ASK_MESSENGER]');
      const before = parts[0]?.trim();
      const after = parts[1]?.trim();
      if (before) {
        const message = document.createElement("div");
        message.className = `message bot-message`;
        message.innerHTML = `<p>${before}</p>`;
        chatContent.appendChild(message);
        animateFadeIn(message);
        botNotificationSound.play();
        if (!skipScroll) smoothScrollToBottom();
      }
      renderModuleOptionsWithAI(key || 'messenger', messengerOptions, (value, next) => {
        // Callback для обработки выбора мессенджера
        if (next) processChatState(next);
      });
      if (after) {
        const message = document.createElement("div");
        message.className = `message bot-message`;
        message.innerHTML = `<p>${after}</p>`;
        chatContent.appendChild(message);
        animateFadeIn(message);
        botNotificationSound.play();
        if (!skipScroll) smoothScrollToBottom();
      }
      chatHistory.push({ sender: "bot", key: key, message: '[ASK_MESSENGER]', timestamp: new Date().toISOString() });
      return;
    }
    // [SHOW_MAGNET_OPTIONS]
    if (text.includes('[SHOW_MAGNET_OPTIONS]')) {
      const parts = text.split('[SHOW_MAGNET_OPTIONS]');
      const before = parts[0]?.trim();
      const after = parts[1]?.trim();
      if (before) {
        const message = document.createElement("div");
        message.className = `message bot-message`;
        message.innerHTML = `<p>${before}</p>`;
        chatContent.appendChild(message);
        animateFadeIn(message);
        botNotificationSound.play();
        if (!skipScroll) smoothScrollToBottom();
      }
      renderYesNoOptionsWithAI(key || 'magnet');
      if (after) {
        const message = document.createElement("div");
        message.className = `message bot-message`;
        message.innerHTML = `<p>${after}</p>`;
        chatContent.appendChild(message);
        animateFadeIn(message);
        botNotificationSound.play();
        if (!skipScroll) smoothScrollToBottom();
      }
      chatHistory.push({ sender: "bot", key: key, message: '[SHOW_MAGNET_OPTIONS]', timestamp: new Date().toISOString() });
      return;
    }
    // [PHOTO]
    if (text.includes('[PHOTO]')) {
      const parts = text.split('[PHOTO]');
      const before = parts[0]?.trim();
      const after = parts[1]?.trim();
      if (before) {
        const message = document.createElement("div");
        message.className = `message bot-message`;
        message.innerHTML = `<p>${before}</p>`;
        chatContent.appendChild(message);
        animateFadeIn(message);
        botNotificationSound.play();
        if (!skipScroll) smoothScrollToBottom();
      }
      // Пример набора фото (можно заменить на реальные пути)
      const photos = [
        { src: 'images/gallery-img-1.jpg' },
        { src: 'images/gallery-img-2.jpg' },
        { src: 'images/gallery-img-3.jpg' },
        { src: 'images/gallery-img-4.jpg' },
        { src: 'images/gallery-img-5.jpg' },
        { src: 'images/gallery-img-6.jpg' }
      ];
      renderGallerySwiper(photos);
      if (after) {
        const message = document.createElement("div");
        message.className = `message bot-message`;
        message.innerHTML = `<p>${after}</p>`;
        chatContent.appendChild(message);
        animateFadeIn(message);
        botNotificationSound.play();
        if (!skipScroll) smoothScrollToBottom();
      }
      chatHistory.push({ sender: "bot", key: key, message: '[PHOTO]', timestamp: new Date().toISOString() });
      return;
    }
    // [ASK_NAME]
    if (text.includes('[ASK_NAME]')) {
      const parts = text.split('[ASK_NAME]');
      const before = parts[0]?.trim();
      const after = parts[1]?.trim();
      if (before) {
        const message = document.createElement("div");
        message.className = `message bot-message`;
        message.innerHTML = `<p>${before}</p>`;
        chatContent.appendChild(message);
        animateFadeIn(message);
        botNotificationSound.play();
        if (!skipScroll) smoothScrollToBottom();
      }
      if (isScenarioMode) {
        renderNameInput(key || 'name', () => {});
      } else {
        renderNameInputWithAI(key || 'name', 'end');
      }
      if (after) {
        const message = document.createElement("div");
        message.className = `message bot-message`;
        message.innerHTML = `<p>${after}</p>`;
        chatContent.appendChild(message);
        animateFadeIn(message);
        botNotificationSound.play();
        if (!skipScroll) smoothScrollToBottom();
      }
      chatHistory.push({ sender: "bot", key: key, message: '[ASK_NAME]', timestamp: new Date().toISOString() });
      return;
    }
  }

  const message = document.createElement("div");
  message.className = `message ${isUser ? "user-message" : "bot-message"}`;
  // Применяем парсер только для сообщений бота
  const formattedText = isUser ? text : parseSpecialFormatting(text);
  message.innerHTML = `<p>${formattedText}</p>`;
  chatContent.appendChild(message);

  chatHistory.push({
    sender: isUser ? "user" : "bot",
    key: key,
    message: value || text,
    timestamp: new Date().toISOString(),
  });

  animateFadeIn(message);
  if (!isUser) {
    swiperInstance = message;
    // Воспроизводим звуковой сигнал для сообщений от бота
    botNotificationSound.play();
    // Скрываем индикатор печати для обычных сообщений от бота
    // НО только если это не часть [BREAK] последовательности
    if (!isProcessingBreak && !isBreakPart) {
      setTimeout(() => {
        hideTypingIndicator();
      }, 600);
    }
  }
  if (!skipScroll) smoothScrollToBottom();

  return message;
}

function showTypingIndicator(delay) {

  anime({
    targets: typingIndicator,
    opacity: 1,
    duration: 400,
    translateX: [-2, 0],
    easing: 'easeInOutQuad',
    begin: () => {
      if (typingIndicator) {
        typingIndicator.style.display = 'block';
      }
    },
  });

  return new Promise((resolve) => {
    setTimeout(() => {
      anime({
        targets: typingIndicator,
        opacity: 0,
        duration: 200,
        translateX: [0, 0],
        easing: 'easeInOutQuad',
        complete: () => {
          if (typingIndicator) {
            typingIndicator.style.display = 'none';
          }
          resolve()
          },
        });
    }, delay)
  })
}

// Функция для скрытия индикатора печати
function hideTypingIndicator() {
  if (typingIndicator) {
    anime({
      targets: typingIndicator,
      opacity: 0,
      duration: 200,
      translateX: [0, 0],
      easing: 'easeInOutQuad',
      complete: () => {
        if (typingIndicator) {
          typingIndicator.style.display = 'none';
        }
      },
    });
  }
}

// Функция для показа индикатора печати без автоматического скрытия
function showTypingIndicatorManual() {
  if (typingIndicator) {
    anime({
      targets: typingIndicator,
      opacity: 1,
      duration: 400,
      translateX: [-2, 0],
      easing: 'easeInOutQuad',
      begin: () => {
        if (typingIndicator) {
          typingIndicator.style.display = 'block';
        }
      },
    });
  }
}

async function appendBotMessageWithDelay(message, key) {
  const delayMap = {
    'text':  Math.min(message.value?.length * 15 || 0, 3800),
    'swiper': 2000,
    'yesno': 500,
    'startQuestions': 1500
  }

  isBotBusy = true;

  // Показываем индикатор печати в обоих режимах
  await showTypingIndicator(delayMap[message.type] || 0);
  await new Promise(resolve => setTimeout(resolve, 280));

  botNotificationSound.play();

  switch(message.type) {
    case 'text':
      // Применяем форматирование для текстовых сообщений
      const formattedText = parseSpecialFormatting(message.value);
      appendMessage({ text: formattedText, key: key });
      break;
    case 'swiper':
      renderGallerySwiper(message.value);
      break;
    case 'options':
      renderOptions(key, message.value);
      break;
    case 'yesno':
      if (isScenarioMode) {
        renderYesNoOptions(key, message.next);
      } else {
        renderYesNoOptionsWithAI(key, message.next);
      }
      break;
    case 'startQuestions':
      if (isScenarioMode) {
        renderModuleOptions('startQuestions', startQuestions);
      } else {
        renderModuleOptionsWithAI('startQuestions', startQuestions);
      }
      break;
  }

  isBotBusy = false;
}

function renderOptions(key, options, showQuestion = true) {
  clearOptions();

  const responseContainer = document.createElement("div");
  responseContainer.className = "response-options";

  // Если showQuestion === true, выводим вопрос над кнопками (берём из сценария)
  if (showQuestion) {
    // Найдём текст вопроса из сценария, если есть
    const state = chatScenario[key];
    if (state && state.messages && state.messages.length > 0) {
      const lastMsg = state.messages[state.messages.length - 1];
      if (lastMsg.type === 'text') {
        const questionDiv = document.createElement("div");
        questionDiv.className = "options-question";
        questionDiv.innerHTML = parseSpecialFormatting(lastMsg.value);
        responseContainer.appendChild(questionDiv);
      }
    }
  }

  options.forEach(({ label, value, next }) => {
    const button = document.createElement("button");
    button.type = 'button';
    button.innerHTML = label;
    button.onclick = () => {
      if (isBotBusy) return;
      appendMessage({ text: label, value: value, key: key, isUser: true });

      if (/^questionFranchise\d*$/.test(key) && swiperInstance) {
        swiperInstance.remove();
        swiperInstance = null;
      }

      clearOptions();
      processChatState(next);
    };
    responseContainer.appendChild(button);
  });

  chatContent.appendChild(responseContainer);
  animateFadeIn(responseContainer);
  smoothScrollToBottom();
  lastOptions = responseContainer;
}

function renderSwiper(swiperItems) {
  const itemsTemplate = swiperItems.map(({ src }) => `
    <div class="swiper-slide">
      <div>
        <img class="tap-color" src="${src}" alt="${src.split('/').pop()}" />
      </div>
    </div>
  `)

  const template = `
    <div class="swiper-container swiper-chat">
      <div class="swiper-wrapper">
        ${itemsTemplate.join('')}
      </div>
      <div class="gallery-pagination swiper-bullets"></div>
    </div>
  `

  const element = new DOMParser()
    .parseFromString(template, "text/html")
    .body
    .firstElementChild;

  chatContent.appendChild(element);
  animateFadeIn(element);
  smoothScrollToBottom();

  new Swiper(element, {
    speed: 450,
    effect: 'slide',
    rewind: true,
    grabCursor: true,
    pagination: {
      el: '.gallery-pagination',
      clickable: true,
    },
    breakpoints: {
      200: {
        spaceBetween: 10,
        slidesPerView: 1,
      },
      768: {
        spaceBetween: 14,
        slidesPerView: 3,
      },
      1400: {
        spaceBetween: 22,
        slidesPerView: 3,
      },
    },
  });
}

function renderTextInput(key, callback) {

  const inputContainer = document.createElement("div");
  inputContainer.className = "textarea-container";

  const inputWrapper = document.createElement("div");
  inputWrapper.className = "input";

  const textarea = document.createElement("textarea");
  textarea.className = "input__field input__field--textarea";
  textarea.placeholder = "Напишите ваш вопрос...";

  inputWrapper.appendChild(textarea);

  const submitButton = document.createElement("button");
  submitButton.type = "button";
  submitButton.className = "btn";
  submitButton.textContent = "Отправить";
  submitButton.onclick = () => {
    const userInput = textarea.value.trim();
    if (!userInput) return;

    appendMessage({ text: userInput, key: key, isUser: true });
    inputContainer.remove();
    if (callback) callback(userInput);
  };

  inputContainer.appendChild(inputWrapper);
  inputContainer.appendChild(submitButton);

  chatContent.appendChild(inputContainer);

  animateFadeIn(inputContainer);
  smoothScrollToBottom();
  lastOptions = inputContainer;
}

function renderPhoneInput(key, callback) {

  const inputContainer = document.createElement("div");
  inputContainer.className = "textarea-container";

  const form = document.createElement("form");
  form.className = "dynamic-form";
  form.style.flexDirection = "column";

  const inputField = document.createElement("input");
  inputField.type = "tel";
  inputField.name = "phone";
  inputField.placeholder = "Ваш телефон";
  inputField.className = "input__field";
  inputField.autocomplete = "off";

  Inputmask({ mask: "+7 (999) 999 9999", showMaskOnHover: false }).mask(inputField);

  const submitButton = document.createElement("button");
  submitButton.className = "btn";
  submitButton.type = "submit";
  submitButton.textContent = "Отправить";

  // === Контейнер для чекбокса и подписи ===
  // Новый flex-контейнер для двух блоков
  const agreeFlex = document.createElement("div");
  agreeFlex.className = "agree__flex";
  agreeFlex.style.display = "flex";
  agreeFlex.style.flexWrap = "wrap";
  agreeFlex.style.alignItems = "center";

  // Контейнер для чекбокса и текста
  const agreeMain = document.createElement("div");
  agreeMain.className = "agree__main";
  agreeMain.style.display = "flex";
  agreeMain.style.alignItems = "center";

  const agreeCheckbox = document.createElement("input");
  agreeCheckbox.type = "checkbox";
  agreeCheckbox.className = "agree";
  agreeCheckbox.id = "agree";
  agreeCheckbox.name = "agree";
  agreeCheckbox.style.marginRight = "8px";

  const agreeText = document.createElement("span");
  agreeText.textContent = "Я принимаю ";
  agreeText.style.color = "#303437";

  agreeMain.appendChild(agreeCheckbox);
  agreeMain.appendChild(agreeText);

  // Контейнер для ссылки
  const agreeLink = document.createElement("div");
  agreeLink.className = "agree__link";
  agreeLink.style.display = "flex";
  agreeLink.style.alignItems = "center";

  const privacyLink = document.createElement("a");
  privacyLink.href = "#";
  privacyLink.setAttribute("data-remodal-target", "privacy");
  privacyLink.textContent = "Политику конфиденциальности";
  privacyLink.style.textDecoration = "underline";
  privacyLink.style.color = "#303437";
  privacyLink.style.marginLeft = "4px";

  agreeLink.appendChild(privacyLink);

  // Собираем flex-контейнер
  agreeFlex.appendChild(agreeMain);
  agreeFlex.appendChild(agreeLink);

  // Label-обёртка для accessibility (можно оставить пустой или обернуть agreeFlex)
  const agreeLabel = document.createElement("label");
  agreeLabel.className = "agree__label tap-color";
  agreeLabel.style.display = "block";
  agreeLabel.style.cursor = "pointer";
  agreeLabel.appendChild(agreeFlex);

  // Сообщение об ошибке (скрыто по умолчанию)
  const agreeError = document.createElement("div");
  agreeError.id = "agree-error";
  agreeError.className = "error error--privacy";
  agreeError.setAttribute("for", "agree");
  agreeError.style.display = "none";
  agreeError.textContent = "Подтвердите согласие с политикой конфиденциальности";

  // Основной контейнер для блока согласия
  const agreeDiv = document.createElement("div");
  agreeDiv.className = "agree";
  agreeDiv.style.display = "flex";
  agreeDiv.style.flexDirection = "column";
  agreeDiv.style.marginTop = "12px";
  agreeDiv.style.fontSize = "14px";
  agreeDiv.appendChild(agreeLabel);
  agreeDiv.appendChild(agreeError);

  // === Контейнер для чекбокса и ошибки ===
  const formModalAgree = document.createElement("div");
  formModalAgree.className = "form-modal__agree";
  formModalAgree.appendChild(agreeDiv);

  // flex-контейнер для input и button
  const inputGroup = document.createElement("div");
  inputGroup.className = "input-group-flex";
  inputGroup.style.display = "flex";
  inputGroup.style.flexDirection = "row";
  inputGroup.style.flexWrap = "wrap";
  inputGroup.style.gap = "8px";
  inputGroup.style.alignItems = "center";
  inputGroup.appendChild(inputField);
  inputGroup.appendChild(submitButton);

  form.appendChild(inputGroup);
  form.appendChild(formModalAgree); // formModalAgree содержит .agree
  inputContainer.appendChild(form);

  chatContent.appendChild(inputContainer);

  animateFadeIn(inputContainer);
  smoothScrollToBottom();
  lastOptions = inputContainer;

  // Блокируем отправку, если чекбокс не отмечен
  $(form).validate({
    errorPlacement: function () {},
    rules: {
      phone: {
        required: true,
        phone: true,
      },
      agree: {
        required: true
      }
    },
    messages: {
      agree: "Необходимо принять условия"
    },
    highlight: function(element, errorClass, validClass) {
      if (element.name === "agree") {
        agreeError.style.display = "block";
        inputField.classList.add("placeholder-error");
      }
    },
    unhighlight: function(element, errorClass, validClass) {
      if (element.name === "agree") {
        agreeError.style.display = "none";
        inputField.classList.remove("placeholder-error");
      }
    },
    submitHandler: function () {
      const phoneNumber = inputField.value.trim();
      inputContainer.remove();
      
      // Добавляем сообщение пользователя только в сценарном режиме
      if (isScenarioMode) {
        appendMessage({ text: phoneNumber, key: key, isUser: true });
      }
      
      // Переходим к следующему шагу сценария
      if (callback) callback(phoneNumber);
    },
  });

  // Скрывать ошибку при клике на чекбокс
  agreeCheckbox.addEventListener("change", function() {
    if (agreeCheckbox.checked) {
      agreeError.style.display = "none";
      inputField.classList.remove("placeholder-error");
    }
  });
}

function renderCityInput(key, callback) {

  const inputContainer = document.createElement("div");
  inputContainer.className = "textarea-container";

  const form = document.createElement("form");
  form.className = "dynamic-form";

  const inputField = document.createElement("input");
  inputField.type = "text";
  inputField.name = "city";
  inputField.placeholder = "Ваш город";
  inputField.className = "input__field";
  inputField.autocomplete = "off";

  const submitButton = document.createElement("button");
  submitButton.className = "btn";
  submitButton.type = "submit";
  submitButton.textContent = "Отправить";

  form.appendChild(inputField);
  form.appendChild(submitButton);
  inputContainer.appendChild(form);

  chatContent.appendChild(inputContainer);

  animateFadeIn(inputContainer);
  smoothScrollToBottom();
  lastOptions = inputContainer;

  $(form).validate({
    errorPlacement: function () {},
    rules: {
      city: {
        required: true,
      },
    },
    submitHandler: function () {
      const userCity = inputField.value.trim();
      inputContainer.remove();
      if (callback) callback(userCity);
    },
  });
}

function renderNameInput(key, callback) {

  const inputContainer = document.createElement("div");
  inputContainer.className = "textarea-container";

  const form = document.createElement("form");
  form.className = "dynamic-form";

  const inputField = document.createElement("input");
  inputField.type = "text";
  inputField.name = "name";
  inputField.placeholder = "Ваше имя";
  inputField.className = "input__field";
  inputField.autocomplete = "off";

  $(inputField).on("input", function () {
    let value = $(this).val();
    $(this).val(value.replace(/[^a-zA-Zа-яА-ЯёЁ\s-]/g, ""));
  });

  const submitButton = document.createElement("button");
  submitButton.className = "btn";
  submitButton.type = "submit";
  submitButton.textContent = "Отправить";

  //помещаем поле ввода имени и кнопку во flex контейнер
  const inputGroup = document.createElement("div");
  inputGroup.className = "input-group-flex";
  inputGroup.style.display = "flex";
  inputGroup.style.flexDirection = "row";
  inputGroup.style.flexWrap = "wrap";
  inputGroup.style.gap = "8px";
  inputGroup.style.alignItems = "center";

  inputGroup.appendChild(inputField);
  inputGroup.appendChild(submitButton);

  form.appendChild(inputGroup);
  inputContainer.appendChild(form);

  chatContent.appendChild(inputContainer);

  animateFadeIn(inputContainer);
  smoothScrollToBottom();
  lastOptions = inputContainer;

  $(form).validate({
    errorPlacement: function () {},
    rules: {
      name: {
        required: true,
      },
    },
    submitHandler: function () {
      const userName = inputField.value.trim();
      inputContainer.remove();
      
      // Добавляем сообщение пользователя в обоих режимах
      appendMessage({ text: userName, key: key, isUser: true });
      
      // Переходим к следующему шагу сценария
      if (callback) callback(userName);
    },
  });
}

async function processChatState(stateKey) {
  const state = chatScenario[stateKey];
  if (!state) return;

  const { messages, showStatus, options, requiresInput, autoNext, actionRedirect, action } = state;

  if (showStatus) {
    setTimeout(() => {
      displayStatus(true);
    }, 3000);
  } else {
    displayStatus(false);
  }

  let accumulatedDelay = 0;

  for (let index = 0; index < messages.length; index++) {
    await appendBotMessageWithDelay(messages[index], stateKey);

    if (index === messages.length - 1) {
      const phoneKeys = ['phone', 'questionFranchise']
      if (requiresInput) {
        if (phoneKeys.includes(stateKey.replace(/\d/g, ''))) {
          // В сценарном режиме используем обычную функцию renderPhoneInput
          if (isScenarioMode) {
            renderPhoneInput(stateKey, (phoneNumber) => {
              processChatState(state.next);
            });
          } else {
            renderPhoneInputWithAI(stateKey, (phoneNumber) => {
              processChatState(state.next);
            });
          }
        } else if (stateKey.includes("name")) {
          // В сценарном режиме используем обычную функцию renderNameInput
          if (isScenarioMode) {
            renderNameInput(stateKey, (userName) => {
              processChatState(state.next);
            });
          } else {
            renderNameInputWithAI(stateKey, state.next);
          }
        } else if (stateKey.includes("city")) {
          // В сценарном режиме используем обычную функцию renderCityInput
          if (isScenarioMode) {
            renderCityInput(stateKey, (userCity) => {
              processChatState(state.next);
            });
          } else {
            renderCityInputWithAI(stateKey, (userName) => {
              processChatState(state.next);
            });
          }
        } else {
          renderTextInput(stateKey, (userInput) => {
            processChatState(state.next);
          });
        }
      } else if (options && options.length > 0) {
        // Если последнее сообщение типа text, не дублируем вопрос над кнопками
        let showQuestion = true;
        if (messages.length > 0 && messages[messages.length-1].type === 'text') {
          showQuestion = false;
        }
        renderOptions(stateKey, options, showQuestion);
      } else if (action) {
        action();
      }

      if (actionRedirect) {
        sendChatHistory();

        setTimeout(() => {
          window.location.href = 'thanks.html';
        }, 6000);
      }
    }
  }

  if (!options || options.length === 0) {
    setTimeout(() => {
      isBotBusy = false;
    }, accumulatedDelay + 1000);
  }
}

function getUTMData() {
  return {
    phone: '',
    email: '',
    name: '',
    city: '',
    question: '',
    timezone: (-1 * new Date().getTimezoneOffset()) / 60,
    utm_medium: $.query.get('utm_medium') || '',
    utm_placement: $.query.get('utm_placement') || '',
    utm_source: $.query.get('utm_source') || '',
    utm_term: $.query.get('utm_term') || '',
    utm_content: $.query.get('utm_content') || '',
    utm_campaign: $.query.get('utm_campaign') || '',
    utm_campaign_name: $.query.get('utm_campaign_name') || '',
    device_type: $.query.get('device_type') || '',
    utm_region_name: $.query.get('utm_region_name') || '',
    utm_placement: $.query.get('utm_placement') || '',
    utm_description: $.query.get('utm_description') || '',
    utm_device: $.query.get('utm_device') || '',
    page_url: window.location.href,
    user_location_ip: '',
    yclid: $.query.get('yclid') || '',
  };
}

function getPayload(history) {
  const payloadMap = {
    questionFranchise: 'phone',
  };

  function filterHistory(item) {
    return item.sender === "user";
  }

  function reduceHistory(acc, item) {
    if (!item.key || !item.message) {
      return acc;
    }

    const normalizedKey = item.key.replace(/\d+$/, "");
    const payloadKey = payloadMap[normalizedKey] || normalizedKey;

    return { ...acc, [payloadKey]: item.message };
  }

  const chatData = history.filter(filterHistory).reduce(reduceHistory, {});
  const payload = {
    ...getUTMData(),
    ...chatData,
  };

  console.log("Сформированные данные для отправки:", payload);
  return payload;
}

function sendChatHistory() {
  const payload = getPayload(chatHistory);
  const formData = createFormData(payload);
  // const dataToSend = JSON.stringify({ chatHistory });

  function createFormData(data) {
    var formData = new FormData()
  
    Object.entries(data).forEach(([key, value]) => {
      if (value) {
        formData.append(key, value)
      }
    })

    return formData
  }

  $.ajax({
    url: 'https://grand-smile-production.up.railway.app/formProcessor.php',
    type: 'POST',
    data: formData,
    processData: false,
    contentType: false,
    dataType: 'json',
  });
}

function setCurrentYear() {
  $('[data-current-year]').text(new Date().getFullYear())
}

document.addEventListener("DOMContentLoaded", () => {
  setInitialFeedbackStore();
  // Запускаем сценарный режим только если нет AI
  // processChatState("start"); // Убираем отсюда, будет запускаться только при переключении

  setCurrentYear()
  initAnchorBtn()
  
  // Показываем поле ввода в AI-режиме (по умолчанию)
  const inputBar = document.querySelector('.chat__input-bar');
  if (inputBar) {
    inputBar.style.display = 'flex';
  }

  // === Chat input send logic ===
  const userInput = document.getElementById('userChatInput');
  const sendBtn = document.getElementById('userChatSendBtn');
  function sendUserMessage() {
    const text = userInput.value.trim();
    if (!text) return;
    appendMessage({ text, isUser: true });
    userInput.value = '';
  }
  if (userInput && sendBtn) {
    sendBtn.addEventListener('click', sendUserMessage);
    userInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendUserMessage();
      }
    });
  }
  // === End chat input send logic ===

  // Автоматически инициируем диалог с ботом при загрузке страницы
  sendMessageToAI("__INIT__");
});

// Функция для рендера интерактивных элементов по модулю (например, стартовых вопросов)
function renderModuleOptions(key, options, callback) {
  clearOptions();

  const responseContainer = document.createElement("div");
  responseContainer.className = "response-options";

  options.forEach(({ label, value, next }) => {
    const button = document.createElement("button");
    button.type = 'button';
    button.innerHTML = label;
    button.onclick = () => {
      if (isBotBusy) return;
      clearOptions();
      
      if (isScenarioMode) {
        // В сценарном режиме добавляем сообщение пользователя вручную
        appendMessage({ text: label, isUser: true });
        // В сценарном режиме всегда используем processChatState
        processChatState(next);
      } else if (key === 'startQuestions') {
        sendMessageToAI(label);
      } else if (callback) {
        callback(value, next);
      } else {
        processChatState(next);
      }
    };
    responseContainer.appendChild(button);
  });

  chatContent.appendChild(responseContainer);
  animateFadeIn(responseContainer);
  smoothScrollToBottom();
  lastOptions = responseContainer;
}

// Генерация и хранение sessionId
function getSessionId() {
  let sessionId = sessionStorage.getItem('sessionId');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem('sessionId', sessionId);
  }
  return sessionId;
}

const sessionId = getSessionId();

// Отправка сообщения пользователя и получение ответа от OpenAI backend
async function sendMessageToAI(userMessage) {
  // Если уже в сценарном режиме, не отправляем в AI
  if (isScenarioMode) {
    return;
  }

  if (userMessage === "__INIT__") {
    // Не отображаем и не отправляем в историю, только инициируем диалог с ботом
    try {
      const response = await fetch('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'init', sessionId })
      });
      const data = await response.json();
      if (data.text) {
        await new Promise(resolve => setTimeout(resolve, 300));
        appendMessage({ text: data.text, isUser: false });
      } else if (data.error) {
        console.log('Ошибка AI: ' + data.error);
        switchToScenarioMode();
      }
    } catch (e) {
      console.log('Ошибка соединения с сервером AI:', e);
      switchToScenarioMode();
    }
    return;
  }
  if (!userMessage || !userMessage.trim()) return;
  appendMessage({ text: userMessage, isUser: true });
  // Тест: если пользователь отправляет одну из меток, бот возвращает её же
  const testTags = ['[ASK_CITY]', '[ASK_PHONE]', '[ASK_MESSENGER]', '[SHOW_MAGNET_OPTIONS]', '[PHOTO]'];
  if (testTags.some(tag => userMessage.includes(tag))) {
    appendMessage({ text: userMessage, isUser: false });
    return;
  }
  // Оригинальный код
  try {
    // Показываем индикатор печати перед отправкой запроса
    showTypingIndicatorManual();
    
    const response = await fetch('/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userMessage, sessionId })
    });
    const data = await response.json();
    if (data.text) {
      await new Promise(resolve => setTimeout(resolve, 300));
      appendMessage({ text: data.text, isUser: false });
      
      // Скрываем индикатор после полной обработки ответа
      // Используем setTimeout чтобы дать время на обработку интерактивных элементов
      setTimeout(() => {
        hideTypingIndicator();
      }, 600);
    } else if (data.error) {
      console.log('Ошибка AI: ' + data.error);
      hideTypingIndicator();
      switchToScenarioMode();
    }
  } catch (e) {
    console.log('Ошибка соединения с сервером AI:', e);
    hideTypingIndicator();
    switchToScenarioMode();
  }
}

// Перехват отправки сообщения пользователем (Enter или кнопка)
const userInput = document.getElementById('userChatInput');
const sendBtn = document.getElementById('userChatSendBtn');

function handleUserSend() {
  const message = userInput.value.trim();
  if (!message) return;
  userInput.value = '';
  
  if (isScenarioMode) {
    // В сценарном режиме обрабатываем как свободный вопрос
    appendMessage({ text: message, isUser: true });
    // Переходим к обработке вопроса в сценарии
    processChatState("question");
  } else {
    sendMessageToAI(message);
  }
}

userInput.addEventListener('keydown', function(e) {
  if (e.key === 'Enter') {
    e.preventDefault();
    handleUserSend();
  }
});
sendBtn.addEventListener('click', handleUserSend);

/**
 * Обновлённые обработчики для всех интерактивных элементов:
 * - Все пользовательские ответы отправляются в sendMessageToAI
 * - Если нет ответа от ИИ (или ошибка), fallback на processChatState(next)
 */

// --- AI-обёртки для интерактивных элементов с fallback ---
function renderYesNoOptionsWithAI(key, next) {
  renderYesNoOptions(key, (answer, key) => {
    sendMessageToAI(answer === 'yes' ? 'Да' : 'Нет', () => {
      if (next) processChatState(next[answer] ? next[answer] : next);
    });
  });
}

function renderCityInputWithAI(key, next) {
  renderCityInput(key, (userCity) => {
    sendMessageToAI(userCity, () => {
      if (next) processChatState(next);
    });
  });
}

function renderNameInputWithAI(key, next) {
  renderNameInput(key, (userName) => {
    // В AI-режиме имя просто добавляется в чат и переходим к следующему состоянию сценария
    // (без отправки в sendMessageToAI, так как после имени должны быть заскриптованные сообщения)
    if (next) processChatState(next);
  });
}

function renderPhoneInputWithAI(key, next) {
  renderPhoneInput(key, (userPhone) => {
    // В AI-режиме отправляем номер в sendMessageToAI и только после ответа переходим к следующему состоянию
    if (!isScenarioMode) {
      sendMessageToAI(userPhone, () => {
        if (next) processChatState(next);
      });
    } else {
      // В сценарном режиме просто переходим к следующему состоянию
      if (next) processChatState(next);
    }
  });
}

function renderModuleOptionsWithAI(key, options, callback) {
  renderModuleOptions(key, options, (value, next) => {
    if (isScenarioMode) {
      // В сценарном режиме переходим к следующему состоянию (сообщение уже добавлено в renderModuleOptions)
      if (callback) {
        callback(value, next);
      } else if (next) {
        processChatState(next);
      }
    } else {
      // В AI-режиме не добавляем сообщение вручную, только через sendMessageToAI
      if (key === 'startQuestions' || key === 'messenger') {
        // Для мессенджера нужно найти соответствующий label по value
        let messageToSend = value;
        let nextState = next;
        if (key === 'messenger') {
          const option = options.find(opt => opt.value === value);
          messageToSend = option ? option.label : value;
          nextState = option ? option.next : next;
        }
        sendMessageToAI(messageToSend, () => {
          if (nextState) processChatState(nextState);
        });
      } else if (callback) {
        callback(value, next);
      } else if (next) {
        processChatState(next);
      }
    }
  });
}

// Функция для переключения на сценарный режим
function switchToScenarioMode() {
  if (isScenarioMode) return; // Уже в сценарном режиме
  
  console.log('Переключение на сценарный режим из-за ошибки подключения к бэкенду');
  isScenarioMode = true;
  
  // Очищаем текущие опции
  clearOptions();
  
  // Скрываем индикатор печати если он активен
  hideTypingIndicator();
  
  // Скрываем поле ввода в сценарном режиме
  const inputBar = document.querySelector('.chat__input-bar');
  if (inputBar) {
    inputBar.style.display = 'none';
  }
  
  // Запускаем сценарный режим с начального состояния
  processChatState("start");
}
