import os
import sqlite3
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, ReplyKeyboardMarkup, KeyboardButton
from telegram.ext import (
    ApplicationBuilder, CommandHandler, CallbackQueryHandler,
    MessageHandler, ContextTypes, filters
)

# =========================
# SETTINGS
# =========================
TOKEN = "8750150015:AAGGkj93aC-HvXCxWM9WzIaPTRFeexkmQ8c"
ADMIN_ID = 8049855208  # আপনার Telegram numeric ID

DB = "bot.db"

# =========================
# DATABASE
# =========================
def db():
    return sqlite3.connect(DB)

def setup():
    con = db()
    cur = con.cursor()

    cur.execute("""
    CREATE TABLE IF NOT EXISTS users (
        user_id INTEGER PRIMARY KEY,
        balance REAL DEFAULT 0
    )
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        task TEXT,
        status TEXT DEFAULT 'pending',
        reward REAL DEFAULT 0
    )
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS withdrawals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        amount REAL,
        method TEXT,
        number TEXT,
        status TEXT DEFAULT 'pending'
    )
    """)

    con.commit()
    con.close()

def add_user(user_id):
    con = db()
    cur = con.cursor()
    cur.execute(
        "INSERT OR IGNORE INTO users(user_id,balance) VALUES (?,0)",
        (user_id,)
    )
    con.commit()
    con.close()

# ইনবক্সের নিচে চিরস্থায়ী বা permanent কিবোর্ড তৈরি করার ফাংশন
def get_main_reply_keyboard():
    keyboard = [
        [KeyboardButton("📋 কাজ"), KeyboardButton("💰 ব্যালেন্স")],
        [KeyboardButton("💸 উইথড্র")]
    ]
    return ReplyKeyboardMarkup(keyboard, resize_keyboard=True)

# =========================
# START
# =========================
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = update.effective_user.id
    add_user(user_id)

    keyboard = [
        [
            InlineKeyboardButton("📋 কাজ", callback_data="tasks"),
            InlineKeyboardButton("💰 ব্যালেন্স", callback_data="balance")
        ],
        [
            InlineKeyboardButton("💸 উইথড্র", callback_data="withdraw")
        ]
    ]

    reply_markup_permanent = get_main_reply_keyboard()

    if update.message:
        await update.message.reply_text(
            "🤖 স্বাগতম!\n\n"
            "নিচের মেনু থেকে অপশন নির্বাচন করুন।",
            reply_markup=reply_markup_permanent
        )
        await update.message.reply_text(
            "বিকল্প মেন্যু:",
            reply_markup=InlineKeyboardMarkup(keyboard)
        )
    elif update.callback_query:
        query = update.callback_query
        await query.answer()
        await query.edit_message_text(
            "🤖 স্বাগতম!\n\n"
            "নিচের মেনু থেকে অপশন নির্বাচন করুন।",
            reply_markup=InlineKeyboardMarkup(keyboard)
        )

# =========================
# BUTTONS & REPLY KEYBOARD TEXT HANDLER
# =========================
async def handle_text_or_button(update: Update, context: ContextTypes.DEFAULT_TYPE):
    text = update.message.text
    user_id = update.effective_user.id
    add_user(user_id)

    if text == "📋 কাজ":
        keyboard = [
            [InlineKeyboardButton("📝 কাজ #1 — কাজ জমা দিন", callback_data="submit_task")],
            [InlineKeyboardButton("🔙 ফিরে যান", callback_data="home")]
        ]
        await update.message.reply_text(
            "📋 AVAILABLE TASKS\n\n"
            "📝 কাজ #1\n"
            "কাজটি সম্পন্ন করে প্রমাণ পাঠান।\n"
            "💰 Reward: 10 টাকা",
            reply_markup=InlineKeyboardMarkup(keyboard)
        )
    elif text == "💰 ব্যালেন্স":
        con = db()
        cur = con.cursor()
        cur.execute("SELECT balance FROM users WHERE user_id=?", (user_id,))
        row = cur.fetchone()
        con.close()
        balance = row[0] if row else 0
        await update.message.reply_text(f"💰 আপনার ব্যালেন্স: {balance:.2f} টাকা")
    elif text == "💸 উইথড্র":
        await update.message.reply_text(
            "💸 উইথড্র করতে এই ফরম্যাটে পাঠান:\n\n"
            "/withdraw 500 Nagad 01XXXXXXXXX"
        )
    else:
        await receive_task(update, context)

