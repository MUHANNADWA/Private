const TelegramBot = require("node-telegram-bot-api");
require("dotenv").config();
const token = process.env.TELEGRAM_TOKEN;
const developerChatId = process.env.DEVELOPER_CHAT_ID;
const bot = new TelegramBot(token, { polling: true });
const keep_alive = require("./keep_alive.js");

const chatId = msg.chat.id;
const username = msg.from.username;

const mainMenuStrings = [
    "محاضرات السنة الثانية 2023-2024",
    "محاضرات السنة الماضية",
    "الإبلاغ عن مشكلة",
    "الإبلاغ عن راسك",
];

const subjectMenuStrings = [
    "تحليل 3",
    "إنجليزي 3",
    "خوارزميات 1",
    "دارات منطقية",
    "برمجة 3",
    "احتمالات",
    "عودة إلى القائمة السابقة",
];

const subsubjectMenuStrings = ["عملي", "نظري", "عودة إلى القائمة السابقة"];

const reportMessage = `للإبلاغ عن مشكلة ما استخدم الأمر /report ثم اكتب ما تريد في رسالة واحدة كالمثال التالي:
/report شكرا لكم`;

const mainMenu = {
    reply_markup: JSON.stringify({
        keyboard: mainMenuStrings.map((x) => [{ text: x }]),
        resize_keyboard: true,
    }),
};

const subjectMenu = {
    reply_markup: JSON.stringify({
        keyboard: subjectMenuStrings.map((x) => [{ text: x }]),
        resize_keyboard: true,
    }),
};

const subsubjectMenu = {
    reply_markup: JSON.stringify({
        keyboard: subsubjectMenuStrings.map((x) => [{ text: x }]),
        resize_keyboard: true,
    }),
};

const userStates = new Map();

bot.onText(/\/start/, async (_msg) => {
    userStates.set(chatId, "mainMenu");
    await bot.sendMessage(chatId, `أهلا وسهلا @${username}`);
    await bot.sendMessage(chatId, "اختر أحد الخيارات التالية:", mainMenu);
});

// Listen for user messages
bot.onText(/\/report (.+)/, (_msg, match) => {
    const userMessage = match[1];
    bot.sendMessage(
        developerChatId,
        `User:
    @${username}
ChatId:
    ${chatId}
Message:
${userMessage}`,
    );
});

bot.on("message", (msg) => {
    if (msg.text === mainMenuStrings[0]) {
        userStates.set(chatId, "subjectMenu");
        bot.sendMessage(chatId, "اختر المادة: ", subjectMenu);
    } else if (
        msg.text === "عودة إلى القائمة السابقة" &&
        userStates.get(chatId) === "subjectMenu"
    ) {
        userStates.set(chatId, "mainMenu");
        bot.sendMessage(chatId, "اختر أحد الخيارات التالية:", mainMenu);
    } else if (
        msg.text === "عودة إلى القائمة السابقة" &&
        userStates.get(chatId) === "subsubjectMenu"
    ) {
        userStates.set(chatId, "subjectMenu");
        bot.sendMessage(chatId, "اختر أحد الخيارات التالية:", subjectMenu);
    } else if (msg.text === "محاضرات السنة الماضية") {
        userStates.set(chatId, "subjectMenu");
        bot.sendMessage(chatId, "اختر أحد الخيارات التالية:", subjectMenu);
    } else if (subjectMenuStrings.includes(msg.text) === true) {
        userStates.set(chatId, "subsubjectMenu");
        bot.sendMessage(chatId, "اختر القسم", subsubjectMenu);
    } else if (msg.text === "الإبلاغ عن مشكلة") {
        bot.sendMessage(chatId, reportMessage, mainMenu);
    } else if (msg.text === "الإبلاغ عن راسك") {
        bot.sendMessage(chatId, "راسك وبس هههه", mainMenu);
    } else {
        if (msg.text != '/start')
            bot.sendMessage(chatId, "مافي هيك شي للأسف", mainMenu);
    }
});

