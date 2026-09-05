import telebot
from telebot import types

TOKEN = '8750150015:AAGGkj93aC-HvXCxWM9WzIaPTRFeexkmQ8c'
bot = telebot.TeleBot(TOKEN)

ADMIN_USERNAME = "@YourAdminUsername"
ADMIN_CHAT_ID = 8049855208  

# আনলিমিটেড জিমেইল, নাম ও পাসওয়ার্ডের তালিকা
GMAIL_TASK_LIST = [
    {"firstname": "Rahim", "lastname": "Uddin", "gmail": "rahim.task2026@gmail.com", "pass": "Pass@1122"},
    {"firstname": "Karim", "lastname": "Khan", "gmail": "karim.job2026@gmail.com", "pass": "Secure#3344"},
    {"firstname": "Tanvir", "lastname": "Ahmed", "gmail": "tanvir.work2026@gmail.com", "pass": "Task*5566"},
    {"firstname": "Sakib", "lastname": "Hasan", "gmail": "sakib.gmail2026@gmail.com", "pass": "Gmail!7788"},
    {"firstname": "Rakibul", "lastname": "Islam", "gmail": "rakib.mail2026@gmail.com", "pass": "Pass#9900"},
    {"firstname": "Nayeem", "lastname": "Hossain", "gmail": "nayeem.task2026@gmail.com", "pass": "Nayeem@123"},
    {"firstname": "Fahim", "lastname": "Mondal", "gmail": "fahim.work2026@gmail.com", "pass": "Fahim#456"},
    {"firstname": "Imran", "lastname": "Ali", "gmail": "imran.mail2026@gmail.com", "pass": "Imran*789"},
    {"firstname": "Jahid", "lastname": "Hasan", "gmail": "jahid.task2026@gmail.com", "pass": "Jahid!321"},
    {"firstname": "Shohidul", "lastname": "Islam", "gmail": "shohidul.2026@gmail.com", "pass": "Shohid@654"}
]

user_states = {}
user_task_indices = {} 
income_balances = {}  
pending_tasks = {}    
completed_tasks = {}  
rejected_tasks = {}   

def get_main_menu():
    markup = types.ReplyKeyboardMarkup(resize_keyboard=True, row_width=2)
    btn_work = types.KeyboardButton("📋 কাজ")
    btn_balance = types.KeyboardButton("💰 ব্যালেন্স")
    btn_withdraw = types.KeyboardButton("💳 উইথড্র")
    btn_lang = types.KeyboardButton("🌐 ভাষা")
    btn_admin = types.KeyboardButton("⚙️ এডমিন প্যানেল")
    markup.add(btn_work, btn_balance, btn_withdraw, btn_lang, btn_admin)
    return markup

@bot.message_handler(commands=['start', 'help'])
def send_welcome(message):
    bot.send_message(
        message.chat.id, 
        "✨ **WELCOME TO INSTANT TASK PAY** ✨\n\nআপনাদের স্বাগতম! নিচের অপশনগুলো থেকে নির্বাচন করুন:", 
        reply_markup=get_main_menu(), 
        parse_mode="Markdown"
    )