async def buttons(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()

    user_id = query.from_user.id
    add_user(user_id)

    if query.data == "tasks":
        keyboard = [
            [InlineKeyboardButton("📝 কাজ #1 — কাজ জমা দিন", callback_data="submit_task")],
            [InlineKeyboardButton("🔙 ফিরে যান", callback_data="home")]
        ]

        await query.edit_message_text(
            "📋 AVAILABLE TASKS\n\n"
            "📝 কাজ #1\n"
            "কাজটি সম্পন্ন করে প্রমাণ পাঠান।\n"
            "💰 Reward: 10 টাকা",
            reply_markup=InlineKeyboardMarkup(keyboard)
        )

    elif query.data == "balance":
        con = db()
        cur = con.cursor()
        cur.execute("SELECT balance FROM users WHERE user_id=?", (user_id,))
        row = cur.fetchone()
        con.close()

        balance = row[0] if row else 0

        await query.edit_message_text(f"💰 আপনার ব্যালেন্স: {balance:.2f} টাকা")

    elif query.data == "submit_task":
        await query.edit_message_text(
            "📝 কাজের প্রমাণ পাঠান।\n\n"
            "একটি ছবি বা লেখা পাঠালে সেটি Admin-এর কাছে যাবে।"
        )
        context.user_data["waiting_task"] = True

    elif query.data == "withdraw":
        await query.edit_message_text(
            "💸 উইথড্র করতে এই ফরম্যাটে পাঠান:\n\n"
            "/withdraw 500 Nagad 01XXXXXXXXX"
        )

    elif query.data == "home":
        keyboard = [
            [
                InlineKeyboardButton("📋 কাজ", callback_data="tasks"),
                InlineKeyboardButton("💰 ব্যালেন্স", callback_data="balance")
            ],
            [InlineKeyboardButton("💸 উইথড্র", callback_data="withdraw")]
        ]

        await query.edit_message_text(
            "🏠 Main Menu",
            reply_markup=InlineKeyboardMarkup(keyboard)
        )

# =========================
# TASK SUBMISSION
# =========================
async def receive_task(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not context.user_data.get("waiting_task"):
        if update.message.text in ["📋 কাজ", "💰 ব্যালেন্স", "💸 উইথড্র"]:
            return
        return

    user_id = update.effective_user.id

    if update.message.photo:
        proof = "Photo submitted"
    else:
        proof = update.message.text or "No text"

    con = db()
    cur = con.cursor()

    cur.execute(
        "INSERT INTO tasks(user_id,task,reward) VALUES (?,?,?)",
        (user_id, proof, 10)
    )

    task_id = cur.lastrowid

    con.commit()
    con.close()

    context.user_data["waiting_task"] = False

    await update.message.reply_text(
        "✅ আপনার কাজ জমা হয়েছে।\n"
        "Admin যাচাই করার পর reward যোগ হবে।",
        reply_markup=get_main_reply_keyboard()
    )

    try:
        await context.bot.send_message(
            ADMIN_ID,
            f"📥 নতুন কাজ জমা হয়েছে\n\n"
            f"User ID: {user_id}\n"
            f"Task ID: {task_id}\n"
            f"Reward: 10 টাকা\n\n"
            f"Approve: /approve_task {task_id}\n"
            f"Reject: /reject_task {task_id}"
        )
    except Exception:
        pass

# =========================
# APPROVE TASK
# =========================
async def approve_task(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if update.effective_user.id != ADMIN_ID:
        return

    if not context.args:
        await update.message.reply_text("Task ID দিন।")
        return

    task_id = int(context.args[0])

    con = db()
    cur = con.cursor()

    cur.execute("SELECT user_id,reward,status FROM tasks WHERE id=?", (task_id,))
    row = cur.fetchone()

    if not row:
        con.close()
        await update.message.reply_text("Task পাওয়া যায়নি।")
        return

    user_id, reward, status = row

    if status != "pending":
        con.close()
        await update.message.reply_text("এই Task আগে processed হয়েছে।")
        return

    cur.execute("UPDATE tasks SET status='approved' WHERE id=?", (task_id,))
    cur.execute("UPDATE users SET balance=balance+? WHERE user_id=?", (reward, user_id))

    con.commit()
    con.close()

    await update.message.reply_text(f"✅ Task #{task_id} approved.\n💰 {reward} টাকা balance-এ যোগ হয়েছে।")

    try:
        await context.bot.send_message(
            user_id,
            f"🎉 আপনার কাজ Approved!\n"
            f"💰 Reward: {reward} টাকা"
        )
    except Exception:
        pass

# =========================
# REJECT TASK
# =========================
async def reject_task(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if update.effective_user.id != ADMIN_ID:
        return

    if not context.args:
        await update.message.reply_text("Task ID দিন।")
        return

    task_id = int(context.args[0])

    con = db()
    cur = con.cursor()
    cur.execute("UPDATE tasks SET status='rejected' WHERE id=? AND status='pending'", (task_id,))
    con.commit()
    con.close()

    await update.message.reply_text(f"❌ Task #{task_id} rejected.")

# =========================
# WITHDRAW
# =========================
async def withdraw(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = update.effective_user.id

    if len(context.args) != 3:
        await update.message.reply_text(
            "সঠিক ফরম্যাট:\n"
            "/withdraw 500 Nagad 01XXXXXXXXX"
        )
        return

    try:
        amount = float(context.args[0])
    except ValueError:
        await update.message.reply_text("সঠিক amount দিন।")
        return

    method = context.args[1]
    number = context.args[2]

    con = db()
    cur = con.cursor()
    cur.execute("SELECT balance FROM users WHERE user_id=?", (user_id,))
    row = cur.fetchone()
    balance = row[0] if row else 0

    if amount <= 0 or amount > balance:
        con.close()
        await update.message.reply_text("❌ পর্যাপ্ত ব্যালেন্স নেই।")
        return

    cur.execute("INSERT INTO withdrawals(user_id,amount,method,number) VALUES (?,?,?,?)", (user_id, amount, method, number))
    wid = cur.lastrowid
    con.commit()
    con.close()

    await update.message.reply_text(
        f"✅ Withdrawal request #{wid} জমা হয়েছে।\n"
        f"💰 Amount: {amount} টাকা\n"
        f"📱 Method: {method}\n"
        f"📞 Number: {number}",
        reply_markup=get_main_reply_keyboard()
    )

    await context.bot.send_message(
        ADMIN_ID,
        f"💸 NEW WITHDRAWAL\n\n"
        f"Request: #{wid}\n"
        f"User: {user_id}\n"
        f"Amount: {amount} টাকা\n"
        f"Method: {method}\n"
        f"Number: {number}\n\n"
        f"Approve: /approve_withdraw {wid}\n"
        f"Reject: /reject_withdraw {wid}"
    )

# =========================
# APPROVE WITHDRAW
# =========================
async def approve_withdraw(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if update.effective_user.id != ADMIN_ID:
        return

    if not context.args:
        return

    wid = int(context.args[0])
    con = db()
    cur = con.cursor()
    cur.execute("SELECT user_id,amount,status FROM withdrawals WHERE id=?", (wid,))
    row = cur.fetchone()

    if not row:
        con.close()
        await update.message.reply_text("Request পাওয়া যায়নি।")
        return

    user_id, amount, status = row

    if status != "pending":
        con.close()
        await update.message.reply_text("Request already processed.")
        return

    cur.execute("SELECT balance FROM users WHERE user_id=?", (user_id,))
    balance = cur.fetchone()[0]

    if balance < amount:
        con.close()
        await update.message.reply_text("User-এর balance কম।")
        return

    cur.execute("UPDATE users SET balance=balance-? WHERE user_id=?", (amount, user_id))
    cur.execute("UPDATE withdrawals SET status='approved' WHERE id=?", (wid,))
    con.commit()
    con.close()

    await update.message.reply_text(f"✅ Withdrawal #{wid} approved.")
    await context.bot.send_message(user_id, f"✅ আপনার withdrawal approved হয়েছে।\n💰 Amount: {amount} টাকা")

# =========================
# REJECT WITHDRAW
# =========================
async def reject_withdraw(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if update.effective_user.id != ADMIN_ID:
        return

    if not context.args:
        return

    wid = int(context.args[0])
    con = db()
    cur = con.cursor()
    cur.execute("UPDATE withdrawals SET status='rejected' WHERE id=? AND status='pending'", (wid,))
    con.commit()
    con.close()

    await update.message.reply_text(f"❌ Withdrawal #{wid} rejected.")

# =========================
# RUN
# =========================
def main():
    setup()

    app = ApplicationBuilder().token(TOKEN).build()

    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("help", start))
    app.add_handler(CommandHandler("withdraw", withdraw))

    app.add_handler(CommandHandler("approve_task", approve_task))
    app.add_handler(CommandHandler("reject_task", reject_task))

    app.add_handler(CommandHandler("approve_withdraw", approve_withdraw))
    app.add_handler(CommandHandler("reject_withdraw", reject_withdraw))

    app.add_handler(CallbackQueryHandler(buttons))

    app.add_handler(
        MessageHandler(
            filters.TEXT & ~filters.COMMAND,
            handle_text_or_button
        )
    )
    app.add_handler(
        MessageHandler(
            filters.PHOTO,
            receive_task
        )
    )

    print("🤖 Bot running...")
    app.run_polling()

if __name__ == "__main__":
    main()
