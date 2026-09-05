bot.py telebot

# আপনার দেওয়া টেলিগ্রাম বট টোকেন
TOKEN = "8750150015:AAGGkj93aC-HvXCxWM9WzIaPTRFeexkmQ8c"
bot = telebot.TeleBot(TOKEN)

# পেমেন্ট এবং কন্টাক্ট ইনফরমেশন
BKASH_NUMBER = "01743815478"
NAGAD_NUMBER = "01743815478"

# নোটিফিকেশন পাঠানোর জন্য আপনার চ্যানেল বা গ্রুপের ইউজারনেম কিংবা চ্যাট আইডি এখানে দিন
# (যেমন: "@AppRewardZone" অথবা চ্যাট আইডি যেমন -100xxxxxxxxxx)
NOTIFICATION_CHANNEL = "@AppRewardZone"

# ইউজার ব্যালেন্স সংরক্ষণের জন্য (প্রাথমিক ডিকশনারি)
user_balances = {}

@bot.message_handler(commands=['start'])
def send_welcome(message):
    markup = telebot.types.ReplyKeyboardMarkup(resize_keyboard=True)
    markup.add("📦 Service List", "💰 My Balance")
    markup.add("➕ Add Fund", "🛒 Order Now")
    
    welcome_text = (
        "👋 Welcome to SMM Panel Bot\n\n"
        "📌 Facebook • Instagram • TikTok • YouTube • Telegram সার্ভিস\n"
        "⚡ Fast delivery • 🛒 Easy order\n\n"
        "নিচের মেনু থেকে বেছে নিন:"
    )
    bot.send_message(message.chat.id, welcome_text, reply_markup=markup)

@bot.message_handler(func=lambda message: True)
def handle_messages(message):
    user_id = message.from_user.id
    username = message.from_user.username or "Unknown"
    
    if user_id not in user_balances:
        user_balances[user_id] = 0.0

    if message.text == "💰 My Balance":
        balance = user_balances[user_id]
        bot.send_message(message.chat.id, f"🆔 Your ID: {user_id}\n💰 আপনার ব্যালেন্স: {balance}৳")
    
    elif message.text == "➕ Add Fund":
        fund_text = (
            "💳 Add Fund\n\n"
            f"📱 bKash (Personal): {BKASH_NUMBER}\n"
            f"📱 Nagad (Personal): {NAGAD_NUMBER}\n"
            "📌 Minimum: 20.0৳\n\n"
            "পেমেন্ট করার পর ট্রানজেকশন আইডি বা অ্যামাউন্ট পাঠান।"
        )
        bot.send_message(message.chat.id, fund_text)
        
    elif message.text == "📦 Service List":
        service_text = (
            "📘 Facebook সার্ভিস:\n"
            "• Facebook View: 1K = 5.0৳ (Min 500 | Max 5000000)\n"
            "• Facebook Followers: 1K = 120.0৳\n\n"
            "অর্ডার করতে চাইলে মেনু থেকে '🛒 Order Now' এ ক্লিক করুন।"
        )
        bot.send_message(message.chat.id, service_text)
        
    elif message.text == "🛒 Order Now":
        bot.send_message(message.chat.id, "দয়া করে আপনার প্রয়োজনীয় সার্ভিসের নাম এবং লিংক দিন।")
        
    # উদাহরণস্বরূপ: ইউজার কোনো ট্রানজেকশন আইডি বা পেমেন্ট ইনফো পাঠালে তা চ্যানেলে নোটিফিকেশন হিসেবে পাঠানোর লজিক
    elif "TRX" in message.text.upper() or "TrxID" in message.text:
        bot.send_message(message.chat.id, "✅ আপনার রিকোয়েস্ট গ্রহণ করা হয়েছে! এডমিন কনফার্ম করলে ব্যালেন্স যোগ হবে।")
        
        # নোটিফিকেশন চ্যালেনে মেসেজ পাঠানো
        alert_text = (
            f"🔔 নতুন পেমেন্ট রিকোয়েস্ট!\n\n"
            f"👤 ইউজার আইডি: {user_id}\n"
            f"🔗 ইউজারনেম: @{username}\n"
            f"💬 বিবরণ: {message.text}"
        )
        try:
            bot.send_message(NOTIFICATION_CHANNEL, alert_text)
        except Exception as e:
            print(f"Notification Error: {e}")

if __name__ == "__main__":
    bot.polling(none_stop=True)
