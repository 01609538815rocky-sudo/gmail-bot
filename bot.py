from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import ApplicationBuilder, ContextTypes, CommandHandler, CallbackQueryHandler, MessageHandler, filters

TOKEN = "8948563757:AAHvkFlRIWd0BSfYCz6BVNHeNnONWJmjJbU"

# ডাটাবেস / মেমোরি স্টোরেজ
user_data_db = {
    "balance": 0.00,
    "pending_balance": 0.00,
    "tasks_review": 0,
    "tasks_completed": 0,
    "tasks_rejected": 0,
}

ADMIN_PASSWORD = "102050"
admin_logged_in = {}
waiting_for_admin_pass = {}
waiting_for_task_proof = {}

pending_task_submissions = [] 
pending_withdrawals = []

# ১. হোম স্ক্রিন মেনু (ইনবক্সের একই জায়গায় মেসেজ আপডেট হবে)
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = update.effective_user.id
    admin_logged_in[user_id] = False
    waiting_for_task_proof[user_id] = False
    
    keyboard = [
        [InlineKeyboardButton("📋 কাজ", callback_data="menu_tasks")],
        [InlineKeyboardButton("💰 ব্যালেন্স", callback_data="balance")],
        [InlineKeyboardButton("💳 উইথড্র ব্যালেন্স", callback_data="withdraw")],
        [InlineKeyboardButton("🌐 ভাষা পরিবর্তন", callback_data="language")],
        [InlineKeyboardButton("👥 রেফার", callback_data="refer")],
        [InlineKeyboardButton("👑 এডমিন প্যানেল", callback_data="admin_login")]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    text = "✨ **স্বাগতম!** কাজঘর বটে আপনাকে স্বাগতম। নিচে থেকে আপনার প্রয়োজনীয় অপশনটি বেছে নিন:"
    if update.message:
        await update.message.reply_text(text, reply_markup=reply_markup, parse_mode="Markdown")
    elif update.callback_query:
        await update.callback_query.message.edit_text(text, reply_markup=reply_markup, parse_mode="Markdown")

# ২. বাটন হ্যান্ডলার এবং নেভিগেশন
async def button_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    data = query.data
    user_id = update.effective_user.id
    
    # কাজ অপশন
    if data == "menu_tasks":
        waiting_for_task_proof[user_id] = False
        keyboard = [
            [InlineKeyboardButton("📧 জিমেইল কাজ (রেট: ১৩ টাকা)", callback_data="task_gmail")],
            [InlineKeyboardButton("📘 ফেসবুক কাজ", callback_data="task_facebook")],
            [InlineKeyboardButton("📸 ইন্সটাগ্রাম কাজ", callback_data="task_instagram")],
            [InlineKeyboardButton("⬅️ ব্যাক (হোম)", callback_data="home")]
        ]
        await query.edit_message_text(text="🎯 **কাজের তালিকা:**\nদয়া করে নিচের তালিকা থেকে আপনার পছন্দের কাজটি বেছে নিন:", reply_markup=InlineKeyboardMarkup(keyboard), parse_mode="Markdown")
        
    elif data == "task_gmail":
        is_task_active = False # আপাতত কাজ বন্ধ রাখা হয়েছে, চালু করলে True করতে হবে
        
        if not is_task_active:
            keyboard = [[InlineKeyboardButton("⬅️ ব্যাক", callback_data="menu_tasks")]]
            await query.edit_message_text(text="⚠️ **জিমেইলের কাজ:**\nএই কাজ বর্তমানে বন্ধ আছে। পরবর্তীতে চালু করা হবে।", reply_markup=InlineKeyboardMarkup(keyboard), parse_mode="Markdown")
        else:
            waiting_for_task_proof[user_id] = True
            keyboard = [
                [InlineKeyboardButton("📤 সাবমিট করুন", callback_data="submit_proof"), InlineKeyboardButton("❌ ক্যানসেল", callback_data="cancel_task")],
                [InlineKeyboardButton("⬅️ ব্যাক", callback_data="menu_tasks")]
            ]
            text = (
                "📧 **জিমেইল কাজ:**\n"
                "━━━━━━━━━━━━━━━━━━━\n"
                "• রেট: ১৩ টাকা প্রতি কাজ\n\n"
                "নিয়ম মেনে কাজ সম্পন্ন করে নিচে 'সাবমিট করুন' বাটনে চাপ দিন।"
            )
            await query.edit_message_text(text=text, reply_markup=InlineKeyboardMarkup(keyboard), parse_mode="Markdown")

    elif data in ["task_facebook", "task_instagram"]:
        waiting_for_task_proof[user_id] = False
        task_name = "ফেসবুক" if data=="task_facebook" else "ইন্সটাগ্রাম"
        # ফেসবুক বা জিমেইল চালু হলে সাবমিট, ক্যানসেল ও ব্যাক বাটন এভাবে কাজ করবে
        keyboard = [
            [InlineKeyboardButton("📤 সাবমিট করুন", callback_data="submit_proof"), InlineKeyboardButton("❌ ক্যানসেল", callback_data="cancel_task")],
            [InlineKeyboardButton("⬅️ ব্যাক", callback_data="menu_tasks")]
        ]
        await query.edit_message_text(text=f"📋 **{task_name} কাজ:**\n━━━━━━━━━━━━━━━━━━━\nএই কাজ বর্তমানে বন্ধ রয়েছে। যখন চালু হবে তখন সাবমিট করতে পারবেন।", reply_markup=InlineKeyboardMarkup(keyboard), parse_mode="Markdown")

    elif data == "submit_proof":
        waiting_for_task_proof[user_id] = True
        keyboard = [[InlineKeyboardButton("❌ ক্যানসেল", callback_data="cancel_task"), InlineKeyboardButton("⬅️ ব্যাক", callback_data="menu_tasks")]]
        await query.edit_message_text(text="💬 অনুগ্রহ করে আপনার কাজের প্রুফ (স্ক্রিনশট বা তথ্য) চ্যাটে লিখে বা পাঠিয়ে দিন:", reply_markup=InlineKeyboardMarkup(keyboard))

    elif data == "cancel_task":
        waiting_for_task_proof[user_id] = False
        keyboard = [[InlineKeyboardButton("📋 কাজের মেনু", callback_data="menu_tasks"), InlineKeyboardButton("⬅️ ব্যাক (হোম)", callback_data="home")]]
        await query.edit_message_text(text="❌ কাজটি বাতিল করা হয়েছে।", reply_markup=InlineKeyboardMarkup(keyboard))

    # প্রিমিয়াম ব্যালেন্স অপশন
    elif data == "balance":
        waiting_for_task_proof[user_id] = False
        keyboard = [
            [InlineKeyboardButton("💳 উইথড্র করুন", callback_data="withdraw")],
            [InlineKeyboardButton("⬅️ ব্যাক (হোম)", callback_data="home")]
        ]
        text = (
            "💎 **A C C O U N T   B A L A N CＥ** 💎\n"
            "═════════════════════════\n\n"
            f"💰 **মূল ব্যালেন্স:** `৳ {user_data_db['balance']:.2f}`\n"
            f"⏳ **পেন্ডিং ব্যালেন্স:** `৳ {user_data_db['pending_balance']:.2f}`\n\n"
            "📊 **কাজের পরিসংখ্যান (Task Stats):**\n"
            "─────────────────────────\n"
            f"  🔹 রিভিউতে আছে :  `{user_data_db['tasks_review']} টি`\n"
            f"  ✅ সম্পন্ন হয়েছে :  `{user_data_db['tasks_completed']} টি`\n"
            f"  ❌ রিজেক্ট হয়েছে :  `{user_data_db['tasks_rejected']} টি`\n\n"
            "═════════════════════════"
        )
        await query.edit_message_text(text=text, reply_markup=InlineKeyboardMarkup(keyboard), parse_mode="Markdown")
        
    # উইথড্র অপশন
    elif data == "withdraw":
        waiting_for_task_proof[user_id] = False
        keyboard = [
            [InlineKeyboardButton("🔸 বিকাশ (bKash)", callback_data="wd_bkash"), InlineKeyboardButton("🔸 নগদ (Nagad)", callback_data="wd_nagad")],
            [InlineKeyboardButton("🔸 রকেট (Rocket)", callback_data="wd_rocket")],
            [InlineKeyboardButton("⬅️ ব্যাক (হোম)", callback_data="home")]
        ]
        await query.edit_message_text(text="💳 **উইথড্র সেকশন:**\nপেমেন্ট নেওয়ার জন্য আপনার পছন্দের মাধ্যমটি সিলেক্ট করুন।\n\n⚠️ *সর্বনিম্ন উইথড্র: ৫০ টাকা*", reply_markup=InlineKeyboardMarkup(keyboard), parse_mode="Markdown")

    elif data in ["wd_bkash", "wd_nagad", "wd_rocket"]:
        method = "বিকাশ" if data == "wd_bkash" else ("নগদ" if data == "wd_nagad" else "রকেট")
        pending_withdrawals.append({"user": f"User {user_id}", "method": method, "amount": 50})
        user_data_db['pending_balance'] += 50
        
        keyboard = [[InlineKeyboardButton("⬅️ ব্যাক", callback_data="withdraw")]]
        await query.edit_message_text(text=f"✅ সফল!\nআপনার {method}-এ উইথড্র রিকুয়েস্ট জমা হয়েছে। এডমিন যাচাই করে পেমেন্ট পাঠিয়ে দেবেন।", reply_markup=InlineKeyboardMarkup(keyboard))

    # ভাষা পরিবর্তন অপশন
    elif data == "language":
        waiting_for_task_proof[user_id] = False
        keyboard = [
            [InlineKeyboardButton("🇧🇩 বাংলা", callback_data="lang_bn"), InlineKeyboardButton("🇬🇧 English", callback_data="lang_en")],
            [InlineKeyboardButton("⬅️ ব্যাক (হোম)", callback_data="home")]
        ]
        await query.edit_message_text(text="🌐 ভাষা নির্বাচন করুন / Select your language:", reply_markup=InlineKeyboardMarkup(keyboard))

    elif data in ["lang_bn", "lang_en"]:
        keyboard = [[InlineKeyboardButton("⬅️ ব্যাক (হোম)", callback_data="home")]]
        await query.edit_message_text(text="✅ ভাষা সফলভাবে পরিবর্তন করা হয়েছে!", reply_markup=InlineKeyboardMarkup(keyboard))

    # রেফার অপশন
    elif data == "refer":
        waiting_for_task_proof[user_id] = False
        keyboard = [[InlineKeyboardButton("⬅️ ব্যাক (হোম)", callback_data="home")]]
        text = (
            "👥 **রেফার ও আয় করুন:**\n"
            "━━━━━━━━━━━━━━━━━━━\n"
            "আপনার রেফার কোড: `KAJ12345`\n"
            "রেফার লিংক:\n`https://t.me/your_bot?start=KAJ12345`"
        )
        await query.edit_message_text(text=text, reply_markup=InlineKeyboardMarkup(keyboard), parse_mode="Markdown")

    # এডমিন প্যানেল লগইন ও ড্যাশবোর্ড
    elif data == "admin_login":
        waiting_for_task_proof[user_id] = False
        if admin_logged_in.get(user_id, False):
            await show_admin_panel(query)
        else:
            waiting_for_admin_pass[user_id] = True
            keyboard = [[InlineKeyboardButton("⬅️ ব্যাক (হোম)", callback_data="home")]]
            await query.edit_message_text(text="🔐 **এডমিন সিকিউরিটি:**\nদয়া করে এডমিন পাসওয়ার্ডটি চ্যাটে লিখে পাঠান:", reply_markup=InlineKeyboardMarkup(keyboard), parse_mode="Markdown")

    elif data == "adm_tasks":
        if admin_logged_in.get(user_id, False):
            if not pending_task_submissions:
                keyboard = [[InlineKeyboardButton("⬅️ ব্যাক (এডমিন মেনু)", callback_data="admin_dashboard")]]
                await query.edit_message_text(text="📭 এই মুহূর্তে কোনো নতুন কাজের সাবমিশন জমা নেই।", reply_markup=InlineKeyboardMarkup(keyboard))
            else:
                keyboard = [
                    [InlineKeyboardButton("✅ Approve", callback_data="task_approve"), InlineKeyboardButton("❌ Reject", callback_data="task_reject")],
                    [InlineKeyboardButton("⬅️ ব্যাক (এডমিন মেনু)", callback_data="admin_dashboard")]
                ]
                await query.edit_message_text(text="📥 **জমা দেওয়া কাজ রয়েছে:**\nস্ট্যাটাস পরিবর্তন করুন:", reply_markup=InlineKeyboardMarkup(keyboard), parse_mode="Markdown")
        else:
            await query.edit_message_text(text="সেশন মেয়াদোত্তীর্ণ। আবার লগইন করুন।")

    elif data == "task_approve":
        if pending_task_submissions:
            pending_task_submissions.pop(0)
            user_data_db['tasks_completed'] += 1
            user_data_db['balance'] += 13
        await query.edit_message_text(text="✅ কাজটি সফলভাবে **Approve** করা হয়েছে!", reply_markup=InlineKeyboardMarkup([[InlineKeyboardButton("⬅️ ব্যাক (এডমিন মেনু)", callback_data="admin_dashboard")]]))

    elif data == "task_reject":
        if pending_task_submissions:
            pending_task_submissions.pop(0)
            user_data_db['tasks_rejected'] += 1
        await query.edit_message_text(text="❌ কাজটি **Reject** করা হয়েছে!", reply_markup=InlineKeyboardMarkup([[InlineKeyboardButton("⬅️ ব্যাক (এডমিন মেনু)", callback_data="admin_dashboard")]]))

    elif data == "adm_withdraws":
        if admin_logged_in.get(user_id, False):
            if not pending_withdrawals:
                keyboard = [[InlineKeyboardButton("⬅️ ব্যাক (এডমিন মেনু)", callback_data="admin_dashboard")]]
                await query.edit_message_text(text="📭 এই মুহূর্তে কোনো উইথড্র রিকুয়েস্ট নেই।", reply_markup=InlineKeyboardMarkup(keyboard))
            else:
                req = pending_withdrawals[0]
                keyboard = [
                    [InlineKeyboardButton("✅ Approve", callback_data="wd_approve"), InlineKeyboardButton("❌ Reject", callback_data="wd_reject")],
                    [InlineKeyboardButton("⬅️ ব্যাক (এডমিন মেনু)", callback_data="admin_dashboard")]
                ]
                await query.edit_message_text(text=f"💸 **উইথড্র রিকুয়েস্ট:**\nপদ্ধতি: {req['method']}\nটাকা: ৳{req['amount']}", reply_markup=InlineKeyboardMarkup(keyboard), parse_mode="Markdown")
        else:
            await query.edit_message_text(text="সেশন মেয়াদোত্তীর্ণ। আবার লগইন করুন।")

    elif data == "wd_approve":
        if pending_withdrawals:
            pending_withdrawals.pop(0)
        await query.edit_message_text(text="✅ উইথড্র রিকুয়েস্ট সফলভাবে **Approve** করা হয়েছে!", reply_markup=InlineKeyboardMarkup([[InlineKeyboardButton("⬅️ ব্যাক (এডমিন মেনু)", callback_data="admin_dashboard")]]))

    elif data == "wd_reject":
        if pending_withdrawals:
            pending_withdrawals.pop(0)
        await query.edit_message_text(text="❌ উইথড্র রিকুয়েস্ট **Reject** করা হয়েছে!", reply_markup=InlineKeyboardMarkup([[InlineKeyboardButton("⬅️ ব্যাক (এডমিন মেনু)", callback_data="admin_dashboard")]]))

    elif data == "admin_dashboard":
        if admin_logged_in.get(user_id, False):
            await show_admin_panel(query)
        else:
            await query.edit_message_text(text="সেশন মেয়াদোত্তীর্ণ।")

    elif data == "home":
        waiting_for_admin_pass[user_id] = False
        waiting_for_task_proof[user_id] = False
        await start(update, context)

async def show_admin_panel(query):
    task_count = len(pending_task_submissions)
    wd_count = len(pending_withdrawals)
    
    keyboard = [
        [InlineKeyboardButton(f"📥 সাবমিট হওয়া কাজ ({task_count})", callback_data="adm_tasks")],
        [InlineKeyboardButton(f"💸 উইথড্র রিকুয়েস্ট ({wd_count})", callback_data="adm_withdraws")],
        [InlineKeyboardButton("⬅️ ব্যাক (হোম)", callback_data="home")]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    text = (
        f"👑 **এডমিন কন্ট্রোল প্যানেল**\n"
        f"═════════════════════════\n\n"
        f"• পেন্ডিং কাজ জমা আছে: `{task_count} টি`\n"
        f"• পেন্ডিং উইথড্র আছে: `{wd_count} টি`"
    )
    await query.edit_message_text(text=text, reply_markup=reply_markup, parse_mode="Markdown")

# ৩. টেক্সট মেসেজ হ্যান্ডলার
async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = update.effective_user.id
    
    if waiting_for_admin_pass.get(user_id, False):
        password_input = update.message.text.strip()
        waiting_for_admin_pass[user_id] = False
        
        if password_input == ADMIN_PASSWORD:
            admin_logged_in[user_id] = True
            keyboard = [
                [InlineKeyboardButton("📥 সাবমিট হওয়া কাজ", callback_data="adm_tasks")],
                [InlineKeyboardButton("💸 উইথড্র রিকুয়েস্ট", callback_data="adm_withdraws")],
                [InlineKeyboardButton("⬅️ ব্যাক (হোম)", callback_data="home")]
            ]
            await update.message.reply_text("✅ পাসওয়ার্ড সঠিক! এডমিন প্যানেলে স্বাগতম।", reply_markup=InlineKeyboardMarkup(keyboard))
        else:
            keyboard = [[InlineKeyboardButton("🔄 আবার চেষ্টা করুন", callback_data="admin_login"), InlineKeyboardButton("⬅️ ব্যাক (হোম)", callback_data="home")]]
            await update.message.reply_text("❌ ভুল পাসওয়ার্ড! আবার চেষ্টা করুন।", reply_markup=InlineKeyboardMarkup(keyboard))
            
    elif waiting_for_task_proof.get(user_id, False):
        waiting_for_task_proof[user_id] = False
        pending_task_submissions.append({"user": user_id, "proof": update.message.text})
        user_data_db['tasks_review'] += 1
        
        keyboard = [[InlineKeyboardButton("📋 কাজের মেনু", callback_data="menu_tasks"), InlineKeyboardButton("⬅️ হোম মেনু", callback_data="home")]]
        await update.message.reply_text("✅ আপনার কাজের প্রুফ সফলভাবে জমা হয়েছে! এডমিন চেক করার পর ব্যালেন্স আপডেট করা হবে।", reply_markup=InlineKeyboardMarkup(keyboard))

if __name__ == "__main__":
    app = ApplicationBuilder().token(TOKEN).build()
    
    app.add_handler(CommandHandler("start", start))
    app.add_handler(CallbackQueryHandler(button_handler))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))
    
    print("বট সফলভাবে রান হচ্ছে...")
    app.run_polling()
