// ============================================
// Russian language strings for @tikuvchilar_uz_bot
// Every user-facing message is stored here
// ============================================

module.exports = {
  // ---- Language selection ----
  welcome: '🧵 Добро пожаловать в *Tikuvchilar UZ Bot*!\n\nПожалуйста, выберите язык:',
  langSelected: '✅ Язык выбран: 🇷🇺 Русский',

  // ---- Role selection ----
  selectRole: '👤 Кто вы?\n\nВыберите подходящую роль:',
  roleClient: '👗 Клиент',
  roleMaster: '✂️ Портной (Мастер)',

  // ---- Registration (shared) ----
  askName: '📝 Пожалуйста, введите ваше полное имя:',
  askPhone: '📱 Введите ваш номер телефона:\n\n_Например: +998901234567_',
  invalidPhone: '❌ Неверный номер телефона. Попробуйте снова:\n\n_Например: +998901234567_',
  registrationComplete: '✅ Регистрация успешно завершена!',

  // ---- Master registration (additional fields) ----
  askAddress: '📍 Введите ваш рабочий адрес:\n\n_Например: г. Ташкент, Чиланзарский район, 5-квартал_',
  askWorkStart: '🕐 Введите время начала работы:\n\n_Например: 09:00_',
  askWorkEnd: '🕕 Введите время окончания работы:\n\n_Например: 18:00_',
  invalidTime: '❌ Неверный формат времени. Попробуйте снова:\n\n_Например: 09:00_',
  askWorkDays: '📅 Выберите ваши рабочие дни:\n\n_После выбора нажмите "✅ Готово"_',
  noWorkDaysSelected: '❌ Выберите хотя бы один рабочий день.',
  masterRegistrationDone: '🎉 Вы зарегистрированы как мастер!\n\nТеперь вы можете принимать заказы.',

  // ---- Days of the week ----
  days: {
    Mon: 'Понедельник',
    Tue: 'Вторник',
    Wed: 'Среда',
    Thu: 'Четверг',
    Fri: 'Пятница',
    Sat: 'Суббота',
    Sun: 'Воскресенье',
  },

  // ---- Client main menu ----
  clientMenu: '🏠 *Главное меню*\n\nВыберите один из вариантов:',
  btnViewTailors: '👗 Посмотреть портных',
  btnMyOrders: '📋 Мои заказы',
  btnSettings: '⚙️ Настройки',

  // ---- Master main menu ----
  masterMenu: '🏠 *Панель мастера*\n\nВыберите один из вариантов:',
  btnMasterOrders: '📅 Мои заказы',
  btnBlockedDates: '➕ Добавить занятый день',
  btnMyProfile: '👁 Мой профиль',
  btnNotifications: '🔔 Уведомления',

  // ---- View tailors ----
  tailorListTitle: '👗 *Доступные портные:*\n\nВыберите одного:',
  noTailorsAvailable: '😔 Пока нет доступных портных.',
  tailorInfo: '✂️ *{name}*\n\n📍 Адрес: {address}\n🕐 Время работы: {start} — {end}\n📅 Рабочие дни: {days}',
  btnBookTailor: '📅 Забронировать время',
  btnBackToList: '⬅️ Назад',

  // ---- Calendar & booking ----
  selectDate: '📅 *Выберите день:*\n\n✅ — свободный день\n❌ — занятый день',
  selectTime: '🕐 *Выберите время:*\n\nСвободные слоты на {date}:',
  noTimeSlotsAvailable: '😔 На этот день нет свободного времени. Выберите другой день.',
  askDescription: '📝 Что вы хотите сшить?\n\n_Например: Платье, 2 шт., чёрного цвета_',
  orderConfirmation: '✅ *Ваш заказ принят!*\n\n✂️ Мастер: {master}\n📅 Дата: {date}\n🕐 Время: {time}\n📝 Описание: {description}\n\n⏳ Мы сообщим вам, когда мастер подтвердит заказ.',
  orderSentToMaster: '📨 Заказ отправлен мастеру. Ожидайте подтверждения.',

  // ---- My orders (client) ----
  myOrdersTitle: '📋 *Мои заказы:*',
  noOrders: '📭 У вас пока нет заказов.',
  orderItem: '#{id} | {date} {time}\n✂️ {master}\n📝 {description}\n📊 Статус: {status}',
  btnCancelOrder: '❌ Отменить',
  orderCancelled: '✅ Заказ отменён.',

  // ---- Order statuses ----
  statusPending: '⏳ Ожидает',
  statusConfirmed: '✅ Подтверждён',
  statusCancelled: '❌ Отменён',

  // ---- Master orders ----
  masterOrdersTitle: '📅 *Ваши заказы:*',
  noMasterOrders: '📭 У вас пока нет заказов.',
  newOrderNotification: '🔔 *Новый заказ!*\n\n👤 Клиент: {client}\n📱 Тел: {phone}\n📅 Дата: {date}\n🕐 Время: {time}\n📝 Описание: {description}',
  btnConfirmOrder: '✅ Подтвердить',
  btnRejectOrder: '❌ Отклонить',
  orderConfirmed: '✅ Заказ подтверждён. Клиент уведомлён.',
  orderRejected: '❌ Заказ отклонён. Клиент уведомлён.',

  // ---- Notifications to client ----
  clientOrderConfirmed: '🎉 *Ваш заказ подтверждён!*\n\n✂️ Мастер: {master}\n📅 Дата: {date}\n🕐 Время: {time}\n📝 {description}',
  clientOrderRejected: '😔 *Ваш заказ отклонён.*\n\n✂️ Мастер: {master}\n📅 Дата: {date}\n🕐 Время: {time}\n\nВы можете выбрать другого мастера.',
  reminderMessage: '⏰ *Напоминание!*\n\nЗавтра у вас встреча:\n\n✂️ Мастер: {master}\n📅 Дата: {date}\n🕐 Время: {time}\n📝 {description}\n\nПожалуйста, приходите вовремя!',

  // ---- Blocked dates ----
  blockedDatesTitle: '📅 *Ваши занятые дни:*',
  noBlockedDates: '✅ У вас нет занятых дней.',
  askBlockDate: '📅 Введите дату, которую хотите заблокировать:\n\n_Например: 2026-06-25_',
  askBlockReason: '📝 Укажите причину (необязательно)\n\n_Если не хотите, нажмите "Пропустить"_',
  btnSkipReason: '⏭ Пропустить',
  dateBlocked: '✅ День {date} заблокирован.',
  invalidDate: '❌ Неверный формат даты. Попробуйте снова:\n\n_Например: 2026-06-25_',
  btnDeleteBlocked: '🗑 Удалить',
  blockedDateDeleted: '✅ Занятый день удалён.',

  // ---- Profile ----
  profileTitle: '👁 *Мой профиль:*\n\n👤 Имя: {name}\n📱 Тел: {phone}\n📍 Адрес: {address}\n🕐 Время работы: {start} — {end}\n📅 Рабочие дни: {days}\n📊 Статус: {status}',
  profileActive: '🟢 Активен',
  profileInactive: '🔴 Неактивен',
  btnToggleActive: '🔄 Изменить статус',
  profileStatusChanged: '✅ Статус изменён: {status}',

  // ---- Settings ----
  settingsTitle: '⚙️ *Настройки*',
  btnChangeLanguage: '🌐 Изменить язык',
  btnChangeName: '✏️ Изменить имя',
  btnChangePhone: '📱 Изменить номер телефона',
  btnBackToMenu: '⬅️ Главное меню',
  nameChanged: '✅ Имя изменено: {name}',
  phoneChanged: '✅ Номер телефона изменён: {phone}',
  languageChanged: '✅ Язык изменён.',

  // ---- Notifications toggle ----
  notificationsOn: '🔔 Уведомления включены.',
  notificationsOff: '🔕 Уведомления отключены.',

  // ---- Errors ----
  errorGeneral: '❌ Произошла ошибка. Пожалуйста, попробуйте снова.',
  errorNotRegistered: '⚠️ Вы ещё не зарегистрированы. Нажмите /start.',
  errorAlreadyBooked: '❌ Это время уже занято. Выберите другое время.',
  errorPastDate: '❌ Нельзя выбрать прошедшую дату.',
  errorMasterNotFound: '❌ Мастер не найден.',

  // ---- Misc ----
  btnDone: '✅ Готово',
  btnCancel: '❌ Отмена',
  btnBack: '⬅️ Назад',
  btnMainMenu: '🏠 Главное меню',
  actionCancelled: '❌ Действие отменено.',
  loading: '⏳ Загрузка...',

  // ---- Month names (for calendar) ----
  months: [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
  ],
};
