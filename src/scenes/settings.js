// ============================================
// Settings scene — allows users to change
// language, name, and phone number
// Works for both clients and masters
// ============================================

const { Scenes, Markup } = require('telegraf');
const { updateUser, findUserByTelegramId } = require('../database');
const { getLocale } = require('../middlewares/auth');
const uz = require('../locales/uz');
const ru = require('../locales/ru');

const settingsScene = new Scenes.BaseScene('settings');

// ============================================
// Scene entry — show settings menu
// ============================================

/**
 * Display the settings menu with options to change
 * language, name, and phone number
 */
settingsScene.enter(async (ctx) => {
  if (!ctx.session) ctx.session = {};
  ctx.session.settingsStep = null;

  const locale = ctx.state.locale || getLocale(ctx.session.language || 'uz');

  return ctx.reply(locale.settingsTitle, {
    parse_mode: 'Markdown',
    ...Markup.inlineKeyboard([
      [Markup.button.callback(locale.btnChangeLanguage, 'settings_language')],
      [Markup.button.callback(locale.btnChangeName, 'settings_name')],
      [Markup.button.callback(locale.btnChangePhone, 'settings_phone')],
      [Markup.button.callback(locale.btnBackToMenu, 'settings_back_menu')],
    ]),
  });
});

// ============================================
// Change language
// ============================================

/**
 * Handle "Change language" button — show language picker
 */
settingsScene.action('settings_language', async (ctx) => {
  await ctx.answerCbQuery();

  return ctx.editMessageText('🌐', {
    ...Markup.inlineKeyboard([
      [Markup.button.callback('🇺🇿 O\'zbekcha', 'set_lang_uz')],
      [Markup.button.callback('🇷🇺 Русский', 'set_lang_ru')],
    ]),
  });
});

/**
 * Handle Uzbek language selection in settings
 */
settingsScene.action('set_lang_uz', async (ctx) => {
  await ctx.answerCbQuery();
  await changeLanguage(ctx, 'uz');
});

/**
 * Handle Russian language selection in settings
 */
settingsScene.action('set_lang_ru', async (ctx) => {
  await ctx.answerCbQuery();
  await changeLanguage(ctx, 'ru');
});

/**
 * Update user's language preference in DB and session
 * @param {object} ctx - Telegraf context
 * @param {string} lang - Language code ("uz" or "ru")
 */
async function changeLanguage(ctx, lang) {
  try {
    await updateUser(ctx.from.id, { language: lang });

    ctx.session.language = lang;
    ctx.state.locale = getLocale(lang);

    const locale = getLocale(lang);
    await ctx.editMessageText(locale.languageChanged, { parse_mode: 'Markdown' });

    // Re-enter settings with new language
    return ctx.scene.reenter();
  } catch (err) {
    console.error('[Settings] Error changing language:', err.message);
    const locale = ctx.state.locale || uz;
    await ctx.reply(locale.errorGeneral, { parse_mode: 'Markdown' });
  }
}

// ============================================
// Change name
// ============================================

/**
 * Handle "Change name" button — ask for new name
 */
settingsScene.action('settings_name', async (ctx) => {
  await ctx.answerCbQuery();

  const locale = ctx.state.locale || getLocale(ctx.session?.language || 'uz');
  ctx.session.settingsStep = 'change_name';

  return ctx.reply(locale.askName, { parse_mode: 'Markdown' });
});

// ============================================
// Change phone
// ============================================

/**
 * Handle "Change phone" button — ask for new phone
 */
settingsScene.action('settings_phone', async (ctx) => {
  await ctx.answerCbQuery();

  const locale = ctx.state.locale || getLocale(ctx.session?.language || 'uz');
  ctx.session.settingsStep = 'change_phone';

  return ctx.reply(locale.askPhone, { parse_mode: 'Markdown' });
});

// ============================================
// Text input handler — name and phone changes
// ============================================

/**
 * Handle text input for name or phone changes
 */
settingsScene.on('text', async (ctx) => {
  const locale = ctx.state.locale || getLocale(ctx.session?.language || 'uz');
  const step = ctx.session?.settingsStep;

  // Handle name change
  if (step === 'change_name') {
    const newName = ctx.message.text.trim();

    if (newName.length < 2) {
      return ctx.reply(locale.askName, { parse_mode: 'Markdown' });
    }

    try {
      await updateUser(ctx.from.id, { fullName: newName });

      const message = locale.nameChanged.replace('{name}', newName);
      await ctx.reply(message, { parse_mode: 'Markdown' });

      ctx.session.settingsStep = null;
      return ctx.scene.reenter();
    } catch (err) {
      console.error('[Settings] Error changing name:', err.message);
      return ctx.reply(locale.errorGeneral, { parse_mode: 'Markdown' });
    }
  }

  // Handle phone change
  if (step === 'change_phone') {
    const newPhone = ctx.message.text.trim();
    const phoneRegex = /^\+?[0-9]{9,15}$/;

    if (!phoneRegex.test(newPhone)) {
      return ctx.reply(locale.invalidPhone, { parse_mode: 'Markdown' });
    }

    try {
      await updateUser(ctx.from.id, { phone: newPhone });

      const message = locale.phoneChanged.replace('{phone}', newPhone);
      await ctx.reply(message, { parse_mode: 'Markdown' });

      ctx.session.settingsStep = null;
      return ctx.scene.reenter();
    } catch (err) {
      console.error('[Settings] Error changing phone:', err.message);
      return ctx.reply(locale.errorGeneral, { parse_mode: 'Markdown' });
    }
  }
});

// ============================================
// Navigation — return to appropriate menu
// ============================================

/**
 * Handle "Back to menu" — route to client or master menu
 * based on user role
 */
settingsScene.action('settings_back_menu', async (ctx) => {
  await ctx.answerCbQuery();

  const user = ctx.state.user || (await findUserByTelegramId(ctx.from.id));

  if (user && user.role === 'MASTER') {
    return ctx.scene.enter('masterMenu');
  }

  return ctx.scene.enter('clientMenu');
});

module.exports = settingsScene;
