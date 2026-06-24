// ============================================
// Master Orders scene — shows tailor's orders
// Handles confirm/reject actions from notifications
// and displays order history
// ============================================

const { Scenes, Markup } = require('telegraf');
const {
  getMasterOrders,
  getMasterByUserId,
  updateOrderStatus,
  getOrderById,
  findUserByTelegramId,
} = require('../database');
const { getLocale } = require('../middlewares/auth');
const { formatMessage } = require('../utils/scheduler');

const masterOrdersScene = new Scenes.BaseScene('masterOrders');

// ============================================
// Scene entry — load and display master's orders
// ============================================

/**
 * Fetch all orders for the current master and display them
 * Shows order details with status
 */
masterOrdersScene.enter(async (ctx) => {
  if (!ctx.session) ctx.session = {};

  const locale = ctx.state.locale || getLocale(ctx.session.language || 'uz');
  const user = ctx.state.user || (await findUserByTelegramId(ctx.from.id));

  if (!user || !user.master) {
    return ctx.scene.enter('start');
  }

  try {
    const orders = await getMasterOrders(user.master.id);

    if (orders.length === 0) {
      await ctx.reply(locale.noMasterOrders, { parse_mode: 'Markdown' });
      return showBackButton(ctx, locale);
    }

    await ctx.reply(locale.masterOrdersTitle, { parse_mode: 'Markdown' });

    // Display each order
    for (const order of orders) {
      const statusText = getStatusText(order.status, locale);

      const orderText =
        `#${order.id} | ${order.date} ${order.time}\n` +
        `👤 ${order.client.fullName}\n` +
        `📱 ${order.client.phone}\n` +
        `📝 ${order.description}\n` +
        `📊 ${statusText}`;

      // Show confirm/reject buttons for pending orders
      const buttons = [];
      if (order.status === 'PENDING') {
        buttons.push([
          Markup.button.callback(
            locale.btnConfirmOrder,
            `order_confirm_${order.id}`
          ),
          Markup.button.callback(
            locale.btnRejectOrder,
            `order_reject_${order.id}`
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

    return showBackButton(ctx, locale);
  } catch (err) {
    console.error('[Master Orders] Error loading orders:', err.message);
    await ctx.reply(locale.errorGeneral, { parse_mode: 'Markdown' });
    return ctx.scene.enter('masterMenu');
  }
});

// ============================================
// Confirm/Reject order handlers
// These also work from push notification messages
// ============================================

/**
 * Handle master confirming an order
 * Updates status to CONFIRMED and notifies the client
 */
masterOrdersScene.action(/^order_confirm_(\d+)$/, async (ctx) => {
  await ctx.answerCbQuery();
  await handleOrderAction(ctx, 'CONFIRMED');
});

/**
 * Handle master rejecting an order
 * Updates status to CANCELLED and notifies the client
 */
masterOrdersScene.action(/^order_reject_(\d+)$/, async (ctx) => {
  await ctx.answerCbQuery();
  await handleOrderAction(ctx, 'CANCELLED');
});

/**
 * Process order confirmation or rejection
 * Updates DB, edits the message, and sends notification to client
 *
 * @param {object} ctx - Telegraf context
 * @param {string} newStatus - New status ("CONFIRMED" or "CANCELLED")
 */
async function handleOrderAction(ctx, newStatus) {
  const orderId = parseInt(ctx.match[1], 10);
  const locale = ctx.state.locale || getLocale(ctx.session?.language || 'uz');

  try {
    const order = await getOrderById(orderId);

    if (!order) {
      return ctx.reply(locale.errorGeneral, { parse_mode: 'Markdown' });
    }

    if (order.status !== 'PENDING') {
      // Order already processed — just acknowledge
      return ctx.answerCbQuery();
    }

    // Update order status in database
    const updatedOrder = await updateOrderStatus(orderId, newStatus);

    // Get the status text for display
    const statusText = getStatusText(newStatus, locale);

    // Edit the original message to remove buttons and show new status
    const updatedText =
      `#${order.id} | ${order.date} ${order.time}\n` +
      `👤 ${order.client.fullName}\n` +
      `📱 ${order.client.phone}\n` +
      `📝 ${order.description}\n` +
      `📊 ${statusText}`;

    try {
      await ctx.editMessageText(updatedText, { parse_mode: 'Markdown' });
    } catch (err) {
      // Message might be too old to edit
    }

    // Show confirmation to master
    if (newStatus === 'CONFIRMED') {
      await ctx.reply(locale.orderConfirmed, { parse_mode: 'Markdown' });
    } else {
      await ctx.reply(locale.orderRejected, { parse_mode: 'Markdown' });
    }

    // Send notification to the client
    try {
      const clientLocale = getLocale(order.client.language);
      const masterName = updatedOrder.master.user.fullName;

      let clientMsg;
      if (newStatus === 'CONFIRMED') {
        clientMsg = formatMessage(clientLocale.clientOrderConfirmed, {
          master: masterName,
          date: order.date,
          time: order.time,
          description: order.description,
        });
      } else {
        clientMsg = formatMessage(clientLocale.clientOrderRejected, {
          master: masterName,
          date: order.date,
          time: order.time,
        });
      }

      await ctx.telegram.sendMessage(order.client.telegramId, clientMsg, {
        parse_mode: 'Markdown',
      });
    } catch (notifErr) {
      console.error('[Master Orders] Failed to notify client:', notifErr.message);
    }
  } catch (err) {
    console.error('[Master Orders] Error processing order:', err.message);
    await ctx.reply(locale.errorGeneral, { parse_mode: 'Markdown' });
  }
}

// ============================================
// Navigation
// ============================================

/**
 * Handle "Back to menu" button
 */
masterOrdersScene.action('master_orders_back', async (ctx) => {
  await ctx.answerCbQuery();
  return ctx.scene.enter('masterMenu');
});

// ============================================
// Helper functions
// ============================================

/**
 * Get localized status text for an order status
 * @param {string} status - Order status string
 * @param {object} locale - Locale object
 * @returns {string} Localized status text
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
      [Markup.button.callback(locale.btnMainMenu, 'master_orders_back')],
    ]),
  });
}

module.exports = masterOrdersScene;
