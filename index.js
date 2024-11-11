const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");
const { google } = require("googleapis");
const youtube = google.youtube("v3");
const ytdl = require("ytdl-core");
const fs = require("fs");
require("dotenv").config();

const token = process.env.TELEGRAM_TOKEN;
const developerChatId = process.env.DEVELOPER_CHAT_ID;
const bot = new TelegramBot(token, { polling: true });
const keep_alive = require("./keep_alive.js");
const weatherApiKey = process.env.WEATHER_API_KEY;
const youtubeApiKey = process.env.YOUTUBE_API_KEY;

const startMessage = `welcome jiji you can use the following commands:
/weather <city> to show its weather,
/search <video> to search youtube,
this is an example:`;

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  await bot.sendMessage(chatId, startMessage);
  await bot.sendMessage(chatId, "/weather Damascus");
  await bot.sendMessage(chatId, "/search Html");
});

bot.onText(/\/weather (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const city = match[1];

  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${weatherApiKey}&units=metric`
    );
    const weather = response.data;
    const message = `The weather in ${weather.name} is ${weather.weather[0].description} with a temperature of ${weather.main.temp}°C.`;
    bot.sendMessage(chatId, message);
  } catch (error) {
    bot.sendMessage(chatId, "Sorry, I couldn't fetch the weather data.");
  }
});

bot.onText(/\/destroy (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const mentionedUserid = match[1];
  bot.sendMessage(chatId, `Destroying chat with id ${mentionedUserid}`);
  for (let i = 0; i < 100; i++) {
    bot.sendMessage(mentionedUserid, "ههههه");
  }
  bot.sendMessage(chatId, `Destroying chat with id ${mentionedUserid}`);
});

bot.onText(/\/search (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const query = match[1];

  try {
    const response = await youtube.search.list({
      key: youtubeApiKey,
      part: "snippet",
      q: query,
      maxResults: 10,
    });

    const items = response.data.items;
    let itemNumber = 0;
    let message = "Top results:\n\n";

    items.forEach((item) => {
      if (item.id.kind === "youtube#video") {
        // Check if the item is a video
        const title = item.snippet.title;
        const videoId = item.id.videoId;
        const url = `https://www.youtube.com/watch?v=${videoId}`;
        message += `${++itemNumber}- ${title}:\n ${url}\n\n`;
      } else if (item.id.kind === "youtube#playlist") {
        const title = item.snippet.title;
        const playlistId = item.id.playlistId;
        const url = `https://www.youtube.com/playlist?list=${playlistId}`;
        message += `${++itemNumber}- ${title} (Playlist):\n ${url}\n\n`;
      } else if (item.id.kind === "youtube#channel") {
        const title = item.snippet.title;
        const channelId = item.id.channelId;
        const url = `https://www.youtube.com/channel/${channelId}`;
        message += `${++itemNumber}- ${title} (Channel):\n ${url}\n\n`;
      }
    });

    if (itemNumber === 0) {
      bot.sendMessage(chatId, "No results found.");
      return;
    }

    bot.sendMessage(chatId, message);
  } catch (error) {
    bot.sendMessage(
      chatId,
      "An error occurred while fetching video data: " + error.message
    );
    bot.sendMessage(
      chatId,
      "Sorry, something went wrong. Please try again later."
    );
  }
});