@bot.message_handler(func=lambda message: True)
def handle_message(message):
    chat_id = message.chat.id
    text = message.text

    if text == "🔙 ব্যাক" or text == "মূল মেনু":
        if chat_id in user_states:
            del user_states[chat_id]
        bot.send_message(chat_id, "মূল মেনুতে ফিরে এসেছেন:", reply_markup=get_main_menu())
        return

    if text == "📋 কাজ":
        current_index = user_task_indices.get(chat_id, 0)
        if current_index >= len(GMAIL_TASK_LIST):
            current_index = 0
            user_task_indices[chat_id] = 0

        task_data = GMAIL_TASK_LIST[current_index]
        user_states[chat_id] = {"state": "submitting_task", "task_info": task_data}

        markup = types.ReplyKeyboardMarkup(resize_keyboard=True)
        markup.add(types.KeyboardButton("📤 সাবমিট"), types.KeyboardButton("🔙 ব্যাক"))

        task_text = (
            "📋 **উপলব্ধ জিমেইল কাজ (রেট: ১৩ টাকা):**\n\n"
            "দয়া করে নিচের তথ্যগুলো দিয়ে জিমেইল অ্যাকাউন্ট তৈরি করুন এবং কাজ শেষ করে নিচে **'📤 সাবমিট'** বাটনে ক্লিক করুন:\n\n"
            f"🔹 **First Name:** `{task_data['firstname']}`\n"
            f"🔹 **Last Name:** `{task_data['lastname']}`\n"
            f"🔹 **Gmail:** `{task_data['gmail']}`\n"
            f"🔹 **Password:** `{task_data['pass']}`"
        )
        bot.send_message(chat_id, task_text, reply_markup=markup, parse_mode="Markdown")
    
    elif text == "📤 সাবমিট":
        if chat_id in user_states and isinstance(user_states[chat_id], dict) and user_states[chat_id].get("state") == "submitting_task":
            task_info = user_states[chat_id]["task_info"]
            
            curr_idx = user_task_indices.get(chat_id, 0)
            user_task_indices[chat_id] = curr_idx + 1

            curr_pending = pending_tasks.get(chat_id, 0)
            pending_tasks[chat_id] = curr_pending + 1

            bot.send_message(
                chat_id, 
                "✅ **আপনার জিমেইল সফলভাবে সাবমিট হয়েছে!** 🎉\n\nটাস্কটি পেন্ডিং লিস্টে জমা হয়েছে। এডমিন চেক করার পর ব্যালেন্স যুক্ত হবে।", 
                reply_markup=get_main_menu(),
                parse_mode="Markdown"
            )
            
            admin_msg = (
                "📥 **নতুন জিমেইল সাবমিশন এসেছে!**\n\n"
                f"👤 **User ID:** `{chat_id}`\n"
                f"🔹 **First Name:** `{task_info['firstname']}`\n"
                f"🔹 **Last Name:** `{task_info['lastname']}`\n"
                f"🔹 **Gmail:** `{task_info['gmail']}`\n"
                f"🔹 **Password:** `{task_info['pass']}`"
            )
            
            admin_markup = types.InlineKeyboardMarkup()
            btn_approve = types.InlineKeyboardButton("✅ Approve", callback_data=f"approve_{chat_id}")
            btn_reject = types.InlineKeyboardButton("❌ Reject", callback_data=f"reject_{chat_id}")
            admin_markup.add(btn_approve, btn_reject)
            
            bot.send_message(ADMIN_CHAT_ID, admin_msg, reply_markup=admin_markup, parse_mode="Markdown")
            del user_states[chat_id]
        else:
            bot.reply_to(message, "আগে '📋 কাজ' থেকে কাজ শুরু করুন।", reply_markup=get_main_menu())

    elif text == "💰 ব্যালেন্স":
        income = income_balances.get(chat_id, 0.0)
        pending = pending_tasks.get(chat_id, 0)
        completed = completed_tasks.get(chat_id, 0)
        rejected = rejected_tasks.get(chat_id, 0)
        
        balance_text = (
            "📊 **আপনার একাউন্ট স্ট্যাটাস ও হিস্ট্রি:**\n\n"
            f"💰 **ইনকাম ব্যালেন্স:** ৳{income:.2f}\n"
            f"⏳ **কাজ রিমুভ / পেন্ডিং:** {pending} টি\n"
            f"✅ **কাজ সম্পন্ন:** {completed} টি\n"
            f"❌ **কাজ রিজেক্ট:** {rejected} টি"
        )
        bot.reply_to(message, balance_text, parse_mode="Markdown")
        
    elif text == "💳 উইথড্র":
        income = income_balances.get(chat_id, 0.0)
        if income < 80.0:
            bot.reply_to(message, f"💳 আপনার ইনকাম ব্যালেন্স ৳{income:.2f}।\n\n❌ সর্বনিম্ন উইথড্র **৳৮০ টাকা**। আপনার একাউন্টে পর্যাপ্ত ব্যালেন্স নেই।", parse_mode="Markdown")
        else:
            markup = types.InlineKeyboardMarkup()
            btn_bkash = types.InlineKeyboardButton("🔴 বিকাশ (Bkash)", callback_data="withdraw_bkash")
            btn_nagad = types.InlineKeyboardButton("🟠 নগদ (Nagad)", callback_data="withdraw_nagad")
            btn_rocket = types.InlineKeyboardButton("🟣 রকেট (Rocket)", callback_data="withdraw_rocket")
            markup.add(btn_bkash, btn_nagad, btn_rocket)
            
            bot.send_message(
                chat_id, 
                f"💳 আপনার ইনকাম ব্যালেন্স: ৳{income:.2f}\n\nদয়া করে আপনার পেমেন্ট মাধ্যমটি সিলেক্ট করুন:",
                reply_markup=markup,
                parse_mode="Markdown"
            )
        
    elif text == "🌐 ভাষা":
        bot.reply_to(message, "🇧🇩 ভাষা নির্বাচন করুন: বাংলা / English")
        
    elif text == "⚙️ এডমিন প্যানেল":
        admin_text = f"⚙️ **এডমিন প্যানেল ও যোগাযোগ**\n\nযে কোনো প্রয়োজনে সরাসরি এডমিনের সাথে যোগাযোগ করুন:\n👉 Telegram: {ADMIN_USERNAME}"
        bot.reply_to(message, admin_text, parse_mode="Markdown")
        
    else:
        if chat_id in user_states:
            user_data = user_states[chat_id]
            if isinstance(user_data, str) and user_data.startswith("withdraw_"):
                method_code = user_data.split("_")[1]
                method_name = "বিকাশ" if method_code == "bkash" else ("নগদ" if method_code == "nagad" else "রকেট")
                account_info = text.strip()
                
                income_balances[chat_id] = 0.0
                
                bot.send_message(
                    chat_id, 
                    f"✅ **আপনার উইথড্র রিকোয়েস্ট সফলভাবে জমা হয়েছে!** 🎉\n\nপেমেন্ট মাধ্যম: {method_name}\nএকাউন্ট নম্বর: `{account_info}`\n\nএডমিন চেক করে পেমেন্ট পাঠিয়ে দেবেন।",
                    reply_markup=get_main_menu(),
                    parse_mode="Markdown"
                )
                
                admin_withdraw_msg = (
                    "💸 **নতুন উইথড্র রিকোয়েস্ট এসেছে!**\n\n"
                    f"👤 **User ID:** `{chat_id}`\n"
                    f"💳 **মেথড:** {method_name}\n"
                    f"📞 **নম্বর/একাউন্ট:** `{account_info}`"
                )
                bot.send_message(ADMIN_CHAT_ID, admin_withdraw_msg, parse_mode="Markdown")
                del user_states[chat_id]
        else:
            bot.reply_to(message, "দয়া করে নিচের মেনু বাটনগুলো ব্যবহার করুন।", reply_markup=get_main_menu())

