const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const path = require('path');

const TOKEN = '8611913683:AAEWy53shrYCIJ-E2-2Jbh6-SDq5tvI1dR8';
const bot = new TelegramBot(TOKEN, { polling: true });

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (text === '/start') {
        // রেন্ডার থেকে পাওয়া আপনার প্রজেক্টের আসল লাইভ ডোমেন লিংকটি এখানে বসিয়ে দিন
        const appUrl = `https://gmail-bot-1.onrender.com`; 
        
        bot.sendMessage(chatId, 'স্বাগতম! নিচে ক্লিক করে আমাদের মিনি অ্যাপটি ওপেন করুন:', {
            reply_markup: {
                inline_keyboard: [
                    [{ text: '🚀 ওপেন মিনি অ্যাপ', web_app: { url: appUrl } }]
                ]
            }
        });
    }
});

app.listen(PORT, () => {
    console.log(`Bot server is running on port ${PORT}`);
});
