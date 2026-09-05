import telebot
from telebot import types

# আপনার দেওয়া টেলিগ্রাম টোকেন এখানে বসানো হলো
TOKEN = '8750150015:AAGGkj93aC-HvXCxWM9WzIaPTRFeexkmQ8c'
bot = telebot.TeleBot(TOKEN)

# স্টার্ট কমান্ড এবং পার্মানেন্ট মেনু কিবোর্ড
@bot.message_handler(commands=['start', 'help'])
def send_welcome(message):
    markup = types.ReplyKeyboardMarkup(resize_keyboard=True, row_width=2)
    
    # চারটি মূল বোতাম
    btn_work = types.KeyboardButton("💼 কাজ করুন")
    btn_withdraw = types.KeyboardButton("💰 উইথড্র")
    btn_lang = types.KeyboardButton("🌐 ভাষা")
    btn_admin = types.KeyboardButton("⚙️ এডমিন প্যানেল")
    
    markup.add(btn_work, btn_withdraw, btn_lang, btn_admin)
    
    bot.send_message(
        message.chat.id, 
        "✨ **WELCOME TO SMART EARNING** ✨\n\nআপনাদের স্বাগতম! নিচের অপশনগুলো থেকে নির্বাচন করুন:", 
        reply_markup=markup, 
        parse_mode="Markdown"
    )

# বোতামগুলোতে ক্লিক করলে কী রিপ্লাই আসবে তার হ্যান্ডলার
@bot.message_handler(func=lambda message: True)
def handle_message(message):
    if message.text == "💼 কাজ করুন":
        bot.reply_to(message, "📝 বর্তমান কোনো কাজ নেই বা জিমেইল টাস্ক লিস্ট শীঘ্রই যুক্ত করা হবে।")
    elif message.text == "💰 উইথড্র":
        bot.reply_to(message, "💳 আপনার ব্যালেন্স শূন্য (0). উইথড্র করতে ন্যূনতম ব্যালেন্স প্রয়োজন।")
    elif message.text == "🌐 ভাষা":
        bot.reply_to(message, "🇧🇩 ভাষা নির্বাচন করুন: বাংলা / English")
    elif message.text == "⚙️ এডমিন প্যানেল":
        bot.reply_to(message, "🔒 এটি শুধুমাত্র অ্যাডমিনদের জন্য সংরক্ষিত এলাকা।")
    else:
        bot.reply_to(message, "দয়া করে নিচের মেনু বাটনগুলো ব্যবহার করুন।")

# বট রান করার কমান্ড
if __name__ == '__main__':
    print("Bot is running...")
    bot.infinity_polling()
