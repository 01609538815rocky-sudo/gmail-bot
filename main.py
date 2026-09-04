import telebot

TOKEN = "8684396840:AAFJtDoikwWFWH-BUO_ATlbv94SldiKCzb4"
bot = telebot.TeleBot(TOKEN)

@bot.message_handler(commands=['start', 'help'])
def send_welcome(message):
    bot.reply_to(message, "হ্যালো! আপনার টেলিগ্রাম বোটটি সফলভাবে চালু হয়েছে এবং কাজ করছে।")

@bot.message_handler(func=lambda message: True)
def echo_all(message):
    bot.reply_to(message, f"আপনি পাঠিয়েছেন: {message.text}")

print("Bot is starting...")
bot.infinity_polling()
