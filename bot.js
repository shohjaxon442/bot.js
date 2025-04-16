// Telegram bot setup
const TelegramBot = require("node-telegram-bot-api");
const token = "7711842324:AAHMFaGCwkSo4F1FXqFAFqapsOuMAe9HgfU";
const bot = new TelegramBot(token, { polling: true });

const userGoals = {}; // { chatId: ["Sport", "Matematika"] }
const pairedUsers = {}; // { chatId: partnerChatId }
const waitingUsers = {}; // { goal: [chatId1, chatId2] }

// Start command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const firstName = msg.from.first_name || "Foydalanuvchi";
  bot.sendMessage(
    chatId,
    `Salom👋, ${firstName}! Maqsaddosh botga xush kelibsiz.`,
    {
      reply_markup: {
        keyboard: [["🕒 Tugmani Bosing"], ["🤝 Maqsaddoshlar"]],
        resize_keyboard: true,
      },
    }
  );
});

// Asosiy menyu
bot.onText(/🕒 Tugmani Bosing/, (msg) => {
  const chatId = msg.chat.id;
  const time = new Date().toLocaleTimeString("uz-UZ", {
    hour: "2-digit",
    minute: "2-digit",
  });
  bot.sendMessage(chatId, `🕔 Hozirgi vaqt: ${time}`);
});

// Maqsaddoshlar menyusi
bot.onText(/🤝 Maqsaddoshlar/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, "Maqsaddoshlar bo‘limi:", {
    reply_markup: {
      keyboard: [
        ["📌 Mening maqsadlarim"],
        ["🔍 Maqsaddosh izlash"],
        ["✏️ Maqsadlarni tahrirlash"],
        ["🔙 Orqaga"],
      ],
      resize_keyboard: true,
    },
  });
});

bot.onText(/🔙 Orqaga/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, "Asosiy menyu:", {
    reply_markup: {
      keyboard: [["🕒 Tugmani Bosing"], ["🤝 Maqsaddoshlar"]],
      resize_keyboard: true,
    },
  });
});

// Mening maqsadlarim
bot.onText(/📌 Mening maqsadlarim/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    "Maqsadlaringizni vergul bilan ajratib yozing (masalan: Sport, Matematika):"
  );
  bot.once("message", (reply) => {
    const goals = reply.text
      .split(",")
      .map((g) => g.trim())
      .filter((g) => g.length > 0);
    userGoals[chatId] = goals;
    bot.sendMessage(chatId, "✅ Maqsadlaringiz saqlandi: " + goals.join(", "));
  });
});

// Maqsaddosh izlash
bot.onText(/🔍 Maqsaddosh izlash/, (msg) => {
  const chatId = msg.chat.id;
  const goals = userGoals[chatId];
  if (!goals || goals.length === 0) {
    bot.sendMessage(chatId, "Avval maqsadlaringizni kiriting.");
    return;
  }

  let found = false;
  for (const goal of goals) {
    if (!waitingUsers[goal]) waitingUsers[goal] = [];

    // Tozalash: o'zini o'zi kutayotganlar ro'yxatidan olib tashlash
    waitingUsers[goal] = waitingUsers[goal].filter((id) => id !== chatId);

    if (waitingUsers[goal].length > 0) {
      const partnerId = waitingUsers[goal].shift();
      pairedUsers[chatId] = partnerId;
      pairedUsers[partnerId] = chatId;
      bot.sendMessage(
        chatId,
        `✅ Sizga maqsaddosh topildi! Endi yozishingiz mumkin.`
      );
      bot.sendMessage(
        partnerId,
        `✅ Sizga maqsaddosh topildi! Endi yozishingiz mumkin.`
      );
      found = true;
      break;
    } else {
      waitingUsers[goal].push(chatId);
    }
  }

  if (!found) {
    bot.sendMessage(
      chatId,
      "⏳ Maqsaddosh qidirilmoqda... Boshqa foydalanuvchilarni kuting."
    );
  }
});

// Chat birlashtirish
bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const partnerId = pairedUsers[chatId];

  // Faqat agar ulashilgan bo‘lsa va bu maxsus tugma emas
  if (
    partnerId &&
    !msg.text.startsWith("/") &&
    !msg.text.includes("Maqsad") &&
    !msg.text.includes("Tugma")
  ) {
    bot.sendMessage(partnerId, `💬 [Maqsaddoshingiz]: ${msg.text}`);
  }
});

// Maqsadlarni tahrirlash
bot.onText(/✏️ Maqsadlarni tahrirlash/, (msg) => {
  const chatId = msg.chat.id;
  userGoals[chatId] = [];
  bot.sendMessage(
    chatId,
    "Avvalgi maqsadlar o‘chirildi. Yangi maqsadlarni yozing:"
  );
});
