// ============================================
// Client Menu scene — main menu for clients
// Shows options: view tailors, my orders, settings
// ============================================

const { Scenes, Markup } = require('telegraf');
const { getLocale } = require('../middlewares/auth');

const clientMenuScene = new Scenes.BaseScene('clientMenu');

// ============================================
// Scene entry — show client main menu
// ============================================

/**
 * Display the client main menu with inline keyboard buttons
 */
clientMenuScene.enter(async (ctx) => {
  if (!ctx.session) ctx.session = {};

  const locale = ctx.state.locale || getLocale(ctx.session.language || 'uz');

  return ctx.reply(locale.clientMenu, {
    parse_mode: 'Markdown',
    ...Markup.inlineKeyboard([
      [Markup.button.callback(locale.btnViewTailors, 'client_view_tailors')],
      [Markup.button.callback(locale.btnMyOrders, 'client_my_orders')],
      [Markup.button.callback(locale.btnSettings, 'client_settings')],
    ]),
  });
});

// ============================================
// Menu action handlers — route to sub-scenes
// ============================================

/**
 * Handle "View tailors" button — enter viewTailors scene
 */
clientMenuScene.action('client_view_tailors', async (ctx) => {
  await ctx.answerCbQuery();
  return ctx.scene.enter('viewTailors');
});

/**
 * Handle "My orders" button — enter myOrders scene
 */
clientMenuScene.action('client_my_orders', async (ctx) => {
  await ctx.answerCbQuery();
  return ctx.scene.enter('myOrders');
});

/**
 * Handle "Settings" button — enter settings scene
 */
clientMenuScene.action('client_settings', async (ctx) => {
  await ctx.answerCbQuery();
  return ctx.scene.enter('settings');
});

module.exports = clientMenuScene;