@bot.callback_query_handler(func=lambda call: True)
def callback_query(call):
    data = call.data
    chat_id = call.message.chat.id

    if data == "withdraw_bkash" or data == "withdraw_nagad" or data == "withdraw_rocket":
        m_code = data.split("_")[1]
        m_name = "বিকাশ (Bkash)" if m_code == "bkash" else ("নগদ (Nagad)" if m_code == "nagad" else "রকেট (Rocket)")
        user_states[chat_id] = data
        
        markup = types.ReplyKeyboardMarkup(resize_keyboard=True)
        markup.add(types.KeyboardButton("🔙 ব্যাক"))
        
        bot.answer_callback_query(call.id)
        bot.send_message(
            chat_id,
            f"📥 **{m_name} উইথড্র ফর্ম**\n\nদয়া করে আপনার একাউন্ট নম্বরটি লিখে পাঠান:",
            reply_markup=markup,
            parse_mode="Markdown"
        )

    elif data.startswith("approve_"):
        target_user_id = int(data.split("_")[1])
        
        curr_pending = pending_tasks.get(target_user_id, 1)
        pending_tasks[target_user_id] = max(0, curr_pending - 1)
        
        curr_comp = completed_tasks.get(target_user_id, 0)
        completed_tasks[target_user_id] = curr_comp + 1
        
        curr_income = income_balances.get(target_user_id, 0.0)
        income_balances[target_user_id] = curr_income + 13.0
        
        bot.answer_callback_query(call.id, "টাস্ক সফলভাবে এপ্রুভ করা হয়েছে!")
        bot.edit_message_text(
            f"{call.message.text}\n\n✅ **Status: Approved [৳13 Added & Completed]**", 
            chat_id, 
            call.message.message_id, 
            parse_mode="Markdown"
        )
        bot.send_message(target_user_id, "🎉 অভিনন্দন! আপনার জিমেইল টাস্কটি এডমিন কর্তৃক **এপ্রুভ** হয়েছে এবং ইনকাম ব্যালেন্সে ১৩ টাকা যোগ হয়েছে।")

    elif data.startswith("reject_"):
        target_user_id = int(data.split("_")[1])
        
        curr_pending = pending_tasks.get(target_user_id, 1)
        pending_tasks[target_user_id] = max(0, curr_pending - 1)
        
        curr_rej = rejected_tasks.get(target_user_id, 0)
        rejected_tasks[target_user_id] = curr_rej + 1
        
        bot.answer_callback_query(call.id, "টাস্ক রিজেক্ট করা হয়েছে।")
        bot.edit_message_text(
            f"{call.message.text}\n\n❌ **Status: Rejected**", 
            chat_id, 
            call.message.message_id, 
            parse_mode="Markdown"
        )
        bot.send_message(target_user_id, "❌ দুঃখিত! আপনার জিমেইল টাস্কটি সঠিক না থাকায় এডমিন কর্তৃক **রিজেক্ট** করা হয়েছে।")

if __name__ == '__main__':
    print("Bot is running...")
    bot.infinity_polling()
