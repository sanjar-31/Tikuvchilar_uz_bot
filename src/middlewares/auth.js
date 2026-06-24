// ============================================
// Auth middleware — loads user data from DB
// and attaches locale to every request context
// ============================================

const { findUserByTelegramId } = require('../database');
const uz = require('../locales/uz');
const ru = require('../locales/ru');

/**
 * Authentication middleware
 * Runs on every incoming update:
 * 1. Looks up the user in the database by Telegram ID
 * 2. Attaches the user record to ctx.state.user
 * 3. Attaches the correct locale (uz/ru) to ctx.state.locale
 * 4. If user is not found, sets default locale to Uzbek
 *
 * @param {object} ctx - Telegraf context
 * @param {Function} next - Next middleware function
 */
async function authMiddleware(ctx, next) {
  try {
    const telegramId = ctx.from?.id;

    if (!telegramId) {
      return next();
    }

    // Look up user in database
    const user = await findUserByTelegramId(telegramId);

    if (user) {
      // Attach user data and locale to context state
      ctx.state.user = user;
      ctx.state.locale = user.language === 'ru' ? ru : uz;
    } else {
      // No user found — use default locale (will be set during registration)
      ctx.state.user = null;
      ctx.state.locale = uz;
    }
  } catch (err) {
    console.error('[Auth Middleware] Error:', err.message);
    ctx.state.user = null;
    ctx.state.locale = uz;
  }

  return next();
}

/**
 * Get the locale object for a given language code
 * @param {string} lang - Language code ("uz" or "ru")
 * @returns {object} Locale object
 */
function getLocale(lang) {
  return lang === 'ru' ? ru : uz;
}

module.exports = {
  authMiddleware,
  getLocale,
};
