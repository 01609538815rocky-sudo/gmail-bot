import telebot
from telebot import types

TOKEN = '8750150015:AAGGkj93aC-HvXCxWM9WzIaPTRFeexkmQ8c'
bot = telebot.TeleBot(TOKEN)

ADMIN_USERNAME = "@YourAdminUsername"
ADMIN_CHAT_ID = 8049855208  

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
user_languages = {}   

def get_main_menu(lang="bn"):
    markup = types.ReplyKeyboardMarkup(resize_keyboard=True, row_width=2)
    if lang == "en":
        btn_work = types.KeyboardButton("🚀 Available Tasks")
        btn_balance = types.KeyboardButton("💎 My Balance")
        btn_withdraw = types.KeyboardButton("💸 Withdraw")
        btn_lang = types.KeyboardButton("🌐 Language")
        btn_admin = types.KeyboardButton("🛡️ Admin Support")
    else:
        btn_work = types.KeyboardButton("🚀 কাজ শুরু করুন")
        btn_balance = types.KeyboardButton("💎 আমার ব্যালেন্স")
        btn_withdraw = types.KeyboardButton("💸 উইথড্র করুন")
        btn_lang = types.KeyboardButton("🌐 ভাষা পরিবর্তন")
        btn_admin = types.KeyboardButton("🛡️ এডমিন সাপোর্ট")
        
    markup.add(btn_work, btn_balance, btn_withdraw, btn_lang, btn_admin)
    return markup

@bot.message_handler(commands=['start', 'help'])
def send_welcome(message):
    chat_id = message.chat.id
    lang = user_languages.get(chat_id, "bn")
    welcome_text = (
        "🌟 **WELCOME TO PREMIUM TASK PAY** 🌟\n\n"
        "✨ ঘরে বসে খুব সহজেই ছোট ছোট টাস্ক সম্পন্ন করে আয় করুন প্রতিদিন!\n"
        "👇 নিচে প্রিমিয়াম মেনু থেকে আপনার পছন্দমতো অপশন সিলেক্ট করুন:"
    ) if lang == "bn" else (
        "🌟 **WELCOME TO PREMIUM TASK PAY** 🌟\n\n"
        "✨ Earn easily by completing simple tasks daily!\n"
        "👇 Select your preferred option from the premium menu below:"
    )
    bot.send_message(chat_id, welcome_text, reply_markup=get_main_menu(lang), parse_mode="Markdown")

