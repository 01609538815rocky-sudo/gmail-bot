from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import ApplicationBuilder, ContextTypes, CommandHandler, CallbackQueryHandler

# আপনার টেলিগ্রাম বট টোকেন
TOKEN = "8948563757:AAHvkFlRIWd0BSfYCz6BVNHeNnONWJmjJbU"

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    # ইনলাইন বাটন তৈরি করা
    keyboard = [
        [InlineKeyboardButton("📋 কাজের তালিকা", callback_data="tasks")],
        [InlineKeyboardButton("👤 আমার অ্যাকাউন্ট", callback_data="profile")],
        [InlineKeyboardButton("ℹ️ সাহায্য", callback_data="help")]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await update.message.reply_text(
        "স্বাগতম! কাজঘর টেলিগ্রাম বটে আপনাকে স্বাগতম। নিচে থেকে আপনার প্রয়োজনীয় অপশনটি বেছে নিন:",
        reply_markup=reply_markup
    )

async def button_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    
    if query.data == "tasks":
        await query.edit_message_text(text="এই মুহূর্তে কোনো কাজ available নেই। ওয়েবসাইট ভিজিট করুন।")
    elif query.data == "profile":
        await query.edit_message_text(text="আপনার অ্যাকাউন্ট দেখতে ওয়েবসাইট বা ড্যাশবোর্ডে লগইন করুন।")
    elif query.data == "help":
        await query.edit_message_text(text="সাহায্যের জন্য অ্যাডমিনের সাথে যোগাযোগ করুন।")

if __name__ == "__main__":
    app = ApplicationBuilder().token(TOKEN).build()
    
    app.add_handler(CommandHandler("start", start))
    app.add_handler(CallbackQueryHandler(button_handler))
    
    print("বট সফলভাবে রান হচ্ছে...")
    app.run_polling()
