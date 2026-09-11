const TelegramBot = require('node-telegram-bot-api');

// আপনার নতুন এবং সঠিক টেলিগ্রাম বট টোকেন
const token = '8830495719:AAEpKd2IaeKLelwFBte8aeKcQGo5_5J9jCg';

const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'স্বাগতম! নিচের মিনি অ্যাপ বাটন থেকে আপনার কাজ শুরু করুন।', {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: '🚀 মিনি অ্যাপ ওপেন করুন',
                        web_app: { url: 'আপনার_লাইভ_ওয়েব_লিংক_এখানে_দিন' }
                    }
                ]
            ]
        }
    });
});

console.log('Bot is running successfully with new token...');
