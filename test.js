const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();
const token = process.env.TELEGRAM_TOKEN;
const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'أهلا وسهلا');
    bot.sendMessage(chatId, 'اختر أحد الخيارات التالية:', {
        reply_markup: {
            keyboard: [
                [{ text: 'محاضرات السنة الثانية 2023-2024' }],
                [{ text: 'محاضرات السنة الماضية' }],
                [{ text: 'الإبلاغ عن مشكلة' }]
            ],
            resize_keyboard: true,
            one_time_keyboard: true
        }
    });
});

bot.on('message', (msg) => {
    const chatId = msg.chat.id;

    if (msg.text === 'محاضرات السنة الثانية 2023-2024') {
        bot.sendMessage(chatId, 'اختر المادة: ', {
            reply_markup: {
                keyboard: [
                    [{ text: 'تحليل 3' }],
                    [{ text: 'إنجليزي 3' }],
                    [{ text: 'خوارزميات 1' }],
                    [{ text: 'دارات منطقية' }],
                    [{ text: 'برمجة 3' }],
                    [{ text: 'احتمالات' }],
                    [{ text: 'عودة إلى القائمة السابقة' }]
                ],
                resize_keyboard: true,
                one_time_keyboard: true
            }
        })
    } else if (msg.text === 'محاضرات السنة الماضية') {
        bot.sendMessage(chatId, 'قريبا...');
    }
    else if (msg.text === 'الإبلاغ عن مشكلة') {
        bot.sendMessage(chatId, 'قريبا...');
    }
});