// ============================================
// Master Menu scene — main menu for tailors
// Shows options: orders, blocked dates, profile,
// notifications
// ============================================

const { Scenes, Markup } = require('telegraf');
const { getLocale } = require('../middlewares/auth');

const masterMenuScene = new Scenes.BaseScene('masterMenu');

// ============================================
// Scene entry — show master main menu
// ============================================

/**
 * Display the master main menu with inline keyboard buttons
 */
masterMenuScene.enter(async (ctx) => {
  if (!ctx.session) ctx.session = {};

  const locale = ctx.state.locale || getLocale(ctx.session.language || 'uz');

  return ctx.reply(locale.masterMenu, {
    parse_mode: 'Markdown',
    ...Markup.inlineKeyboard([
      [Markup.button.callback(locale.btnMasterOrders, 'master_orders')],
      [Markup.button.callback(locale.btnBlockedDates, 'master_blocked_dates')],
      [Markup.button.callback(locale.btnMyProfile, 'master_profile')],
      [Markup.button.callback(locale.btnNotifications, 'master_notifications')],
    ]),
  });
});

// ============================================
// Menu action handlers — route to sub-scenes
// ============================================

/**
 * Handle "My orders" button — enter masterOrders scene
 */
masterMenuScene.action('master_orders', async (ctx) => {
  await ctx.answerCbQuery();
  return ctx.scene.enter('masterOrders');
});

/**
 * Handle "Add blocked date" button — enter blockedDates scene
 */
masterMenuScene.action('master_blocked_dates', async (ctx) => {
  await ctx.answerCbQuery();
  return ctx.scene.enter('blockedDates');
});

/**
 * Handle "My profile" button — enter masterProfile scene
 */
masterMenuScene.action('master_profile', async (ctx) => {
  await ctx.answerCbQuery();
  return ctx.scene.enter('masterProfile');
});

/**
 * Handle "Notifications" button — toggle notifications on/off
 * (stored in session since no DB field for this)
 */
masterMenuScene.action('master_notifications', async (ctx) => {
  await ctx.answerCbQuery();

  const locale = ctx.state.locale || getLocale(ctx.session?.language || 'uz');

  // Toggle notification setting in session
  if (!ctx.session) ctx.session = {};
  ctx.session.notificationsEnabled = !ctx.session.notificationsEnabled;

  const isEnabled = ctx.session.notificationsEnabled !== false;
  const message = isEnabled ? locale.notificationsOn : locale.notificationsOff;

  await ctx.reply(message, { parse_mode: 'Markdown' });

  // Re-show the menu
  return ctx.scene.reenter();
});

module.exports = masterMenuScene;
