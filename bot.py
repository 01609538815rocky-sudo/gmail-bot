import os
import telebot

TOKEN = "8948563757:AAHvkFlRIWd0BSfYCz6BVNHeNnONWJmjJbU"
bot = telebot.TeleBot(TOKEN)
NOTIFICATION_CHANNEL = "@AppRewardZone"

user_data = {}

@bot.message_handler(commands=['start'])
def send_welcome(message):
    user_id = message.from_user.id
    if user_id not in user_data:
        user_data[user_id] = {
            "income": 0.0,
            "pending": 0,
            "completed": 0,
            "rejected": 0
        }
    
    markup = telebot.types.ReplyKeyboardMarkup(resize_keyboard=True)
    markup.add("💎 My Balance", "📋 Do Task")
    markup.add("💰 Withdraw", "📞 Support")
    
    welcome_text = (
        "👋 স্বাগতম! Instant Task Pay বটে আপনাকে স্বাগতম。\n\n"
        "নিচের মেনু থেকে কাজ শুরু করুন বা আপনার ব্যালেন্স চেক করুন:"
    )
    bot.send_message(message.chat.id, welcome_text, reply_markup=markup)

@bot.message_handler(func=lambda message: True)
def handle_messages(message):
    user_id = message.from_user.id
    first_name = message.from_user.first_name or ""
    last_name = message.from_user.last_name or ""
    
    if user_id not in user_data:
        user_data[user_id] = {
            "income": 0.0,
            "pending": 0,
            "completed": 0,
            "rejected": 0
        }

    if message.text == "💎 My Balance":
        data = user_data[user_id]
        balance_text = (
            f"💎 My Balance\n\n"
            f"👤 User Dashboard & Balance Status:\n\n"
            f"💰 Income Balance: ৳{data['income']:.2f}\n"
            f"⏳ Pending Tasks: {data['pending']}\n"
            f"✅ Completed Tasks: {data['completed']}\n"
            f"❌ Rejected Tasks: {data['rejected']}"
        )
        bot.send_message(message.chat.id, balance_text)
        
    elif message.text == "📋 Do Task":
        bot.send_message(message.chat.id, "দয়া করে আপনার জিমেইল এবং পাসওয়ার্ড এই ফরম্যাটে দিন:\nGmail: yourmail@gmail.com\nPassword: yourpassword")
        
    elif "Gmail:" in message.text or "@gmail.com" in message.text:
        user_data[user_id]["pending"] += 1
        
        bot.send_message(message.chat.id, "⏳ আপনার কাজটি পেন্ডিং লিস্টে রয়েছে। এডমিন যাচাই করে দ্রুত আপনার ব্যালেন্স পেমেন্ট যুক্ত করে দেবেন।")
        
        markup = telebot.types.InlineKeyboardMarkup()
        approve_btn = telebot.types.InlineKeyboardButton("✅ Approve (+৳13)", callback_data=f"approve_{user_id}")
        reject_btn = telebot.types.InlineKeyboardButton("❌ Reject", callback_data=f"reject_{user_id}")
        markup.add(approve_btn, reject_btn)
        
        admin_text = (
            f"📬 【নতুন টাস্ক সাবমিশন】\n\n"
            f"👤 User ID: {user_id}\n"
            f"🔹 First Name: {first_name}\n"
            f"🔹 Last Name: {last_name}\n"
            f"💬 বিবরণ: {message.text}"
        )
        try:
            bot.send_message(NOTIFICATION_CHANNEL, admin_text, reply_markup=markup)
        except Exception as e:
            print(f"Error: {e}")
            
    else:
        bot.send_message(message.chat.id, "দয়া করে মেনু থেকে সঠিক অপশন সিলেক্ট করুন অথবা টাস্ক সাবমিট করুন।")

@bot.callback_query_handler(func=lambda call: True)
def callback_query(call):
    data_parts = call.data.split("_")
    action = data_parts[0]
    target_user_id = int(data_parts[1])
    
    if target_user_id in user_data:
        if action == "approve":
            user_data[target_user_id]["income"] += 13.0
            user_data[target_user_id]["pending"] = max(0, user_data[target_user_id]["pending"] - 1)
            user_data[target_user_id]["completed"] += 1
            bot.answer_callback_query(call.id, "টাস্ক সফলভাবে অ্যাপ্রুভ করা হয়েছে!")
            bot.edit_message_text(f"✅ Approved by Admin\n{call.message.text}", call.message.chat.id, call.message.message_id)
            
            try:
                bot.send_message(target_user_id, "🎉 অভিনন্দন! আপনার কাজটি সফলভাবে সাবমিট ও অ্যাপ্রুভ হয়েছে এবং ৳13 যুক্ত হয়েছে।")
            except:
                pass
                
        elif action == "reject":
            user_data[target_user_id]["pending"] = max(0, user_data[target_user_id]["pending"] - 1)
            user_data[target_user_id]["rejected"] += 1
            bot.answer_callback_query(call.id, "টাস্ক রিজেক্ট করা হয়েছে।")
            bot.edit_message_text(f"❌ Rejected by Admin\n{call.message.text}", call.message.chat.id, call.message.message_id)
            
            try:
                bot.send_message(target_user_id, "❌ দুঃখিত, আপনার টাস্কটি রিজেক্ট করা হয়েছে।")
            except:
                pass

if __name__ == "__main__":
    print("Bot is starting polling...")
    bot.infinity_none_stop()
