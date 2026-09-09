const TelegramBot = require('node-telegram-bot-api');

const TOKEN = "8913146509:AAG8SjD7O98dTOAVv1daomaSqRvAEowoMEg";
const bot = new TelegramBot(TOKEN, { polling: true });

console.log("PayTap Bot is running...");

bot.on('callback_query', async (query) => {
    const action = query.data;
    const msg = query.message;
    const chatId = msg.chat.id;
    const messageId = msg.message_id;
    const adminName = query.from.first_name || "Admin";

    let responseText = msg.text;

    if (action === 'approve_gmail') {
        responseText += `\n\n✅ <b>Approved by ${adminName}</b>`;
        await bot.editMessageText(responseText, {
            chat_id: chatId,
            message_id: messageId,
            parse_mode: 'HTML',
            reply_markup: { inline_keyboard: [] }
        });
        await bot.answerCallbackQuery(query.id, { text: "Approved Successfully!" });
    } else if (action === 'reject_gmail') {
        responseText += `\n\n❌ <b>Rejected by ${adminName}</b>`;
        await bot.editMessageText(responseText, {
            chat_id: chatId,
            message_id: messageId,
            parse_mode: 'HTML',
            reply_markup: { inline_keyboard: [] }
        });
        await bot.answerCallbackQuery(query.id, { text: "Rejected." });
    }
});
