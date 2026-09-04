import telebot
from telebot.types import InlineKeyboardMarkup, InlineKeyboardButton

# আপনার দেওয়া বটের টোকেন এখানে সেট করা হলো
TOKEN = "8750150015:AAGGkj93aC-HvXCxWM9WzIaPTRFeexkmQ8c"
bot = telebot.TeleBot(TOKEN)

# ডেমো ইউজার ডেটা
user_data = {
    "balance": 0,
    "total_earned": 0,
    "total_withdrawn": 0
}

# ১. /start কমান্ড এবং হোম পেজ
@bot.message_handler(commands=['start'])
def send_welcome(message):
    markup = InlineKeyboardMarkup()
    markup.row_width = 1
    markup.add(
        InlineKeyboardButton("📂 Available Tasks", callback_data="available_tasks"),
        InlineKeyboardButton("📦 My Tasks", callback_data="my_tasks"),
        InlineKeyboardButton("💰 My Earnings", callback_data="my_earnings"),
        InlineKeyboardButton("💸 Withdraw", callback_data="withdraw"),
        InlineKeyboardButton("💬 Support", callback_data="support")
    )
    
    welcome_text = (
        "Welcome to Gmail Cash BD Bot!\n"
        "🏠 Main Menu\n\n"
        f"Balance: ৳{user_data['balance']}\n"
        "✅ Available Tasks: 5\n"
        "✅ Completed: 0"
    )
    bot.send_message(message.chat.id, welcome_text, reply_markup=markup)

# ২. সকল বাটন ক্লিক হ্যান্ডলার
@bot.callback_query_handler(func=lambda call: True)
def callback_query(call):
    if call.data == "available_tasks":
        markup = InlineKeyboardMarkup()
        markup.add(InlineKeyboardButton("👁️ View Task", callback_data="view_task_gmail"))
        
        text = (
            "📄 AVAILABLE TASKS\n\n"
            "#501\n"
            "📧 Gmail Account Sell\n"
            "Reward: ৳30\n"
            "Deadline: 12 Hours"
        )
        bot.edit_message_text(text, call.message.chat.id, call.message.message_id, reply_markup=markup)

    elif call.data == "view_task_gmail":
        markup = InlineKeyboardMarkup()
        markup.row(
            InlineKeyboardButton("✅ Accept Task", callback_data="accept_task"),
            InlineKeyboardButton("⬅️ Back", callback_data="available_tasks")
        )
        text = (
            "📝 TASK #501\n"
            "📧 Gmail Account Sell\n\n"
            "📌 কাজের নির্দেশিকা:\n"
            "১. নতুন জিমেইল খুলুন বা রিকভারি দিন।\n"
            "২. ইউজার আইডি ও পাসওয়ার্ড সাবমিট করুন।"
        )
        bot.edit_message_text(text, call.message.chat.id, call.message.message_id, reply_markup=markup)

    elif call.data == "accept_task":
        markup = InlineKeyboardMarkup()
        markup.add(InlineKeyboardButton("📤 Submit Work", callback_data="submit_work"))
        text = (
            "✅ TASK ACCEPTED\n\n"
            "Task ID: #501\n"
            "Status: 🟡 In Progress"
        )
        bot.edit_message_text(text, call.message.chat.id, call.message.message_id, reply_markup=markup)

    elif call.data == "submit_work":
        bot.send_message(call.message.chat.id, "✅ আপনার জিমেইল তথ্য সফলভাবে সাবমিট হয়েছে! অ্যাডমিন রিভিউ করছেন।")
        
        # অ্যাডমিনের জন্য রিভিউ প্যানেল ফ্লো (ডেমো আকারে অটো এপ্রুভ অপشن সহ)
        admin_markup = InlineKeyboardMarkup()
        admin_markup.row(
            InlineKeyboardButton("✅ APPROVE", callback_data="admin_approve"),
            InlineKeyboardButton("❌ REJECT", callback_data="admin_reject")
        )
        admin_text = (
            "🔔 TASK REVIEW\n\n"
            "Task: #501 (Gmail Sell)\n"
            "Worker: @User\n"
            "Submission: Gmail & Password\n"
            "Status: 🟡 Pending"
        )
        bot.send_message(call.message.chat.id, admin_text, reply_markup=admin_markup)

    elif call.data == "my_earnings":
        markup = InlineKeyboardMarkup()
        markup.row(
            InlineKeyboardButton("💸 Withdraw", callback_data="withdraw"),
            InlineKeyboardButton("📜 History", callback_data="history")
        )
        text = (
            "💰 MY EARNINGS\n\n"
            f"Available Balance: ৳{user_data['balance']}\n"
            f"Total Earned: ৳{user_data['total_earned']}\n"
            f"Total Withdrawn: ৳{user_data['total_withdrawn']}"
        )
        bot.edit_message_text(text, call.message.chat.id, call.message.message_id, reply_markup=markup)

    elif call.data == "withdraw":
        markup = InlineKeyboardMarkup()
        markup.add(InlineKeyboardButton("✅ Submit Withdrawal", callback_data="confirm_withdraw"))
        text = (
            "💸 WITHDRAW\n\n"
            f"Available: ৳{user_data['balance']}\n\n"
            "Method: Nagad\n"
            "Account: **********"
        )
        bot.edit_message_text(text, call.message.chat.id, call.message.message_id, reply_markup=markup)

    elif call.data == "confirm_withdraw":
        bot.send_message(call.message.chat.id, "✅ Withdrawal Request Sent! Status: 🟡 Pending (অ্যাডমিন চেক করে পেমেন্ট পাঠিয়ে দেবেন)")

    elif call.data == "admin_approve":
        user_data['balance'] += 30
        user_data['total_earned'] += 30
        bot.edit_message_text("✅ Task Approved! ইউজারের ব্যালেন্সে ৳30 যোগ করা হয়েছে।", call.message.chat.id, call.message.message_id)

    elif call.data == "admin_reject":
        bot.edit_message_text("❌ Task Rejected. Reason: জিমেইল তথ্য সঠিক নয়।", call.message.chat.id, call.message.message_id)

    elif call.data == "my_tasks":
        bot.answer_callback_query(call.id, "আপনার কোনো রানিং টাস্ক নেই।")

    elif call.data == "support":
        bot.answer_callback_query(call.id, "সাপোর্টের জন্য যোগাযোগ করুন: @Admin")

    elif call.data == "history":
        bot.answer_callback_query(call.id, "কোনো হিস্টরি পাওয়া যায়নি।")

# বট রান করার কমান্ড
if __name__ == '__main__':
    print("Gmail Cash BD Bot is running smoothly...")
    bot.polling(none_stop=True)
