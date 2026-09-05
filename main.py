from telegram import ReplyKeyboardMarkup, KeyboardButton

# বোতামগুলো সাজানোর কোড
keyboard = [
    [KeyboardButton("💼 কাজ করুন"), KeyboardButton("💰 উইথড্র")],
    [KeyboardButton("🌐 ভাষা"), KeyboardButton("⚙️ এডমিন প্যানেল")]
]

reply_markup = ReplyKeyboardMarkup(keyboard, resize_keyboard=True)
