// ============================================
// My Orders scene — shows client's orders
// with status and cancel option for pending ones
// ============================================

const { Scenes, Markup } = require('telegraf');
const {
  getClientOrders,
  updateOrderStatus,
  getOrderById,
  findUserByTelegramId,
} = require('../database');
const { getLocale } = require('../middlewares/auth');
const { formatMessage } = require('../utils/scheduler');

const myOrdersScene = new Scenes.BaseScene('myOrders');

// ============================================
// Scene entry — load and display client orders
// ============================================

/**
 * Fetch all orders for the current client and display them
 * Each pending order has a "Cancel" button
 */
myOrdersScene.enter(async (ctx) => {
  if (!ctx.session) ctx.session = {};

  const locale = ctx.state.locale || getLocale(ctx.session.language || 'uz');
  const user = ctx.state.user || (await findUserByTelegramId(ctx.from.id));

  if (!user) {
    return ctx.scene.enter('start');
  }

  try {
    const orders = await getClientOrders(user.id);

    if (orders.length === 0) {
      await ctx.reply(locale.noOrders, { parse_mode: 'Markdown' });
      return showBackButton(ctx, locale);
    }

    await ctx.reply(locale.myOrdersTitle, { parse_mode: 'Markdown' });

    // Display each order as a separate message with inline buttons
    for (const order of orders) {
      // Get status text based on order status
      const statusText = getStatusText(order.status, locale);

      const orderText = formatMessage(locale.orderItem, {
        id: String(order.id),
        date: order.date,
        time: order.time,
        master: order.master.user.fullName,
        description: order.description,
        status: statusText,
      });

      await ctx.reply(orderText, { parse_mode: 'Markdown' });
    }

    // Show back button after all orders
    return showBackButton(ctx, locale);
  } catch (err) {
    console.error('[My Orders] Error loading orders:', err.message);
    await ctx.reply(locale.errorGeneral, { parse_mode: 'Markdown' });
    return ctx.scene.enter('clientMenu');
  }
});



// ============================================
// Navigation
// ============================================

/**
 * Handle "Back to menu" button
 */
myOrdersScene.action('orders_back_menu', async (ctx) => {
  await ctx.answerCbQuery();
  return ctx.scene.enter('clientMenu');
});

// ============================================
// Helper functions
// ============================================

/**
 * Get localized status text for an order status
 * @param {string} status - Order status (PENDING/CONFIRMED/CANCELLED)
 * @param {object} locale - Locale object
 * @returns {string} Localized status text with emoji
 */
function getStatusText(status, locale) {
  switch (status) {
    case 'PENDING':
      return locale.statusPending;
    case 'CONFIRMED':
      return locale.statusConfirmed;
    case 'CANCELLED':
      return locale.statusCancelled;
    default:
      return status;
  }
}

/**
 * Show a "Back to menu" button
 * @param {object} ctx - Telegraf context
 * @param {object} locale - Locale object
 */
async function showBackButton(ctx, locale) {
  return ctx.reply('👇', {
    ...Markup.inlineKeyboard([
      [Markup.button.callback(locale.btnMainMenu, 'orders_back_menu')],
    ]),
  });
}

module.exports = myOrdersScene;
