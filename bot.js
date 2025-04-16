const TelegramBot = require("node-telegram-bot-api");
const token = "7711842324:AAHMFaGCwkSo4F1FXqFAFqapsOuMAe9HgfU"; // O'z tokeningizni qo'ying

const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const username = msg.from.username || "Noma'lum"; // Foydalanuvchining Telegram username'i
  const firstName = msg.from.first_name || "Noma'lum"; // Foydalanuvchining ismi

  // Foydalanuvchiga salom berish
  bot.sendMessage(
    chatId,
    `Salom👋, ${firstName}! Bu bot @shohjaxon_0000 tomonidan yaratildi.\nQo'shimcha g'oya va takliflar bo'lsa marhamat😊`,
    {
      reply_markup: {
        keyboard: [[{ text: "🕒Tugmani Bos" }]], // Tugma matnini tekshirish
        resize_keyboard: true,
      },
    }
  );
});

// Tugma bosilganda hozirgi vaqtdan 5 soat oldinga o‘tgan vaqtni yuboradi
bot.onText(/🕒Tugmani Bos/, (msg) => {
  const chatId = msg.chat.id;

  // O‘zbekiston vaqtini olish
  const now = new Date().toLocaleString("en-US", { timeZone: "Asia/Tashkent" });
  const uzTime = new Date(now);

  // 5 soat qo‘shish
  uzTime.setHours(uzTime.getHours());

  // Formatlangan soat
  const newTime = uzTime.toLocaleTimeString("uz-UZ", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  bot.sendMessage(chatId, `🕔 Hozirgi vaqt: ${newTime}`);
});
