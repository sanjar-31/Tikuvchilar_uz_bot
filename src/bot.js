// ============================================
// Main bot entry point for @tikuvchilar_uz_bot
// Initializes Telegraf, registers middleware,
// scenes, and launches the bot
// ============================================

require('dotenv').config();

const { Telegraf, Scenes, session } = require('telegraf');
const { authMiddleware } = require('./middlewares/auth');
const { startReminderScheduler } = require('./utils/scheduler');
const { disconnect } = require('./database');
const http = require('http');

// Import all scenes
const startScene = require('./scenes/start');
const clientMenuScene = require('./scenes/clientMenu');
const masterMenuScene = require('./scenes/masterMenu');
const masterRegistrationScene = require('./scenes/masterRegistration');
const viewTailorsScene = require('./scenes/viewTailors');
const bookOrderScene = require('./scenes/bookOrder');
const myOrdersScene = require('./scenes/myOrders');
const masterOrdersScene = require('./scenes/masterOrders');
const blockedDatesScene = require('./scenes/blockedDates');
const masterProfileScene = require('./scenes/masterProfile');
const settingsScene = require('./scenes/settings');

// ============================================
// Validate environment variables
// ============================================
if (!process.env.BOT_TOKEN) {
  console.error('❌ BOT_TOKEN is not set in .env file!');
  process.exit(1);
}

// ============================================
// Create bot instance
// ============================================
const bot = new Telegraf(process.env.BOT_TOKEN);

// ============================================
// Register session middleware
// Stores conversation state per user in memory
// ============================================
bot.use(session());

// ============================================
// Register auth middleware
// Loads user data and locale on every update
// ============================================
bot.use(authMiddleware);

// ============================================
// Create and register the scene stage
// All bot flows are managed as scenes
// ============================================
const stage = new Scenes.Stage([
  startScene,
  clientMenuScene,
  masterMenuScene,
  masterRegistrationScene,
  viewTailorsScene,
  bookOrderScene,
  myOrdersScene,
  masterOrdersScene,
  blockedDatesScene,
  masterProfileScene,
  settingsScene,
]);

bot.use(stage.middleware());

// ============================================
// /start command — entry point for all users
// Enters the start scene (language selection)
// ============================================
bot.start((ctx) => ctx.scene.enter('start'));

// ============================================
// /help command — shows basic help info
// ============================================
bot.command('help', (ctx) => {
  const locale = ctx.state.locale;
  const isRu = ctx.state.user?.language === 'ru';

  const helpText = isRu
    ? '🧵 *Tikuvchilar UZ Bot*\n\n'
      + '📌 Команды:\n'
      + '/start — Начать заново\n'
      + '/help — Показать помощь\n\n'
      + '💡 Используйте кнопки меню для навигации.'
    : '🧵 *Tikuvchilar UZ Bot*\n\n'
      + '📌 Buyruqlar:\n'
      + '/start — Qayta boshlash\n'
      + '/help — Yordam ko\'rsatish\n\n'
      + '💡 Navigatsiya uchun menyu tugmalaridan foydalaning.';

  return ctx.reply(helpText, { parse_mode: 'Markdown' });
});

// ============================================
// Handle unknown text messages
// Redirect unregistered users to /start
// ============================================
bot.on('text', (ctx) => {
  if (!ctx.state.user) {
    return ctx.scene.enter('start');
  }

  const locale = ctx.state.locale;
  return ctx.reply(locale.errorGeneral);
});

// ============================================
// Handle callback query errors gracefully
// Answers the callback to remove loading state
// ============================================
bot.on('callback_query', (ctx) => {
  return ctx.answerCbQuery();
});

// ============================================
// Global error handler
// Logs the error and notifies the user
// ============================================
bot.catch((err, ctx) => {
  console.error(`[Bot Error] ${err.message}`);
  console.error(err.stack);

  try {
    const locale = ctx.state?.locale;
    if (locale) {
      ctx.reply(locale.errorGeneral);
    }
  } catch (e) {
    // Silently ignore if we can't send the error message
  }
});

// ============================================
// Launch the bot
// ============================================
async function main() {
  try {
    console.log('🧵 Starting Tikuvchilar UZ Bot...');

    // Start the daily reminder scheduler
    startReminderScheduler(bot);

    // Launch bot with long polling
    await bot.launch();

    console.log('✅ Bot is running! Press Ctrl+C to stop.');

    // Render uchun dummy port binding
    const PORT = process.env.PORT || 3000;
    http.createServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('Bot is active and running');
    }).listen(PORT, () => {
      console.log(`[Render] Dummy server listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to start bot:', err.message);
    process.exit(1);
  }
}

// ============================================
// Graceful shutdown — stop bot and close DB
// ============================================
process.once('SIGINT', async () => {
  console.log('\n🛑 Shutting down...');
  bot.stop('SIGINT');
  await disconnect();
  process.exit(0);
});

process.once('SIGTERM', async () => {
  console.log('\n🛑 Shutting down...');
  bot.stop('SIGTERM');
  await disconnect();
  process.exit(0);
});

// Start the bot
main();
