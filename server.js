const TelegramBot = require('node-telegram-bot-api');
const express = require('express');

// আপনার দেওয়া বট টোকেন এখানে বসানো হলো
const token = '8860755134:AAEIiSZ-BkIlm-G6e2zkZSj3WOSuewkKgRY';
const bot = new TelegramBot(token, { polling: true });

const app = express();
app.use(express.json());

// আপনার হোস্টেড মিনি অ্যাপের লিংকটি এখানে বসাবেন (যেমন Vercel বা Netlify লিংক)
const WEB_APP_URL = 'https://your-webapp-url.vercel.app'; 

// ইউজার যখন বট-এ /start লিখবে
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const userName = msg.from.first_name || 'Freelancer';

    bot.sendMessage(chatId, `স্বাগতম ${userName}! BD Freelancing Academy-তে কাজ করতে নিচের বাটনে ক্লিক করুন:`, {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: '🚀 Open App (মিনি অ্যাপ ওপেন করুন)',
                        web_app: { url: WEB_APP_URL }
                    }
                ]
            ]
        }
    });
});

// সার্ভার পোর্ট সেটআপ
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Telegram Bot Server is running on port ${PORT}`);
});
