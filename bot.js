const TelegramBot = require("node-telegram-bot-api");

// 🔐 Sen kiritgan token
const token = "7711842324:AAHMFaGCwkSo4F1FXqFAFqapsOuMAe9HgfU";

// Botni ishga tushiramiz
const bot = new TelegramBot(token, { polling: true });

// /start komandasi — tugma yuboradi
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  const opts = {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "🕒 O‘zbekiston soatini ko‘rsat",
            callback_data: "get_uz_time",
          },
        ],
      ],
    },
  };

  bot.sendMessage(chatId, "Quyidagi tugmani bosing:", opts);
});

// Tugma bosilganda Toshkent vaqti yuboriladi
bot.on("callback_query", (callbackQuery) => {
  const msg = callbackQuery.message;
  const data = callbackQuery.data;

  if (data === "get_uz_time") {
    const uzTime = new Date().toLocaleTimeString("uz-UZ", {
      timeZone: "Asia/Tashkent",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    bot.sendMessage(msg.chat.id, `🕒 O‘zbekiston vaqti: ${uzTime}`);
  }
});
