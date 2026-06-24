// ============================================
// Time slot utility — generates available
// appointment slots for a master on a given day
// ============================================

const { Markup } = require('telegraf');

/**
 * Validate time format (HH:MM)
 * @param {string} time - Time string to validate
 * @returns {boolean} True if valid HH:MM format
 */
function isValidTime(time) {
  const regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  return regex.test(time);
}

/**
 * Convert a time string (HH:MM) to total minutes since midnight
 * @param {string} time - Time string in HH:MM format
 * @returns {number} Total minutes
 */
function timeToMinutes(time) {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Convert total minutes since midnight to HH:MM string
 * @param {number} minutes - Total minutes
 * @returns {string} Formatted time string
 */
function minutesToTime(minutes) {
  const h = String(Math.floor(minutes / 60)).padStart(2, '0');
  const m = String(minutes % 60).padStart(2, '0');
  return `${h}:${m}`;
}

/**
 * Generate all possible time slots between start and end time
 * Each slot is 1 hour long
 *
 * @param {string} startTime - Work start time (HH:MM)
 * @param {string} endTime - Work end time (HH:MM)
 * @param {number} intervalMinutes - Slot interval in minutes (default: 60)
 * @returns {Array<string>} Array of time slot strings
 */
function generateAllSlots(startTime, endTime, intervalMinutes = 60) {
  const slots = [];
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);

  for (let t = start; t < end; t += intervalMinutes) {
    slots.push(minutesToTime(t));
  }

  return slots;
}

/**
 * Get available (unbooked) time slots for a master on a given day
 *
 * @param {string} startTime - Work start time (HH:MM)
 * @param {string} endTime - Work end time (HH:MM)
 * @param {Array<string>} bookedSlots - Already booked time strings
 * @returns {Array<string>} Array of available time slot strings
 */
function getAvailableSlots(startTime, endTime, bookedSlots) {
  const allSlots = generateAllSlots(startTime, endTime);
  return allSlots.filter((slot) => !bookedSlots.includes(slot));
}

/**
 * Generate an inline keyboard with available time slots
 * Arranged in 3 columns for a clean layout
 *
 * @param {Array<string>} availableSlots - Array of available time strings
 * @param {string} callbackPrefix - Prefix for callback data
 * @param {object} locale - Locale object for translations
 * @returns {object} Telegraf inline keyboard markup
 */
function generateTimeSlotsKeyboard(availableSlots, callbackPrefix, locale) {
  const rows = [];
  const columnsPerRow = 3;

  for (let i = 0; i < availableSlots.length; i += columnsPerRow) {
    const row = availableSlots
      .slice(i, i + columnsPerRow)
      .map((slot) => Markup.button.callback(`🕐 ${slot}`, `${callbackPrefix}_${slot}`));
    rows.push(row);
  }

  // Back button
  rows.push([Markup.button.callback(locale.btnBack, `${callbackPrefix}_back`)]);

  return Markup.inlineKeyboard(rows);
}

module.exports = {
  isValidTime,
  timeToMinutes,
  minutesToTime,
  generateAllSlots,
  getAvailableSlots,
  generateTimeSlotsKeyboard,
};
