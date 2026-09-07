import random
import string
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import ApplicationBuilder, ContextTypes, CommandHandler, CallbackQueryHandler, MessageHandler, filters

TOKEN = "8860755134:AAHyjyS0zcdMngYioi6xFTadtkBEsGWlCVk"

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

# ইউজারের বর্তমান জিমেইল ডাটা সাময়িকভাবে ধরে রাখার জন্য
user_current_gmail = {}

pending_task_submissions = [] 
pending_withdrawals = []

# আনলিমিটেড অটো র্যান্ডম জিমেইল ডেটা জেনারেটর ফাংশন
def generate_gmail_details():
    first_names = ["Rahim", "Karim", "Sakib", "Tamim", "Anik", "Nayeem", "Tanvir", "Fahim", "Imran", "Rakib", "Ashik", "Mehedi", "Faisal", "Jahid", "Sumon", "Nasir"]
    last_names = ["Hasan", "Ahmed", "Ali", "Khan", "Chowdhury", "Mahmud", "Sarker", "Hossain", "Mia", "Talukder", "Molla", "Biswas", "Siddique", "Rahman"]
    
    f_name = random.choice(first_names)
    l_name = random.choice(last_names)
    random_num = random.randint(100, 9999)
    
    email = f"{f_name.lower()}.{l_name.lower()}{random_num}@gmail.com"
    password = ''.join(random.choices(string.ascii_letters + string.digits, k=10))
    
    return f_name, l_name, email, password

