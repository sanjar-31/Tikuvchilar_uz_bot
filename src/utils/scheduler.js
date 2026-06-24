// ============================================
// Scheduler utility — sends daily reminders
// to clients 1 day before their appointment
// Uses node-cron for scheduling
// ============================================

const cron = require('node-cron');
const { getOrdersForDate } = require('../database');
const { getTomorrowDate } = require('./calendar');
const uz = require('../locales/uz');
const ru = require('../locales/ru');

/**
 * Replace template placeholders in a string with actual values
 * @param {string} template - String with {key} placeholders
 * @param {object} values - Key-value pairs to substitute
 * @returns {string} Formatted string
 */
function formatMessage(template, values) {
  let result = template;
  for (const [key, value] of Object.entries(values)) {
    result = result.replace(`{${key}}`, value);
  }
  return result;
}

/**
 * Start the daily reminder cron job
 * Runs every day at 20:00 (8 PM) — reminds clients about tomorrow's appointments
 *
 * @param {object} bot - Telegraf bot instance (used to send messages)
 */
function startReminderScheduler(bot) {
  // Run every day at 20:00
  cron.schedule('0 20 * * *', async () => {
    console.log('[Scheduler] Running daily reminder check...');

    try {
      const tomorrow = getTomorrowDate();
      const orders = await getOrdersForDate(tomorrow);

      if (orders.length === 0) {
        console.log('[Scheduler] No confirmed orders for tomorrow.');
        return;
      }

      console.log(`[Scheduler] Sending reminders for ${orders.length} order(s)...`);

      for (const order of orders) {
        try {
          // Select the correct locale based on client's language
          const locale = order.client.language === 'ru' ? ru : uz;

          const message = formatMessage(locale.reminderMessage, {
            master: order.master.user.fullName,
            date: order.date,
            time: order.time,
            description: order.description,
          });

          // Send reminder to the client
          await bot.telegram.sendMessage(order.client.telegramId, message, {
            parse_mode: 'Markdown',
          });

          console.log(`[Scheduler] Reminder sent to client ${order.client.telegramId}`);
        } catch (err) {
          console.error(
            `[Scheduler] Failed to send reminder to ${order.client.telegramId}:`,
            err.message
          );
        }
      }
    } catch (err) {
      console.error('[Scheduler] Error in reminder job:', err.message);
    }
  });

  console.log('[Scheduler] Daily reminder cron job started (runs at 20:00 every day).');
}

module.exports = {
  startReminderScheduler,
  formatMessage,
};
