const TelegramBot = require("node-telegram-bot-api");
require("dotenv").config();
const token = process.env.TELEGRAM_TOKEN;
const developerChatId = process.env.DEVELOPER_CHAT_ID;
const bot = new TelegramBot(token, { polling: true });
const keep_alive = require("./keep_alive.js");
const ytdl = require('ytdl-core');
const express = require('express');

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

// bot.onText(/\/start/, (msg) => {
//     const chatId = msg.chat.id;
//     const username = msg.from.username;
//     userStates.set(chatId, "mainMenu");
//     bot.sendMessage(chatId, `أهلا وسهلا @${username}`);
//     bot.sendMessage(chatId, "اختر أحد الخيارات التالية:", mainMenu);
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
//     }
// });


// Handle the /start command
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Welcome! Send me a YouTube link to download the video.');
});

// Handle YouTube link messages
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const url = msg.text;

    // Check if the message contains a valid YouTube URL
    if (ytdl.validateURL(url)) {
        try {
            const info = await ytdl.getInfo(url);
            const title = info.videoDetails.title;
            const videoStream = ytdl(url, { filter: 'audioandvideo', format: 'mp4' });

            bot.sendMessage(chatId, `Downloading video: ${title}`);

            // Debugging: Check stream size before sending
            let videoSize = 0;
            videoStream.on('data', chunk => {
                videoSize += chunk.length;
            });

            videoStream.on('end', () => {
                console.log(`Video size: ${videoSize} bytes`);
                if (videoSize > 50 * 1024 * 1024) {
                    bot.sendMessage(chatId, "Sorry, the video is too large to be sent.");
                }
            });

            // Send the video file to the user
            await bot.sendVideo(chatId, videoStream, {
                caption: `Here's your video: ${title}`,
            });
        } catch (error) {
            console.error("Error while processing the video:", error.message);
            bot.sendMessage(chatId, `Failed to download video: ${error.message}`);
        }
    } else {
        bot.sendMessage(chatId, 'Please send a valid YouTube URL.');
    }
});