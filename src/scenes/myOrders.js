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

      // Build inline buttons (only show cancel for pending orders)
      const buttons = [];
      if (order.status === 'PENDING') {
        buttons.push([
          Markup.button.callback(
            locale.btnCancelOrder,
            `client_cancel_order_${order.id}`
          ),
        ]);
      }

      if (buttons.length > 0) {
        await ctx.reply(orderText, {
          parse_mode: 'Markdown',
          ...Markup.inlineKeyboard(buttons),
        });
      } else {
        await ctx.reply(orderText, { parse_mode: 'Markdown' });
      }
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
// Cancel order handler
// ============================================

/**
 * Handle client cancelling a pending order
 * Updates order status to CANCELLED and notifies the master
 */
myOrdersScene.action(/^client_cancel_order_(\d+)$/, async (ctx) => {
  await ctx.answerCbQuery();

  const orderId = parseInt(ctx.match[1], 10);
  const locale = ctx.state.locale || getLocale(ctx.session?.language || 'uz');

  try {
    const order = await getOrderById(orderId);

    if (!order || order.status !== 'PENDING') {
      return ctx.answerCbQuery(locale.errorGeneral, { show_alert: true });
    }

    // Update order status to CANCELLED
    await updateOrderStatus(orderId, 'CANCELLED');

    // Update the message to show cancelled status
    await ctx.editMessageText(
      formatMessage(locale.orderItem, {
        id: String(order.id),
        date: order.date,
        time: order.time,
        master: order.master.user.fullName,
        description: order.description,
        status: locale.statusCancelled,
      }),
      { parse_mode: 'Markdown' }
    );

    await ctx.reply(locale.orderCancelled, { parse_mode: 'Markdown' });
  } catch (err) {
    console.error('[My Orders] Error cancelling order:', err.message);
    await ctx.reply(locale.errorGeneral, { parse_mode: 'Markdown' });
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
