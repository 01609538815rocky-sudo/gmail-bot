import telebot
from telebot import types

TOKEN = '8750150015:AAGGkj93aC-HvXCxWM9WzIaPTRFeexkmQ8c'
bot = telebot.TeleBot(TOKEN)

ADMIN_USERNAME = "@YourAdminUsername"
ADMIN_CHAT_ID = 8049855208  

user_states = {}
income_balances = {}  
pending_tasks = {}    
completed_tasks = {}  
rejected_tasks = {}   

@bot.message_handler(commands=['start', 'help'])
def send_welcome(message):
    markup = types.ReplyKeyboardMarkup(resize_keyboard=True, row_width=2)
    
    btn_work = types.KeyboardButton("📋 কাজ")
    btn_balance = types.KeyboardButton("💰 ব্যালেন্স")
    btn_withdraw = types.KeyboardButton("💳 উইথড্র")
    btn_lang = types.KeyboardButton("🌐 ভাষা")
    btn_admin = types.KeyboardButton("⚙️ এডমিন প্যানেল")
    
    markup.add(btn_work, btn_balance, btn_withdraw, btn_lang, btn_admin)
    
    bot.send_message(
        message.chat.id, 
        "✨ **WELCOME TO INSTANT TASK PAY** ✨\n\nআপনাদের স্বাগতম! নিচের অপশনগুলো থেকে নির্বাচন করুন:", 
        reply_markup=markup, 
        parse_mode="Markdown"
    )

@bot.message_handler(func=lambda message: True)
def handle_message(message):
    chat_id = message.chat.id
    text = message.text

    if text == "🔙 ব্যাক" or text == "মূল মেনু":
        if chat_id in user_states:
            del user_states[chat_id]
        send_welcome(message)
        return

    if text == "📋 কাজ":
        markup = types.InlineKeyboardMarkup()
        btn_sell_gmail = types.InlineKeyboardButton("🟢 📧 Gmail সেল (রেট: ১৩ টাকা)", callback_data="sell_gmail")
        markup.add(btn_sell_gmail)
        
        bot.send_message(
            chat_id, 
            "📋 **উপলব্ধ কাজসমূহ:**\n\nবর্তমানে জিমেইল সেল করার কাজ চলছে। প্রতি জিমেইলের রেট **১৩ টাকা**। কাজটি করতে নিচের বাটনে ক্লিক করুন:",
            reply_markup=markup,
            parse_mode="Markdown"
        )
    
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
            markup.add(btn_bkash, btn_nagad)
            
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
            state = user_states[chat_id]
            if state == "waiting_for_details":
                lines = text.split('\n')
                first_name = "N/A"
                last_name = "N/A"
                gmail_name = "N/A"
                password = "N/A"

                for line in lines:
                    if "First" in line or "নামের প্রথম" in line:
                        first_name = line.split(':')[-1].strip()
                    elif "Last" in line or "নামের শেষ" in line:
                        last_name = line.split(':')[-1].strip()
                    elif "Gmail" in line or "ইমেইল" in line:
                        gmail_name = line.split(':')[-1].strip()
                    elif "Password" in line or "পাসওয়ার্ড" in line:
                        password = line.split(':')[-1].strip()

                if first_name == "N/A" and len(lines) >= 4:
                    first_name = lines[0].strip()
                    last_name = lines[1].strip()
                    gmail_name = lines[2].strip()
                    password = lines[3].strip()

                curr_pending = pending_tasks.get(chat_id, 0)
                pending_tasks[chat_id] = curr_pending + 1

                markup = types.ReplyKeyboardMarkup(resize_keyboard=True)
                markup.add(types.KeyboardButton("🔙 ব্যাক"))
                
                bot.send_message(
                    chat_id, 
                    "✅ **আপনার জিমেইল সফলভাবে সাবমিট হয়েছে!** 🎉\n\nটাস্কটি পেন্ডিং লিস্টে (কাজ রিমুভ) জমা হয়েছে। এডমিন চেক করার পর এটি সম্পন্ন হিসেবে যুক্ত হবে।", 
                    reply_markup=markup,
                    parse_mode="Markdown"
                )
                
                admin_msg = (
                    "📥 **নতুন জিমেইল সাবমিশন এসেছে!**\n\n"
                    f"👤 **User ID:** `{chat_id}`\n"
                    f"🔹 **First Name:** `{first_name}`\n"
                    f"🔹 **Last Name:** `{last_name}`\n"
                    f"🔹 **Gmail:** `{gmail_name}`\n"
                    f"🔹 **Password:** `{password}`"
                )
                
                admin_markup = types.InlineKeyboardMarkup()
                btn_approve = types.InlineKeyboardButton("✅ Approve", callback_data=f"approve_{chat_id}")
                btn_reject = types.InlineKeyboardButton("❌ Reject", callback_data=f"reject_{chat_id}")
                admin_markup.add(btn_approve, btn_reject)
                
                bot.send_message(ADMIN_CHAT_ID, admin_msg, reply_markup=admin_markup, parse_mode="Markdown")
                
                del user_states[chat_id]
                
            elif state.startswith("withdraw_"):
                method = "বিকাশ" if "bkash" in state else "নগদ"
                account_info = text.strip()
                
                # ব্যালেন্স জিরো করে দেওয়া বা কেটে নেওয়া উইথড্র রিকোয়েস্টের পর
                income_balances[chat_id] = 0.0
                
                markup = types.ReplyKeyboardMarkup(resize_keyboard=True)
                markup.add(types.KeyboardButton("🔙 ব্যাক"))
                
                bot.send_message(
                    chat_id, 
                    f"✅ **আপনার উইথড্র রিকোয়েস্ট সফলভাবে জমা হয়েছে!** 🎉\n\nপেমেন্ট মাধ্যম: {method}\nএকাউন্ট নম্বর: `{account_info}`\n\nএডমিন চেক করে ২৪ ঘণ্টার মধ্যে পেমেন্ট পাঠিয়ে দেবেন।",
                    reply_markup=markup,
                    parse_mode="Markdown"
                )
                
                admin_withdraw_msg = (
                    "💸 **নতুন উইথড্র রিকোয়েস্ট এসেছে!**\n\n"
                    f"👤 **User ID:** `{chat_id}`\n"
                    f"💳 **মেথড:** {method}\n"
                    f"📞 **নম্বর/একাউন্ট:** `{account_info}`"
                )
                bot.send_message(ADMIN_CHAT_ID, admin_withdraw_msg, parse_mode="Markdown")
                
                del user_states[chat_id]
        else:
            bot.reply_to(message, "দয়া করে নিচের মেনু বাটনগুলো ব্যবহার করুন।")

