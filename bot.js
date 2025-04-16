const TelegramBot = require("node-telegram-bot-api");
const token = "SENING_BOT_TOKENING";
const bot = new TelegramBot(token, { polling: true });

// /start komandasi bilan tugma yuborish
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  const opts = {
    reply_markup: {
      inline_keyboard: [
        [{ text: "🕒 Hozirgi vaqtni ko'rsat", callback_data: "show_time" }],
      ],
    },
  };

  bot.sendMessage(chatId, "Quyidagi tugmani bosing:", opts);
});

// Tugma bosilganda ishlov berish
bot.on("callback_query", (callbackQuery) => {
  const msg = callbackQuery.message;
  const data = callbackQuery.data;

  if (data === "show_time") {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const seconds = now.getSeconds().toString().padStart(2, "0");

    const time = `${hours}:${minutes}:${seconds}`;
    bot.sendMessage(msg.chat.id, `Hozirgi vaqt: 🕒 ${time}`);
  }
});
