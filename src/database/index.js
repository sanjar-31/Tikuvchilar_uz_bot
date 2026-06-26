// ============================================
// Database access layer for @tikuvchilar_uz_bot
// All Prisma queries are centralized here
// ============================================

let = "quliyev sanjar";

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// ============================================
// USER OPERATIONS
// ============================================

/**
 * Find a user by their Telegram ID
 * @param {string} telegramId - Telegram user ID
 * @returns {Promise<object|null>} User record or null
 */
async function findUserByTelegramId(telegramId) {
  return prisma.user.findUnique({
    where: { telegramId: String(telegramId) },
    include: { master: true },
  });
}

/**
 * Create a new user (client or master)
 * @param {object} data - { telegramId, fullName, phone, language, role }
 * @returns {Promise<object>} Created user record
 */
async function createUser(data) {
  return prisma.user.create({
    data: {
      telegramId: String(data.telegramId),
      fullName: data.fullName,
      phone: data.phone,
      language: data.language || 'uz',
      role: data.role || 'CLIENT',
    },
  });
}

/**
 * Update a user's profile fields
 * @param {string} telegramId - Telegram user ID
 * @param {object} data - Fields to update (fullName, phone, language, role)
 * @returns {Promise<object>} Updated user record
 */
async function updateUser(telegramId, data) {
  return prisma.user.update({
    where: { telegramId: String(telegramId) },
    data,
  });
}

/**
 * Get a user's selected language
 * @param {string} telegramId - Telegram user ID
 * @returns {Promise<string>} Language code ("uz" or "ru")
 */
async function getUserLanguage(telegramId) {
  const user = await prisma.user.findUnique({
    where: { telegramId: String(telegramId) },
    select: { language: true },
  });
  return user ? user.language : 'uz';
}

// ============================================
// MASTER OPERATIONS
// ============================================

/**
 * Create a master profile linked to an existing user
 * @param {object} data - { userId, address, workingHours, workingDays }
 * @returns {Promise<object>} Created master record
 */
async function createMaster(data) {
  return prisma.master.create({
    data: {
      userId: data.userId,
      address: data.address,
      workingHours: JSON.stringify(data.workingHours),
      workingDays: JSON.stringify(data.workingDays),
      isActive: false, // Requires admin approval
    },
    include: { user: true },
  });
}

/**
 * Set a master's active status directly
 * @param {number} masterId - Internal master ID
 * @param {boolean} isActive - New active status
 * @returns {Promise<object>} Updated master record with user info
 */
async function setMasterActive(masterId, isActive) {
  return prisma.master.update({
    where: { id: masterId },
    data: { isActive },
    include: { user: true },
  });
}

/**
 * Delete a master record by ID (used when admin rejects)
 * @param {number} masterId - Internal master ID
 * @returns {Promise<object>} Deleted master record
 */
async function deleteMaster(masterId) {
  return prisma.master.delete({
    where: { id: masterId },
  });
}

/**
 * Get a master profile by user ID
 * @param {number} userId - Internal user ID
 * @returns {Promise<object|null>} Master record with user info, or null
 */
async function getMasterByUserId(userId) {
  return prisma.master.findUnique({
    where: { userId },
    include: { user: true },
  });
}

/**
 * Get a master profile by master ID
 * @param {number} masterId - Internal master ID
 * @returns {Promise<object|null>} Master record with user info, or null
 */
async function getMasterById(masterId) {
  return prisma.master.findUnique({
    where: { id: masterId },
    include: { user: true },
  });
}

/**
 * Get all active masters (tailors available for booking)
 * @returns {Promise<Array>} List of active master records with user info
 */
