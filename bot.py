import random
import string
import time
import logging
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, ReplyKeyboardMarkup, KeyboardButton
from telegram.ext import ApplicationBuilder, ContextTypes, CommandHandler, CallbackQueryHandler, MessageHandler, filters

TOKEN = "8860755134:AAHyjyS0zcdMngYioi6xFTadtkBEsGWlCVk"

logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)

user_balances = {} 

ADMIN_PASSWORD = "102050"
admin_logged_in = {}
waiting_for_admin_pass = {}

user_current_gmail = {}
pending_task_submissions = [] 
pending_withdrawals = []

def get_user_data(user_id):
    if user_id not in user_balances:
        user_balances[user_id] = {
            "balance": 0.00,
            "pending_balance": 0.00,
            "tasks_review": 0,
            "tasks_completed": 0,
            "tasks_rejected": 0
        }
    return user_balances[user_id]

def generate_gmail_details():
    first_names = ["Rahim", "Karim", "Sakib", "Tamim", "Anik", "Nayeem", "Tanvir", "Fahim", "Imran", "Rakib", "Ashik", "Mehedi"]
    last_names = ["Hasan", "Ahmed", "Ali", "Khan", "Chowdhury", "Mahmud", "Sarker", "Hossain", "Mia"]
    f_name = random.choice(first_names)
    l_name = random.choice(last_names)
    random_num = random.randint(100, 9999)
    email = f"{f_name.lower()}.{l_name.lower()}{random_num}@gmail.com"
    password = ''.join(random.choices(string.ascii_letters + string.digits, k=10))
    return f_name, l_name, email, password

def get_reply_keyboard():
    keyboard = [
        [KeyboardButton("📋 কাজ"), KeyboardButton("💰 ব্যালেন্স")],
        [KeyboardButton("💳 উইথড্র"), KeyboardButton("👥 রেফার")],
        [KeyboardButton("👑 এডমিন প্যানেল")]
    ]
    return ReplyKeyboardMarkup(keyboard, resize_keyboard=True)

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    text = "স্বাগতম! কাজঘর বটে আপনাকে স্বাগতম। নিচের মেনু থেকে আপনার প্রয়োজনীয় অপশনটি বেছে নিন:"
    reply_markup = get_reply_keyboard()
    
    if update.message:
        await update.message.reply_text(text, reply_markup=reply_markup)
    elif update.callback_query:
        await update.callback_query.message.reply_text(text, reply_markup=reply_markup)

