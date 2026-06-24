// ============================================
// Book Order scene — full booking flow:
// 1. Show calendar with available dates
// 2. Show available time slots for selected date
// 3. Ask what to sew (description)
// 4. Create order and notify the master
// ============================================

const { Scenes, Markup } = require('telegraf');
const {
  getMasterById,
  getBlockedDates,
  getBookedSlots,
  isTimeSlotBooked,
  createOrder,
  findUserByTelegramId,
} = require('../database');
const { getLocale } = require('../middlewares/auth');
const { generateCalendar, formatDate } = require('../utils/calendar');
const { getAvailableSlots, generateTimeSlotsKeyboard } = require('../utils/timeSlots');
const { formatMessage } = require('../utils/scheduler');

const bookOrderScene = new Scenes.BaseScene('bookOrder');

// ============================================
// Scene entry — show calendar for selected master
// ============================================

/**
 * Load the selected master's schedule and show a calendar
 * for the current month with available/blocked dates
 */
bookOrderScene.enter(async (ctx) => {
  if (!ctx.session) ctx.session = {};

  const locale = ctx.state.locale || getLocale(ctx.session.language || 'uz');
  const masterId = ctx.session.selectedMasterId;

  if (!masterId) {
    await ctx.reply(locale.errorMasterNotFound, { parse_mode: 'Markdown' });
    return ctx.scene.enter('viewTailors');
  }

  try {
    const master = await getMasterById(masterId);

    if (!master) {
      await ctx.reply(locale.errorMasterNotFound, { parse_mode: 'Markdown' });
      return ctx.scene.enter('viewTailors');
    }

    // Store master info in session
    ctx.session.bookingMaster = {
      id: master.id,
      name: master.user.fullName,
      telegramId: master.user.telegramId,
      workingHours: JSON.parse(master.workingHours),
      workingDays: JSON.parse(master.workingDays),
    };

    // Get blocked dates for this master
    const blockedDatesRecords = await getBlockedDates(masterId);
    const blockedDateStrings = blockedDatesRecords.map((bd) => bd.date);
    ctx.session.blockedDateStrings = blockedDateStrings;

    // Show calendar for current month
    const now = new Date();
    ctx.session.calYear = now.getFullYear();
    ctx.session.calMonth = now.getMonth();

    const calendar = generateCalendar(
      ctx.session.calYear,
      ctx.session.calMonth,
      ctx.session.bookingMaster.workingDays,
      blockedDateStrings,
      locale,
      'book_date'
    );

    return ctx.reply(locale.selectDate, {
      parse_mode: 'Markdown',
      ...calendar,
    });
  } catch (err) {
    console.error('[Book Order] Error entering scene:', err.message);
    await ctx.reply(locale.errorGeneral, { parse_mode: 'Markdown' });
    return ctx.scene.enter('viewTailors');
  }
});

// ============================================
// Calendar navigation — previous/next month
// ============================================

/**
 * Handle previous month button in calendar
 */
bookOrderScene.action(/^cal_prev_(\d+)_(\d+)$/, async (ctx) => {
  await ctx.answerCbQuery();

  const locale = ctx.state.locale || getLocale(ctx.session?.language || 'uz');
  let year = parseInt(ctx.match[1], 10);
  let month = parseInt(ctx.match[2], 10);

  // Go to previous month
  month -= 1;
  if (month < 0) {
    month = 11;
    year -= 1;
  }

  // Don't allow navigating to past months
  const now = new Date();
  if (year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth())) {
    return; // Silently ignore
  }

  ctx.session.calYear = year;
  ctx.session.calMonth = month;

  const calendar = generateCalendar(
    year,
    month,
    ctx.session.bookingMaster.workingDays,
    ctx.session.blockedDateStrings || [],
    locale,
    'book_date'
  );

  try {
    await ctx.editMessageText(locale.selectDate, {
      parse_mode: 'Markdown',
      ...calendar,
    });
  } catch (err) {
    // Message not modified — ignore
  }
});