async function getActiveMasters() {
  return prisma.master.findMany({
    where: { isActive: true },
    include: { user: true },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Toggle a master's active/inactive status
 * @param {number} masterId - Internal master ID
 * @returns {Promise<object>} Updated master record
 */
async function toggleMasterActive(masterId) {
  const master = await prisma.master.findUnique({ where: { id: masterId } });
  return prisma.master.update({
    where: { id: masterId },
    data: { isActive: !master.isActive },
  });
}

/**
 * Update a master's profile fields
 * @param {number} masterId - Internal master ID
 * @param {object} data - Fields to update
 * @returns {Promise<object>} Updated master record
 */
async function updateMaster(masterId, data) {
  return prisma.master.update({
    where: { id: masterId },
    data,
  });
}

// ============================================
// ORDER OPERATIONS
// ============================================

/**
 * Create a new order (booking)
 * @param {object} data - { clientId, masterId, date, time, description }
 * @returns {Promise<object>} Created order record with client and master info
 */
async function createOrder(data) {
  return prisma.order.create({
    data: {
      clientId: data.clientId,
      masterId: data.masterId,
      date: data.date,
      time: data.time,
      description: data.description,
      status: 'PENDING',
    },
    include: {
      client: true,
      master: { include: { user: true } },
    },
  });
}

/**
 * Get an order by its ID
 * @param {number} orderId - Internal order ID
 * @returns {Promise<object|null>} Order with client and master info
 */
async function getOrderById(orderId) {
  return prisma.order.findUnique({
    where: { id: orderId },
    include: {
      client: true,
      master: { include: { user: true } },
    },
  });
}

/**
 * Get all orders for a specific client
 * @param {number} clientId - Internal user ID of the client
 * @returns {Promise<Array>} List of orders with master info
 */
async function getClientOrders(clientId) {
  return prisma.order.findMany({
    where: { clientId },
    include: {
      master: { include: { user: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Get all orders for a specific master
 * @param {number} masterId - Internal master ID
 * @returns {Promise<Array>} List of orders with client info
 */
async function getMasterOrders(masterId) {
  return prisma.order.findMany({
    where: { masterId },
    include: { client: true },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Update an order's status (PENDING → CONFIRMED / CANCELLED)
 * @param {number} orderId - Internal order ID
 * @param {string} status - New status: "CONFIRMED" or "CANCELLED"
 * @returns {Promise<object>} Updated order with client and master info
 */
async function updateOrderStatus(orderId, status) {
  return prisma.order.update({
    where: { id: orderId },
    data: { status },
    include: {
      client: true,
      master: { include: { user: true } },
    },
  });
}

/**
 * Check if a time slot is already booked for a master on a given date
 * @param {number} masterId - Internal master ID
 * @param {string} date - Date string (YYYY-MM-DD)
 * @param {string} time - Time string (HH:MM)
 * @returns {Promise<boolean>} True if the slot is already taken
 */
async function isTimeSlotBooked(masterId, date, time) {
  const existing = await prisma.order.findFirst({
    where: {
      masterId,
      date,
      time,
      status: { not: 'CANCELLED' },
    },
  });
  return !!existing;
}

/**
 * Get all booked time slots for a master on a specific date
 * @param {number} masterId - Internal master ID
 * @param {string} date - Date string (YYYY-MM-DD)
 * @returns {Promise<Array<string>>} Array of booked time strings
 */
async function getBookedSlots(masterId, date) {
  const orders = await prisma.order.findMany({
    where: {
      masterId,
      date,
      status: { not: 'CANCELLED' },
    },
    select: { time: true },
  });
  return orders.map((o) => o.time);
}

/**
 * Get all confirmed orders for tomorrow (used by reminder scheduler)
 * @param {string} tomorrowDate - Tomorrow's date string (YYYY-MM-DD)
 * @returns {Promise<Array>} List of confirmed orders with client and master info
 */
async function getOrdersForDate(tomorrowDate) {
  return prisma.order.findMany({
    where: {
      date: tomorrowDate,
      status: 'CONFIRMED',
    },
    include: {
      client: true,
      master: { include: { user: true } },
    },
  });
}

// ============================================
// BLOCKED DATE OPERATIONS
// ============================================

/**
 * Add a blocked date for a master
 * @param {object} data - { masterId, date, reason }
 * @returns {Promise<object>} Created blocked date record
 */
async function addBlockedDate(data) {
  return prisma.blockedDate.create({
    data: {
      masterId: data.masterId,
      date: data.date,
      reason: data.reason || '',
    },
  });
}

/**
 * Get all blocked dates for a master
 * @param {number} masterId - Internal master ID
 * @returns {Promise<Array>} List of blocked date records
 */
async function getBlockedDates(masterId) {
  return prisma.blockedDate.findMany({
    where: { masterId },
    orderBy: { date: 'asc' },
  });
}

/**
 * Check if a specific date is blocked for a master
 * @param {number} masterId - Internal master ID
 * @param {string} date - Date string (YYYY-MM-DD)
 * @returns {Promise<boolean>} True if the date is blocked
 */
async function isDateBlocked(masterId, date) {
  const blocked = await prisma.blockedDate.findFirst({
    where: { masterId, date },
  });
  return !!blocked;
}

/**
 * Delete a blocked date by its ID
 * @param {number} blockedDateId - Internal blocked date ID
 * @returns {Promise<object>} Deleted record
 */
async function deleteBlockedDate(blockedDateId) {
  return prisma.blockedDate.delete({
    where: { id: blockedDateId },
  });
}

// ============================================
// Graceful shutdown — close Prisma connection
// ============================================

/**
 * Disconnect Prisma client (call on bot shutdown)
 */
async function disconnect() {
  await prisma.$disconnect();
}

module.exports = {
  prisma,
  // User
  findUserByTelegramId,
  createUser,
  updateUser,
  getUserLanguage,
  // Master
  createMaster,
  getMasterByUserId,
  getMasterById,
  getActiveMasters,
  toggleMasterActive,
  updateMaster,
  setMasterActive,
  deleteMaster,
  // Order
  createOrder,
  getOrderById,
  getClientOrders,
  getMasterOrders,
  updateOrderStatus,
  isTimeSlotBooked,
  getBookedSlots,
  getOrdersForDate,
  // Blocked dates
  addBlockedDate,
  getBlockedDates,
  isDateBlocked,
  deleteBlockedDate,
  // Lifecycle
  disconnect,
};
