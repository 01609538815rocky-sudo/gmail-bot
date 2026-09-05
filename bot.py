import os
import telebot

TOKEN = "8948563757:AAHvkFlRIWd0BSfYCz6BVNHeNnONWJmjJbU"
bot = telebot.TeleBot(TOKEN)
ORDER_CHANNEL = "@OrderChannelBD"

user_data = {}
order_counter = 0

@bot.message_handler(commands=['start'])
def send_welcome(message):
    user_id = message.from_user.id
    if user_id not in user_data:
        user_data[user_id] = {
            "balance": 0.0,
            "step": None,
            "temp_amount": 0,
            "temp_service": None,
            "temp_qty": 0
        }
    
    markup = telebot.types.ReplyKeyboardMarkup(resize_keyboard=True, row_width=2)
    markup.add("📦 Service List", "💎 My Balance")
    markup.add("➕ Add Fund", "🎁 Refer & Earn")
    markup.add("📞 Support")
    
    welcome_text = (
        f"🆔 Your ID: {user_id}\n"
        f"💰 আপনার ব্যালেন্স: {user_data[user_id]['balance']:.1f}৳"
    )
    bot.send_message(message.chat.id, welcome_text, reply_markup=markup)

@bot.message_handler(func=lambda message: True)
def handle_messages(message):
    user_id = message.from_user.id
    text = message.text
    
    if user_id not in user_data:
        user_data[user_id] = {"balance": 0.0, "step": None, "temp_amount": 0, "temp_service": None, "temp_qty": 0}

    user = user_data[user_id]

    if text == "💎 My Balance":
        markup = telebot.types.InlineKeyboardMarkup()
        markup.add(telebot.types.InlineKeyboardButton("🆔 Copy ID", callback_data=f"copy_id_{user_id}"))
        balance_msg = (
            f"🆔 Your ID: {user_id}\n"
            f"💰 আপনার ব্যালেন্স: {user['balance']:.1f}৳"
        )
        bot.send_message(message.chat.id, balance_msg, reply_markup=markup)

    elif text == "➕ Add Fund":
        user["step"] = "waiting_amount"
        fund_text = (
            "💳 Add Fund\n\n"
            "📱 bKash (Personal): 01743815478\n"
            "📱 Nagad (Personal): 01743815478\n"
            "📌 Minimum: 20.0৳\n\n"
            "পেমেন্ট করার পর Amount লিখুন (সংখ্যায়):"
        )
        bot.send_message(message.chat.id, fund_text)

    elif user["step"] == "waiting_amount":
        try:
            amount = float(text)
            if amount < 20:
                bot.send_message(message.chat.id, "❌ সর্বনিম্ন ২০ টাকা অ্যাড করতে হবে। আবার পরিমাণ লিখুন:")
                return
            user["temp_amount"] = amount
            user["step"] = "waiting_trx"
            bot.send_message(message.chat.id, f"💵 Amount: {amount:.1f}৳\nএখন আপনার Transaction ID (trx) লিখুন:")
        except ValueError:
            bot.send_message(message.chat.id, "দয়া করে সঠিক সংখ্যায় অ্যামাউন্ট লিখুন:")

    elif user["step"] == "waiting_trx":
        trx_id = text
        amount = user["temp_amount"]
        user["step"] = None
        
        bot.send_message(message.chat.id, f"✅ রিকোয়েস্ট গ্রহণ করা হয়েছে!\n💵 {amount:.1f}৳\n🆔 TRX: {trx_id}\n⏳ এডমিন কনফার্ম করলে ব্যালেন্স যোগ হবে।")
        
        markup = telebot.types.InlineKeyboardMarkup()
        markup.add(telebot.types.InlineKeyboardButton("✅ Confirm Add Balance", callback_data=f"addbal_{user_id}_{amount}"))
        bot.send_message(message.chat.id, f"[Admin Panel Simulation] পেমেন্ট অ্যাপ্রুভ করতে নিচের বাটনে ক্লিক করুন:", reply_markup=markup)

    elif text == "📦 Service List":
        markup = telebot.types.InlineKeyboardMarkup()
        markup.add(telebot.types.InlineKeyboardButton("📘 Facebook", callback_data="cat_facebook"))
        markup.add(telebot.types.InlineKeyboardButton("🎵 TikTok", callback_data="cat_tiktok"))
        bot.send_message(message.chat.id, "প্লাটফর্ম নির্বাচন করুন 👇", reply_markup=markup)

    elif user["step"] == "waiting_qty":
        try:
            qty = int(text)
            if qty < 100 or qty > 1000000:
                bot.send_message(message.chat.id, "❌ সঠিক সীমার মধ্যে পরিমাণ লিখুন:")
                return
            user["temp_qty"] = qty
            
            # সার্ভিসের ধরন অনুযায়ী রেট নির্ধারণ
            if "TikTok" in user["temp_service"]:
                cost = (qty / 1000) * 20.0  # টিকটক ফলোয়ার রেট (প্রতি ১ হাজারে ২০ টাকা বা ইচ্ছামতো পরিবর্তন করতে পারেন)
            else:
                cost = (qty / 1000) * 5.0   # ফেসবুক ভিউ রেট
                
            user["temp_cost"] = cost
            user["step"] = "waiting_link"
            bot.send_message(message.chat.id, f"💵 Total: {cost:.1f}৳\n🔗 এখন আপনার Link/Username দিন:")
        except ValueError:
            bot.send_message(message.chat.id, "দয়া করে সঠিক সংখ্যায় পরিমাণ লিখুন:")

    elif user["step"] == "waiting_link":
        link = text
        user["step"] = None
        global order_counter
        order_counter += 1
        
        if user["balance"] >= user["temp_cost"]:
            user["balance"] -= user["temp_cost"]
            success_text = (
                f"✅ Order Received!\n"
                f"🆔 Local ID: {order_counter}\n"
                f"📌 {user['temp_service']}\n"
                f"🔗 Link: Hidden\n"
                f"📊 Qty: {user['temp_qty']}\n"
                f"💰 Cost: {user['temp_cost']:.1f}৳\n"
                f"📄 Mode: manual\n\n"
                f"Order channel : https://t.me/OrderChannelBD"
            )
            bot.send_message(message.chat.id, success_text)
            try:
                bot.send_message(ORDER_CHANNEL, success_text)
            except:
                pass
        else:
            bot.send_message(message.chat.id, "❌ আপনার পর্যাপ্ত ব্যালেন্স নেই। দয়া করে আগে Add Fund করুন।")

