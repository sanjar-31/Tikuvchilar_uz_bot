// ============================================
// Blocked Dates scene — allows masters to add
// or remove days when they're unavailable
// (vacation, holidays, personal reasons)
// ============================================

const { Scenes, Markup } = require('telegraf');
const {
  getBlockedDates,
  addBlockedDate,
  deleteBlockedDate,
  findUserByTelegramId,
} = require('../database');
const { getLocale } = require('../middlewares/auth');
const { isValidDate, isPastDate } = require('../utils/calendar');

const blockedDatesScene = new Scenes.BaseScene('blockedDates');

// ============================================
// Scene entry — show existing blocked dates
// ============================================

/**
 * Load and display the master's blocked dates
 * Each date has a delete button; a button to add new dates is shown
 */
blockedDatesScene.enter(async (ctx) => {
  if (!ctx.session) ctx.session = {};
  ctx.session.blockedStep = null;

  const locale = ctx.state.locale || getLocale(ctx.session.language || 'uz');
  const user = ctx.state.user || (await findUserByTelegramId(ctx.from.id));

  if (!user || !user.master) {
    return ctx.scene.enter('start');
  }

  try {
    const blockedDates = await getBlockedDates(user.master.id);

    if (blockedDates.length === 0) {
      await ctx.reply(locale.noBlockedDates, { parse_mode: 'Markdown' });
    } else {
      await ctx.reply(locale.blockedDatesTitle, { parse_mode: 'Markdown' });

      // Display each blocked date with a delete button
      for (const bd of blockedDates) {
        const text = `📅 ${bd.date}${bd.reason ? ` — ${bd.reason}` : ''}`;

        await ctx.reply(text, {
          ...Markup.inlineKeyboard([
            [
              Markup.button.callback(
                locale.btnDeleteBlocked,
                `delete_blocked_${bd.id}`
              ),
            ],
          ]),
        });
      }
    }

    // Show action buttons: add new + back to menu
    return ctx.reply('👇', {
      ...Markup.inlineKeyboard([
        [Markup.button.callback(locale.btnBlockedDates, 'add_blocked_date')],
        [Markup.button.callback(locale.btnMainMenu, 'blocked_back_menu')],
      ]),
    });
  } catch (err) {
    console.error('[Blocked Dates] Error loading dates:', err.message);
    await ctx.reply(locale.errorGeneral, { parse_mode: 'Markdown' });
    return ctx.scene.enter('masterMenu');
  }
});

// ============================================
// Add blocked date flow
// ============================================

/**
 * Handle "Add blocked date" button — ask for the date
 */
blockedDatesScene.action('add_blocked_date', async (ctx) => {
  await ctx.answerCbQuery();

  const locale = ctx.state.locale || getLocale(ctx.session?.language || 'uz');
  ctx.session.blockedStep = 'ask_date';

  return ctx.reply(locale.askBlockDate, { parse_mode: 'Markdown' });
});

/**
 * Handle text input — collect date and optional reason
 */
blockedDatesScene.on('text', async (ctx) => {
  const locale = ctx.state.locale || getLocale(ctx.session?.language || 'uz');
  const step = ctx.session?.blockedStep;

  // Step 1: Collect date
  if (step === 'ask_date') {
    const dateStr = ctx.message.text.trim();

    // Validate date format
    if (!isValidDate(dateStr)) {
      return ctx.reply(locale.invalidDate, { parse_mode: 'Markdown' });
    }

    // Check if date is in the past
    if (isPastDate(dateStr)) {
      return ctx.reply(locale.errorPastDate, { parse_mode: 'Markdown' });
    }

    ctx.session.blockedDate = dateStr;
    ctx.session.blockedStep = 'ask_reason';

    return ctx.reply(locale.askBlockReason, {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.callback(locale.btnSkipReason, 'skip_block_reason')],
      ]),
    });
  }

  // Step 2: Collect reason (text input)
  if (step === 'ask_reason') {
    const reason = ctx.message.text.trim();
    return saveBlockedDate(ctx, locale, reason);
  }
});

/**
 * Handle "Skip reason" button — save date with empty reason
 */
blockedDatesScene.action('skip_block_reason', async (ctx) => {
  await ctx.answerCbQuery();

  const locale = ctx.state.locale || getLocale(ctx.session?.language || 'uz');
  return saveBlockedDate(ctx, locale, '');
});

/**
 * Save the blocked date to the database and re-enter the scene
 * @param {object} ctx - Telegraf context
 * @param {object} locale - Locale object
 * @param {string} reason - Reason for blocking (can be empty)
 */
async function saveBlockedDate(ctx, locale, reason) {
  const user = ctx.state.user || (await findUserByTelegramId(ctx.from.id));

  if (!user || !user.master) {
    return ctx.scene.enter('start');
  }

  try {
    await addBlockedDate({
      masterId: user.master.id,
      date: ctx.session.blockedDate,
      reason,
    });

    const message = locale.dateBlocked.replace('{date}', ctx.session.blockedDate);
    await ctx.reply(message, { parse_mode: 'Markdown' });

    // Clean up session
    delete ctx.session.blockedDate;
    delete ctx.session.blockedStep;

    // Re-enter scene to show updated list
    return ctx.scene.reenter();
  } catch (err) {
    console.error('[Blocked Dates] Error saving date:', err.message);
    await ctx.reply(locale.errorGeneral, { parse_mode: 'Markdown' });
    return ctx.scene.reenter();
  }
}

// ============================================
// Delete blocked date handler
// ============================================

/**
 * Handle delete button — remove a blocked date from DB
 */
blockedDatesScene.action(/^delete_blocked_(\d+)$/, async (ctx) => {
  await ctx.answerCbQuery();

  const blockedId = parseInt(ctx.match[1], 10);
  const locale = ctx.state.locale || getLocale(ctx.session?.language || 'uz');

  try {
    await deleteBlockedDate(blockedId);

    // Remove the message with the deleted date
    try {
      await ctx.deleteMessage();
    } catch (err) {
      // Can't delete message — just edit it
      await ctx.editMessageText(`~${locale.blockedDateDeleted}~`, {
        parse_mode: 'Markdown',
      });
    }

    await ctx.reply(locale.blockedDateDeleted, { parse_mode: 'Markdown' });
  } catch (err) {
    console.error('[Blocked Dates] Error deleting date:', err.message);
    await ctx.reply(locale.errorGeneral, { parse_mode: 'Markdown' });
  }
});

// ============================================
// Navigation
// ============================================

/**
 * Handle "Back to menu" button
 */
blockedDatesScene.action('blocked_back_menu', async (ctx) => {
  await ctx.answerCbQuery();
  return ctx.scene.enter('masterMenu');
});

module.exports = blockedDatesScene;