@bot.message_handler(func=lambda message: True)
def handle_message(message):
    chat_id = message.chat.id
    text = message.text
    lang = user_languages.get(chat_id, "bn")

    if text in ["🔙 মূল মেনু", "🔙 Main Menu", "🔙 ব্যাক", "🔙 Back"]:
        if chat_id in user_states:
            del user_states[chat_id]
        bot.send_message(chat_id, "✨ আপনি সফলভাবে মূল মেনুতে ফিরে এসেছেন:" if lang == "bn" else "✨ Successfully returned to the main menu:", reply_markup=get_main_menu(lang))
        return

    if text in ["🚀 কাজ শুরু করুন", "🚀 Available Tasks"]:
        markup = types.InlineKeyboardMarkup(row_width=1)
        btn_gmail = types.InlineKeyboardButton("📧 Gmail Task (Rate: ৳13)", callback_data="task_gmail")
        btn_fb = types.InlineKeyboardButton("📘 Facebook Task (Coming Soon)", callback_data="task_fb")
        btn_insta = types.InlineKeyboardButton("📸 Instagram Task (Coming Soon)", callback_data="task_insta")
        markup.add(btn_gmail, btn_fb, btn_insta)
        
        bot.send_message(
            chat_id, 
            "🎯 **ক্যাটাগরি সিলেক্ট করুন:**\n\nনিচের ক্যাটাগরিগুলো থেকে আপনার পছন্দের কাজটি বেছে নিন:" if lang=="bn" else "🎯 **Select Category:**\n\nChoose your preferred task category below:",
            reply_markup=markup,
            parse_mode="Markdown"
        )
    
    elif text in ["📤 কাজ সাবমিট করুন", "📤 Submit Task"]:
        if chat_id in user_states and isinstance(user_states[chat_id], dict) and user_states[chat_id].get("state") == "submitting_task":
            task_info = user_states[chat_id]["task_info"]
            
            curr_idx = user_task_indices.get(chat_id, 0)
            user_task_indices[chat_id] = curr_idx + 1

            curr_pending = pending_tasks.get(chat_id, 0)
            pending_tasks[chat_id] = curr_pending + 1

            bot.send_message(
                chat_id, 
                "🎉 **অভিনন্দন! আপনার কাজটি সফলভাবে সাবমিট হয়েছে।**\n\n⏳ টাস্কটি পেন্ডিং লিস্টে রয়েছে। এডমিন যাচাই করে দ্রুত আপনার ব্যালেন্সে পেমেন্ট যুক্ত করে দেবেন।", 
                reply_markup=get_main_menu(lang),
                parse_mode="Markdown"
            )
            
            admin_msg = (
                "📥 **【নতুন টাস্ক সাবমিশন】**\n\n"
                f"👤 **User ID:** `{chat_id}`\n"
                f"🔹 **First Name:** `{task_info['firstname']}`\n"
                f"🔹 **Last Name:** `{task_info['lastname']}`\n"
                f"🔹 **Gmail:** `{task_info['gmail']}`\n"
                f"🔹 **Password:** `{task_info['pass']}`"
            )
            
            admin_markup = types.InlineKeyboardMarkup()
            btn_approve = types.InlineKeyboardButton("✅ Approve (+৳13)", callback_data=f"approve_{chat_id}")
            btn_reject = types.InlineKeyboardButton("❌ Reject", callback_data=f"reject_{chat_id}")
            admin_markup.add(btn_approve, btn_reject)
            
            bot.send_message(ADMIN_CHAT_ID, admin_msg, reply_markup=admin_markup, parse_mode="Markdown")
            del user_states[chat_id]
        else:
            bot.reply_to(message, "⚠️ আগে 'কাজ শুরু করুন' থেকে একটি টাস্ক সিলেক্ট করুন।", reply_markup=get_main_menu(lang))

    elif text in ["💎 আমার ব্যালেন্স", "💎 My Balance"]:
        income = income_balances.get(chat_id, 0.0)
        pending = pending_tasks.get(chat_id, 0)
        completed = completed_tasks.get(chat_id, 0)
        rejected = rejected_tasks.get(chat_id, 0)
        
        balance_text = (
            "💎 **ইউজার ড্যাশবোর্ড ও ব্যালেন্স স্ট্যাটাস:**\n\n"
            f"💰 **মূল ইনকাম ব্যালেন্স:** ৳{income:.2f}\n"
            f"⏳ **পেন্ডিং টাস্ক:** {pending} টি\n"
            f"✅ **সফল টাস্ক:** {completed} টি\n"
            f"❌ **রিজেক্টেড টাস্ক:** {rejected} টি"
        ) if lang == "bn" else (
            "💎 **User Dashboard & Balance Status:**\n\n"
            f"💰 **Income Balance:** ৳{income:.2f}\n"
            f"⏳ **Pending Tasks:** {pending}\n"
            f"✅ **Completed Tasks:** {completed}\n"
            f"❌ **Rejected Tasks:** {rejected}"
        )
        bot.reply_to(message, balance_text, parse_mode="Markdown")
        
    elif text in ["💸 উইথড্র করুন", "💸 Withdraw"]:
        income = income_balances.get(chat_id, 0.0)
        markup = types.InlineKeyboardMarkup()
        btn_bkash = types.InlineKeyboardButton("🔴 বিকাশ (Bkash) [Min: ৳80]", callback_data="withdraw_bkash")
        btn_nagad = types.InlineKeyboardButton("🟠 নগদ (Nagad) [Min: ৳80]", callback_data="withdraw_nagad")
        markup.add(btn_bkash, btn_nagad)
        
        withdraw_intro = (
            f"💳 **আপনার বর্তমান ব্যালেন্স:** ৳{income:.2f}\n\n"
            "📌 **উইথড্র করার নিয়ম ও শর্তাবলি:**\n"
            "• বিকাশে পেমেন্ট নিতে মিনিমাম **৳৮০ টাকা** লাগবে।\n"
            "• নগদে পেমেন্ট নিতে মিনিমাম **৳৮০ টাকা** লাগবে।\n\n"
            "👇 আপনার পছন্দের পেমেন্ট মাধ্যমটি সিলেক্ট করুন:"
        ) if lang == "bn" else (
            f"💳 **Your Current Balance:** ৳{income:.2f}\n\n"
            "📌 **Withdrawal Rules & Guidelines:**\n"
            "• Bkash Minimum Withdrawal: **৳80**\n"
            "• Nagad Minimum Withdrawal: **৳80**\n\n"
            "👇 Please select your payment method:"
        )
        bot.send_message(chat_id, withdraw_intro, reply_markup=markup, parse_mode="Markdown")
        
    elif text in ["🌐 ভাষা পরিবর্তন", "🌐 Language"]:
        markup = types.InlineKeyboardMarkup()
        btn_bn = types.InlineKeyboardButton("🇧🇩 বাংলা (Bangla)", callback_data="lang_bn")
        btn_en = types.InlineKeyboardButton("🇺🇸 English", callback_data="lang_en")
        markup.add(btn_bn, btn_en)
        bot.send_message(chat_id, "🌐 দয়া করে আপনার পছন্দের ভাষা নির্বাচন করুন / Please select your preferred language:", reply_markup=markup)
        
    elif text in ["🛡️ এডমিন সাপোর্ট", "🛡️ Admin Support"]:
        admin_text = f"🛡️ **অফিসিয়াল এডমিন সাপোর্ট**\n\nযেকোনো সমস্যায় বা সহায়তার জন্য সরাসরি এডমিনের সাথে যোগাযোগ করুন:\n👉 Telegram: {ADMIN_USERNAME}" if lang=="bn" else f"🛡️ **Official Admin Support**\n\nContact Admin for any support:\n👉 Telegram: {ADMIN_USERNAME}"
        bot.reply_to(message, admin_text, parse_mode="Markdown")
        
    else:
        if chat_id in user_states:
            user_data = user_states[chat_id]
            if isinstance(user_data, str) and user_data.startswith("withdraw_"):
                method_code = user_data.split("_")[1]
                method_name = "বিকাশ" if method_code == "bkash" else "নগদ"
                account_info = text.strip()
                income = income_balances.get(chat_id, 0.0)
                
                if income < 80.0:
                    bot.reply_to(message, "❌ আপনার একাউন্টে পর্যাপ্ত ব্যালেন্স নেই। উইথড্র করতে মিনিমাম ৮০ টাকা প্রয়োজন।" if lang=="bn" else "❌ Insufficient balance. Minimum ৳80 required.")
                    return

                income_balances[chat_id] = 0.0
                
                bot.send_message(
                    chat_id, 
                    f"🎉 **আপনার উইথড্র রিকোয়েস্ট সফলভাবে জমা হয়েছে!**\n\n💳 মাধ্যম: {method_name}\n📞 একাউন্ট নম্বর: `{account_info}`\n\nএডমিন পেমেন্ট চেক করে খুব শীঘ্রই পাঠিয়ে দেবেন।",
                    reply_markup=get_main_menu(lang),
                    parse_mode="Markdown"
                )
                
                admin_withdraw_msg = (
                    "💸 **【নতুন উইথড্র রিকোয়েস্ট】**\n\n"
                    f"👤 **User ID:** `{chat_id}`\n"
                    f"💳 **মেথড:** {method_name}\n"
                    f"📞 **নম্বর:** `{account_info}`\n"
                    f"💰 **পরিমাণ:** ৳{income:.2f}"
                )
                bot.send_message(ADMIN_CHAT_ID, admin_withdraw_msg, parse_mode="Markdown")
                del user_states[chat_id]
        else:
            bot.reply_to(message, "⚠️ দয়া করে নিচের প্রিমিয়াম মেনু বাটনগুলো ব্যবহার করুন।", reply_markup=get_main_menu(lang))