/**
 * Handle next month button in calendar
 */
bookOrderScene.action(/^cal_next_(\d+)_(\d+)$/, async (ctx) => {
  await ctx.answerCbQuery();

  const locale = ctx.state.locale || getLocale(ctx.session?.language || 'uz');
  let year = parseInt(ctx.match[1], 10);
  let month = parseInt(ctx.match[2], 10);

  // Go to next month
  month += 1;
  if (month > 11) {
    month = 0;
    year += 1;
  }

  ctx.session.calYear = year;
  ctx.session.calMonth = month;

  const calendar = generateCalendar(
    year,
    month,
    ctx.session.bookingMaster.workingDays,
    ctx.session.blockedDateStrings || [],
    locale,
    'book_date'
  );

  try {
    await ctx.editMessageText(locale.selectDate, {
      parse_mode: 'Markdown',
      ...calendar,
    });
  } catch (err) {
    // Message not modified — ignore
  }
});

/**
 * Handle no-op calendar buttons (headers, disabled days)
 */
bookOrderScene.action('cal_noop', async (ctx) => {
  await ctx.answerCbQuery();
});

// ============================================
// Date selection — show available time slots
// ============================================

/**
 * Handle clicking on an available date in the calendar
 * Load booked slots and show available ones
 */
bookOrderScene.action(/^book_date_(\d{4}-\d{2}-\d{2})$/, async (ctx) => {
  await ctx.answerCbQuery();

  const selectedDate = ctx.match[1];
  const locale = ctx.state.locale || getLocale(ctx.session?.language || 'uz');
  const master = ctx.session.bookingMaster;

  if (!master) {
    return ctx.scene.enter('viewTailors');
  }

  try {
    // Get already booked slots for this date
    const bookedSlots = await getBookedSlots(master.id, selectedDate);

    // Generate available slots
    const availableSlots = getAvailableSlots(
      master.workingHours.start,
      master.workingHours.end,
      bookedSlots
    );

    if (availableSlots.length === 0) {
      await ctx.answerCbQuery(locale.noTimeSlotsAvailable, { show_alert: true });
      return;
    }

    // Store selected date in session
    ctx.session.selectedDate = selectedDate;

    // Show available time slots
    const timeKeyboard = generateTimeSlotsKeyboard(availableSlots, 'book_time', locale);

    const message = locale.selectTime.replace('{date}', selectedDate);

    await ctx.editMessageText(message, {
      parse_mode: 'Markdown',
      ...timeKeyboard,
    });
  } catch (err) {
    console.error('[Book Order] Error loading time slots:', err.message);
    await ctx.reply(locale.errorGeneral, { parse_mode: 'Markdown' });
  }
});

/**
 * Handle "Back" button from calendar — return to tailor list
 */
bookOrderScene.action('book_date_back', async (ctx) => {
  await ctx.answerCbQuery();
  return ctx.scene.enter('viewTailors');
});

// ============================================
// Time slot selection — ask for description
// ============================================

/**
 * Handle clicking on an available time slot
 * Store the time and ask what the client wants sewn
 */
bookOrderScene.action(/^book_time_(\d{2}:\d{2})$/, async (ctx) => {
  await ctx.answerCbQuery();

  const selectedTime = ctx.match[1];
  const locale = ctx.state.locale || getLocale(ctx.session?.language || 'uz');

  ctx.session.selectedTime = selectedTime;
  ctx.session.bookingStep = 'ask_description';

  await ctx.editMessageText(
    `✅ ${ctx.session.selectedDate} | ${selectedTime}`,
    { parse_mode: 'Markdown' }
  );

  return ctx.reply(locale.askDescription, { parse_mode: 'Markdown' });
});

/**
 * Handle "Back" button from time slots — re-show calendar
 */
