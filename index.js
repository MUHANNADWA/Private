const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();
const token = process.env.TELEGRAM_TOKEN;
const bot = new TelegramBot(token, { polling: true });
const keep_alive = require('./keep_alive.js')

const mainMenuStrings = [
    'محاضرات السنة الثانية 2023-2024',
    'محاضرات السنة الماضية',
    'الإبلاغ عن مشكلة'
];

const subjectMenuStrings = [
    'تحليل 3',
    'إنجليزي 3',
    'خوارزميات 1',
    'دارات منطقية',
    'برمجة 3',
    'احتمالات',
    'عودة إلى القائمة السابقة'
];

const mainMenu = mainMenuStrings.map((x) => [{ text: x }]);

const subjectMenu = subjectMenuStrings.map((x) => [{ text: x }]);

const userStates = new Map();

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const username = msg.from.username;
    userStates.set(chatId, 'mainMenu');
    bot.sendMessage(chatId, `أهلا وسهلا @${username}!`);
    bot.sendMessage(chatId, 'اختر أحد الخيارات التالية:', {
        reply_markup: {
            keyboard: mainMenu,
            resize_keyboard: true,
            one_time_keyboard: true
        }
    });
});

// Listen for user messages
bot.onText(/\/forward (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const userMessage = match[1]; // The captured message after /forward command
    // Forward the user's message to the developer
    bot.sendMessage(developerChatId, `User ${chatId} says: ${userMessage}`);
});

bot.on('message', (msg) => {
    const chatId = msg.chat.id;

    if (msg.text === mainMenuStrings[0]) {
        userStates.set(chatId, 'subjectMenu');
        bot.sendMessage(chatId, 'اختر المادة: ', {
            reply_markup: {
                keyboard: subjectMenu,
                resize_keyboard: true,
                one_time_keyboard: true
            }
        })
    } else if (msg.text === 'عودة إلى القائمة السابقة') {
        userStates.set(chatId, 'mainMenu');
        bot.sendMessage(chatId, 'اختر أحد الخيارات التالية:', {
            reply_markup: {
                keyboard: mainMenu,
                resize_keyboard: true,
                one_time_keyboard: true
            }
        })
    } else if (msg.text === 'محاضرات السنة الماضية') {
        bot.sendMessage(chatId, 'اختر أحد الخيارات التالية:', {
            reply_markup: {
                keyboard: subjectMenu,
                resize_keyboard: true,
                one_time_keyboard: true
            }
        })
    }
    else if (msg.text === 'الإبلاغ عن مشكلة') {
        bot.sendMessage(chatId, 'قريبا...');
    }
});