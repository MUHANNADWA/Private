const TelegramBot = require("node-telegram-bot-api");
const axios = require('axios');
const { google } = require('googleapis');
const youtube = google.youtube('v3');
const ytdl = require('ytdl-core');
const fs = require('fs');
require("dotenv").config();

const token = process.env.TELEGRAM_TOKEN;
const developerChatId = process.env.DEVELOPER_CHAT_ID;
const bot = new TelegramBot(token, { polling: true });
const keep_alive = require("./keep_alive.js");
const weatherApiKey = process.env.WEATHER_API_KEY;
const youtubeApiKey = process.env.YOUTUBE_API_KEY;

bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    await bot.sendMessage(chatId, 'welcome jiji use the command (/weather city) to show its weather, this is an example:');
    await bot.sendMessage(chatId, '/weather damascus');
});

bot.onText(/\/weather (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const city = match[1];

    try {
        const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${weatherApiKey}&units=metric`);
        const weather = response.data;
        const message = `The weather in ${weather.name} is ${weather.weather[0].description} with a temperature of ${weather.main.temp}°C.`;
        bot.sendMessage(chatId, message);
    } catch (error) {
        bot.sendMessage(chatId, 'Sorry, I couldn\'t fetch the weather data.');
    }
});

bot.onText(/\/search (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const query = match[1];

    try {
        const response = await youtube.search.list({
            key: youtubeApiKey,
            part: 'snippet',
            q: query,
            maxResults: 10,
        });

        const videos = response.data.items;
        let videoNumber = 0;
        let message = 'Top results:\n\n';
        videos.forEach(video => {
            const title = video.snippet.title;
            const videoId = video.id.videoId;
            const url = `https://www.youtube.com/watch?v=${videoId}`;
            message += `${++videoNumber}- ${title}:\n ${url}\n\n`;
        });

        const video = response.data.items[0];
        if (!video) {
            bot.sendMessage(chatId, "No results found.");
            return;
        }

        bot.sendMessage(chatId, message);

    } catch (error) {
        console.log(error);
        bot.sendMessage(chatId, 'Sorry, something went wrong, try again later.');
    }
});


// const mainMenuStrings = [
//     "محاضرات السنة الثانية 2023-2024",
//     "محاضرات السنة الماضية",
//     "الإبلاغ عن مشكلة",
//     "الإبلاغ عن راسك",
// ];

// const subjectMenuStrings = [
//     "تحليل 3",
//     "إنجليزي 3",
//     "خوارزميات 1",
//     "دارات منطقية",
//     "برمجة 3",
//     "احتمالات",
//     "عودة إلى القائمة السابقة",
// ];

// const subsubjectMenuStrings = ["عملي", "نظري", "عودة إلى القائمة السابقة"];

// const reportMessage = `للإبلاغ عن مشكلة ما استخدم الأمر /report ثم اكتب ما تريد في رسالة واحدة كالمثال التالي:
// /report شكرا لكم`;

// const mainMenu = {
//     reply_markup: JSON.stringify({
//         keyboard: mainMenuStrings.map((x) => [{ text: x }]),
//         resize_keyboard: true,
//     }),
// };

// const subjectMenu = {
//     reply_markup: JSON.stringify({
//         keyboard: subjectMenuStrings.map((x) => [{ text: x }]),
//         resize_keyboard: true,
//     }),
// };

// const subsubjectMenu = {
//     reply_markup: JSON.stringify({
//         keyboard: subsubjectMenuStrings.map((x) => [{ text: x }]),
//         resize_keyboard: true,
//     }),
// };

// const userStates = new Map();

// bot.onText(/\/start/, async (msg) => {
//     const chatId = msg.chat.id;
//     const username = msg.from.username;
//     userStates.set(chatId, "mainMenu");
//     await bot.sendMessage(chatId, `أهلا وسهلا @${username}`);
//     await bot.sendMessage(chatId, "اختر أحد الخيارات التالية:", mainMenu);
// });

// // Listen for user messages
// bot.onText(/\/report (.+)/, (msg, match) => {
//     const chatId = msg.chat.id;
//     const username = msg.from.username;
//     const userMessage = match[1];
//     bot.sendMessage(
//         developerChatId,
//         `User:
//     @${username}
// ChatId:
//     ${chatId}
// Message:
// ${userMessage}`,
//     );
// });

// bot.on("message", (msg) => {
//     const chatId = msg.chat.id;

//     if (msg.text === mainMenuStrings[0]) {
//         userStates.set(chatId, "subjectMenu");
//         bot.sendMessage(chatId, "اختر المادة: ", subjectMenu);
//     } else if (
//         msg.text === "عودة إلى القائمة السابقة" &&
//         userStates.get(chatId) === "subjectMenu"
//     ) {
//         userStates.set(chatId, "mainMenu");
//         bot.sendMessage(chatId, "اختر أحد الخيارات التالية:", mainMenu);
//     } else if (
//         msg.text === "عودة إلى القائمة السابقة" &&
//         userStates.get(chatId) === "subsubjectMenu"
//     ) {
//         userStates.set(chatId, "subjectMenu");
//         bot.sendMessage(chatId, "اختر أحد الخيارات التالية:", subjectMenu);
//     } else if (msg.text === "محاضرات السنة الماضية") {
//         userStates.set(chatId, "subjectMenu");
//         bot.sendMessage(chatId, "اختر أحد الخيارات التالية:", subjectMenu);
//     } else if (subjectMenuStrings.includes(msg.text) === true) {
//         userStates.set(chatId, "subsubjectMenu");
//         bot.sendMessage(chatId, "اختر القسم", subsubjectMenu);
//     } else if (msg.text === "الإبلاغ عن مشكلة") {
//         bot.sendMessage(chatId, reportMessage, mainMenu);
//     } else if (msg.text === "الإبلاغ عن راسك") {
//         bot.sendMessage(chatId, "راسك وبس هههه", mainMenu);
//     } else {
//         if (msg.text != '/start')
//             bot.sendMessage(chatId, "مافي هيك شي للأسف", mainMenu);
//     }
// });

