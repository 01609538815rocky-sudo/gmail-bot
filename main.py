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
        balance REAL DEFAULT 0,
        language TEXT DEFAULT 'Bangla'
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
        "INSERT OR IGNORE INTO users(user_id, balance, language) VALUES (?, 0, 'Bangla')",
        (user_id,)
    )
    con.commit()
    con.close()

def get_main_reply_keyboard():
    keyboard = [
        [KeyboardButton("📋 কাজ"), KeyboardButton("💰 ব্যালেন্স")],
        [KeyboardButton("💸 উইথড্র"), KeyboardButton("🌐 ল্যাঙ্গুয়েজ চেঞ্জ")],
        [KeyboardButton("👨‍💻 এডমিন")]
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
            InlineKeyboardButton("💸 উইথড্র", callback_data="withdraw"),
            InlineKeyboardButton("🌐 ল্যাঙ্গুয়েজ", callback_data="language")
        ],
        [
            InlineKeyboardButton("👨‍💻 এডমিন যোগাযোগ", callback_data="admin_contact")
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
# HANDLERS
# =========================
async def handle_text_or_button(update: Update, context: ContextTypes.DEFAULT_TYPE):
    text = update.message.text
    user_id = update.effective_user.id
    add_user(user_id)

    if text == "📋 কাজ":
        keyboard = [
            [InlineKeyboardButton("📧 Gmail Sell (13৳)", callback_data="job_gmail")],
            [InlineKeyboardButton("📘 Facebook Quiz (3৳)", callback_data="job_fb")],
            [InlineKeyboardButton("📢 Job Post (5৳)", callback_data="job_post")],
            [InlineKeyboardButton("🔙 ফিরে যান", callback_data="home")]
        ]
        await update.message.reply_text(
            "📁 **কাজের ক্যাটাগরি ও রেট তালিকা**\n\nনিচের তালিকা থেকে আপনার পছন্দের কাজটি সিলেক্ট করুন:",
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
        keyboard = [
            [InlineKeyboardButton("💳 বিকাশ (Bkash)", callback_data="wd_Bkash")],
            [InlineKeyboardButton("💵 নগদ (Nagad)", callback_data="wd_Nagad")],
            [InlineKeyboardButton("🚀 রকেট (Rocket)", callback_data="wd_Rocket")],
            [InlineKeyboardButton("🔙 ফিরে যান", callback_data="home")]
        ]
        await update.message.reply_text(
            "💸 **উইথড্র পদ্ধতি নির্বাচন করুন:**\n\n"
            "⚠️ সর্বনিম্ন উইথড্র: **৫০ টাকা**\n\n"
            "সরাসরি কম্যান্ড ব্যবহার করতে পারেন:\n"
            "`/withdraw টাকার_পরিমাণ পদ্ধতি নম্বর`\n"
            "(যেমন: `/withdraw 50 Bkash 01XXXXXXXXX`)",
            reply_markup=InlineKeyboardMarkup(keyboard),
            parse_mode="Markdown"
        )
    elif text == "🌐 ল্যাঙ্গুয়েজ চেঞ্জ":
        keyboard = [
            [InlineKeyboardButton("🇧🇩 বাংলা (Bangla)", callback_data="lang_bn")],
            [InlineKeyboardButton("🇺🇸 ইংরেজি (English)", callback_data="lang_en")],
            [InlineKeyboardButton("🔙 ফিরে যান", callback_data="home")]
        ]
        await update.message.reply_text(
            "🌐 ভাষা পরিবর্তন করুন / Change Language:",
            reply_markup=InlineKeyboardMarkup(keyboard)
        )
    elif text == "👨‍💻 এডমিন":
        await update.message.reply_text(
            "👨‍💻 **এডমিন প্যানেল / যোগাযোগ তথ্য**\n\n"
            "যেকোনো প্রয়োজনে বা সমস্যায় সরাসরি এডমিনের সাথে যোগাযোগ করুন:\n"
            "👉 Telegram Admin: @YourAdminUsername"
        )
    else:
        if context.user_data.get("waiting_withdraw"):
            await process_inline_withdraw(update, context)
        else:
            await receive_task(update, context)

async def buttons(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()

    user_id = query.from_user.id
    add_user(user_id)

    if query.data == "tasks":
        keyboard = [
            [InlineKeyboardButton("📧 Gmail Sell (13৳)", callback_data="job_gmail")],
            [InlineKeyboardButton("📘 Facebook Quiz (3৳)", callback_data="job_fb")],
            [InlineKeyboardButton("📢 Job Post (5৳)", callback_data="job_post")],
            [InlineKeyboardButton("🔙 ফিরে যান", callback_data="home")]
        ]
        await query.edit_message_text(
            "📁 **কাজের ক্যাটাগরি ও রেট তালিকা**\n\nনিচের তালিকা থেকে আপনার পছন্দের কাজটি সিলেক্ট করুন:",
            reply_markup=InlineKeyboardMarkup(keyboard)
        )

    elif query.data.startswith("job_"):
        job_key = query.data.replace("job_", "")
        if job_key == "gmail":
            job_type = "Gmail Sell"
            reward = 13.0
        elif job_key == "fb":
            job_type = "Facebook Quiz"
            reward = 3.0
        elif job_key == "post":
            job_type = "Job Post"
            reward = 5.0
        else:
            job_type = "General Task"
            reward = 10.0

        context.user_data["waiting_task"] = True
        context.user_data["current_job"] = job_type
        context.user_data["current_reward"] = reward
        
        keyboard = [[InlineKeyboardButton("🔙 পেছনে যান", callback_data="tasks"), InlineKeyboardButton("❌ ক্যানসেল", callback_data="home")]]
        
        await query.edit_message_text(
            f"📁 নির্বাচিত কাজ: **{job_type}**\n"
            f"💰 রিওয়ার্ড: **{reward} টাকা**\n\n"
            f"দয়া করে এই কাজের প্রমাণ (স্ক্রিনশট বা তথ্য) এখানে পাঠান:",
            reply_markup=InlineKeyboardMarkup(keyboard),
            parse_mode="Markdown"
        )

    elif query.data == "balance":
        con = db()
        cur = con.cursor()
        cur.execute("SELECT balance FROM users WHERE user_id=?", (user_id,))
        row = cur.fetchone()
        con.close()
        balance = row[0] if row else 0
        await query.edit_message_text(f"💰 আপনার ব্যালেন্স: {balance:.2f} টাকা")

    elif query.data == "withdraw":
        keyboard = [
            [InlineKeyboardButton("💳 বিকাশ (Bkash)", callback_data="wd_Bkash")],
            [InlineKeyboardButton("💵 নগদ (Nagad)", callback_data="wd_Nagad")],
            [InlineKeyboardButton("🚀 রকেট (Rocket)", callback_data="wd_Rocket")],
            [InlineKeyboardButton("🔙 ফিরে যান", callback_data="home")]
        ]
        await query.edit_message_text(
            "💸 **উইথড্র পদ্ধতি নির্বাচন করুন:**\n\n"
            "⚠️ সর্বনিম্ন উইথড্র: **৫০ টাকা**\n\n"
            "সরাসরি কম্যান্ড ব্যবহার করতে পারেন:\n"
            "`/withdraw টাকার_পরিমাণ পদ্ধতি নম্বর`\n"
            "(যেমন: `/withdraw 50 Bkash 01XXXXXXXXX`)",
            reply_markup=InlineKeyboardMarkup(keyboard),
            parse_mode="Markdown"
        )

    elif query.data.startswith("wd_"):
        method = query.data.replace("wd_", "")
        context.user_data["waiting_withdraw"] = True
        context.user_data["wd_method"] = method

        keyboard = [[InlineKeyboardButton("❌ ক্যানসেল", callback_data="home")]]
        await query.edit_message_text(
            f"💳 নির্বাচিত পদ্ধতি: **{method}**\n\n"
            "⚠️ সর্বনিম্ন উইথড্র: **৫০ টাকা**\n\n"
            "দয়া করে আপনার **টাকার পরিমাণ এবং অ্যাকাউন্ট নম্বর** একসাথে লিখে পাঠান。\n"
            "উদাহরণ: `50 01700000000`",
            reply_markup=InlineKeyboardMarkup(keyboard),
            parse_mode="Markdown"
        )

    elif query.data == "language":
        keyboard = [
            [InlineKeyboardButton("🇧🇩 বাংলা (Bangla)", callback_data="lang_bn")],
            [InlineKeyboardButton("🇺🇸 ইংরেজি (English)", callback_data="lang_en")],
            [InlineKeyboardButton("🔙 ফিরে যান", callback_data="home")]
        ]
        await query.edit_message_text(
            "🌐 ভাষা পরিবর্তন করুন / Change Language:",
            reply_markup=InlineKeyboardMarkup(keyboard)
        )

    elif query.data == "lang_bn":
        await query.edit_message_text("✅ ভাষা সফলভাবে বাংলায় পরিবর্তন করা হয়েছে।")

    elif query.data == "lang_en":
        await query.edit_message_text("✅ Language successfully changed to English.")

    elif query.data == "admin_contact":
        await query.edit_message_text(
            "👨‍💻 **এডমিন যোগাযোগ তথ্য**\n\n"
            "যেকোনো প্রয়োজনে সরাসরি যোগাযোগ করুন: @YourAdminUsername"
        )

    elif query.data == "home":
        context.user_data["waiting_withdraw"] = False
        context.user_data["waiting_task"] = False
        keyboard = [
            [
                InlineKeyboardButton("📋 কাজ", callback_data="tasks"),
                InlineKeyboardButton("💰 ব্যালেন্স", callback_data="balance")
            ],
            [
                InlineKeyboardButton("💸 উইথড্র", callback_data="withdraw"),
                InlineKeyboardButton("🌐 ল্যাঙ্গুয়েজ", callback_data="language")
            ],
            [
                InlineKeyboardButton("👨‍💻 এডমিন", callback_data="admin_contact")
            ]
        ]

        await query.edit_message_text(
            "🏠 Main Menu",
            reply_markup=InlineKeyboardMarkup(keyboard)
        )

# =========================
# TASK & WITHDRAW PROCESSING
# =========================
async def receive_task(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not context.user_data.get("waiting_task"):
        return

    user_id = update.effective_user.id
    job_type = context.user_data.get("current_job", "TASK")
    reward = context.user_data.get("current_reward", 10.0)

    if update.message.photo:
        proof = "Photo submitted"
    else:
        proof = update.message.text or "No text"

    con = db()
    cur = con.cursor()
    cur.execute(
        "INSERT INTO tasks(user_id,task,reward) VALUES (?,?,?)",
        (user_id, f"[{job_type}] {proof}", reward)
    )
    task_id = cur.lastrowid
    con.commit()
    con.close()

    context.user_data["waiting_task"] = False

    await update.message.reply_text(
        f"✅ আপনার কাজ জমা হয়েছে।\n"
        f"Admin যাচাই করার পর {reward} টাকা reward যোগ হবে।",
        reply_markup=get_main_reply_keyboard()
    )

    try:
        await context.bot.send_message(
            ADMIN_ID,
            f"📥 নতুন কাজ জমা হয়েছে ({job_type})\n\n"
            f"User ID: {user_id}\n"
            f"Task ID: {task_id}\n"
            f"Reward: {reward} টাকা\n\n"
            f"Approve: /approve_task {task_id}\n"
            f"Reject: /reject_task {task_id}"
        )
    except Exception:
        pass

async def process_inline_withdraw(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = update.effective_user.id
    method = context.user_data.get("wd_method")
    text = update.message.text.strip()
    parts = text.split()

    if len(parts) < 2:
        await update.message.reply_text("সঠিক ফরম্যাটে পরিমাণ এবং নম্বর দিন। উদাহরণ: `50 01700000000`", parse_mode="Markdown")
        return

    try:
        amount = float(parts[0])
    except ValueError:
        await update.message.reply_text("সঠিক টাকার পরিমাণ দিন।")
        return

    number = parts[1]
    context.user_data["waiting_withdraw"] = False

    con = db()
    cur = con.cursor()
    cur.execute("SELECT balance FROM users WHERE user_id=?", (user_id,))
    row = cur.fetchone()
    balance = row[0] if row else 0

    if amount < 50:
        con.close()
        await update.message.reply_text("❌ সর্বনিম্ন উইথড্র পরিমাণ ৫০ টাকা।")
        return

    if amount > balance:
        con.close()
        await update.message.reply_text("❌ পর্যাপ্ত ব্যালেন্স নেই।")
        return

    cur.execute("INSERT INTO withdrawals(user_id,amount,method,number) VALUES (?,?,?,?)", (user_id, amount, method, number))
    wid = cur.lastrowid
    con.commit()
    con.close()

    await update.message.reply_text(
        f"✅ উইথড্র রিকোয়েস্ট #{wid} সফলভাবে জমা হয়েছে!\n"
        f"💰 পরিমাণ: {amount} টাকা\n"
        f"💳 মাধ্যম: {method}\n"
        f"📞 নম্বর: {number}",
        reply_markup=get_main_reply_keyboard()
    )

    try:
        await context.bot.send_message(
            ADMIN_ID,
            f"💸 নতুন উইথড্র রিকোয়েস্ট\n\n"
            f"Request ID: #{wid}\n"
            f"User ID: {user_id}\n"
            f"Amount: {amount} টাকা\n"
            f"Method: {method}\n"
            f"Number: {number}\n\n"
            f"Approve: /approve_withdraw {wid}\n"
            f"Reject: /reject_withdraw {wid}"
        )
    except Exception:
        pass

# =========================
# ADMIN COMMANDS
# =========================
async def withdraw_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = update.effective_user.id
    if len(context.args) != 3:
        await update.message.reply_text(
            "সঠিক ফরম্যাট:\n"
            "/withdraw 50 Bkash 01XXXXXXXXX"
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

    if amount < 50:
        con.close()
        await update.message.reply_text("❌ সর্বনিম্ন উইথড্র পরিমাণ ৫০ টাকা।")
        return

    if amount > balance:
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
        await context.bot.send_message(user_id, f"🎉 আপনার কাজ Approved!\n💰 Reward: {reward} টাকা")
    except Exception:
        pass

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
    setup()import os
from telegram import Update, ReplyKeyboardMarkup, KeyboardButton
from telegram.ext import ApplicationBuilder, CommandHandler, MessageHandler, ContextTypes, filters

TOKEN = "8750150015:AAGGkj93aC-HvXCxWM9WzIaPTRFeexkmQ8c"
ADMIN_ID = 8049855208

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("🤖 বট সফলভাবে চালু হয়েছে!")

def main():
    app = ApplicationBuilder().token(TOKEN).build()
    app.add_handler(CommandHandler("start", start))
    print("🤖 Bot running...")
    app.run_polling()

if __name__ == "__main__":
    main()
    
    app = ApplicationBuilder().token(TOKEN).build()

    app.add_handler(CommandHandle
