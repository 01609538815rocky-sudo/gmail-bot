const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const path = require('path');

const TOKEN = '8611913683:AAEWy53shrYCIJ-E2-2Jbh6-SDq5tvI1dR8';
const bot = new TelegramBot(TOKEN, { polling: true });

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

// রুট ডিরেক্টরিতে index.html ফাইল সার্ভ করার জন্য
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (text === '/start') {
        // আপনার রেন্ডারের আসল লাইভ প্রজেক্ট লিংক
        const appUrl = `https://gmail-bot-1-jzx7.onrender.com`; 
        
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