@bot.callback_query_handler(func=lambda call: True)
def callback_query(call):
    data = call.data
    chat_id = call.message.chat.id

    if data == "sell_gmail":
        user_states[chat_id] = "waiting_for_details"
        
        markup = types.ReplyKeyboardMarkup(resize_keyboard=True)
        markup.add(types.KeyboardButton("🔙 ব্যাক"))
        
        bot.send_message(
            chat_id, 
            "📥 **Gmail সেল ফর্ম**\n\n"
            "দয়া করে নিচের ফরম্যাটটি পূরণ করে এক মেসেজে পাঠিয়ে দিন:\n\n"
            "First Name: [আপনার নাম]\n"
            "Last Name: [বংশগত নাম]\n"
            "Gmail: [আপনার জিমেইল]\n"
            "Password: [পাসওয়ার্ড]",
            reply_markup=markup
        )
        bot.answer_callback_query(call.id)

    elif data == "withdraw_bkash" or data == "withdraw_nagad":
        method_name = "বিকাশ (Bkash)" if "bkash" in data else "নগদ (Nagad)"
        user_states[chat_id] = data
        
        markup = types.ReplyKeyboardMarkup(resize_keyboard=True)
        markup.add(types.KeyboardButton("🔙 ব্যাক"))
        
        bot.answer_callback_query(call.id)
        bot.send_message(
            chat_id,
            f"📥 **{method_name} উইথড্র ফর্ম**\n\nদয়া করে আপনার একাউন্ট নম্বরটি (Personal/Agent) লিখে পাঠান:",
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
        bot.send_message(target_user_id, "🎉 অভিনন্দন! আপনার জিমেইল টাস্কটি এডমিন কর্তৃক **এপ্রুভ** হয়েছে। আপনার **ইনকাম ব্যালেন্সে ১৩ টাকা** যোগ হয়েছে এবং **কাজ সম্পন্ন** লিস্টে আপডেট হয়েছে।")

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
