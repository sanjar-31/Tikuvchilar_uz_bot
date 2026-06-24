// ============================================
// View Tailors scene — shows list of available
// tailors and their details
// Client can select a tailor to book
// ============================================

const { Scenes, Markup } = require('telegraf');
const { getActiveMasters, getMasterById } = require('../database');
const { getLocale } = require('../middlewares/auth');

const viewTailorsScene = new Scenes.BaseScene('viewTailors');

// ============================================
// Scene entry — show list of active tailors
// ============================================

/**
 * Fetch all active masters from DB and display them as inline buttons
 */
viewTailorsScene.enter(async (ctx) => {
  if (!ctx.session) ctx.session = {};

  const locale = ctx.state.locale || getLocale(ctx.session.language || 'uz');

  try {
    const masters = await getActiveMasters();

    if (masters.length === 0) {
      await ctx.reply(locale.noTailorsAvailable, { parse_mode: 'Markdown' });
      return ctx.scene.enter('clientMenu');
    }

    // Build a button for each tailor
    const buttons = masters.map((master) => [
      Markup.button.callback(
        `✂️ ${master.user.fullName}`,
        `view_tailor_${master.id}`
      ),
    ]);

    // Add back button
    buttons.push([
      Markup.button.callback(locale.btnMainMenu, 'tailors_back_menu'),
    ]);

    return ctx.reply(locale.tailorListTitle, {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard(buttons),
    });
  } catch (err) {
    console.error('[View Tailors] Error loading masters:', err.message);
    await ctx.reply(locale.errorGeneral, { parse_mode: 'Markdown' });
    return ctx.scene.enter('clientMenu');
  }
});

// ============================================
// Tailor detail view
// ============================================

/**
 * Handle clicking on a specific tailor — show their full profile
 * with address, working hours, and a "Book" button
 */
viewTailorsScene.action(/^view_tailor_(\d+)$/, async (ctx) => {
  await ctx.answerCbQuery();

  const masterId = parseInt(ctx.match[1], 10);
  const locale = ctx.state.locale || getLocale(ctx.session?.language || 'uz');

  try {
    const master = await getMasterById(masterId);

    if (!master) {
      await ctx.reply(locale.errorMasterNotFound, { parse_mode: 'Markdown' });
      return ctx.scene.reenter();
    }

    // Parse JSON fields
    const workingHours = JSON.parse(master.workingHours);
    const workingDays = JSON.parse(master.workingDays);

    // Translate working days to localized names
    const dayNames = workingDays.map((d) => locale.days[d]).join(', ');

    // Build tailor info message
    const info = locale.tailorInfo
      .replace('{name}', master.user.fullName)
      .replace('{address}', master.address)
      .replace('{start}', workingHours.start)
      .replace('{end}', workingHours.end)
      .replace('{days}', dayNames);

    await ctx.editMessageText(info, {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.callback(locale.btnBookTailor, `book_tailor_${masterId}`)],
        [Markup.button.callback(locale.btnBackToList, 'tailors_back_list')],
      ]),
    });
  } catch (err) {
    console.error('[View Tailors] Error loading tailor:', err.message);
    await ctx.reply(locale.errorGeneral, { parse_mode: 'Markdown' });
  }
});

// ============================================
// Navigation handlers
// ============================================

/**
 * Handle "Book" button — enter bookOrder scene with selected master
 */
viewTailorsScene.action(/^book_tailor_(\d+)$/, async (ctx) => {
  await ctx.answerCbQuery();

  const masterId = parseInt(ctx.match[1], 10);

  // Store selected master ID in session for bookOrder scene
  ctx.session.selectedMasterId = masterId;

  return ctx.scene.enter('bookOrder');
});

/**
 * Handle "Back to list" button — re-show tailor list
 */
viewTailorsScene.action('tailors_back_list', async (ctx) => {
  await ctx.answerCbQuery();
  return ctx.scene.reenter();
});

/**
 * Handle "Main menu" button — return to client menu
 */
viewTailorsScene.action('tailors_back_menu', async (ctx) => {
  await ctx.answerCbQuery();
  return ctx.scene.enter('clientMenu');
});

module.exports = viewTailorsScene;
