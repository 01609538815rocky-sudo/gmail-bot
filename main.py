import os
import telebot
from telebot import types
from flask import Flask, request

# বটের টোকেন এবং এডমিন আইডি
TOKEN = "8750150015:AAGGkj93aC-HvXCXwM9WzIaP"
ADMIN_ID = 123456789  # আপনার আসল টেলিগ্রাম আইডি এখানে দিন

bot = telebot.TeleBot(TOKEN)
app = Flask(__name__)

user_balances = {}

# ইনবক্সের নিচে সব সময় দৃশ্যমান মূল মেনু কিবোর্ড
def get_main_keyboard():
    markup = types.ReplyKeyboardMarkup(resize_keyboard=True, row_width=2)
    btn1 = types.KeyboardButton("📁 Available Tasks")
    btn2 = types.KeyboardButton("📦 My Tasks")
    btn3 = types.KeyboardButton("💰 My Earnings")
    btn4 = types.KeyboardButton("💸 Withdraw")
    btn5 = types.KeyboardButton("💬 Support")
    markup.add(btn1, btn2, btn3, btn4, btn5)
    return markup

@bot.message_handler(commands=['start'])
def send_welcome(message):
    user_id = message.from_user.id
    if user_id not in user_balances:
        user_balances[user_id] = 0

    welcome_text = (
        "🏠 *Main Menu*\n\n"
        "Welcome to Gmail Cash BD Bot!\n\n"
        f"💰 Balance: ৳{user_balances[user_id]}\n"
        "✅ Available Tasks: 5\n"
        "✅ Completed: 0"
    )
    bot.send_message(message.chat.id, welcome_text, parse_mode="Markdown", reply_markup=get_main_keyboard())

@bot.message_handler(func=lambda message: True)
def handle_menu(message):
    text = message.text
    chat_id = message.chat.id

    if text == "📁 Available Tasks":
        markup = types.InlineKeyboardMarkup()
        markup.add(types.InlineKeyboardButton("📌 Task ID: #501 (Click to Submit)", callback_data="start_task_501"))
        markup.add(types.InlineKeyboardButton("🔙 Main Menu", callback_data="back_to_home"))
        bot.send_message(chat_id, "📁 *Available Tasks*\n\nClick on the task below to submit your proof:", parse_mode="Markdown", reply_markup=markup)

    elif text == "📦 My Tasks":
        markup = types.InlineKeyboardMarkup()
        markup.add(types.InlineKeyboardButton("🔙 Main Menu", callback_data="back_to_home"))
        bot.send_message(chat_id, "📦 *My Tasks*\n\nYou have no active or pending tasks right now.", parse_mode="Markdown", reply_markup=markup)

    elif text == "💰 My Earnings":
        user_id = message.from_user.id
        bal = user_balances.get(user_id, 0)
        markup = types.InlineKeyboardMarkup()
        markup.add(types.InlineKeyboardButton("🔙 Main Menu", callback_data="back_to_home"))
        bot.send_message(chat_id, f"💰 *My Earnings*\n\nTotal Balance: ৳{bal}", parse_mode="Markdown", reply_markup=markup)

    elif text == "💸 Withdraw":
        user_id = message.from_user.id
        bal = user_balances.get(user_id, 0)
        markup = types.InlineKeyboardMarkup()
        markup.add(types.InlineKeyboardButton("💳 Withdraw via Nagad/Bkash", callback_data="withdraw_req"))
        markup.add(types.InlineKeyboardButton("🔙 Main Menu", callback_data="back_to_home"))
        bot.send_message(chat_id, f"💸 *WITHDRAW*\n\nAvailable Balance: ৳{bal}\nMethod: Nagad/Bkash", parse_mode="Markdown", reply_markup=markup)

    elif text == "💬 Support":
        markup = types.InlineKeyboardMarkup()
        markup.add(types.InlineKeyboardButton("🔙 Main Menu", callback_data="back_to_home"))
        bot.send_message(chat_id, "💬 *Support*\n\nFor any help, contact administration.", parse_mode="Markdown", reply_markup=markup)
    
    else:
        bot.send_message(chat_id, "দয়া করে নিচের মেনু বাটনগুলো ব্যবহার করুন।", reply_markup=get_main_keyboard())

