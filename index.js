const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const path = require('path');

// আপনার বটের টোকেন
const token = '8860755134:AAEIiSZ-BkIlm-G6e2zkZSj3WOSuewkKgRY';
const bot = new TelegramBot(token, { polling: false });

const app = express();
app.use(express.json());

// স্ট্যাটিক ফাইল বা ফ্রন্টএন্ড ফোল্ডার সেটআপ (যদি public ফোল্ডার থাকে)
app.use(express.static(path.join(__dirname, 'public')));

// রুট পেজে ভিজিট করলে একটি সুন্দর ওয়েলকাম মেসেজ বা HTML দেখানোর জন্য
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>BD Freelancing Academy</title>
        <style>
            body { font-family: Arial, sans-serif; background: #0f172a; color: #fff; text-align: center; padding-top: 50px; }
            h1 { color: #38bdf8; }
            p { color: #94a3b8; }
        </style>
    </head>
    <body>
        <h1>BD Freelancing Academy Bot Server is Running Successfully!</h1>
        <p>You can now open this app directly from your Telegram Bot.</p>
    </body>
    </html>
  `);
});

// টেলিগ্রাম বট /start কমান্ড হ্যান্ডলার
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const userName = msg.from.first_name || 'User';
  
  const webAppUrl = 'https://gmail-bot-taupe.vercel.app'; // আপনার Vercel-এর লাইভ লিংক

  bot.sendMessage(chatId, `স্বাগতম ${userName} !! BD Freelancing Academy-তে কাজ করতে নিচের বাটনে ক্লিক করুন:`, {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "🚀 Open App (মিনি অ্যাপ ওপেন করুন)",
            web_app: { url: webAppUrl }
          }
        ]
      ]
    }
  });
});

// Vercel বা লোকাল সার্ভারের জন্য webhook রাউট
app.post(`/bot${token}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
