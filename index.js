const TelegramBot = require('node-telegram-bot-api');
const express = require('express');

// আপনার টেলিগ্রাম বট টোকেন
const token = '8860755134:AAEIiSZ-BkIlm-G6e2zkZSj3WOSuewkKgRY';
const bot = new TelegramBot(token, { polling: true });

const app = express();
app.use(express.json());

// আপনার মিনি অ্যাপের লাইভ লিংকটি (যেমন Vercel বা Netlify লিংক) এখানে বসাবেন
const WEB_APP_URL = 'https://gmail-bot-taupe.vercel.app'; 

// বেসিক রুট চেক করার জন্য
app.get('/', (req, res) => {
    res.send('BD Freelancing Academy Bot Server is Running Successfully!');
});

// ইউজার যখন টেলিগ্রাম বটে /start কমান্ড দিবে
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const userName = msg.from.first_name || 'Freelancer';

    bot.sendMessage(chatId, `স্বাগতম ${userName}! BD Freelancing Academy-তে কাজ শুরু করতে নিচের বাটনে ক্লিক করুন:`, {
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
