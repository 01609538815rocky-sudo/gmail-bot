const TelegramBot = require('node-telegram-bot-api');

const token = '8830495719:AAEpKd2IaeKLelwFBte8aeKcQGo5_5J9jCg';

// ওয়েব হুক কনফ্লিক্ট এড়াতে সরাসরি পোলিং শুরু করা হচ্ছে
const bot = new TelegramBot(token, { polling: true });

// আগের কোনো ওয়েব হুক থাকলে তা রিমুভ করে পোলিং সচল করা
bot.deleteWebHook().then(() => {
    console.log('Webhook deleted successfully, starting polling...');
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

console.log('Bot is running successfully with new token...');
