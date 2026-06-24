# 🧵 Tikuvchilar UZ Bot

Telegram bot for tailors (masters) and their clients. Clients can browse available tailors, view their schedules, and book appointments. Tailors can manage their orders, set blocked dates, and receive real-time notifications.

**Bot:** [@tikuvchilar_uz_bot](https://t.me/tikuvchilar_uz_bot)
**Languages:** 🇺🇿 Uzbek / 🇷🇺 Russian

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Step 1 — Clone the Repository](#step-1--clone-the-repository)
- [Step 2 — Install Dependencies](#step-2--install-dependencies)
- [Step 3 — Create a Telegram Bot](#step-3--create-a-telegram-bot)
- [Step 4 — Configure Environment Variables](#step-4--configure-environment-variables)
- [Step 5 — Set Up the Database](#step-5--set-up-the-database)
- [Step 6 — Run Locally](#step-6--run-locally)
- [Step 7 — Test the Bot](#step-7--test-the-bot)
- [Deploying to Railway](#-deploying-to-railway)
- [Bot Commands](#-bot-commands)
- [User Flows](#-user-flows)
- [Database Schema](#-database-schema)
- [Troubleshooting](#-troubleshooting)
- [License](#-license)

---

## ✨ Features

### For Clients:
- 🌐 Choose language (Uzbek or Russian)
- 👗 Browse list of available tailors
- 📅 Interactive calendar to pick a day
- 🕐 View and select available time slots
- 📝 Describe what needs to be sewn
- 📋 View all orders with statuses
- ❌ Cancel pending orders
- 🔔 Receive notifications when orders are confirmed or rejected
- ⏰ Get reminders 1 day before the appointment

### For Tailors (Masters):
- ✂️ Register with address, working hours, and working days
- 📅 View incoming orders with client details
- ✅ Confirm or ❌ reject orders with one tap
- 📅 Block specific dates (vacation, holidays)
- 👁 View and edit profile
- 🔄 Toggle active/inactive status (hide from clients)
- 🔔 Toggle notifications on/off

---

## 🛠 Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| [Node.js](https://nodejs.org/) | v18+ | JavaScript runtime |
| [Telegraf.js](https://telegraf.js.org/) | v4.16+ | Telegram Bot API framework |
| [Prisma](https://www.prisma.io/) | v6.9+ | Database ORM |
| [SQLite](https://www.sqlite.org/) | — | Lightweight file-based database |
| [node-cron](https://www.npmjs.com/package/node-cron) | v3.0+ | Scheduled reminder jobs |
| [dotenv](https://www.npmjs.com/package/dotenv) | v16.4+ | Environment variable management |

---

## 📁 Project Structure

```
Tikuvchilar_uz_bot/
├── prisma/
│   └── schema.prisma          # Database schema definition
├── src/
│   ├── bot.js                 # Main entry point — starts the bot
│   ├── database/
│   │   └── index.js           # All Prisma database queries
│   ├── locales/
│   │   ├── uz.js              # Uzbek translations
│   │   └── ru.js              # Russian translations
│   ├── middlewares/
│   │   └── auth.js            # Auth middleware — loads user + locale
│   ├── scenes/
│   │   ├── start.js           # Language & role selection, registration
│   │   ├── clientMenu.js      # Client main menu
│   │   ├── masterMenu.js      # Master main menu
│   │   ├── masterRegistration.js  # Master additional registration
│   │   ├── viewTailors.js     # Browse available tailors
│   │   ├── bookOrder.js       # Full booking flow (calendar → time → description)
│   │   ├── myOrders.js        # Client's order history
│   │   ├── masterOrders.js    # Master's order management (confirm/reject)
│   │   ├── blockedDates.js    # Manage blocked dates
│   │   ├── masterProfile.js   # Master profile view & status toggle
│   │   └── settings.js        # Change language, name, phone
│   └── utils/
│       ├── calendar.js        # Inline calendar keyboard generator
│       ├── timeSlots.js       # Time slot generator & keyboard
│       └── scheduler.js       # Daily reminder cron job
├── .env.example               # Environment variable template
├── .gitignore                 # Git ignore rules
├── package.json               # Dependencies and scripts
└── README.md                  # This file
```

---

## 📋 Prerequisites

Before you begin, make sure you have the following installed on your machine:

1. **Node.js v18 or higher**
   - Download from: https://nodejs.org/
   - Verify installation:
     ```bash
     node --version
     # Should output: v18.x.x or higher
     ```

2. **npm (comes with Node.js)**
   ```bash
   npm --version
   # Should output: 9.x.x or higher
   ```

3. **Git**
   ```bash
   git --version
   ```

4. **A Telegram account** to create and test the bot.

---

## Step 1 — Clone the Repository

```bash
git clone https://github.com/sanjar-31/Tikuvchilar_uz_bot.git
cd Tikuvchilar_uz_bot
```

If you already have the project locally, navigate to it:

```bash
cd path/to/Tikuvchilar_uz_bot
```

---

## Step 2 — Install Dependencies

Run the following command to install all required packages:

```bash
npm install
```

This will install:
- `telegraf` — Telegram Bot framework
- `@prisma/client` — Prisma ORM client
- `dotenv` — Environment variable loader
- `node-cron` — Task scheduler for reminders
- `prisma` (dev) — Database schema management
- `nodemon` (dev) — Auto-restart during development

Wait for the installation to complete. You should see a `node_modules/` folder created.

---

## Step 3 — Create a Telegram Bot

You need a bot token from Telegram's BotFather:

1. Open Telegram and search for **@BotFather**
2. Send the command: `/newbot`
3. Follow the prompts:
   - **Bot name:** `Tikuvchilar UZ Bot` (or any name you prefer)
   - **Bot username:** `tikuvchilar_uz_bot` (must be unique and end with `bot`)
4. BotFather will respond with your **bot token**. It looks like this:
   ```
   7123456789:AAHxyz1234567890abcdefghijklmnop
   ```
5. **Copy this token** — you'll need it in the next step.

### Optional: Configure Bot Settings in BotFather

Send these commands to @BotFather to configure your bot:

```
/setdescription
🧵 Tikuvchilar UZ Bot — tikuvchilar va mijozlar uchun qulay bot.
Tailors and clients booking platform.

/setabouttext
📅 Book appointments with tailors
🇺🇿 O'zbekcha / 🇷🇺 Русский

/setcommands
start - Botni boshlash / Запустить бота
help - Yordam / Помощь
```

---

## Step 4 — Configure Environment Variables

1. **Copy the example file:**

   On Windows (Command Prompt):
   ```cmd
   copy .env.example .env
   ```

   On Windows (PowerShell):
   ```powershell
   Copy-Item .env.example .env
   ```

   On macOS/Linux:
   ```bash
   cp .env.example .env
   ```

2. **Edit the `.env` file** with your text editor and fill in the values:

   ```env
   # Telegram Bot Token (from Step 3)
   BOT_TOKEN=7123456789:AAHxyz1234567890abcdefghijklmnop

   # Database URL (keep as-is for local development)
   DATABASE_URL="file:./dev.db"

   # Your Telegram ID (optional, for future admin features)
   # To find your ID, message @userinfobot on Telegram
   ADMIN_TELEGRAM_ID=123456789
   ```

   > ⚠️ **Important:** Never commit the `.env` file to Git. It's already in `.gitignore`.

---

## Step 5 — Set Up the Database

Prisma needs to generate the client code and create the SQLite database file.

### 5.1 — Generate Prisma Client

This reads `prisma/schema.prisma` and generates the TypeScript/JavaScript client:

```bash
npx prisma generate
```

Expected output:
```
✔ Generated Prisma Client to ./node_modules/@prisma/client
```

### 5.2 — Create the Database and Tables

This creates the `prisma/dev.db` SQLite file and all tables:

```bash
npx prisma db push
```

Expected output:
```
🚀 Your database is now in sync with your Prisma schema.
```

### 5.3 — Verify the Database (Optional)

You can open Prisma Studio to visually inspect the database:

```bash
npx prisma studio
```

This opens a web interface at `http://localhost:5555` where you can browse tables and data.

Press `Ctrl+C` to close Prisma Studio when done.

---

## Step 6 — Run Locally

### Development Mode (with auto-restart)

```bash
npm run dev
```

This uses `nodemon` to automatically restart the bot when you edit any file.

Expected output:
```
🧵 Starting Tikuvchilar UZ Bot...
[Scheduler] Daily reminder cron job started (runs at 20:00 every day).
✅ Bot is running! Press Ctrl+C to stop.
```

### Production Mode

```bash
npm start
```

This runs the bot directly with Node.js (no auto-restart).

### Stop the Bot

Press `Ctrl+C` in the terminal. The bot will gracefully shut down and close the database connection.

---

## Step 7 — Test the Bot

1. Open Telegram and search for your bot by its username (e.g., `@tikuvchilar_uz_bot`)
2. Press **Start** or send `/start`
3. You should see the language selection screen

### Testing the Client Flow:
1. Select a language → Choose "Client" role
2. Enter your name and phone number
3. You'll see the client main menu
4. Try "View tailors" (will be empty until a master registers)

### Testing the Master Flow:
1. Use a **different Telegram account** (or clear the database)
2. Send `/start` → Select language → Choose "Master" role
3. Enter name, phone, address, working hours, and working days
4. You'll see the master panel

### Testing Booking:
1. As a **client**, go to "View tailors" → select the registered master
2. Pick a date from the calendar → select a time slot
3. Type what you need sewn → order is created
4. The **master** will receive a notification with Confirm/Reject buttons
5. Master confirms → client receives a confirmation notification

### Reset for Testing

To start fresh, delete the database and recreate it:

```bash
# Delete the database file
del prisma\dev.db          # Windows CMD
# OR
Remove-Item prisma\dev.db  # PowerShell
# OR
rm prisma/dev.db           # macOS/Linux

# Recreate the database
npx prisma db push
```

---

## 🚀 Deploying to Railway

[Railway](https://railway.app/) is a cloud platform that makes it easy to deploy Node.js apps. Here's the full step-by-step process:

### Step 1 — Create a Railway Account

1. Go to [https://railway.app/](https://railway.app/)
2. Sign up with your **GitHub account** (recommended) or email
3. Verify your account if prompted

### Step 2 — Push Code to GitHub

Make sure your latest code is pushed to GitHub:

```bash
git add .
git commit -m "feat: complete Tikuvchilar UZ bot"
git push origin sanjar
```

> If you haven't set up the remote yet:
> ```bash
> git remote add origin https://github.com/sanjar-31/Tikuvchilar_uz_bot.git
> git push -u origin sanjar
> ```

### Step 3 — Create a New Project on Railway

1. Go to your [Railway Dashboard](https://railway.app/dashboard)
2. Click **"New Project"**
3. Select **"Deploy from GitHub Repo"**
4. If this is your first time, click **"Configure GitHub App"** and grant Railway access to your repositories
5. Find and select **`sanjar-31/Tikuvchilar_uz_bot`**
6. Select the **`sanjar`** branch (or `main` if you've merged)

### Step 4 — Configure Environment Variables on Railway

Railway needs the same environment variables as your local `.env` file:

1. In your Railway project, click on the deployed service
2. Go to the **"Variables"** tab
3. Add the following variables one by one:

   | Variable | Value |
   |---|---|
   | `BOT_TOKEN` | `7123456789:AAHxyz...` (your real bot token) |
   | `DATABASE_URL` | `file:./prisma/dev.db` |

   > ⚠️ **Note:** On Railway, the `DATABASE_URL` path should be `file:./prisma/dev.db` because the working directory is the project root, not the `prisma/` folder.

4. Click **"Add"** after entering each variable

### Step 5 — Configure Build & Start Commands

1. In your Railway service, go to the **"Settings"** tab
2. Under **"Build"**, set the **Build Command**:

   ```
   npm install && npx prisma generate && npx prisma db push
   ```

3. Under **"Deploy"**, set the **Start Command**:

   ```
   npm start
   ```

4. Under **"Deploy"**, make sure **"Restart on Deploy"** is enabled

### Step 6 — Deploy

1. Railway should automatically start the deployment after you configure it
2. Go to the **"Deployments"** tab to monitor progress
3. Click on the active deployment to see **build logs**

You should see output like:
```
Installing dependencies...
✔ Generated Prisma Client
🚀 Your database is now in sync with your Prisma schema.
🧵 Starting Tikuvchilar UZ Bot...
[Scheduler] Daily reminder cron job started (runs at 20:00 every day).
✅ Bot is running!
```

### Step 7 — Verify Deployment

1. Open Telegram and send `/start` to your bot
2. The bot should respond with the language selection screen
3. Test the full flow (registration, booking, etc.)

### Automatic Redeployment

Railway will automatically redeploy your bot every time you push to the configured branch:

```bash
git add .
git commit -m "fix: some improvement"
git push origin sanjar
```

Railway detects the push and rebuilds + restarts the bot automatically.

### Railway Troubleshooting

| Problem | Solution |
|---|---|
| Bot doesn't respond | Check the deployment logs for errors |
| "BOT_TOKEN is not set" | Make sure the variable is added in Railway settings |
| Database errors | Ensure `DATABASE_URL` is set correctly |
| Build fails | Check that `npm install` and `prisma generate` succeed in logs |
| Bot crashes and restarts | Railway auto-restarts crashed services; check logs for the error |

### Important Notes About Railway + SQLite

> ⚠️ **SQLite on Railway:** Railway uses ephemeral storage, meaning the SQLite database file will be lost on every redeploy. For a production bot with persistent data, consider:
>
> 1. **Use Railway's PostgreSQL add-on** (recommended for production):
>    - Click "New" → "Database" → "PostgreSQL" in your Railway project
>    - Copy the `DATABASE_URL` from the PostgreSQL service
>    - Update `prisma/schema.prisma`: change `provider = "sqlite"` to `provider = "postgresql"`
>    - Run `npx prisma generate` and `npx prisma db push` again
>
> 2. **Use a Railway Volume** (to persist SQLite):
>    - In your service settings, add a **Volume**
>    - Mount path: `/app/prisma`
>    - Update `DATABASE_URL` to `file:/app/prisma/dev.db`
>
> For development and testing, SQLite works fine as-is.

---

## 🤖 Bot Commands

| Command | Description |
|---|---|
| `/start` | Start the bot / restart from beginning |
| `/help` | Show help information |

All other interactions use **inline keyboard buttons** — no typing required for navigation.

---

## 👥 User Flows

### Client Flow
```
/start
  → 🌐 Select language (UZ / RU)
  → 👤 Select role: Client
  → 📝 Enter name
  → 📱 Enter phone
  → ✅ Registration complete
  → 🏠 Client Menu:
      ├── 👗 View Tailors → Select tailor → 📅 Calendar → 🕐 Time → 📝 Description → ✅ Order created
      ├── 📋 My Orders → View status / Cancel pending
      └── ⚙️ Settings → Change language / name / phone
```

### Master Flow
```
/start
  → 🌐 Select language (UZ / RU)
  → 👤 Select role: Master
  → 📝 Enter name
  → 📱 Enter phone
  → ✅ Basic registration
  → 📍 Enter address
  → 🕐 Enter work start time
  → 🕕 Enter work end time
  → 📅 Select working days
  → 🎉 Master registration complete
  → 🏠 Master Menu:
      ├── 📅 My Orders → View / Confirm / Reject
      ├── ➕ Blocked Dates → Add / Delete blocked dates
      ├── 👁 My Profile → View info / Toggle active status
      └── 🔔 Notifications → Toggle on/off
```

---

## 🗄 Database Schema

```
┌──────────────┐       ┌──────────────┐
│     User     │       │    Master    │
├──────────────┤       ├──────────────┤
│ id           │──1:1──│ id           │
│ telegramId   │       │ userId (FK)  │
│ fullName     │       │ address      │
│ phone        │       │ workingHours │
│ language     │       │ workingDays  │
│ role         │       │ isActive     │
│ createdAt    │       │ createdAt    │
└──────┬───────┘       └──────┬───────┘
       │                      │
       │ 1:N                  │ 1:N
       │                      │
┌──────▼───────┐       ┌──────▼───────┐
│    Order     │       │ BlockedDate  │
├──────────────┤       ├──────────────┤
│ id           │       │ id           │
│ clientId(FK) │       │ masterId(FK) │
│ masterId(FK) │       │ date         │
│ date         │       │ reason       │
│ time         │       └──────────────┘
│ description  │
│ status       │
│ createdAt    │
└──────────────┘
```

---

## 🔧 Troubleshooting

### "Cannot find module '@prisma/client'"
You need to generate the Prisma client:
```bash
npx prisma generate
```

### "The table `User` does not exist in the current database"
You need to push the schema to the database:
```bash
npx prisma db push
```

### "BOT_TOKEN is not set in .env file!"
Make sure you've created the `.env` file and added your bot token:
```bash
copy .env.example .env
# Then edit .env and add your token
```

### Bot doesn't respond to /start
1. Make sure the bot is running (`npm run dev`)
2. Check the terminal for error messages
3. Verify the bot token is correct
4. Make sure no other instance of the bot is running (only one instance can use the same token)

### "Error: 409: Conflict: terminated by other getUpdates request"
Another instance of the bot is running with the same token. Stop all other instances:
- Close other terminal windows running the bot
- If deployed on Railway, stop the deployment before testing locally

### Calendar shows no available days
Make sure the master has:
1. Set their working days during registration
2. Their profile is set to **Active** (not Inactive)
3. The dates are not in the past
4. The dates are not blocked

### Phone number validation fails
The bot accepts phone numbers in the format: `+998901234567` or `998901234567`
- Must contain only digits (and optional leading `+`)
- Must be between 9 and 15 digits long

---

## 📝 Available npm Scripts

| Script | Command | Description |
|---|---|---|
| `start` | `npm start` | Run bot in production mode |
| `dev` | `npm run dev` | Run bot with auto-restart (nodemon) |
| `db:generate` | `npm run db:generate` | Generate Prisma client |
| `db:push` | `npm run db:push` | Push schema to database |
| `db:studio` | `npm run db:studio` | Open Prisma Studio (visual DB editor) |

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Sanjar** — [@sanjar-31](https://github.com/sanjar-31)

---

> 🧵 Made with ❤️ for tailors and their clients in Uzbekistan
