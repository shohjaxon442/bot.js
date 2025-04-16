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
    `Salom👋, ${firstName}! Bu bot @shohjaxon_0000 tomonidan yaratildi.Qo'shimcha g'oya va takliflar bo'lsa marhamat😊`,
    {
      reply_markup: {
        keyboard: [[{ text: "🕒Tugmani Bos" }]], // Tugma matnini tekshirish
        resize_keyboard: true,
      },
    }
  );
});

// Tugmani tekshirish uchun tugma matnini aniq belgilash
bot.onText(/🕒Tugmani Bos/, (msg) => {
  // Matnni aniq belgilash
  const chatId = msg.chat.id;
  const hozirgiSoat = new Date().toLocaleTimeString();
  bot.sendMessage(chatId, `⏰ Hozirgi soat: ${hozirgiSoat}`);
});