# ১. হোম স্ক্রিন মেনু (নিচে সুন্দর করে সাজানো ইনবক্স বাটনসহ)
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = update.effective_user.id
    waiting_for_task_proof[user_id] = False
    
    keyboard = [
        [InlineKeyboardButton("📋 কাজ", callback_data="menu_tasks")],
        [InlineKeyboardButton("💰 ব্যালেন্স", callback_data="balance")],
        [InlineKeyboardButton("💳 উইথড্র ব্যালেন্স", callback_data="withdraw")],
        [InlineKeyboardButton("🌐 ভাষা পরিবর্তন", callback_data="language")],
        [InlineKeyboardButton("👥 রেফার", callback_data="refer")],
        [InlineKeyboardButton("📥 ইনবক্স (গডের ফাইল)", callback_data="admin_login")]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    text = "✨ **স্বাগতম!** কাজঘর বটে আপনাকে স্বাগতম। নিচে থেকে আপনার প্রয়োজনীয় অপশনটি বেছে নিন:"
    if update.message:
        await update.message.reply_text(text, reply_markup=reply_markup, parse_mode="Markdown")
    elif update.callback_query:
        await update.callback_query.message.edit_text(text, reply_markup=reply_markup, parse_mode="Markdown")

# ২. মেইন বাটন এবং পেজ সুইচিং হ্যান্ডলার
async def button_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    data = query.data
    user_id = update.effective_user.id
    
    # কাজ অপশন (হোম পেজ রিমুভ হয়ে কাজের বাটনগুলো আসবে)
    if data == "menu_tasks":
        waiting_for_task_proof[user_id] = False
        keyboard = [
            [InlineKeyboardButton("📧 জিমেইল কাজ (রেট: ১৩ টাকা)", callback_data="task_gmail")],
            [InlineKeyboardButton("📘 ফেসবুক কাজ", callback_data="task_facebook")],
            [InlineKeyboardButton("📸 ইন্সটাগ্রাম কাজ", callback_data="task_instagram")],
            [InlineKeyboardButton("⬅️ হোম পেজে ফিরে যান", callback_data="home")]
        ]
        await query.edit_message_text(text="🎯 **কাজের তালিকা:**\nদয়া করে নিচের তালিকা থেকে আপনার পছন্দের কাজটি বেছে নিন:", reply_markup=InlineKeyboardMarkup(keyboard), parse_mode="Markdown")
        
    elif data == "task_gmail" or data == "next_gmail":
        is_task_active = True 
        
        if not is_task_active:
            keyboard = [[InlineKeyboardButton("⬅️ ব্যাক", callback_data="menu_tasks")]]
            await query.edit_message_text(text="⚠️ **জিমেইলের কাজ:**\nএই কাজ বর্তমানে বন্ধ আছে। পরবর্তীতে চালু করা হবে।", reply_markup=InlineKeyboardMarkup(keyboard), parse_mode="Markdown")
        else:
            waiting_for_task_proof[user_id] = False
            
            f_name, l_name, email, pwd = generate_gmail_details()
            
            user_current_gmail[user_id] = {
                "first_name": f_name,
                "last_name": l_name,
                "email": email,
                "password": pwd
            }
            
            keyboard = [
                [InlineKeyboardButton("🔄 অন্য জিমেইল নিন (Change)", callback_data="next_gmail")],
                [InlineKeyboardButton("📤 সাবমিট করুন", callback_data="submit_proof_direct"), InlineKeyboardButton("❌ ক্যানসেল", callback_data="cancel_task")],
                [InlineKeyboardButton("⬅️ কাজের মেনুতে যান", callback_data="menu_tasks")]
            ]
            text = (
                "📧 **জিমেইল ক্রিয়েট কাজ ফরম:**\n"
                "━━━━━━━━━━━━━━━━━━━\n"
                f"• **First Name:** `{f_name}`\n"
                f"• **Last Name:** `{l_name}`\n"
                f"• **Gmail:** `{email}`\n"
                f"• **Password:** `{pwd}`\n\n"
                f"📌 **রেট:** ১৩ টাকা প্রতি কাজ\n"
                "💡 *উপরে দেওয়া তথ্য দিয়ে জিমেইল অ্যাকাউন্ট তৈরি করার পর সরাসরি নিচে **'সাবমিট করুন'** বাটনে ক্লিক করুন।*"
            )
            await query.edit_message_text(text=text, reply_markup=InlineKeyboardMarkup(keyboard), parse_mode="Markdown")

    elif data == "submit_proof_direct":
        if user_id in user_current_gmail:
            gmail_info = user_current_gmail[user_id]
            
            pending_task_submissions.append({
                "user_id": user_id,
                "first_name": gmail_info["first_name"],
                "last_name": gmail_info["last_name"],
                "email": gmail_info["email"],
                "password": gmail_info["password"]
            })
            user_data_db['tasks_review'] += 1
            
            keyboard = [[InlineKeyboardButton("📋 কাজের মেনু", callback_data="menu_tasks"), InlineKeyboardButton("⬅️ হোম পেজ", callback_data="home")]]
            await query.edit_message_text(
                text="✅ আপনার জিমেইল অ্যাকাউন্ট তৈরির রিকুয়েস্ট সফলভাবে এডমিনের কাছে পাঠানো হয়েছে!\nএডমিন চেক করার পর আপনার ব্যালেন্স আপডেট করে দেওয়া হবে।", 
                reply_markup=InlineKeyboardMarkup(keyboard)
            )
        else:
            keyboard = [[InlineKeyboardButton("🔄 জিমেইল নিন", callback_data="task_gmail"), InlineKeyboardButton("⬅️ হোম পেজ", callback_data="home")]]
            await query.edit_message_text(text="⚠️ কোনো জিমেইল ডাটা পাওয়া যায়নি। দয়া করে নতুন করে জিমেইল নিন।", reply_markup=InlineKeyboardMarkup(keyboard))

    elif data in ["task_facebook", "task_instagram"]:
        waiting_for_task_proof[user_id] = False
        task_name = "ফেসবুক" if data=="task_facebook" else "ইন্সটাগ্রাম"
        keyboard = [
            [InlineKeyboardButton("📤 সাবমিট করুন", callback_data="submit_proof_direct"), InlineKeyboardButton("❌ ক্যানসেল", callback_data="cancel_task")],
            [InlineKeyboardButton("⬅️ ব্যাক", callback_data="menu_tasks")]
        ]
        await query.edit_message_text(text=f"📋 **{task_name} কাজ:**\n━━━━━━━━━━━━━━━━━━━\nএই কাজ বর্তমানে বন্ধ রয়েছে।", reply_markup=InlineKeyboardMarkup(keyboard), parse_mode="Markdown")

    elif data == "cancel_task":
        waiting_for_task_proof[user_id] = False
        keyboard = [[InlineKeyboardButton("📋 কাজের মেনু", callback_data="menu_tasks"), InlineKeyboardButton("⬅️ হোম পেজ", callback_data="home")]]
        await query.edit_message_text(text="❌ কাজটি বাতিল করা হয়েছে।", reply_markup=InlineKeyboardMarkup(keyboard))

    # ব্যালেন্স অপশন
    elif data == "balance":
        waiting_for_task_proof[user_id] = False
        keyboard = [
            [InlineKeyboardButton("💳 উইথড্র করুন", callback_data="withdraw")],
            [InlineKeyboardButton("⬅️ হোম পেজে ফিরে যান", callback_data="home")]
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
            [InlineKeyboardButton("⬅️ হোম পেজে ফিরে যান", callback_data="home")]
        ]
        await query.edit_message_text(text="💳 **উইথড্র সেকশন:**\nপেমেন্ট নেওয়ার জন্য আপনার পছন্দের মাধ্যমটি সিলেক্ট করুন。\n\n⚠️ *সর্বনিম্ন উইথড্র: ৫০ টাকা*", reply_markup=InlineKeyboardMarkup(keyboard), parse_mode="Markdown")

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
            [InlineKeyboardButton("⬅️ হোম পেজে ফিরে যান", callback_data="home")]
        ]
        await query.edit_message_text(text="🌐 ভাষা নির্বাচন করুন / Select your language:", reply_markup=InlineKeyboardMarkup(keyboard))

    elif data in ["lang_bn", "lang_en"]:
        keyboard = [[InlineKeyboardButton("⬅️ হোম পেজে ফিরে যান", callback_data="home")]]
        await query.edit_message_text(text="✅ ভাষা সফলভাবে পরিবর্তন করা হয়েছে!", reply_markup=InlineKeyboardMarkup(keyboard))

    # রেফার অপশন
    elif data == "refer":
        waiting_for_task_proof[user_id] = False
        keyboard = [[InlineKeyboardButton("⬅️ হোম পেজে ফিরে যান", callback_data="home")]]
        text = (
            "👥 **রেফার ও আয় করুন:**\n"
            "━━━━━━━━━━━━━━━━━━━\n"
            "আপনার রেফার কোড: `KAJ12345`\n"
            "রেফার লিংক:\n`https://t.me/your_bot?start=KAJ12345`"
        )
        await query.edit_message_text(text=text, reply_markup=InlineKeyboardMarkup(keyboard), parse_mode="Markdown")

    # ইনবক্স / গডের ফাইল (God File / Admin Panel) লগইন ও ড্যাশবোর্ড
    elif data == "admin_login":
        waiting_for_task_proof[user_id] = False
        if admin_logged_in.get(user_id, False):
            await show_admin_panel(query)
        else:
            waiting_for_admin_pass[user_id] = True
            keyboard = [[InlineKeyboardButton("⬅️ হোম পেজে ফিরে যান", callback_data="home")]]
            await query.edit_message_text(text="🔐 **ইনবক্স সিকিউরিটি (গডের ফাইল):**\nদয়া করে পাসওয়ার্ডটি চ্যাটে লিখে পাঠান:", reply_markup=InlineKeyboardMarkup(keyboard), parse_mode="Markdown")

    elif data == "adm_tasks":
        if admin_logged_in.get(user_id, False):
            if not pending_task_submissions:
                keyboard = [[InlineKeyboardButton("⬅️ ইনবক্স মেনুতে যান", callback_data="admin_dashboard")]]
                await query.edit_message_text(text="📭 ইনবক্সে এই মুহূর্তে কোনো নতুন জিমেইল কাজের সাবমিশন জমা নেই।", reply_markup=InlineKeyboardMarkup(keyboard))
            else:
                task = pending_task_submissions[0]
                keyboard = [
                    [InlineKeyboardButton("✅ Approve", callback_data="task_approve"), InlineKeyboardButton("❌ Reject", callback_data="task_reject")],
                    [InlineKeyboardButton("⬅️ ইনবক্স মেনুতে যান", callback_data="admin_dashboard")]
                ]
                text = (
                    "📥 **ইনবক্স - নতুন জিমেইল সাবমিশন:**\n"
                    "━━━━━━━━━━━━━━━━━━━\n"
                    f"👤 ইউজার আইডি: `{task['user_id']}`\n"
                    f"• **First Name:** `{task['first_name']}`\n"
                    f"• **Last Name:** `{task['last_name']}`\n"
                    f"• **Gmail:** `{task['email']}`\n"
                    f"• **Password:** `{task['password']}`\n"
                    "━━━━━━━━━━━━━━━━━━━"
                )
                await query.edit_message_text(text=text, reply_markup=InlineKeyboardMarkup(keyboard), parse_mode="Markdown")
        else:
            await query.edit_message_text(text="সেশন মেয়াদোত্তীর্ণ। আবার লগইন করুন।")

    elif data == "task_approve":
        if pending_task_submissions:
            pending_task_submissions.pop(0)
            user_data_db['tasks_completed'] += 1
            user_data_db['balance'] += 13
        await query.edit_message_text(text="✅ জিমেইল কাজটি সফলভাবে **Approve** করা হয়েছে!", reply_markup=InlineKeyboardMarkup([[InlineKeyboardButton("⬅️ ইনবক্স মেনুতে যান", callback_data="admin_dashboard")]]))

    elif data == "task_reject":
        if pending_task_submissions:
            pending_task_submissions.pop(0)
            user_data_db['tasks_rejected'] += 1
        await query.edit_message_text(text="❌ জিমেইল কাজটি **Reject** করা হয়েছে!", reply_markup=InlineKeyboardMarkup([[InlineKeyboardButton("⬅️ ইনবক্স মেনুতে যান", callback_data="admin_dashboard")]]))

    elif data == "adm_withdraws":
        if admin_logged_in.get(user_id, False):
            if not pending_withdrawals:
                keyboard = [[InlineKeyboardButton("⬅️ ইনবক্স মেনুতে যান", callback_data="admin_dashboard")]]
                await query.edit_message_text(text="📭 এই মুহূর্তে কোনো উইথড্র রিকুয়েস্ট নেই।", reply_markup=InlineKeyboardMarkup(keyboard))
            else:
                req = pending_withdrawals[0]
                keyboard = [
                    [InlineKeyboardButton("✅ Approve", callback_data="wd_approve"), InlineKeyboardButton("❌ Reject", callback_data="wd_reject")],
                    [InlineKeyboardButton("⬅️ ইনবক্স মেনুতে যান", callback_data="admin_dashboard")]
                ]
                await query.edit_message_text(text=f"💸 **উইথড্র রিকুয়েস্ট:**\nপদ্ধতি: {req['method']}\nটাকা: ৳{req['amount']}", reply_markup=InlineKeyboardMarkup(keyboard), parse_mode="Markdown")
        else:
            await query.edit_message_text(text="সেশন মেয়াদোত্তীর্ণ। আবার লগইন করুন।")

    elif data == "wd_approve":
        if pending_withdrawals:
            pending_withdrawals.pop(0)
        await query.edit_message_text(text="✅ উইথড্র রিকুয়েস্ট সফলভাবে **Approve** করা হয়েছে!", reply_markup=InlineKeyboardMarkup([[InlineKeyboardButton("⬅️ ইনবক্স মেনুতে যান", callback_data="admin_dashboard")]]))

    elif data == "wd_reject":
        if pending_withdrawals:
            pending_withdrawals.pop(0)
        await query.edit_message_text(text="❌ উইথড্র রিকুয়েস্ট **Reject** করা হয়েছে!", reply_markup=InlineKeyboardMarkup([[InlineKeyboardButton("⬅️ ইনবক্স মেনুতে যান", callback_data="admin_dashboard")]]))

    elif data == "admin_dashboard":
        if admin_logged_in.get(user_id, False):
            await show_admin_panel(query)
        else:
            await query.edit_message_text(text="সেশন মেয়াদোত্তীর্ণ।")

    # হোম পেজে ফিরে যাওয়ার বাটন
    elif data == "home":
        waiting_for_admin_pass[user_id] = False
        waiting_for_task_proof[user_id] = False
        await start(update, context)

