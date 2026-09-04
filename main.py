import telebot

# আপনার বোটের টোকেন
TOKEN = "8750150015:AAGGkj93aC-HvXCxWM9WzIaPTRFeexkmQ8c"
bot = telebot.TeleBot(TOKEN)

# /start কমান্ড হ্যান্ডলার
@bot.message_handler(commands=['start'])
def send_welcome(message):
    bot.reply_to(message, "আসসালামু আলাইকুম! বোটটি সফলভাবে সচল রয়েছে। আপনি কীভাবে সাহায্য করতে পারি?")

# সাধারণ টেক্সট বা প্রম্পট হ্যান্ডলার
@bot.message_handler(func=lambda message: True)
def echo_all(message):
    bot.reply_to(message, f"আপনার বার্তাটি পেয়েছি: {message.text}")

# বোট রান করার জন্য
if __name__ == "__main__":
    print("Bot is running...")
    bot.infinity_polling()
  
