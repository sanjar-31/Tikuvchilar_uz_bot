// ============================================
// Start scene — language selection, role
// selection, and basic registration (name + phone)
// This is the first scene every user enters
// ============================================
const instagram = "quliyev.sanjar";
const { Scenes, Markup } = require('telegraf');
const { findUserByTelegramId, createUser, updateUser } = require('../database');
const { getLocale } = require('../middlewares/auth');
const uz = require('../locales/uz');
const ru = require('../locales/ru');

const startScene = new Scenes.BaseScene('start');

// ============================================
// Scene entry — show language selection
// ============================================

/**
 * When user enters the start scene, check if they already exist
 * If yes, go straight to their menu. If no, show language picker.
 */
startScene.enter(async (ctx) => {
  // Initialize session if not present
  if (!ctx.session) ctx.session = {};

  // Check if user already exists in database
  const existingUser = await findUserByTelegramId(ctx.from.id);

  if (existingUser) {
    // User exists — update context state and go to their menu
    ctx.state.user = existingUser;
    ctx.state.locale = getLocale(existingUser.language);

    if (existingUser.role === 'MASTER') {
      return ctx.scene.enter('masterMenu');
    }
    return ctx.scene.enter('clientMenu');
  }

  // New user — show language selection
  return ctx.reply(uz.welcome, {
    parse_mode: 'Markdown',
    ...Markup.inlineKeyboard([
      [Markup.button.callback('🇺🇿 O\'zbekcha', 'lang_uz')],
      [Markup.button.callback('🇷🇺 Русский', 'lang_ru')],
    ]),
  });
});

// ============================================
// Language selection handlers
// ============================================

/**
 * Handle Uzbek language selection
 */
startScene.action('lang_uz', async (ctx) => {
  await ctx.answerCbQuery();
  ctx.session.language = 'uz';
  ctx.state.locale = uz;

  // Edit the original message to show confirmation
  await ctx.editMessageText(uz.langSelected, { parse_mode: 'Markdown' });

  // Show role selection
  return showRoleSelection(ctx, uz);
});

/**
 * Handle Russian language selection
 */
startScene.action('lang_ru', async (ctx) => {
  await ctx.answerCbQuery();
  ctx.session.language = 'ru';
  ctx.state.locale = ru;

  // Edit the original message to show confirmation
  await ctx.editMessageText(ru.langSelected, { parse_mode: 'Markdown' });

  // Show role selection
  return showRoleSelection(ctx, ru);
});

/**
 * Show role selection buttons (Client or Master)
 * @param {object} ctx - Telegraf context
 * @param {object} locale - Current locale object
 */
async function showRoleSelection(ctx, locale) {
  return ctx.reply(locale.selectRole, {
    parse_mode: 'Markdown',
    ...Markup.inlineKeyboard([
      [Markup.button.callback(locale.roleClient, 'role_client')],
      [Markup.button.callback(locale.roleMaster, 'role_master')],
    ]),
  });
}

// ============================================
// Role selection handlers
// ============================================

/**
 * Handle client role selection — proceed to ask name
 */
startScene.action('role_client', async (ctx) => {
  await ctx.answerCbQuery();
  ctx.session.role = 'CLIENT';

  const locale = getLocale(ctx.session.language);
  await ctx.editMessageText(`${locale.roleClient} ✅`, { parse_mode: 'Markdown' });

  // Ask for full name
  ctx.session.step = 'ask_name';
  return ctx.reply(locale.askFullName, { parse_mode: 'Markdown' });
});

/**
 * Handle master role selection — proceed to ask name
 */
startScene.action('role_master', async (ctx) => {
  await ctx.answerCbQuery();
  ctx.session.role = 'MASTER';

  const locale = getLocale(ctx.session.language);
  await ctx.editMessageText(`${locale.roleMaster} ✅`, { parse_mode: 'Markdown' });

  // Ask for full name
  ctx.session.step = 'ask_name';
  return ctx.reply(locale.askFullName, { parse_mode: 'Markdown' });
});

// ============================================
// Text input handler — name and phone collection
// ============================================

/**
 * Handle text input during registration flow
 * Steps: ask_name → ask_phone → create user → route to menu
 */
startScene.on('text', async (ctx) => {
  const locale = getLocale(ctx.session?.language || 'uz');
  const step = ctx.session?.step;

  // Step 1: Collect full name
  if (step === 'ask_name') {
    const fullName = ctx.message.text.trim();
    const words = fullName.split(/\s+/).filter(Boolean);

    // Validate containing at least two words and each word being at least 2 characters long
    const isValid = words.length >= 2 && words.every(word => word.length >= 2);

    if (!isValid) {
      return ctx.reply(locale.invalidFullName, { parse_mode: 'Markdown' });
    }

    ctx.session.fullName = fullName;
    ctx.session.step = 'ask_phone';

    return ctx.reply(locale.askPhone, { parse_mode: 'Markdown' });
  }

  // Step 2: Collect phone number
  if (step === 'ask_phone') {
    const phone = ctx.message.text.trim();

    // Validate phone number format (basic validation)
    const phoneRegex = /^\+?[0-9]{9,15}$/;
    if (!phoneRegex.test(phone)) {
      return ctx.reply(locale.invalidPhone, { parse_mode: 'Markdown' });
    }

    ctx.session.phone = phone;

    try {
      // Create the user in the database
      const user = await createUser({
        telegramId: ctx.from.id,
        fullName: ctx.session.fullName,
        phone: ctx.session.phone,
        language: ctx.session.language || 'uz',
        role: 'CLIENT', // Keep role as CLIENT until admin approves
      });

      // Update context state
      ctx.state.user = user;
      ctx.state.locale = locale;

      await ctx.reply(locale.registrationComplete, { parse_mode: 'Markdown' });

      // Route to appropriate menu or master registration
      if (ctx.session.role === 'MASTER') {
        // Masters need additional registration (address, hours, days)
        return ctx.scene.enter('masterRegistration');
      }

      // Clients go straight to the client menu
      return ctx.scene.enter('clientMenu');
    } catch (err) {
      console.error('[Start Scene] Error creating user:', err.message);
      return ctx.reply(locale.errorGeneral, { parse_mode: 'Markdown' });
    }
  }

  // If no valid step, restart the scene
  return ctx.scene.reenter();
});

module.exports = startScene;
