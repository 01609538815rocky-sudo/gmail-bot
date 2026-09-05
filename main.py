import logging
import os
from telegram import InlineKeyboardButton, InlineKeyboardMarkup, Update
from telegram.ext import (
    Application,
    CallbackQueryHandler,
    CommandHandler,
    ContextTypes,
    MessageHandler,
    filters,
)

# Logging setup
logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    level=logging.INFO,
)
logger = logging.getLogger(__name__)

# Replace with your actual Telegram Bot Token from BotFather
TOKEN = os.environ.get("BOT_TOKEN", "YOUR_BOT_TOKEN_HERE")


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
  keyboard = [
      [InlineKeyboardButton("🚀 Available Tasks", callback_data="available_tasks")],
      [InlineKeyboardButton("💎 My Balance", callback_data="my_balance")],
      [InlineKeyboardButton("💳 Withdraw", callback_data="withdraw")],
      [InlineKeyboardButton("🌐 Language", callback_data="language")],
      [InlineKeyboardButton("🛡️ Admin Support", callback_data="admin_support")],
  ]
  reply_markup = InlineKeyboardMarkup(keyboard)
  await update.message.reply_text(
      "স্বাগতম! নিচের অপশনগুলো থেকে আপনার পছন্দমতো কাজটি বেছে নিন:",
      reply_markup=reply_markup,
  )


async def button_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
  query = update.callback_query
  await query.answer()

  if query.data == "available_tasks":
    keyboard = [
        [InlineKeyboardButton("📧 Gmail Task (Rate: ৳13)", callback_data="gmail_task")],
        [InlineKeyboardButton("📘 Facebook Task (Active)", callback_data="fb_task")],
        [InlineKeyboardButton("📸 Instagram Task (Active)", callback_data="insta_task")],
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    await query.message.edit_text(
        "🎯 ক্যাটাগরি সিলেক্ট করুন:\n\nনিচের ক্যাটাগরিগুলো থেকে আপনার পছন্দের কাজটি বেছে নিন:",
        reply_markup=reply_markup,
    )

  elif query.data == "gmail_task":
    task_details = (
        "📥 **Available Gmail Task**\n\n"
        "ডটকম ক্রিয়েট করুন এবং নিচের তথ্যগুলো পূরণ করুন। কাজ শেষে 'Submit Task' এ ক্লিক করুন:\n\n"
        "🔹 First Name: Karim\n"
        "🔹 Last Name: Khan\n"
        "🔹 Gmail: karim.job2026@gmail.com\n"
        "🔹 Password: Secure#3344\n\n"
    )
    keyboard = [[InlineKeyboardButton("📥 Submit Task", callback_data="submit_task")]]
    reply_markup = InlineKeyboardMarkup(keyboard)
    await query.message.edit_text(task_details, reply_markup=reply_markup, parse_mode="Markdown")

  elif query.data == "fb_task":
    task_details = (
        "📘 **Available Facebook Task**\n\n"
        "১. কাজ কমপ্লিট করার পরে আপনার **UID** দিন।\n"
        "২. এরপর **Cookies** সাবমিট করুন।\n"
        "৩. সবশেষে **Confirm** বাটনে চাপ দিন।\n\n"
        "🔹 First Name: Fahim\n"
        "🔹 Last Name: Ahmed\n"
        "🔹 Password: FB_Secure#123\n\n"
    )
    keyboard = [
        [InlineKeyboardButton("📌 Submit UID", callback_data="fb_uid")],
        [InlineKeyboardButton("🍪 Submit Cookies", callback_data="fb_cookies")],
        [InlineKeyboardButton("✅ Confirm Task", callback_data="submit_task")],
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    await query.message.edit_text(task_details, reply_markup=reply_markup, parse_mode="Markdown")

  elif query.data == "insta_task":
    task_details = (
        "📸 **Available Instagram Task**\n\n"
        "১. কাজ কমপ্লিট করার পরে আপনার **UID** দিন।\n"
        "২. এরপর **Cookies** সাবমিট করুন।\n"
        "৩. সবশেষে **Confirm** বাটনে চাপ দিন।\n\n"
        "🔹 First Name: Rina\n"
        "🔹 Last Name: Akter\n"
        "🔹 Password: Insta_Secure#456\n\n"
    )
    keyboard = [
        [InlineKeyboardButton("📌 Submit UID", callback_data="insta_uid")],
        [InlineKeyboardButton("🍪 Submit Cookies", callback_data="insta_cookies")],
        [InlineKeyboardButton("✅ Confirm Task", callback_data="submit_task")],
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    await query.message.edit_text(task_details, reply_markup=reply_markup, parse_mode="Markdown")

  elif query.data in ["fb_uid", "insta_uid"]:
    await query.message.reply_text("দয়া করে আপনার ইউআইডি (UID) লিখে পাঠান:")

  elif query.data in ["fb_cookies", "insta_cookies"]:
    await query.message.reply_text("দয়া করে আপনার কুকিজ (Cookies) লিখে পাঠান:")

  elif query.data == "submit_task":
    success_msg = (
        "🎉 অভিনন্দন! আপনার কাজটি সফলভাবে সাবমিট হয়েছে।\n\n"
        "⏳ টাস্কটি পেন্ডিং লিস্টে রয়েছে। এডমিন যাচাই করে দ্রুত আপনার ব্যালেন্সে পেমেন্ট যুক্ত করে দেবেন।"
    )
    await query.message.edit_text(success_msg)


def main():
  # Create application
  application = Application.builder().token(TOKEN).build()

  # Handlers
  application.add_handler(CommandHandler("start", start))
  application.add_handler(CallbackQueryHandler(button_handler))

  # Start the Bot
  print("Bot is running...")
  application.run_polling()


if __name__ == "__main__":
  main()
