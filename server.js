const TelegramBot = require('node-telegram-bot-api');
const express = require('express');

const token = '8830495719:AAEpKd2IaeKLelwFBte8aeKcQGo5_5J9jCg';
const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json());

const bot = new TelegramBot(token);
const RENDER_URL = process.env.RENDER_EXTERNAL_URL;

if (RENDER_URL) {
    bot.setWebHook(`${RENDER_URL}/bot${token}`);
    console.log(`Webhook set to: ${RENDER_URL}/bot${token}`);
} else {
    console.log('RENDER_EXTERNAL_URL not found, running locally or without webhook.');
}

app.post(`/bot${token}`, (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
});

app.get('/', (req, res) => {
    res.send('Bot is running live and active!');
});

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'স্বাগতম! নিচের মিনি অ্যাপ বাটন থেকে আপনার কাজ শুরু করুন।', {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: '🚀 মিনি অ্যাপ ওপেন করুন',
                        web_app: { url: 'https://e-khata-one.vercel.app' }
                    }
                ]
            ]
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