async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    text = update.message.text
    user_id = update.effective_user.id
    u_data = get_user_data(user_id)

    if waiting_for_admin_pass.get(user_id, False):
        pwd = text.strip()
        waiting_for_admin_pass[user_id] = False
        
        try:
            await update.message.delete()
        except:
            pass

        if pwd == ADMIN_PASSWORD:
            admin_logged_in[user_id] = True
            keyboard = [
                [InlineKeyboardButton(f"📥 জমা দেওয়া কাজ ({len(pending_task_submissions)})", callback_data="adm_tasks_0")],
                [InlineKeyboardButton(f"💸 উইথড্র রিকুয়েস্ট ({len(pending_withdrawals)})", callback_data="adm_wd_0")]
            ]
            await update.message.reply_text("✅ পাসওয়ার্ড সঠিক! এডমিন প্যানেল ওপেন হয়েছে:", reply_markup=InlineKeyboardMarkup(keyboard))
        else:
            await update.message.reply_text("❌ ভুল পাসওয়ার্ড! আপনি এডমিন নন।")
        return

    if text == "📋 কাজ":
        keyboard = [
            [InlineKeyboardButton("📧 জিমেইল কাজ (রেট: ১৩ টাকা)", callback_data="task_gmail")],
            [InlineKeyboardButton("📘 ফেসবুক কাজ", callback_data="task_facebook")],
            [InlineKeyboardButton("📸 ইন্সটাগ্রাম কাজ", callback_data="task_instagram")]
        ]
        await update.message.reply_text("দয়া করে নিচের তালিকা থেকে আপনার পছন্দের কাজটি বেছে নিন:", reply_markup=InlineKeyboardMarkup(keyboard))

    elif text == "💰 ব্যালেন্স":
        msg = (
            "💰 ব্যালেন্স বিবরণী:\n\n"
            f"• মূল ব্যালেন্স: ৳{u_data['balance']:.2f}\n"
            f"• পেন্ডিং ব্যালেন্স: ৳{u_data['pending_balance']:.2f}\n"
            f"• কাজ রিভিউতে আছে: {u_data['tasks_review']} টি\n"
            f"• কাজ সম্পূর্ণ হয়েছে: {u_data['tasks_completed']} টি\n"
            f"• কাজ রিজেক্ট হয়েছে: {u_data['tasks_rejected']} টি"
        )
        await update.message.reply_text(msg)

    elif text == "💳 উইথড্র":
        if u_data['balance'] < 50:
            await update.message.reply_text("⚠️ আপনার পর্যাপ্ত ব্যালেন্স নেই! সর্বনিম্ন উইথড্র ৫০ টাকা।")
        else:
            keyboard = [
                [InlineKeyboardButton("বিকাশ", callback_data="wd_bkash"), InlineKeyboardButton("নগদ", callback_data="wd_nagad")],
                [InlineKeyboardButton("রকেট", callback_data="wd_rocket")]
            ]
            await update.message.reply_text("💳 উইথড্র করতে পেমেন্ট মেথড সিলেক্ট করুন:\n⚠️ সর্বনিম্ন উইথড্র: ৫০ টাকা", reply_markup=InlineKeyboardMarkup(keyboard))

    elif text == "👥 রেফার":
        await update.message.reply_text("আপনার রেফার লিংক: https://t.me/your_bot?start=ref123")

    elif text == "👑 এডমিন প্যানেল":
        if admin_logged_in.get(user_id, False):
            keyboard = [
                [InlineKeyboardButton(f"📥 জমা দেওয়া কাজ ({len(pending_task_submissions)})", callback_data="adm_tasks_0")],
                [InlineKeyboardButton(f"💸 উইথড্র রিকুয়েস্ট ({len(pending_withdrawals)})", callback_data="adm_wd_0")]
            ]
            await update.message.reply_text("👑 এডমিন কন্ট্রোল প্যানেল", reply_markup=InlineKeyboardMarkup(keyboard))
        else:
            waiting_for_admin_pass[user_id] = True
            await update.message.reply_text("🔐 এডমিন প্যানেলে প্রবেশ করতে পাসওয়ার্ড লিখে পাঠান:")

