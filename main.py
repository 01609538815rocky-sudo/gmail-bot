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

# আপনার বটের টোকেন এবং আপনার আসল এডমিন চ্যাট আইডি
TOKEN = "8750150015:AAGGkj93aC-HvXCxWM9WzIaPTRFeexkmQ8c"
ADMIN_CHAT_ID = 8049855208

# কনভার্সেশন স্টেপস
CHOOSING, JOBS_MENU, DEPOSIT_PHONE, DEPOSIT_AMOUNT, DEPOSIT_SCREENSHOT = range(5)
WITHDRAW_AMOUNT, WITHDRAW_SCREENSHOT, WITHDRAW_PHONE = range(5, 8)
JOB_SUBMIT = 8

logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s", level=logging.INFO
)

# মূল মেন্যু (হোম পেজ)
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user = update.effective_user
    ref_link = f"https://t.me/{context.bot.username}?start=ref_{user.id}"
    
    keyboard = [
        [InlineKeyboardButton("💳 ডিপোজিট", callback_data="deposit"), InlineKeyboardButton("💸 উইথড্র", callback_data="withdraw")],
        [InlineKeyboardButton("💼 কাজসমূহ (Jobs)", callback_data="jobs_main")],
        [InlineKeyboardButton("👤 প্রোফাইল ও ওয়ালেট", callback_data="profile"), InlineKeyboardButton("🤝 নেটওয়ার্ক (রেফার)", callback_data="network")],
        [InlineKeyboardButton("🛡️ এডমিন প্যানেল", callback_data="admin"), InlineKeyboardButton("❌ ক্যানসেল", callback_data="cancel")]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    welcome_text = (
        f"✨ **INSTANT TASK PAY** ✨\n\n"
        f"স্বাগতম, {user.first_name}!\n"
        f"আপনার বন্ধুকে রেফার করুন এবং প্রতি রেফারে পান **১৫০ টাকা**! 🎉\n\n"
        f"আপনার রেফারেল লিংক:\n`{ref_link}`\n\n"
        f"দয়া করে নিচের অপশনগুলো থেকে আপনার প্রয়োজনীয় সেবা বেছে নিন:"
    )
    
    if update.message:
        await update.message.reply_text(welcome_text, reply_markup=reply_markup, parse_mode="Markdown")
    elif update.callback_query:
        query = update.callback_query
        await query.answer()
        await query.edit_message_text(welcome_text, reply_markup=reply_markup, parse_mode="Markdown")
    return CHOOSING

# কাজের মূল মেন্যু (১২টি কাজের ক্যাটাগরি)
async def jobs_menu_view(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    
    keyboard = [
        [InlineKeyboardButton("📊 CPA Marketing", callback_data="job_cpa"), InlineKeyboardButton("💻 Data Entry", callback_data="job_data")],
        [InlineKeyboardButton("📱 Mobile Recharge", callback_data="job_recharge"), InlineKeyboardButton("📄 C.V Create new", callback_data="job_cv")],
        [InlineKeyboardButton("💰 Monthly Salary", callback_data="job_monthly"), InlineKeyboardButton("📧 Gmail Sell", callback_data="job_gmail")],
        [InlineKeyboardButton("✍️ Typing Job", callback_data="job_typing"), InlineKeyboardButton("⭐ VIP Job", callback_data="job_vip")],
        [InlineKeyboardButton("🏢 B2B Lead Generation", callback_data="job_b2b"), InlineKeyboardButton("💵 Daily Salary", callback_data="job_daily")],
        [InlineKeyboardButton("🎁 Take the Giveaway", callback_data="job_giveaway"), InlineKeyboardButton("📢 Job Post", callback_data="job_post")],
        [InlineKeyboardButton("🔙 হোম মেন্যু", callback_data="home")]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await query.edit_message_text(
        "📁 **কাজের ক্যাটাগরি সমূহ**\n\nনিচের তালিকা থেকে আপনার পছন্দের কাজটি সিলেক্ট করুন:",
        reply_markup=reply_markup,
        parse_mode="Markdown"
    )
    return JOBS_MENU

# নির্দিষ্ট কাজ সিলেক্ট করলে সাবমিশন শুরু হওয়া
async def job_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    job_type = query.data.replace("job_", "").upper()
    context.user_data['current_job'] = job_type
    
    keyboard = [[InlineKeyboardButton("🔙 পেছনে যান", callback_data="jobs_main"), InlineKeyboardButton("❌ ক্যানসেল", callback_data="cancel")]]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await query.edit_message_text(
        f"📁 নির্বাচিত কাজ: **{job_type}**\n\nদয়া করে এই কাজের বিবরণ বা স্ক্রিনশট ও তথ্য এখানে পাঠান:",
        reply_markup=reply_markup,
        parse_mode="Markdown"
    )
    return JOB_SUBMIT

# ইউজার কাজ জমা দিলে সরাসরি এডমিনের ইনবক্সে ফরোয়ার্ড হওয়ার ফাংশন
async def job_submit_receive(update: Update, context: ContextTypes.DEFAULT_TYPE):
    job_type = context.user_data.get('current_job', 'TASK')
    user = update.effective_user
    
    caption = f"🚀 নতুন জব সাবমিশন ({job_type})!\n\nইউজার আইডি: `{user.id}`"
    admin_keyboard = InlineKeyboardMarkup([
        [InlineKeyboardButton("✅ কনফার্ম", callback_data=f"adm_approve_{user.id}"), InlineKeyboardButton("❌ বাতিল", callback_data=f"adm_reject_{user.id}")]
    ])
    
    if update.message.photo:
        photo_file = await update.message.photo[-1].get_file()
        await context.bot.send_photo(chat_id=ADMIN_CHAT_ID, photo=photo_file.file_id, caption=caption, reply_markup=admin_keyboard, parse_mode="Markdown")
    else:
        text_content = update.message.text
        caption += f"\n\nবিবরণ:\n{text_content}"
        await context.bot.send_message(chat_id=ADMIN_CHAT_ID, text=caption, reply_markup=admin_keyboard, parse_mode="Markdown")
        
    await update.message.reply_text("✅ আপনার কাজের রিকুয়েস্ট সফলভাবে এডমিনের কাছে পাঠানো হয়েছে!")
    return await return_to_home_msg(update, context)

# প্রোফাইল ও ওয়ালেট
async def profile_view(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    user = query.from_user
    
    text = (
        f"👤 **আপনার প্রোফাইল ও ওয়ালেট**\n\n"
        f"আইডি: `{user.id}`\n"
        f"মূল ব্যালেন্স: 0.00 টাকা\n"
        f"মোট আয়: 0.00 টাকা"
    )
    keyboard = [[InlineKeyboardButton("🔙 হোম মেন্যু", callback_data="home")]]
    await query.edit_message_text(text, reply_markup=InlineKeyboardMarkup(keyboard), parse_mode="Markdown")
    return CHOOSING

# নেটওয়ার্ক / রেফারেল সিস্টেম
async def network_view(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    user = query.from_user
    ref_link = f"https://t.me/{context.bot.username}?start=ref_{user.id}"
    
    text = (
        f"🤝 **নেটওয়ার্ক ও রেফারেল প্রোগ্রাম**\n\n"
        f"প্রতি রেফারে পাবেন **১৫০ টাকা**! 🎉\n\n"
        f"আপনার নিজস্ব রেফারেল লিংক:\n`{ref_link}`\n\n"
        f"মোট রেফারকৃত বন্ধু: ০ জন"
    )
    keyboard = [[InlineKeyboardButton("🔙 হোম মেন্যু", callback_data="home")]]
    await query.edit_message_text(text, reply_markup=InlineKeyboardMarkup(keyboard), parse_mode="Markdown")
    return CHOOSING

# ডিপোজিট প্রসেস
async def deposit_start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    keyboard = [[InlineKeyboardButton("❌ ক্যানসেল", callback_data="cancel")]]
    await query.edit_message_text("💳 ডিপোজিট প্রক্রিয়া শুরু হয়েছে।\n\nআপনার ফোন নাম্বারটি লিখুন:", reply_markup=InlineKeyboardMarkup(keyboard))
    return DEPOSIT_PHONE

async def deposit_phone(update: Update, context: ContextTypes.DEFAULT_TYPE):
    context.user_data['deposit_phone'] = update.message.text
    await update.message.reply_text("💵 জমার পরিমাণ (টাকা) কত তা লিখুন:")
    return DEPOSIT_AMOUNT

async def deposit_amount(update: Update, context: ContextTypes.DEFAULT_TYPE):
    context.user_data['deposit_amount'] = update.message.text
    await update.message.reply_text("📸 পেমেন্টের স্ক্রিনশট বা ছবি আপলোড করুন:")
    return DEPOSIT_SCREENSHOT

async def deposit_screenshot(update: Update, context: ContextTypes.DEFAULT_TYPE):
    photo_file = await update.message.photo[-1].get_file()
    phone = context.user_data.get('deposit_phone')
    amount = context.user_data.get('deposit_amount')
    user = update.effective_user
    
    caption = f"📥 নতুন ডিপোজিট রিকুয়েস্ট!\n\nইউজার আইডি: `{user.id}`\nফোন নাম্বার: {phone}\nপরিমাণ: {amount}"
    admin_keyboard = InlineKeyboardMarkup([
        [InlineKeyboardButton("✅ কনফার্ম", callback_data=f"adm_approve_{user.id}"), InlineKeyboardButton("❌ বাতিল", callback_data=f"adm_reject_{user.id}")]
    ])
    await context.bot.send_photo(chat_id=ADMIN_CHAT_ID, photo=photo_file.file_id, caption=caption, reply_markup=admin_keyboard, parse_mode="Markdown")
    await update.message.reply_text("✅ আপনার ডিপোজিট রিকুয়েস্ট সফলভাবে সাবমিট হয়েছে!")
    return await return_to_home_msg(update, context)

# উইথড্র প্রসেস
async def withdraw_start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    keyboard = [[InlineKeyboardButton("❌ ক্যানসেল", callback_data="cancel")]]
    await query.edit_message_text("💸 উইথড্র প্রক্রিয়া শুরু হয়েছে।\n\nউত্তোলনের পরিমাণ (টাকা) কত তা লিখুন:", reply_markup=InlineKeyboardMarkup(keyboard))
    return WITHDRAW_AMOUNT

async def withdraw_amount(update: Update, context: ContextTypes.DEFAULT_TYPE):
    context.user_data['withdraw_amount'] = update.message.text
    await update.message.reply_text("📸 স্ক্রিনশট বা পেমেন্ট প্রুফ ছবি আপলোড করুন:")
    return WITHDRAW_SCREENSHOT

async def withdraw_screenshot(update: Update, context: ContextTypes.DEFAULT_TYPE):
    photo_file = await update.message.photo[-1].get_file()
    context.user_data['withdraw_screenshot'] = photo_file.file_id
    await update.message.reply_text("📞 আপনার ফোন নাম্বারটি লিখুন:")
    return WITHDRAW_PHONE

async def withdraw_phone(update: Update, context: ContextTypes.DEFAULT_TYPE):
    phone = update.message.text
    amount = context.user_data.get('withdraw_amount')
    photo_id = context.user_data.get('withdraw_screenshot')
    user = update.effective_user
    
    caption = f"📤 নতুন উইথড্রল রিকুয়েস্ট!\n\nইউজার আইডি: `{user.id}`\nপরিমাণ: {amount}\nফোন নাম্বার: {phone}"
    admin_keyboard = InlineKeyboardMarkup([
        [InlineKeyboardButton("✅ কনফার্ম", callback_data=f"adm_approve_{user.id}"), InlineKeyboardButton("❌ বাতিল", callback_data=f"adm_reject_{user.id}")]
    ])
    await context.bot.send_photo(chat_id=ADMIN_CHAT_ID, photo=photo_id, caption=caption, reply_markup=admin_keyboard, parse_mode="Markdown")
    await update.message.reply_text("✅ আপনার উইথড্র রিকুয়েস্ট সফলভাবে সাবমিট হয়েছে!")
    return await return_to_home_msg(update, context)

# এডমিন বাটন হ্যান্ডলার (কনফার্ম করলে বা বাতিল করলে মেসেজ ইনবক্স থেকে ডিলিট হয়ে যাবে)
async def admin_action_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    data = query.data
    
    if data.startswith("adm_approve_"):
        user_id = data.split("_")[2]
        try:
            await query.message.delete()
            await context.bot.send_message(chat_id=int(user_id), text="🎉 অভিনন্দন! আপনার রিকুয়েস্টটি এডমিন কর্তৃক সফলভাবে অনুমোদিত হয়েছে।")
        except:
            pass
    elif data.startswith("adm_reject_"):
        user_id = data.split("_")[2]
        try:
            await query.message.delete()
            await context.bot.send_message(chat_id=int(user_id), text="❌ দুঃখিত, আপনার রিকুয়েস্টটি বাতিল করা হয়েছে।")
        except:
            pass

async def admin_panel(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    user_id = query.from_user.id
    
    if user_id == ADMIN_CHAT_ID:
        text = "🛡️ **এডমিন প্যানেল**\n\nসকল রিকুয়েস্ট আপনার ইনবক্সে কনফার্ম/বাতিল বাটনসহ আসছে।"
    else:
        text = "❌ দুঃখিত, এই অপশনটি শুধুমাত্র এডমিনের জন্য।"
        
    keyboard = [[InlineKeyboardButton("🔙 হোম মেন্যু", callback_data="home")]]
    await query.edit_message_text(text, reply_markup=InlineKeyboardMarkup(keyboard), parse_mode="Markdown")
    return CHOOSING

async def cancel(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    await query.edit_message_text("❌ অপারেশন বাতিল করা হয়েছে। আবার শুরু করতে /start লিখুন।")
    return ConversationHandler.END

async def return_to_home_msg(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user = update.effective_user
    ref_link = f"https://t.me/{context.bot.username}?start=ref_{user.id}"
    
    keyboard = [
        [InlineKeyboardButton("💳 ডিপোজিট", callback_data="deposit"), InlineKeyboardButton("💸 উইথড্র", callback_data="withdraw")],
        [InlineKeyboardButton("💼 কাজসমূহ (Jobs)", callback_data="jobs_main")],
        [InlineKeyboardButton("👤 প্রোফাইল ও ওয়ালেট", callback_data="profile"), InlineKeyboardButton("🤝 নেটওয়ার্ক (রেফার)", callback_data="network")],
        [InlineKeyboardButton("🛡️ এডমিন প্যানেল", callback_data="admin"), InlineKeyboardButton("❌ ক্যানসেল", callback_data="cancel")]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    welcome_text = "✨ প্রধান মেন্যু:"
    await update.message.reply_text(welcome_text, reply_markup=reply_markup)
    return CHOOSING

async def home_button(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    return await start(update, context)

def main():
    application = ApplicationBuilder().token(TOKEN).build()

    conv_handler = ConversationHandler(
        entry_points=[CommandHandler("start", start), CallbackQueryHandler(start)],
        states={
            CHOOSING: [
                CallbackQueryHandler(deposit_start, pattern="^deposit$"),
                CallbackQueryHandler(withdraw_start, pattern="^withdraw$"),
                CallbackQueryHandler(jobs_menu_view, pattern="^jobs_main$"),
                CallbackQueryHandler(profile_view, pattern="^profile$"),
                CallbackQueryHandler(network_view, pattern="^network$"),
                CallbackQueryHandler(admin_panel, pattern="^admin$"),
                CallbackQueryHandler(home_button, pattern="^home$"),
                CallbackQueryHandler(cancel, pattern="^cancel$"),
            ],
            JOBS_MENU: [
                CallbackQueryHandler(job_handler, pattern="^job_"),
                CallbackQueryHandler(home_button, pattern="^home$"),
            ],
            DEPOSIT_PHONE: [MessageHandler(filters.TEXT & ~filters.COMMAND, deposit_phone)],
            DEPOSIT_AMOUNT: [MessageHandler(filters.TEXT & ~filters.COMMAND, deposit_amount)],
            DEPOSIT_SCREENSHOT: [MessageHandler(filters.PHOTO, deposit_screenshot)],
            
            WITHDRAW_AMOUNT: [MessageHandler(filters.TEXT & ~filters.COMMAND, withdraw_amount)],
            WITHDRAW_SCREENSHOT: [MessageHandler(filters.PHOTO, withdraw_screenshot)],
            WITHDRAW_PHONE: [MessageHandler(filters.TEXT & ~filters.COMMAND, withdraw_phone)],
            
            JOB_SUBMIT: [
                MessageHandler(filters.TEXT | filters.PHOTO, job_submit_receive),
                CallbackQueryHandler(jobs_menu_view, pattern="^jobs_main$"),
                CallbackQueryHandler(cancel, pattern="^cancel$"),
            ],
        },
        fallbacks=[CallbackQueryHandler(cancel, pattern="^cancel$")],
    )

    application.add_handler(conv_handler)
    application.add_handler(CallbackQueryHandler(admin_action_callback, pattern="^adm_"))
    application.run_polling()

if __name__ == "__main__":
    main()