@bot.callback_query_handler(func=lambda call: True)
def callback_handler(call):
    chat_id = call.message.chat.id
    user_id = call.from_user.id

    if call.data == "back_to_home":
        bot.delete_message(chat_id, call.message.message_id)
        user_balances.setdefault(user_id, 0)
        welcome_text = (
            "🏠 *Main Menu*\n\n"
            "Welcome back to Gmail Cash BD Bot!\n\n"
            f"💰 Balance: ৳{user_balances[user_id]}\n"
            "✅ Available Tasks: 5\n"
            "✅ Completed: 0"
        )
        bot.send_message(chat_id, welcome_text, parse_mode="Markdown", reply_markup=get_main_keyboard())

    elif call.data == "start_task_501":
        bot.answer_callback_query(call.id)
        msg = bot.send_message(chat_id, "📤 আপনার জিমেইল বা কাজের প্রুফ (স্ক্রিনশট/টেক্সট) এখানে চ্যাটে পাঠান:")
        bot.register_next_step_handler(msg, process_task_submission)

    elif call.data.startswith("approve_"):
        target_user = int(call.data.split("_")[1])
        if user_id == ADMIN_ID:
            user_balances[target_user] = user_balances.get(target_user, 0) + 30
            bot.edit_message_text(chat_id=chat_id, message_id=call.message.message_id, text=call.message.text + "\n\n✅ *Approved by Admin!* (৳30 added)")
            bot.send_message(target_user, "✅ Task Approved! এডমিন আপনার কাজটি এপ্রুভ করেছেন এবং ব্যালেন্সে ৳30 যোগ হয়েছে।")
        else:
            bot.answer_callback_query(call.id, "You are not authorized!", show_alert=True)

    elif call.data.startswith("reject_"):
        target_user = int(call.data.split("_")[1])
        if user_id == ADMIN_ID:
            bot.edit_message_text(chat_id=chat_id, message_id=call.message.message_id, text=call.message.text + "\n\n❌ *Rejected by Admin!*")
            bot.send_message(target_user, "❌ Task Rejected. আপনার কাজের প্রুফ সঠিক নয়।")
        else:
            bot.answer_callback_query(call.id, "You are not authorized!", show_alert=True)

    elif call.data == "withdraw_req":
        bot.answer_callback_query(call.id)
        bot.send_message(chat_id, "✅ Withdrawal Request Sent! Status: 🟡 Pending (এডমিন চেক করে পেমেন্ট পাঠিয়ে দেবেন)")

def process_task_submission(message):
    user_id = message.from_user.id
    username = message.from_user.username or "No Username"
    proof_text = message.text

    bot.send_message(message.chat.id, "✅ আপনার কাজের প্রুফ সফলভাবে জমা হয়েছে! এডমিন রিভিউ করছেন।", reply_markup=get_main_keyboard())

    admin_markup = types.InlineKeyboardMarkup()
    admin_markup.add(
        types.InlineKeyboardButton("✅ Approve (৳30)", callback_data=f"approve_{user_id}"),
        types.InlineKeyboardButton("❌ Reject", callback_data=f"reject_{user_id}")
    )
    
    admin_msg = (
        f"🔔 *New Task Proof Submitted!*\n\n"
        f"👤 User: @{username} (ID: `{user_id}`)\n"
        f"📄 Proof:\n{proof_text}"
    )
    bot.send_message(ADMIN_ID, admin_msg, parse_mode="Markdown", reply_markup=admin_markup)

@app.route('/')
def home():
    return "Bot is running!"

if __name__ == '__main__':
    import threading
    # ব্যাকগ্রাউন্ডে টেলিগ্রাম পোলিং রান করা
    threading.Thread(target=bot.infinity_polling, daemon=True).start()
    # রেন্ডার পোর্টের জন্য ফ্লাস্ক সার্ভার চালু করা
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
    

