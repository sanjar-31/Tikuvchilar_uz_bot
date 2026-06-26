// ============================================
// Uzbek language strings for @tikuvchilar_uz_bot
// Every user-facing message is stored here
// ============================================

module.exports = {
  // ---- Language selection ----
  welcome: '🧵 *Tikuvchilar UZ Bot*ga xush kelibsiz!\n\nIltimos, tilni tanlang:',
  langSelected: '✅ Til tanlandi: 🇺🇿 O\'zbekcha',

  // ---- Role selection ----
  selectRole: '👤 Siz kimsiz?\n\nO\'zingizga mos rolni tanlang:',
  roleClient: '👗 Mijoz',
  roleMaster: '✂️ Tikuvchi (Usta)',

  // ---- Registration (shared) ----
  askName: '📝 Iltimos, to\'liq ismingizni kiriting:',
  askPhone: '📱 Telefon raqamingizni kiriting:\n\n_Masalan: +998901234567_',
  invalidPhone: '❌ Telefon raqami noto\'g\'ri. Iltimos, qayta kiriting:\n\n_Masalan: +998901234567_',
  registrationComplete: '✅ Ro\'yxatdan o\'tish muvaffaqiyatli yakunlandi!',

  // ---- Master registration (additional fields) ----
  askAddress: '📍 Ish manzilingizni kiriting:\n\n_Masalan: Toshkent sh., Chilonzor tumani, 5-kvartal_',
  askWorkStart: '🕐 Ish boshlanish vaqtini kiriting:\n\n_Masalan: 09:00_',
  askWorkEnd: '🕕 Ish tugash vaqtini kiriting:\n\n_Masalan: 18:00_',
  invalidTime: '❌ Vaqt formati noto\'g\'ri. Iltimos, qayta kiriting:\n\n_Masalan: 09:00_',
  askWorkDays: '📅 Ish kunlaringizni tanlang:\n\n_Tugagach "✅ Tayyor" tugmasini bosing_',
  noWorkDaysSelected: '❌ Kamida bitta ish kunini tanlang.',
  masterRegistrationDone: '🎉 Usta sifatida ro\'yxatdan o\'tdingiz!\n\nEndi buyurtmalar qabul qilishingiz mumkin.',

  // ---- Admin approval system ----
  pendingApproval: '⏳ Arizangiz yuborildi. Admin tasdiqlashini kuting.',
  approved: '🎉 Arizangiz tasdiqlandi! Endi buyurtmalar qabul qila olasiz.',
  rejected: '❌ Arizangiz rad etildi.',
  adminNewMaster: '📋 *Yangi usta ariza:*\n\n👤 Ism: {name}\n📱 Tel: {phone}\n📍 Manzil: {address}\n🕐 Ish vaqti: {start} — {end}\n📅 Ish kunlari: {days}',
  adminApproved: '✅ Tasdiqlandi: {name}',
  adminRejected: '❌ Rad etildi: {name}',

  // ---- Days of the week ----
  days: {
    Mon: 'Dushanba',
    Tue: 'Seshanba',
    Wed: 'Chorshanba',
    Thu: 'Payshanba',
    Fri: 'Juma',
    Sat: 'Shanba',
    Sun: 'Yakshanba',
  },

  // ---- Client main menu ----
  clientMenu: '🏠 *Asosiy menyu*\n\nQuyidagilardan birini tanlang:',
  btnViewTailors: '👗 Tikuvchilarni ko\'rish',
  btnMyOrders: '📋 Mening buyurtmalarim',
  btnSettings: '⚙️ Sozlamalar',

  // ---- Master main menu ----
  masterMenu: '🏠 *Usta paneli*\n\nQuyidagilardan birini tanlang:',
  btnMasterOrders: '📅 Buyurtmalarim',
  btnBlockedDates: '➕ Band kunni qo\'shish',
  btnMyProfile: '👁 Mening profilim',
  btnNotifications: '🔔 Bildirishnomalar',

  // ---- View tailors ----
  tailorListTitle: '👗 *Mavjud tikuvchilar:*\n\nBirini tanlang:',
  noTailorsAvailable: '😔 Hozircha hech qanday tikuvchi mavjud emas.',
  tailorInfo: '✂️ *{name}*\n\n📍 Manzil: {address}\n🕐 Ish vaqti: {start} — {end}\n📅 Ish kunlari: {days}',
  btnBookTailor: '📅 Vaqt band qilish',
  btnBackToList: '⬅️ Ortga',

  // ---- Calendar & booking ----
  selectDate: '📅 *Kunni tanlang:*\n\n✅ — bo\'sh kun\n❌ — band kun',
  selectTime: '🕐 *Vaqtni tanlang:*\n\n{date} kuni uchun bo\'sh vaqtlar:',
  noTimeSlotsAvailable: '😔 Bu kunda bo\'sh vaqt yo\'q. Boshqa kunni tanlang.',
  askDescription: '📝 Nima tiktirishni xohlaysiz?\n\n_Masalan: Ko\'ylak, 2 dona, qora rangli_',
  orderConfirmation: '✅ *Buyurtmangiz qabul qilindi!*\n\n✂️ Usta: {master}\n📅 Sana: {date}\n🕐 Vaqt: {time}\n📝 Tavsif: {description}\n\n⏳ Usta tasdiqlaganidan so\'ng sizga xabar beramiz.',
  orderSentToMaster: '📨 Buyurtma ustaga yuborildi. Tasdiqni kuting.',

  // ---- My orders (client) ----
  myOrdersTitle: '📋 *Mening buyurtmalarim:*',
  noOrders: '📭 Sizda hali buyurtmalar yo\'q.',
  orderItem: '#{id} | {date} {time}\n✂️ {master}\n📝 {description}\n📊 Holat: {status}',
  btnCancelOrder: '❌ Bekor qilish',
  orderCancelled: '✅ Buyurtma bekor qilindi.',

  // ---- Order statuses ----
  statusPending: '⏳ Kutilmoqda',
  statusConfirmed: '✅ Tasdiqlangan',
  statusCancelled: '❌ Bekor qilingan',

  // ---- Master orders ----
  masterOrdersTitle: '📅 *Buyurtmalaringiz:*',
  noMasterOrders: '📭 Sizda hali buyurtmalar yo\'q.',
  newOrderNotification: '🔔 *Yangi buyurtma!*\n\n👤 Mijoz: {client}\n📱 Tel: {phone}\n📅 Sana: {date}\n🕐 Vaqt: {time}\n📝 Tavsif: {description}',
  btnConfirmOrder: '✅ Tasdiqlash',
  btnRejectOrder: '❌ Rad etish',
  orderConfirmed: '✅ Buyurtma tasdiqlandi. Mijozga xabar yuborildi.',
  orderRejected: '❌ Buyurtma rad etildi. Mijozga xabar yuborildi.',

  // ---- Notifications to client ----
  clientOrderConfirmed: '🎉 *Buyurtmangiz tasdiqlandi!*\n\n✂️ Usta: {master}\n📅 Sana: {date}\n🕐 Vaqt: {time}\n📝 {description}',
  clientOrderRejected: '😔 *Buyurtmangiz rad etildi.*\n\n✂️ Usta: {master}\n📅 Sana: {date}\n🕐 Vaqt: {time}\n\nBoshqa ustani tanlashingiz mumkin.',
  reminderMessage: '⏰ *Eslatma!*\n\nErtaga sizda uchrashuv bor:\n\n✂️ Usta: {master}\n📅 Sana: {date}\n🕐 Vaqt: {time}\n📝 {description}\n\nIltimos, o\'z vaqtida boring!',

  // ---- Blocked dates ----
  blockedDatesTitle: '📅 *Band kunlaringiz:*',
  noBlockedDates: '✅ Sizda band kunlar yo\'q.',
  askBlockDate: '📅 Band qilmoqchi bo\'lgan sanani kiriting:\n\n_Masalan: 2026-06-25_',
  askBlockReason: '📝 Sababi nima? (ixtiyoriy)\n\n_Bo\'sh qoldirsangiz, "Tayyor" tugmasini bosing_',
  btnSkipReason: '⏭ O\'tkazib yuborish',
  dateBlocked: '✅ {date} kuni band qilindi.',
  invalidDate: '❌ Sana formati noto\'g\'ri. Iltimos, qayta kiriting:\n\n_Masalan: 2026-06-25_',
  btnDeleteBlocked: '🗑 O\'chirish',
  blockedDateDeleted: '✅ Band kun o\'chirildi.',

  // ---- Profile ----
  profileTitle: '👁 *Mening profilim:*\n\n👤 Ism: {name}\n📱 Tel: {phone}\n📍 Manzil: {address}\n🕐 Ish vaqti: {start} — {end}\n📅 Ish kunlari: {days}\n📊 Holat: {status}',
  profileActive: '🟢 Faol',
  profileInactive: '🔴 Nofaol',
  btnToggleActive: '🔄 Holatni o\'zgartirish',
  profileStatusChanged: '✅ Holat o\'zgartirildi: {status}',

  // ---- Settings ----
  settingsTitle: '⚙️ *Sozlamalar*',
  btnChangeLanguage: '🌐 Tilni o\'zgartirish',
  btnChangeName: '✏️ Ismni o\'zgartirish',
  btnChangePhone: '📱 Telefon raqamini o\'zgartirish',
  btnBackToMenu: '⬅️ Asosiy menyu',
  nameChanged: '✅ Ism o\'zgartirildi: {name}',
  phoneChanged: '✅ Telefon raqami o\'zgartirildi: {phone}',
  languageChanged: '✅ Til o\'zgartirildi.',

  // ---- Notifications toggle ----
  notificationsOn: '🔔 Bildirishnomalar yoqildi.',
  notificationsOff: '🔕 Bildirishnomalar o\'chirildi.',

  // ---- Errors ----
  errorGeneral: '❌ Xatolik yuz berdi. Iltimos, qayta urinib ko\'ring.',
  errorNotRegistered: '⚠️ Siz hali ro\'yxatdan o\'tmagansiz. /start buyrug\'ini bosing.',
  errorAlreadyBooked: '❌ Bu vaqt allaqachon band qilingan. Boshqa vaqtni tanlang.',
  errorPastDate: '❌ O\'tgan sanani tanlab bo\'lmaydi.',
  errorMasterNotFound: '❌ Usta topilmadi.',

  // ---- Misc ----
  btnDone: '✅ Tayyor',
  btnCancel: '❌ Bekor qilish',
  btnBack: '⬅️ Ortga',
  btnMainMenu: '🏠 Asosiy menyu',
  actionCancelled: '❌ Amal bekor qilindi.',
  loading: '⏳ Yuklanmoqda...',

  // ---- Month names (for calendar) ----
  months: [
    'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
    'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr',
  ],
};