async def button_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    data = query.data
    user_id = update.effective_user.id
    u_data = get_user_data(user_id)
    
    if data == "task_gmail" or data == "next_gmail":
        f_name, l_name, email, pwd = generate_gmail_details()
        user_current_gmail[user_id] = {"first_name": f_name, "last_name": l_name, "email": email, "password": pwd}
        
        keyboard = [
            [InlineKeyboardButton("🔄 অন্য জিমেইল নিন", callback_data="next_gmail")],
            [InlineKeyboardButton("📤 সাবমিট করুন", callback_data="submit_proof_direct")]
        ]
        text = (
            "📧 **জিমেইল ক্রিয়েট কাজ:**\n"
            f"• First Name: `{f_name}`\n"
            f"• Last Name: `{l_name}`\n"
            f"• Gmail: `{email}`\n"
            f"• Password: `{pwd}`\n\n"
            "রেট: ১৩ টাকা প্রতি কাজ। একাউন্ট তৈরি করে 'সাবমিট করুন' বাটনে চাপ দিন।"
        )
        await query.edit_message_text(text=text, reply_markup=InlineKeyboardMarkup(keyboard), parse_mode="Markdown")

    elif data == "submit_proof_direct":
        if user_id in user_current_gmail:
            g = user_current_gmail[user_id]
            task_info = {
                "user_id": user_id, 
                "first_name": g["first_name"], 
                "last_name": g["last_name"], 
                "email": g["email"], 
                "password": g["password"]
            }
            pending_task_submissions.append(task_info)
            u_data['tasks_review'] += 1
            
            await query.edit_message_text(text="✅ আপনার জিমেইল কাজের রিকুয়েস্ট সফলভাবে এডমিন প্যানেলে জমা হয়েছে!")
        else:
            await query.edit_message_text(text="⚠️ কোনো ডাটা পাওয়া যায়নি।")

    elif data in ["task_facebook", "task_instagram"]:
        await query.edit_message_text(text="এই কাজ বর্তমানে বন্ধ রয়েছে।")

    elif data in ["wd_bkash", "wd_nagad", "wd_rocket"]:
        if u_data['balance'] < 50:
            await query.edit_message_text(text="❌ পর্যাপ্ত ব্যালেন্স না থাকায় উইথড্র বাতিল করা হয়েছে।")
            return

        m_map = {"wd_bkash": "বিকাশ", "wd_nagad": "নগদ", "wd_rocket": "রকেট"}
        method = m_map[data]
        withdraw_amount = 50
        
        u_data['balance'] -= withdraw_amount
        u_data['pending_balance'] += withdraw_amount
        
        wd_info = {"user_id": user_id, "method": method, "amount": withdraw_amount}
        pending_withdrawals.append(wd_info)
        
        await query.edit_message_text(text=f"✅ সফল! আপনার {method}-এ {withdraw_amount} টাকার উইথড্র রিকুয়েস্ট এডমিন প্যানেলে জমা হয়েছে।")

    elif data.startswith("adm_tasks_"):
        if admin_logged_in.get(user_id, False):
            idx = int(data.split("_")[2])
            if not pending_task_submissions:
                await query.edit_message_text(text="📭 কোনো পেন্ডিং কাজ নেই।")
            else:
                if idx >= len(pending_task_submissions):
                    idx = 0
                task = pending_task_submissions[idx]
                
                nav_buttons = []
                if idx > 0:
                    nav_buttons.append(InlineKeyboardButton("⬅️ আগের", callback_data=f"adm_tasks_{idx-1}"))
                if idx < len(pending_task_submissions) - 1:
                    nav_buttons.append(InlineKeyboardButton("পরের ➡️", callback_data=f"adm_tasks_{idx+1}"))
                
                keyboard = [
                    [InlineKeyboardButton("✅ Approve", callback_data=f"t_app_{idx}"), InlineKeyboardButton("❌ Reject", callback_data=f"t_rej_{idx}")]
                ]
                if nav_buttons:
                    keyboard.append(nav_buttons)

                text = (
                    "👑 **এডমিন কন্ট্রোল প্যানেল**\n\n"
                    f"📥 **জমা দেওয়া কাজ [{idx+1} / {len(pending_task_submissions)}]**\n"
                    f"• টেলিগ্রাম UID: `{task['user_id']}`\n"
                    f"• First Name: `{task['first_name']}`\n"
                    f"• Last Name: `{task['last_name']}`\n"
                    f"• Email: `{task['email']}`\n"
                    f"• Password: `{task['password']}`"
                )
                await query.edit_message_text(text=text, reply_markup=InlineKeyboardMarkup(keyboard), parse_mode="Markdown")

    elif data.startswith("t_app_") or data.startswith("t_rej_"):
        if admin_logged_in.get(user_id, False):
            parts = data.split("_")
            action = parts[1]
            idx = int(parts[2])
            
            if idx < len(pending_task_submissions):
                task = pending_task_submissions.pop(idx) 
                target_user = task["user_id"]
                target_u_data = get_user_data(target_user)
                
                if action == "app":
                    target_u_data['tasks_review'] = max(0, target_u_data['tasks_review'] - 1)
                    target_u_data['tasks_completed'] += 1
                    target_u_data['balance'] += 13
                    try:
                        await context.bot.send_message(chat_id=target_user, text="🎉 অভিনন্দন! আপনার জিমেইল কাজটি সফলভাবে এপ্রুভ করা হয়েছে এবং ১৩ টাকা যোগ হয়েছে।")
                    except:
                        pass
                    msg = "✅ কাজ সফলভাবে এপ্রুভ করা হয়েছে!"
                else:
                    target_u_data['tasks_review'] = max(0, target_u_data['tasks_review'] - 1)
                    target_u_data['tasks_rejected'] += 1
                    try:
                        await context.bot.send_message(chat_id=target_user, text="❌ দুঃখিত, আপনার জিমেইল কাজটি রিজেক্ট করা হয়েছে।")
                    except:
                        pass
                    msg = "❌ কাজ রিজেক্ট করা হয়েছে!"
                
                await query.edit_message_text(text=msg)

    elif data.startswith("adm_wd_"):
        if admin_logged_in.get(user_id, False):
            idx = int(data.split("_")[2])
            if not pending_withdrawals:
                await query.edit_message_text(text="📭 কোনো উইথড্র রিকুয়েস্ট নেই।")
            else:
                if idx >= len(pending_withdrawals):
                    idx = 0
                wd = pending_withdrawals[idx]
                
                nav_buttons = []
                if idx > 0:
                    nav_buttons.append(InlineKeyboardButton("⬅️ আগের", callback_data=f"adm_wd_{idx-1}"))
                if idx < len(pending_withdrawals) - 1:
                    nav_buttons.append(InlineKeyboardButton("পরের ➡️", callback_data=f"adm_wd_{idx+1}"))
                
                keyboard = [
                    [InlineKeyboardButton("✅ Approve Withdraw", callback_data=f"wd_app_{idx}"), InlineKeyboardButton("❌ Reject Withdraw", callback_data=f"wd_rej_{idx}")]
                ]
                if nav_buttons:
                    keyboard.append(nav_buttons)

                text = (
                    "👑 **এডমিন কন্ট্রোল প্যানেল**\n\n"
                    f"💸 **উইথড্র রিকুয়েস্ট [{idx+1} / {len(pending_withdrawals)}]**\n"
                    f"• টেলিগ্রাম UID: `{wd['user_id']}`\n"
                    f"• পেমেন্ট মেথড: `{wd['method']}`\n"
                    f"• পরিমাণ: ৳`{wd['amount']}`"
                )
                await query.edit_message_text(text=text, reply_markup=InlineKeyboardMarkup(keyboard), parse_mode="Markdown")

    elif data.startswith("wd_app_") or data.startswith("wd_rej_"):
        if admin_logged_in.get(user_id, False):
            parts = data.split("_")
            action = parts[1]
            idx = int(parts[2])
            
            if idx < len(pending_withdrawals):
                wd = pending_withdrawals.pop(idx) 
                target_user = wd["user_id"]
                target_u_data = get_user_data(target_user)
                
                if action == "app":
                    target_u_data['pending_balance'] = max(0, target_u_data['pending_balance'] - wd['amount'])
                    try:
                        await context.bot.send_message(chat_id=target_user, text=f"🎉 আপনার {wd['amount']} টাকার উইথড্র রিকুয়েস্ট সফলভাবে পেমেন্ট করা হয়েছে!")
                    except:
                        pass
                    msg = "✅ উইথড্র এপ্রুভ করা হয়েছে!"
                else:
                    target_u_data['pending_balance'] = max(0, target_u_data['pending_balance'] - wd['amount'])
                    target_u_data['balance'] += wd['amount']
                    try:
                        await context.bot.send_message(chat_id=target_user, text=f"❌ আপনার উইথড্র রিকুয়েস্ট রিজেক্ট করা হয়েছে এবং টাকা ব্যালেন্সে ফেরত দেওয়া হয়েছে।")
                    except:
                        pass
                    msg = "❌ উইথড্র রিজেক্ট করা হয়েছে!"
                
                await query.edit_message_text(text=msg)

if __name__ == "__main__":
    app = ApplicationBuilder().token(TOKEN).build()
    
    app.add_handler(CommandHandler("start", start))
    app.add_handler(CallbackQueryHandler(button_handler))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))
    
    print("🤖 বট সফলভাবে ২৪ ঘণ্টা লাইভ এবং আনলিমিটেড পেন্ডিং লিস্ট মোডে রান হচ্ছে...")
    
    while True:
        try:
            app.run_polling(drop_pending_updates=True)
        except Exception as e:
            print(f"⚠️ সংযোগ সমস্যা: {e}. ৫ সেকেন্ড পর রিকানেক্ট করা হচ্ছে...")
            time.sleep(5)