async def show_admin_panel(query):
    task_count = len(pending_task_submissions)
    wd_count = len(pending_withdrawals)
    
    keyboard = [
        [InlineKeyboardButton(f"📥 সাবমিট হওয়া জিমেইল কাজ ({task_count})", callback_data="adm_tasks")],
        [InlineKeyboardButton(f"💸 উইথড্র রিকুয়েস্ট ({wd_count})", callback_data="adm_withdraws")],
        [InlineKeyboardButton("⬅️ হোম পেজে ফিরে যান", callback_data="home")]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    text = (
        f"👑 **ইনবক্স / গডের ফাইল (God File)**\n"
        f"═════════════════════════\n\n"
        f"• পেন্ডিং জিমেইল জমা আছে: `{task_count} টি`\n"
        f"• পেন্ডিং উইথড্র আছে: `{wd_count} টি`"
    )
    await query.edit_message_text(text=text, reply_markup=reply_markup, parse_mode="Markdown")

# ৩. টেক্সট মেসেজ হ্যান্ডলার (পাসওয়ার্ড চেক করার জন্য)
async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = update.effective_user.id
    
    if waiting_for_admin_pass.get(user_id, False):
        password_input = update.message.text.strip()
        waiting_for_admin_pass[user_id] = False
        
        if password_input == ADMIN_PASSWORD:
            admin_logged_in[user_id] = True
            keyboard = [
                [InlineKeyboardButton("📥 সাবমিট হওয়া জিমেইল কাজ", callback_data="adm_tasks")],
                [InlineKeyboardButton("💸 উইথড্র রিকুয়েস্ট", callback_data="adm_withdraws")],
                [InlineKeyboardButton("⬅️ হোম পেজে ফিরে যান", callback_data="home")]
            ]
            await update.message.reply_text("✅ পাসওয়ার্ড সঠিক! ইনবক্স (গডের ফাইল) ওপেন হয়েছে।", reply_markup=InlineKeyboardMarkup(keyboard))
        else:
            keyboard = [[InlineKeyboardButton("🔄 আবার চেষ্টা করুন", callback_data="admin_login"), InlineKeyboardButton("⬅️ হোম পেজে ফিরে যান", callback_data="home")]]
            await update.message.reply_text("❌ ভুল পাসওয়ার্ড! আবার চেষ্টা করুন।", reply_markup=InlineKeyboardMarkup(keyboard))

if __name__ == "__main__":
    app = ApplicationBuilder().token(TOKEN).build()
    
    app.add_handler(CommandHandler("start", start))
    app.add_handler(CallbackQueryHandler(button_handler))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))
    
    print("বট সফলভাবে রান হচ্ছে...")
    app.run_polling()