@bot.callback_query_handler(func=lambda call: True)
def callback_handler(call):
    data = call.data
    user_id = call.from_user.id

    if data.startswith("addbal_"):
        parts = data.split("_")
        target_user = int(parts[1])
        amount = float(parts[2])
        if target_user in user_data:
            user_data[target_user]["balance"] += amount
            bot.answer_callback_query(call.id, f"+{amount}৳ Balance Added Successfully!")
            bot.edit_message_text(f"💳 Balance Added: +{amount:.1f}৳", call.message.chat.id, call.message.message_id)
            try:
                bot.send_message(target_user, f"💳 Balance Added: +{amount:.1f}৳")
            except:
                pass

    elif data == "cat_facebook":
        markup = telebot.types.InlineKeyboardMarkup()
        markup.add(telebot.types.InlineKeyboardButton("👀 View", callback_data="serv_fb_view"))
        markup.add(telebot.types.InlineKeyboardButton("👥 Followers", callback_data="serv_fb_followers"))
        bot.edit_message_text("📌 Facebook — কোন ধরনের সার্ভিস?", call.message.chat.id, call.message.message_id, reply_markup=markup)

    elif data == "cat_tiktok":
        markup = telebot.types.InlineKeyboardMarkup()
        markup.add(telebot.types.InlineKeyboardButton("👤 TikTok Followers", callback_data="serv_tk_followers"))
        bot.edit_message_text("📌 TikTok — কোন ধরনের সার্ভিস?", call.message.chat.id, call.message.message_id, reply_markup=markup)

    elif data == "serv_fb_view":
        markup = telebot.types.InlineKeyboardMarkup()
        markup.add(telebot.types.InlineKeyboardButton("🛒 Order Now", callback_data="order_fb_view_start"))
        text = (
            "📦 Facebook View\n"
            "1K = 5.0৳ (Min 500)\n"
            "📈 Max: 5000000"
        )
        bot.edit_message_text(text, call.message.chat.id, call.message.message_id, reply_markup=markup)

    elif data == "serv_tk_followers":
        markup = telebot.types.InlineKeyboardMarkup()
        markup.add(telebot.types.InlineKeyboardButton("🛒 Order Now", callback_data="order_tk_followers_start"))
        text = (
            "📦 TikTok Followers\n"
            "1K = 20.0৳ (Min 100)\n"
            "📈 Max: 100000"
        )
        bot.edit_message_text(text, call.message.chat.id, call.message.message_id, reply_markup=markup)

    elif data == "order_fb_view_start":
        if user_id in user_data:
            user_data[user_id]["temp_service"] = "Facebook Views"
            user_data[user_id]["step"] = "waiting_qty"
            bot.send_message(call.message.chat.id, "🛍️ Order: Facebook Views\n✏️ Quantity লিখুন (Min 500 | Max 5000000):")

    elif data == "order_tk_followers_start":
        if user_id in user_data:
            user_data[user_id]["temp_service"] = "TikTok Followers"
            user_data[user_id]["step"] = "waiting_qty"
            bot.send_message(call.message.chat.id, "🛍️ Order: TikTok Followers\n✏️ Quantity লিখুন (Min 100 | Max 100000):")

if __name__ == "__main__":
    print("SMM Panel Bot is running...")
    bot.infinity_polling()
