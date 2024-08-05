const TelegramBot = require("node-telegram-bot-api");
require("dotenv").config();
const token = process.env.TELEGRAM_TOKEN;
const developerChatId = process.env.DEVELOPER_CHAT_ID;
const bot = new TelegramBot(token, { polling: true });
const keep_alive = require("./keep_alive.js");
const express = require('express');


const fs = require("fs");
const ytdl = require("ytdl-core");
const ffmpeg = require("fluent-ffmpeg");

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(
        chatId,
        "Welcome ConcatHubbers, enter Youtube Link to get your Video Downloaded"
    );
});

bot.on("message", (msg) => {
    const chatId = msg.chat.id;
    const messageText = msg.text;

    if (messageText.includes("youtube.com")) {
        const videoId = ytdl.getURLVideoID(messageText);
        const downloadLink = `https://www.youtube.com/watch?v=${videoId}`;

        const mp4DownloadPath = `./video_${videoId}.mp4`;
        const mp4DownloadStream = ytdl(downloadLink, {
            filter: (format) => format.container === "mp4",
            quality: "highest",
        });
        const mp4FileStream = fs.createWriteStream(mp4DownloadPath);

        mp4DownloadStream.pipe(mp4FileStream);

        mp4DownloadStream.on("end", () => {
            const mp3DownloadPath = `./aidop_${videoId}.mp3`;
            const mp3DownloadStream = ytdl(downloadLink, {
                filter: (format) => format.container === "mp4",
                quality: "highestaudio",
            });
            const mp3FileStream = fs.createWriteStream(mp3DownloadPath);

            mp3DownloadStream.pipe(mp3FileStream);

            mp3DownloadStream.on("end", () => {
                const mergedFilePath = `./merged_${videoId}.mp4`;
                const command = ffmpeg()
                    .input(mp4DownloadPath)
                    .input(mp3DownloadPath)
                    .output(mergedFilePath)
                    .on("end", () => {
                        const videoData = fs.readFileSync(mergedFilePath);

                        bot.sendVideo(chatId, videoData, {
                            caption: "Enjoy your video:)",
                        });

                        fs.unlinkSync(mp4DownloadPath);
                        fs.unlinkSync(mp3DownloadPath);
                        fs.unlinkSync(mergedFilePath);
                    })
                    .on("error", (error) => {
                        console.error("Error merging files: ", error);
                        bot.sendMessage(chatId, "An error while merging the files");

                        fs.unlinkSync(mp4DownloadPath);
                        fs.unlinkSync(mp3DownloadPath);
                        fs.unlinkSync(mergedFilePath);
                    })
                    .run();
            });

            mp3DownloadStream.on("error", (error) => {
                console.error("Error downloading audio: ", error);
                bot.sendMessage(chatId, "An error while donloading the audio");
            });
        });

        mp4DownloadStream.on("error", (error) => {
            console.error("Error downloading video: ", error);
            bot.sendMessage(chatId, "An error while donloading the video");
        });
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

