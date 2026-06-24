// ============================================
// Master Profile scene — shows master's profile
// info and allows toggling active/inactive status
// ============================================

const { Scenes, Markup } = require('telegraf');
const {
  findUserByTelegramId,
  getMasterByUserId,
  toggleMasterActive,
} = require('../database');
const { getLocale } = require('../middlewares/auth');

const masterProfileScene = new Scenes.BaseScene('masterProfile');

// ============================================
// Scene entry — display master profile
// ============================================

/**
 * Load master profile from DB and display all details
 * with a toggle button for active/inactive status
 */
masterProfileScene.enter(async (ctx) => {
  if (!ctx.session) ctx.session = {};

  const locale = ctx.state.locale || getLocale(ctx.session.language || 'uz');
  const user = ctx.state.user || (await findUserByTelegramId(ctx.from.id));

  if (!user || !user.master) {
    return ctx.scene.enter('start');
  }

  try {
    // Re-fetch master to get latest data
    const master = await getMasterByUserId(user.id);
    const workingHours = JSON.parse(master.workingHours);
    const workingDays = JSON.parse(master.workingDays);

    // Translate working days
    const dayNames = workingDays.map((d) => locale.days[d]).join(', ');

    // Build profile text
    const statusText = master.isActive ? locale.profileActive : locale.profileInactive;

    const profileText = locale.profileTitle
      .replace('{name}', user.fullName)
      .replace('{phone}', user.phone)
      .replace('{address}', master.address)
      .replace('{start}', workingHours.start)
      .replace('{end}', workingHours.end)
      .replace('{days}', dayNames)
      .replace('{status}', statusText);

    return ctx.reply(profileText, {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.callback(locale.btnToggleActive, 'profile_toggle_active')],
        [Markup.button.callback(locale.btnMainMenu, 'profile_back_menu')],
      ]),
    });
  } catch (err) {
    console.error('[Master Profile] Error loading profile:', err.message);
    await ctx.reply(locale.errorGeneral, { parse_mode: 'Markdown' });
    return ctx.scene.enter('masterMenu');
  }
});

// ============================================
// Toggle active/inactive status
// ============================================

/**
 * Handle toggle button — switch master between active and inactive
 * Inactive masters won't appear in the tailor list for clients
 */
masterProfileScene.action('profile_toggle_active', async (ctx) => {
  await ctx.answerCbQuery();

  const locale = ctx.state.locale || getLocale(ctx.session?.language || 'uz');
  const user = ctx.state.user || (await findUserByTelegramId(ctx.from.id));

  if (!user || !user.master) {
    return ctx.scene.enter('start');
  }

  try {
    const updatedMaster = await toggleMasterActive(user.master.id);

    const statusText = updatedMaster.isActive
      ? locale.profileActive
      : locale.profileInactive;

    const message = locale.profileStatusChanged.replace('{status}', statusText);
    await ctx.reply(message, { parse_mode: 'Markdown' });

    // Re-enter scene to show updated profile
    return ctx.scene.reenter();
  } catch (err) {
    console.error('[Master Profile] Error toggling status:', err.message);
    await ctx.reply(locale.errorGeneral, { parse_mode: 'Markdown' });
  }
});

// ============================================
// Navigation
// ============================================

/**
 * Handle "Back to menu" button
 */
masterProfileScene.action('profile_back_menu', async (ctx) => {
  await ctx.answerCbQuery();
  return ctx.scene.enter('masterMenu');
});

module.exports = masterProfileScene;
