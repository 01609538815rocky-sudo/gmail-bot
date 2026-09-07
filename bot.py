from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import ApplicationBuilder, ContextTypes, CommandHandler, CallbackQueryHandler, MessageHandler, filters

TOKEN = "8948563757:AAHvkFlRIWd0BSfYCz6BVNHeNnONWJmjJbU"

# ডেমো ডাটাবেস
user_data_db = {
    "balance": 0.00,
    "pending_balance": 0.00,
    "tasks_review": 1,
    "tasks_completed": 5,
    "tasks_rejected": 0,
}

ADMIN_PASSWORD = "admin123"
admin_logged_in = {}
waiting_for_admin_pass = {}

# ১. হোম স্ক্রিন মেনু
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = update.effective_user.id
    admin_logged_in[user_id] = False
    
    keyboard = [
        [InlineKeyboardButton("📋 কাজ", callback_data="menu_tasks")],
        [InlineKeyboardButton("💰 ব্যালেন্স", callback_data="balance")],
        [InlineKeyboardButton("💳 উইথড্র ব্যালেন্স", callback_data="withdraw")],
        [InlineKeyboardButton("🌐 ভাষা পরিবর্তন", callback_data="language")],
        [InlineKeyboardButton("👥 রেফার", callback_data="refer")],
        [InlineKeyboardButton("👑 এডমিন প্যানেল", callback_data="admin_login")]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    text = "স্বাগতম! কাজঘর বটে আপনাকে স্বাগতম। নিচে থেকে আপনার প্রয়োজনীয় অপশনটি বেছে নিন:"
    if update.message:
        await update.message.reply_text(text, reply_markup=reply_markup)
    elif update.callback_query:
        await update.callback_query.message.edit_text(text, reply_markup=reply_markup)

# ২. বাটন হ্যান্ডলার এবং নেভিগেশন
async def button_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    data = query.data
    user_id = update.effective_user.id
    
    # কাজ অপশন
    if data == "menu_tasks":
        keyboard = [
            [InlineKeyboardButton("📧 জিমেইল কাজ (রেট: ১৩ টাকা)", callback_data="task_gmail")],
            [InlineKeyboardButton("📘 ফেসবুক কাজ", callback_data="task_facebook")],
            [InlineKeyboardButton("📸 ইন্সটাগ্রাম কাজ", callback_data="task_instagram")],
            [InlineKeyboardButton("⬅️ ব্যাক (হোম)", callback_data="home")]
        ]
        await query.edit_message_text(text="দয়া করে নিচের তালিকা থেকে আপনার পছন্দের কাজটি বেছে নিন:", reply_markup=InlineKeyboardMarkup(keyboard))
        
    elif data in ["task_gmail", "task_facebook", "task_instagram"]:
        task_name = "জিমেইল (১৩ টাকা)" if data=="task_gmail" else ("ফেসবুক" if data=="task_facebook" else "ইন্সটাগ্রাম")
        keyboard = [[InlineKeyboardButton("⬅️ ব্যাক", callback_data="menu_tasks")]]
        await query.edit_message_text(text=f"📋 **{task_name} কাজ:**\nকাজের বিবরণ সম্পন্ন করে প্রুফ জমা দিন।", reply_markup=InlineKeyboardMarkup(keyboard), parse_mode="Markdown")

    # ব্যালেন্স অপশন
    elif data == "balance":
        keyboard = [[InlineKeyboardButton("⬅️ ব্যাক (হোম)", callback_data="home")]]
        text = (
            f"💰 **ব্যালেন্স বিবরণী:**\n\n"
            f"• মূল ব্যালেন্স: ৳{user_data_db['balance']:.2f}\n"
            f"• পেন্ডিং ব্যালেন্স: ৳{user_data_db['pending_balance']:.2f}\n"
            f"• কাজ রিভিউতে আছে: {user_data_db['tasks_review']} টি\n"
            f"• কাজ সম্পূর্ণ হয়েছে: {user_data_db['tasks_completed']} টি\n"
            f"• কাজ রিজেক্ট হয়েছে: {user_data_db['tasks_rejected']} টি"
        )
        await query.edit_message_text(text=text, reply_markup=InlineKeyboardMarkup(keyboard), parse_mode="Markdown")
        
    # উইথড্র অপশন
    elif data == "withdraw":
        keyboard = [
            [InlineKeyboardButton("বিকাশ", callback_data="wd_bkash"), InlineKeyboardButton("নগদ", callback_data="wd_nagad")],
            [InlineKeyboardButton("রকেট", callback_data="wd_rocket")],
            [InlineKeyboardButton("⬅️ ব্যাক (হোম)", callback_data="home")]
        ]
        await query.edit_message_text(text="💳 উইথড্র করতে পেমেন্ট মেথড সিলেক্ট করুন।\n⚠️ সর্বনিম্ন উইথড্র: ৫০ টাকা", reply_markup=InlineKeyboardMarkup(keyboard))

    elif data in ["wd_bkash", "wd_nagad", "wd_rocket"]:
        method = "বিকাশ" if data == "wd_bkash" else ("নগদ" if data == "wd_nagad" else "রকেট")
        keyboard = [[InlineKeyboardButton("⬅️ ব্যাক", callback_data="withdraw")]]
        await query.edit_message_text(text=f"আপনি {method} সিলেক্ট করেছেন। আপনার নম্বর এবং অ্যামাউন্ট দিন (মিনিমাম ৫০ টাকা)।", reply_markup=InlineKeyboardMarkup(keyboard))

    # ভাষা পরিবর্তন অপশন
    elif data == "language":
        keyboard = [
            [InlineKeyboardButton("বাংলা 🇧🇩", callback_data="lang_bn"), InlineKeyboardButton("English 🇬🇧", callback_data="lang_en")],
            [InlineKeyboardButton("⬅️ ব্যাক (হোম)", callback_data="home")]
        ]
        await query.edit_message_text(text="ভাষা নির্বাচন করুন / Select your language:", reply_markup=InlineKeyboardMarkup(keyboard))

    elif data in ["lang_bn", "lang_en"]:
        keyboard = [[InlineKeyboardButton("⬅️ ব্যাক (হোম)", callback_data="home")]]
        await query.edit_message_text(text="ভাষা সফলভাবে পরিবর্তন করা হয়েছে!", reply_markup=InlineKeyboardMarkup(keyboard))

    # রেফার অপশন
    elif data == "refer":
        keyboard = [[InlineKeyboardButton("⬅️ ব্যাক (হোম)", callback_data="home")]]
        await query.edit_message_text(text="👥 **রেফার সিস্টেম:**\nআপনার রেফার কোড: `KAJ12345`\nরেফার লিংক: `https://t.me/your_bot?start=KAJ12345`", reply_markup=InlineKeyboardMarkup(keyboard), parse_mode="Markdown")

    # এডমিন প্যানেল লগইন ও ড্যাশবোর্ড
    elif data == "admin_login":
        if admin_logged_in.get(user_id, False):
            await show_admin_panel(query)
        else:
            waiting_for_admin_pass[user_id] = True
            keyboard = [[InlineKeyboardButton("⬅️ ব্যাক (হোম)", callback_data="home")]]
            await query.edit_message_text(text="🔐 এডমিন প্যানেলে প্রবেশ করতে পাসওয়ার্ডটি চ্যাটে লিখে পাঠান:", reply_markup=InlineKeyboardMarkup(keyboard))

    elif data == "adm_tasks":
        if admin_logged_in.get(user_id, False):
            keyboard = [
                [InlineKeyboardButton("✅ Approve", callback_data="task_approve"), InlineKeyboardButton("❌ Reject", callback_data="task_reject")],
                [InlineKeyboardButton("⬅️ ব্যাক (এডমিন মেনু)", callback_data="admin_dashboard")]
            ]
            await query.edit_message_text(text="📥 **জমা দেওয়া কাজ #১**\nWorker: John Doe\nProof: Screenshot attached\n\nস্ট্যাটাস পরিবর্তন করুন:", reply_markup=InlineKeyboardMarkup(keyboard), parse_mode="Markdown")
        else:
            await query.edit_message_text(text="সেশন মেয়াদোত্তীর্ণ। আবার লগইন করুন।")

    elif data == "task_approve":
        await query.edit_message_text(text="✅ কাজটি সফলভাবে **Approve** করা হয়েছে এবং ইউজারের ব্যালেন্স যোগ করা হয়েছে!", reply_markup=InlineKeyboardMarkup([[InlineKeyboardButton("⬅️ ব্যাক (এডমিন মেনু)", callback_data="admin_dashboard")]]))

    elif data == "task_reject":
        await query.edit_message_text(text="❌ কাজটি সফলভাবে **Reject** করা হয়েছে!", reply_markup=InlineKeyboardMarkup([[InlineKeyboardButton("⬅️ ব্যাক (এডমিন মেনু)", callback_data="admin_dashboard")]]))

    elif data == "adm_withdraws":
        if admin_logged_in.get(user_id, False):
            keyboard = [
                [InlineKeyboardButton("✅ Approve", callback_data="wd_approve"), InlineKeyboardButton("❌ Reject", callback_data="wd_reject")],
                [InlineKeyboardButton("⬅️ ব্যাক (এডমিন মেনু)", callback_data="admin_dashboard")]
            ]
            await query.edit_message_text(text="💸 **উইথড্র রিকুয়েস্ট #১**\nUser: Alex\nMethod: বিকাশ (৳১২০)\nNumber: 01700000000\n\nসিদ্ধান্ত নিন:", reply_markup=InlineKeyboardMarkup(keyboard), parse_mode="Markdown")
        else:
            await query.edit_message_text(text="সেশন মেয়াদোত্তীর্ণ। আবার লগইন করুন।")

    elif data == "wd_approve":
        await query.edit_message_text(text="✅ উইথড্র রিকুয়েস্ট সফলভাবে **Approve** করা হয়েছে!", reply_markup=InlineKeyboardMarkup([[InlineKeyboardButton("⬅️ ব্যাক (এডমিন মেনু)", callback_data="admin_dashboard")]]))

    elif data == "wd_reject":
        await query.edit_message_text(text="❌ উইথড্র রিকুয়েস্ট **Reject** করা হয়েছে এবং টাকা রিফান্ড করা হয়েছে!", reply_markup=InlineKeyboardMarkup([[InlineKeyboardButton("⬅️ ব্যাক (এডমিন মেনু)", callback_data="admin_dashboard")]]))

    elif data == "admin_dashboard":
        if admin_logged_in.get(user_id, False):
            await show_admin_panel(query)
        else:
            await query.edit_message_text(text="সেশন মেয়াদোত্তীর্ণ।")

    elif data == "home":
        waiting_for_admin_pass[user_id] = False
        await start(update, context)

async def show_admin_panel(query):
    keyboard = [
        [InlineKeyboardButton("📥 সাবমিট হওয়া কাজসমূহ", callback_data="adm_tasks")],
        [InlineKeyboardButton("💸 উইথড্র রিকুয়েস্টসমূহ", callback_data="adm_withdraws")],
        [InlineKeyboardButton("⬅️ ব্যাক (হোম)", callback_data="home")]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    text = (
        "👑 **এডমিন কন্ট্রোল প্যানেল**\n\n"
        "• সাবমিট হওয়া কাজ দেখতে এবং approve/reject করতে নিচে ক্লিক করুন:\n"
        "• উইথড্র রিকুয়েস্ট দেখতে এবং approve/reject করতে নিচে ক্লিক করুন:"
    )
    await query.edit_message_text(text=text, reply_markup=reply_markup, parse_mode="Markdown")

# ৩. পাসওয়ার্ড মেসেজ হ্যান্ডলার
async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = update.effective_user.id
    if waiting_for_admin_pass.get(user_id, False):
        password_input = update.message.text.strip()
        waiting_for_admin_pass[user_id] = False
        
        if password_input == ADMIN_PASSWORD:
            admin_logged_in[user_id] = True
            keyboard = [
                [InlineKeyboardButton("📥 সাবমিট হওয়া কাজসমূহ", callback_data="adm_tasks")],
                [InlineKeyboardButton("💸 উইথড্র রিকুয়েস্টসমূহ", callback_data="adm_withdraws")],
                [InlineKeyboardButton("⬅️ ব্যাক (হোম)", callback_data="home")]
            ]
            await update.message.reply_text("✅ পাসওয়ার্ড সঠিক! এডমিন প্যানেলে স্বাগতম।", reply_markup=InlineKeyboardMarkup(keyboard))
        else:
            keyboard = [[InlineKeyboardButton("🔄 আবার চেষ্টা করুন", callback_data="admin_login"), InlineKeyboardButton("⬅️ ব্যাক (হোম)", callback_data="home")]]
            await update.message.reply_text("❌ ভুল পাসওয়ার্ড! আবার চেষ্টা করুন।", reply_markup=InlineKeyboardMarkup(keyboard))

if __name__ == "__main__":
    app = ApplicationBuilder().token(TOKEN).build()
    
    app.add_handler(CommandHandler("start", start))
    app.add_handler(CallbackQueryHandler(button_handler))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))
    
    print("বট সফলভাবে রান হচ্ছে...")
    app.run_polling()