@bot.callback_query_handler(func=lambda call: True)
def callback_query(call):
    data = call.data
    chat_id = call.message.chat.id
    lang = user_languages.get(chat_id, "bn")

    if data == "task_gmail":
        current_index = user_task_indices.get(chat_id, 0)
        if current_index >= len(GMAIL_TASK_LIST):
            current_index = 0
            user_task_indices[chat_id] = 0

        task_data = GMAIL_TASK_LIST[current_index]
        user_states[chat_id] = {"state": "submitting_task", "task_info": task_data}

        markup = types.ReplyKeyboardMarkup(resize_keyboard=True)
        markup.add(types.KeyboardButton("📤 কাজ সাবমিট করুন" if lang=="bn" else "📤 Submit Task"), types.KeyboardButton("🔙 মূল মেনু" if lang=="bn" else "🔙 Main Menu"))

        task_text = (
            "📧 **উপলব্ধ জিমেইল টাস্ক (রেট: ৳১৩):**\n\n"
            "✨ নিচের তথ্যগুলো ব্যবহার করে একটি নতুন জিমেইল একাউন্ট তৈরি করুন। কাজ সম্পন্ন হওয়ার পর নিচের **'📤 কাজ সাবমিট করুন'** বাটনে চাপ দিন:\n\n"
            f"🔹 **First Name:** `{task_data['firstname']}`\n"
            f"🔹 **Last Name:** `{task_data['lastname']}`\n"
            f"🔹 **Gmail:** `{task_data['gmail']}`\n"
            f"🔹 **Password:** `{task_data['pass']}`"
        ) if lang == "bn" else (
            "📧 **Available Gmail Task (Rate: ৳13):**\n\n"
            "✨ Create a new Gmail account using the details below. After completion, click **'📤 Submit Task'**:\n\n"
            f"🔹 **First Name:** `{task_data['firstname']}`\n"
            f"🔹 **Last Name:** `{task_data['lastname']}`\n"
            f"🔹 **Gmail:** `{task_data['gmail']}`\n"
            f"🔹 **Password:** `{task_data['pass']}`"
        )
        bot.answer_callback_query(call.id)
        bot.send_message(chat_id, task_text, reply_markup=markup, parse_mode="Markdown")

    elif data in ["task_fb", "task_insta"]:
        bot.answer_callback_query(call.id, "⚠️ এই কাজটি বর্তমানে বন্ধ আছে, খুব শীঘ্রই চালু হবে!", show_alert=True)

    elif data == "lang_bn":
        user_languages[chat_id] = "bn"
        bot.answer_callback_query(call.id, "ভাষা সফলভাবে বাংলায় পরিবর্তন করা হয়েছে!")
        bot.edit_message_text("🇧🇩 ভাষা সফলভাবে **বাংলা** সেট করা হয়েছে।", chat_id, call.message.message_id, parse_mode="Markdown")
        bot.send_message(chat_id, "মূল মেনু:", reply_markup=get_main_menu("bn"))

    elif data == "lang_en":
        user_languages[chat_id] = "en"
        bot.answer_callback_query(call.id, "Language changed to English successfully!")
        bot.edit_message_text("🇺🇸 Language successfully set to **English**.", chat_id, call.message.message_id, parse_mode="Markdown")
        bot.send_message(chat_id, "Main menu:", reply_markup=get_main_menu("en"))

    elif data in ["withdraw_bkash", "withdraw_nagad"]:
        income = income_balances.get(chat_id, 0.0)
        if income < 80.0:
            bot.answer_callback_query(call.id, "❌ আপনার পর্যাপ্ত ব্যালেন্স নেই! উইথড্র করতে মিনিমাম ৮০ টাকা লাগবে।", show_alert=True)
            return

        m_code = data.split("_")[1]
        m_name = "বিকাশ (Bkash)" if m_code == "bkash" else "নগদ (Nagad)"
        user_states[chat_id] = data
        
        markup = types.ReplyKeyboardMarkup(resize_keyboard=True)
        markup.add(types.KeyboardButton("🔙 মূল মেনু" if lang=="bn" else "🔙 Main Menu"))
        
        bot.answer_callback_query(call.id)
        bot.send_message(
            chat_id,
            f"💳 **{m_name} উইথড্র ফর্ম**\n\nদয়া করে আপনার সঠিক একাউন্ট নম্বরটি লিখে পাঠান:" if lang=="bn" else f"💳 **{m_name} Withdraw Form**\n\nPlease send your correct account number:",
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
            f"{call.message.text}\n\n✅ **Status: Approved [+৳13 Added & Completed]**", 
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