bookOrderScene.action('book_time_back', async (ctx) => {
  await ctx.answerCbQuery();

  const locale = ctx.state.locale || getLocale(ctx.session?.language || 'uz');

  const calendar = generateCalendar(
    ctx.session.calYear,
    ctx.session.calMonth,
    ctx.session.bookingMaster.workingDays,
    ctx.session.blockedDateStrings || [],
    locale,
    'book_date'
  );

  try {
    await ctx.editMessageText(locale.selectDate, {
      parse_mode: 'Markdown',
      ...calendar,
    });
  } catch (err) {
    // Fallback: send a new message
    await ctx.reply(locale.selectDate, {
      parse_mode: 'Markdown',
      ...calendar,
    });
  }
});

// ============================================
// Description input — create the order
// ============================================

/**
 * Handle text input for order description
 * Creates the order and sends notification to the master
 */
bookOrderScene.on('text', async (ctx) => {
  const locale = ctx.state.locale || getLocale(ctx.session?.language || 'uz');

  if (ctx.session?.bookingStep !== 'ask_description') {
    return;
  }

  const description = ctx.message.text.trim();

  if (description.length < 2) {
    return ctx.reply(locale.askDescription, { parse_mode: 'Markdown' });
  }

  const master = ctx.session.bookingMaster;
  const selectedDate = ctx.session.selectedDate;
  const selectedTime = ctx.session.selectedTime;

  if (!master || !selectedDate || !selectedTime) {
    return ctx.scene.enter('viewTailors');
  }

  try {
    // Double-check the slot is still available
    const alreadyBooked = await isTimeSlotBooked(master.id, selectedDate, selectedTime);
    if (alreadyBooked) {
      await ctx.reply(locale.errorAlreadyBooked, { parse_mode: 'Markdown' });
      return ctx.scene.enter('bookOrder');
    }

    // Get client user record
    const user = ctx.state.user || (await findUserByTelegramId(ctx.from.id));

    if (!user) {
      return ctx.scene.enter('start');
    }

    // Create the order in database
    const order = await createOrder({
      clientId: user.id,
      masterId: master.id,
      date: selectedDate,
      time: selectedTime,
      description,
    });

    // Send confirmation to the client
    const confirmMsg = formatMessage(locale.orderConfirmation, {
      master: master.name,
      date: selectedDate,
      time: selectedTime,
      description,
    });

    await ctx.reply(confirmMsg, { parse_mode: 'Markdown' });

    // Send notification to the master
    try {
      const masterLocale = getLocale(order.master.user.language);

      const notifMsg = formatMessage(masterLocale.newOrderNotification, {
        client: user.fullName,
        phone: user.phone,
        date: selectedDate,
        time: selectedTime,
        description,
      });

      await ctx.telegram.sendMessage(master.telegramId, notifMsg, {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [
            Markup.button.callback(
              masterLocale.btnConfirmOrder,
              `order_confirm_${order.id}`
            ),
          ],
          [
            Markup.button.callback(
              masterLocale.btnRejectOrder,
              `order_reject_${order.id}`
            ),
          ],
        ]),
      });
    } catch (notifErr) {
      console.error('[Book Order] Failed to notify master:', notifErr.message);
    }

    // Clean up session booking data
    delete ctx.session.bookingMaster;
    delete ctx.session.selectedMasterId;
    delete ctx.session.selectedDate;
    delete ctx.session.selectedTime;
    delete ctx.session.bookingStep;
    delete ctx.session.blockedDateStrings;
    delete ctx.session.calYear;
    delete ctx.session.calMonth;

    // Return to client menu
    return ctx.scene.enter('clientMenu');
  } catch (err) {
    console.error('[Book Order] Error creating order:', err.message);
    await ctx.reply(locale.errorGeneral, { parse_mode: 'Markdown' });
    return ctx.scene.enter('clientMenu');
  }
});

module.exports = bookOrderScene;
