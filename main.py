import logging
from telegram import InlineKeyboardButton, InlineKeyboardMarkup, Update
from telegram.ext import (
    ApplicationBuilder,
    CallbackQueryHandler,
    CommandHandler,
    ContextTypes,
    ConversationHandler,
    MessageHandler,
    filters,
)

# আপনার টেলিগ্রাম বটের টোকেন এবং এডমিন আইডি এখানে বসান
TOKEN = "YOUR_BOT_TOKEN_HERE"
ADMIN_CHAT_ID = 123456789  # আপনার এডমিন চ্যাট আইডি দিন

# কনভার্সেশনের বিভিন্ন স্টেপ ডিফাইন করা
CHOOSING, DEPOSIT_NAME, DEPOSIT_PHONE, DEPOSIT_AMOUNT, DEPOSIT_SCREENSHOT = range(5)
WITHDRAW_NAME, WITHDRAW_AMOUNT, WITHDRAW_SCREENSHOT, WITHDRAW_PHONE = range(5, 9)

logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s", level=logging.INFO
)

# মূল মেন্যু বা স্টার্ট কমান্ড
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    keyboard = [
        [InlineKeyboardButton("ডিপোজিট", callback_data="deposit")],
        [InlineKeyboardButton("উইথড্র", callback_data="withdraw")],
        [InlineKeyboardButton("এডমিন", callback_data="admin")],
        [InlineKeyboardButton("ক্যানসেল", callback_data="cancel")],
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    if update.message:
        await update.message.reply_text("দয়া করে নিচের অপশনগুলো থেকে একটি বেছে নিন:", reply_markup=reply_markup)
    elif update.callback_query:
        query = update.callback_query
        await query.answer()
        await query.edit_message_text("দয়া করে নিচের অপশনগুলো থেকে একটি বেছে নিন:", reply_markup=reply_markup)
    return CHOOSING

# ডিপোজিট শুরু করা
async def deposit_start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    
    keyboard = [[InlineKeyboardButton("ক্যানসেল", callback_data="cancel")]]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await query.edit_message_text("আপনার ইউজার নেমটি লিখুন:", reply_markup=reply_markup)
    return DEPOSIT_NAME

async def deposit_name(update: Update, context: ContextTypes.DEFAULT_TYPE):
    context.user_data['deposit_name'] = update.message.text
    await update.message.reply_text("আপনার ফোন নাম্বারটি লিখুন:")
    return DEPOSIT_PHONE

async def deposit_phone(update: Update, context: ContextTypes.DEFAULT_TYPE):
    context.user_data['deposit_phone'] = update.message.text
    await update.message.reply_text("টাকার পরিমাণ কত তা লিখুন:")
    return DEPOSIT_AMOUNT

async def deposit_amount(update: Update, context: ContextTypes.DEFAULT_TYPE):
    context.user_data['deposit_amount'] = update.message.text
    await update.message.reply_text("পেমেন্টের স্ক্রিনশট বা ছবি আপলোড করুন:")
    return DEPOSIT_SCREENSHOT

async def deposit_screenshot(update: Update, context: ContextTypes.DEFAULT_TYPE):
    photo_file = await update.message.photo[-1].get_file()
    
    name = context.user_data.get('deposit_name')
    phone = context.user_data.get('deposit_phone')
    amount = context.user_data.get('deposit_amount')
    
    caption = f"📥 নতুন ডিপোজিট রিকুয়েস্ট!\n\nইউজার নেম: {name}\nফোন নাম্বার: {phone}\nপরিমাণ: {amount}"
    await context.bot.send_photo(chat_id=ADMIN_CHAT_ID, photo=photo_file.file_id, caption=caption)
    
    await update.message.reply_text("আপনার ডিপোজিট রিকুয়েস্ট সফলভাবে সাবমিট হয়েছে!")
    return await start_after_finish(update, context)

# উইথড্র শুরু করা
async def withdraw_start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    
    keyboard = [[InlineKeyboardButton("ক্যানসেল", callback_data="cancel")]]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await query.edit_message_text("আপনার ইউজার নেমটি লিখুন:", reply_markup=reply_markup)
    return WITHDRAW_NAME

async def withdraw_name(update: Update, context: ContextTypes.DEFAULT_TYPE):
    context.user_data['withdraw_name'] = update.message.text
    await update.message.reply_text("টাকার পরিমাণ কত তা লিখুন:")
    return WITHDRAW_AMOUNT

async def withdraw_amount(update: Update, context: ContextTypes.DEFAULT_TYPE):
    context.user_data['withdraw_amount'] = update.message.text
    await update.message.reply_text("স্ক্রিনশট বা ছবি আপলোড করুন:")
    return WITHDRAW_SCREENSHOT

async def withdraw_screenshot(update: Update, context: ContextTypes.DEFAULT_TYPE):
    photo_file = await update.message.photo[-1].get_file()
    context.user_data['withdraw_screenshot'] = photo_file.file_id
    await update.message.reply_text("আপনার ফোন নাম্বারটি লিখুন:")
    return WITHDRAW_PHONE

async def withdraw_phone(update: Update, context: ContextTypes.DEFAULT_TYPE):
    phone = update.message.text
    name = context.user_data.get('withdraw_name')
    amount = context.user_data.get('withdraw_amount')
    photo_id = context.user_data.get('withdraw_screenshot')
    
    caption = f"📤 নতুন উইথড্রল রিকুয়েস্ট!\n\nইউজার নেম: {name}\nপরিমাণ: {amount}\nফোন নাম্বার: {phone}"
    await context.bot.send_photo(chat_id=ADMIN_CHAT_ID, photo=photo_id, caption=caption)
    
    await update.message.reply_text("আপনার উইথড্র রিকুয়েস্ট সফলভাবে সাবমিট হয়েছে!")
    return await start_after_finish(update, context)

# এডমিন অপশন
async def admin_panel(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    user_id = query.from_user.id
    
    if user_id == ADMIN_CHAT_ID:
        await query.edit_message_text("স্বাগতম এডমিন প্যানেলে। এখানে আপনি সমস্ত রিকুয়েস্ট দেখতে পাবেন।")
    else:
        await query.edit_message_text("দুঃখিত, এই অপশনটি শুধুমাত্র এডমিনের জন্য।")
    return CHOOSING

# প্রসেস ক্যানসেল করা
async def cancel(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    await query.edit_message_text("অপারেশন বাতিল করা হয়েছে।")
    return ConversationHandler.END

async def start_after_finish(update: Update, context: ContextTypes.DEFAULT_TYPE):
    keyboard = [
        [InlineKeyboardButton("ডিপোজিট", callback_data="deposit")],
        [InlineKeyboardButton("উইথড্র", callback_data="withdraw")],
        [InlineKeyboardButton("এডমিন", callback_data="admin")],
        [InlineKeyboardButton("ক্যানসেল", callback_data="cancel")],
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    await update.message.reply_text("প্রধান মেন্যু:", reply_markup=reply_markup)
    return CHOOSING

def main():
    application = ApplicationBuilder().token(TOKEN).build()

    conv_handler = ConversationHandler(
        entry_points=[CommandHandler("start", start), CallbackQueryHandler(start)],
        states={
            CHOOSING: [
                CallbackQueryHandler(deposit_start, pattern="^deposit$"),
                CallbackQueryHandler(withdraw_start, pattern="^withdraw$"),
                CallbackQueryHandler(admin_panel, pattern="^admin$"),
                CallbackQueryHandler(cancel, pattern="^cancel$"),
            ],
            DEPOSIT_NAME: [MessageHandler(filters.TEXT & ~filters.COMMAND, deposit_name)],
            DEPOSIT_PHONE: [MessageHandler(filters.TEXT & ~filters.COMMAND, deposit_phone)],
            DEPOSIT_AMOUNT: [MessageHandler(filters.TEXT & ~filters.COMMAND, deposit_amount)],
            DEPOSIT_SCREENSHOT: [MessageHandler(filters.PHOTO, deposit_screenshot)],
            
            WITHDRAW_NAME: [MessageHandler(filters.TEXT & ~filters.COMMAND, withdraw_name)],
            WITHDRAW_AMOUNT: [MessageHandler(filters.TEXT & ~filters.COMMAND, withdraw_amount)],
            WITHDRAW_SCREENSHOT: [MessageHandler(filters.PHOTO, withdraw_screenshot)],
            WITHDRAW_PHONE: [MessageHandler(filters.TEXT & ~filters.COMMAND, withdraw_phone)],
        },
        fallbacks=[CallbackQueryHandler(cancel, pattern="^cancel$")],
    )

    application.add_handler(conv_handler)
    application.run_polling()

if __name__ == "__main__":
    main()
