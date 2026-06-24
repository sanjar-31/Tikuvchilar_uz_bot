// ============================================
// Calendar utility — generates inline keyboard
// calendars for date selection
// ============================================

const { Markup } = require('telegraf');

/**
 * Get the short day key (Mon, Tue, etc.) from a JS Date object
 * @param {Date} date - JavaScript Date object
 * @returns {string} Day key like "Mon", "Tue", etc.
 */
function getDayKey(date) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[date.getDay()];
}

/**
 * Format a Date object as YYYY-MM-DD string
 * @param {Date} date - JavaScript Date object
 * @returns {string} Formatted date string
 */
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parse a YYYY-MM-DD string into a Date object
 * @param {string} dateStr - Date string in YYYY-MM-DD format
 * @returns {Date} Parsed Date object
 */
function parseDate(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Check if a date string is valid YYYY-MM-DD format
 * @param {string} dateStr - Date string to validate
 * @returns {boolean} True if valid
 */
function isValidDate(dateStr) {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateStr)) return false;
  const date = parseDate(dateStr);
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Check if a date is in the past (before today)
 * @param {string} dateStr - Date string in YYYY-MM-DD format
 * @returns {boolean} True if the date is in the past
 */
function isPastDate(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const date = parseDate(dateStr);
  return date < today;
}

/**
 * Get tomorrow's date as YYYY-MM-DD string
 * @returns {string} Tomorrow's date
 */
function getTomorrowDate() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return formatDate(tomorrow);
}

/**
 * Generate a calendar inline keyboard for a given month
 * Shows available/blocked days based on master's schedule
 *
 * @param {number} year - Year (e.g. 2026)
 * @param {number} month - Month (0-indexed, 0 = January)
 * @param {Array<string>} workingDays - Master's working day keys (["Mon","Tue",...])
 * @param {Array<string>} blockedDates - Array of blocked date strings (YYYY-MM-DD)
 * @param {object} locale - Locale object for translations
 * @param {string} callbackPrefix - Prefix for callback data (e.g. "book_date")
 * @returns {object} Telegraf inline keyboard markup
 */
function generateCalendar(year, month, workingDays, blockedDates, locale, callbackPrefix) {
  const rows = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Header row: month name + year with navigation arrows
  const monthName = locale.months[month];
  rows.push([
    Markup.button.callback('◀️', `cal_prev_${year}_${month}`),
    Markup.button.callback(`${monthName} ${year}`, 'cal_noop'),
    Markup.button.callback('▶️', `cal_next_${year}_${month}`),
  ]);

  // Day-of-week header row
  const dayHeaders = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  if (locale === require('../locales/uz')) {
    dayHeaders.splice(0, 7, 'Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya');
  }
  rows.push(dayHeaders.map((d) => Markup.button.callback(d, 'cal_noop')));

  // Calculate first day of month and total days
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const totalDays = lastDay.getDate();

  // Monday-based offset (0 = Monday, 6 = Sunday)
  let startOffset = firstDay.getDay() - 1;
  if (startOffset < 0) startOffset = 6;

  // Build week rows
  let week = [];

  // Fill empty cells before the 1st
  for (let i = 0; i < startOffset; i++) {
    week.push(Markup.button.callback(' ', 'cal_noop'));
  }

  for (let day = 1; day <= totalDays; day++) {
    const date = new Date(year, month, day);
    const dateStr = formatDate(date);
    const dayKey = getDayKey(date);

    const isPast = date < today;
    const isWorkDay = workingDays.includes(dayKey);
    const isBlocked = blockedDates.includes(dateStr);

    if (isPast || !isWorkDay || isBlocked) {
      // Unavailable day — show as disabled
      week.push(Markup.button.callback(`  ${day}  `, 'cal_noop'));
    } else {
      // Available day — clickable
      week.push(Markup.button.callback(`✅${day}`, `${callbackPrefix}_${dateStr}`));
    }

    // Start a new row after Sunday (7 buttons)
    if (week.length === 7) {
      rows.push(week);
      week = [];
    }
  }

  // Fill remaining cells in the last week
  if (week.length > 0) {
    while (week.length < 7) {
      week.push(Markup.button.callback(' ', 'cal_noop'));
    }
    rows.push(week);
  }

  // Back button
  rows.push([Markup.button.callback(locale.btnBack, `${callbackPrefix}_back`)]);

  return Markup.inlineKeyboard(rows);
}

module.exports = {
  getDayKey,
  formatDate,
  parseDate,
  isValidDate,
  isPastDate,
  getTomorrowDate,
  generateCalendar,
};
