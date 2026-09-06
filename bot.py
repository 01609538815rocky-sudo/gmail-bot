import os
from telegram import Update
from telegram.ext import ApplicationBuilder, ContextTypes, CommandHandler

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("হ্যালো! আপনার জিমেইল ও টেলিগ্রাম বট সফলভাবে চালু হয়েছে।")

if __name__ == '__main__':
    # রেন্ডারে সেট করা এনভায়রনমেন্ট ভ্যারিয়েবল থেকে টোকেন নেবে
    TOKEN = os.getenv("TOKEN")
    
    if not TOKEN:
        raise ValueError("টোকেন পাওয়া যায়নি! রেন্ডারে TOKEN ভ্যারিয়েবল ঠিকমতো সেট করা আছে কিনা চেক করুন।")
        
    app = ApplicationBuilder().token(TOKEN).build()
    app.add_handler(CommandHandler("start", start))
    
    print("বট সফলভাবে চালু হচ্ছে...")
    app.run_polling()
