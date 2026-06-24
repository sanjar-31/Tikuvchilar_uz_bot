// ============================================
// Master Registration scene — collects additional
// info from tailors: address, working hours,
// and working days
// Entered after basic registration in start scene
// ============================================

const { Scenes, Markup } = require('telegraf');
const { createMaster, findUserByTelegramId } = require('../database');
const { getLocale } = require('../middlewares/auth');
const { isValidTime } = require('../utils/timeSlots');

const masterRegistrationScene = new Scenes.BaseScene('masterRegistration');

// ============================================
// Scene entry — ask for work address
// ============================================

/**
 * When entering the scene, ask for the tailor's work address
 */
masterRegistrationScene.enter(async (ctx) => {
  if (!ctx.session) ctx.session = {};

  const locale = ctx.state.locale || getLocale(ctx.session.language || 'uz');

  ctx.session.masterReg = {
    step: 'ask_address',
    address: null,
    workStart: null,
    workEnd: null,
    workDays: [],
  };

  return ctx.reply(locale.askAddress, { parse_mode: 'Markdown' });
});

// ============================================
// Working days selection — inline keyboard
// ============================================

/**
 * Build an inline keyboard showing all 7 days of the week
 * Selected days are marked with ✅, unselected with ⬜
 *
 * @param {Array<string>} selectedDays - Currently selected day keys
 * @param {object} locale - Locale object for translations
 * @returns {object} Inline keyboard markup
 */
function buildWorkDaysKeyboard(selectedDays, locale) {
  const allDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const rows = [];

  // Build 2 days per row (3 rows + 1 row with Sun)
  for (let i = 0; i < allDays.length; i += 2) {
    const row = [];
    for (let j = i; j < Math.min(i + 2, allDays.length); j++) {
      const dayKey = allDays[j];
      const isSelected = selectedDays.includes(dayKey);
      const label = `${isSelected ? '✅' : '⬜'} ${locale.days[dayKey]}`;
      row.push(Markup.button.callback(label, `workday_${dayKey}`));
    }
    rows.push(row);
  }

  // Done button
  rows.push([Markup.button.callback(locale.btnDone, 'workdays_done')]);

  // Cancel button
  rows.push([Markup.button.callback(locale.btnCancel, 'workdays_cancel')]);

  return Markup.inlineKeyboard(rows);
}

// ============================================
// Day toggle handlers
// ============================================

/**
 * Handle clicking on a day button — toggle selection
 */
masterRegistrationScene.action(/^workday_(.+)$/, async (ctx) => {
  await ctx.answerCbQuery();

  const dayKey = ctx.match[1];
  const locale = ctx.state.locale || getLocale(ctx.session?.language || 'uz');
  const reg = ctx.session.masterReg;

  if (!reg) return ctx.scene.enter('start');

  // Toggle day selection
  const index = reg.workDays.indexOf(dayKey);
  if (index === -1) {
    reg.workDays.push(dayKey);
  } else {
    reg.workDays.splice(index, 1);
  }

  // Update the keyboard to reflect current selection
  try {
    await ctx.editMessageText(locale.askWorkDays, {
      parse_mode: 'Markdown',
      ...buildWorkDaysKeyboard(reg.workDays, locale),
    });
  } catch (err) {
    // Message not modified — ignore
  }
});

/**
 * Handle "Done" button — finalize working days selection
 */
masterRegistrationScene.action('workdays_done', async (ctx) => {
  await ctx.answerCbQuery();

  const locale = ctx.state.locale || getLocale(ctx.session?.language || 'uz');
  const reg = ctx.session.masterReg;

  if (!reg) return ctx.scene.enter('start');

  // Validate at least one day is selected
  if (reg.workDays.length === 0) {
    return ctx.answerCbQuery(locale.noWorkDaysSelected, { show_alert: true });
  }

  // Sort days in correct order
  const dayOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  reg.workDays.sort((a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b));

  try {
    // Get user from database
    const user = ctx.state.user || (await findUserByTelegramId(ctx.from.id));

    if (!user) {
      return ctx.scene.enter('start');
    }

    // Create master record in database
    await createMaster({
      userId: user.id,
      address: reg.address,
      workingHours: {
        start: reg.workStart,
        end: reg.workEnd,
      },
      workingDays: reg.workDays,
    });

    // Show selected days in confirmation
    const selectedDayNames = reg.workDays.map((d) => locale.days[d]).join(', ');

    await ctx.editMessageText(
      `${locale.masterRegistrationDone}\n\n`
      + `📍 ${reg.address}\n`
      + `🕐 ${reg.workStart} — ${reg.workEnd}\n`
      + `📅 ${selectedDayNames}`,
      { parse_mode: 'Markdown' }
    );

    // Clear registration data
    delete ctx.session.masterReg;

    // Go to master menu
    return ctx.scene.enter('masterMenu');
  } catch (err) {
    console.error('[Master Registration] Error creating master:', err.message);
    return ctx.reply(locale.errorGeneral, { parse_mode: 'Markdown' });
  }
});

/**
 * Handle "Cancel" button — abort registration
 */
masterRegistrationScene.action('workdays_cancel', async (ctx) => {
  await ctx.answerCbQuery();

  const locale = ctx.state.locale || getLocale(ctx.session?.language || 'uz');
  await ctx.editMessageText(locale.actionCancelled, { parse_mode: 'Markdown' });

  delete ctx.session.masterReg;
  return ctx.scene.enter('start');
});

// ============================================
// Text input handler — address, start time, end time
// ============================================

/**
 * Handle text input during master registration
 * Steps: ask_address → ask_work_start → ask_work_end → show work days picker
 */
masterRegistrationScene.on('text', async (ctx) => {
  const locale = ctx.state.locale || getLocale(ctx.session?.language || 'uz');
  const reg = ctx.session?.masterReg;

  if (!reg) {
    return ctx.scene.reenter();
  }

  const text = ctx.message.text.trim();

  // Step 1: Collect address
  if (reg.step === 'ask_address') {
    if (text.length < 3) {
      return ctx.reply(locale.askAddress, { parse_mode: 'Markdown' });
    }

    reg.address = text;
    reg.step = 'ask_work_start';

    return ctx.reply(locale.askWorkStart, { parse_mode: 'Markdown' });
  }

  // Step 2: Collect work start time
  if (reg.step === 'ask_work_start') {
    if (!isValidTime(text)) {
      return ctx.reply(locale.invalidTime, { parse_mode: 'Markdown' });
    }

    reg.workStart = text;
    reg.step = 'ask_work_end';

    return ctx.reply(locale.askWorkEnd, { parse_mode: 'Markdown' });
  }

  // Step 3: Collect work end time
  if (reg.step === 'ask_work_end') {
    if (!isValidTime(text)) {
      return ctx.reply(locale.invalidTime, { parse_mode: 'Markdown' });
    }

    reg.workEnd = text;
    reg.step = 'ask_work_days';

    // Show working days picker
    return ctx.reply(locale.askWorkDays, {
      parse_mode: 'Markdown',
      ...buildWorkDaysKeyboard(reg.workDays, locale),
    });
  }
});

module.exports = masterRegistrationScene;
