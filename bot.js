const TelegramBot = require("node-telegram-bot-api");
const token = "7711842324:AAHMFaGCwkSo4F1FXqFAFqapsOuMAe9HgfU";
const bot = new TelegramBot(token, { polling: true });

const userGoals = {};
const userDayGoals = {};
const pairedUsers = {};
const waitingUsers = {};

// Boshlanishi
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, "👋 Xush kelibsiz! Qanday yordam bera olaman?", {
    reply_markup: {
      keyboard: [["🕒 Vaqt", "📅 Bugungi maqsadlar"], ["🤝 Maqsaddoshlar"]],
      resize_keyboard: true,
    },
  });
});

// 🕒 Vaqt
bot.onText(/🕒 Vaqt/, (msg) => {
  const chatId = msg.chat.id;
  const now = new Date().toLocaleString("en-US", { timeZone: "Asia/Tashkent" });
  const time = new Date(now).toLocaleTimeString("uz-UZ", {
    hour: "2-digit",
    minute: "2-digit",
  });
  bot.sendMessage(chatId, `🕔 Hozirgi vaqt: ${time}`);
});

// 📅 Bugungi maqsadlar menyusi
bot.onText(/📅 Bugungi maqsadlar/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, "📅 Bugungi maqsadlar bo‘limi:", {
    reply_markup: {
      keyboard: [
        ["➕ Maqsadlar qo‘shish"],
        ["📖 Bugungi maqsadlarim"],
        ["🔙 Asosiy menyuga"],
      ],
      resize_keyboard: true,
    },
  });
});

// ➕ Maqsadlar qo‘shish
bot.onText(/➕ Maqsadlar qo‘shish/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    "Maqsadlaringizni soat bilan yozing (masalan: 08:00 Uyg'onaman):"
  );
  bot.once("message", (reply) => {
    const lines = reply.text.split("\n");
    userDayGoals[chatId] = [];
    lines.forEach((line) => {
      const match = line.match(/^(\d{2}:\d{2})\s+(.+)/);
      if (match) {
        userDayGoals[chatId].push({
          time: match[1],
          task: match[2],
          done: false,
        });
      }
    });
    bot.sendMessage(chatId, "✅ Maqsadlaringiz saqlandi.");
  });
});

// 📖 Bugungi maqsadlarim
bot.onText(/📖 Bugungi maqsadlarim/, (msg) => {
  const chatId = msg.chat.id;
  const goals = userDayGoals[chatId];
  if (!goals || goals.length === 0) {
    return bot.sendMessage(chatId, "📭 Sizda bugungi maqsadlar yo‘q.");
  }
  const list = goals
    .map((g) => `${g.time} - ${g.task} ${g.done ? "✅" : ""}`)
    .join("\n");
  bot.sendMessage(chatId, `📋 Maqsadlaringiz:\n${list}`, {
    reply_markup: {
      keyboard: [
        ["✏️ Maqsadlarni tahrirlash", "❌ Ularni o‘chirish"],
        ["🔙 Asosiy menyuga"],
      ],
      resize_keyboard: true,
    },
  });
});

// ❌ Ularni o‘chirish
bot.onText(/❌ Ularni o‘chirish/, (msg) => {
  const chatId = msg.chat.id;
  userDayGoals[chatId] = [];
  bot.sendMessage(chatId, "🗑️ Barcha maqsadlar o‘chirildi.");
});

// ✏️ Maqsadlarni tahrirlash
bot.onText(/✏️ Maqsadlarni tahrirlash/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, "🔁 Yangi maqsadlaringizni soat bilan yozing:");
  bot.once("message", (reply) => {
    const lines = reply.text.split("\n");
    userDayGoals[chatId] = [];
    lines.forEach((line) => {
      const match = line.match(/^(\d{2}:\d{2})\s+(.+)/);
      if (match) {
        userDayGoals[chatId].push({
          time: match[1],
          task: match[2],
          done: false,
        });
      }
    });
    bot.sendMessage(chatId, "✅ Maqsadlaringiz yangilandi.");
  });
});

// 🔙 Asosiy menyuga
bot.onText(/🔙 Asosiy menyuga/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, "🔙 Asosiy menyuga qaytdingiz.", {
    reply_markup: {
      keyboard: [["🕒 Vaqt", "📅 Bugungi maqsadlar"], ["🤝 Maqsaddoshlar"]],
      resize_keyboard: true,
    },
  });
});

// 🤝 Maqsaddoshlar
bot.onText(/🤝 Maqsaddoshlar/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, "🤝 Maqsaddoshlar bo‘limi:", {
    reply_markup: {
      keyboard: [
        ["📌 Mening maqsadlarim"],
        ["🔍 Maqsaddosh izlash"],
        ["🔁 Eski maqsaddosh bilan suhbatni to‘xtatish"],
        ["🔙 Asosiy menyuga"],
      ],
      resize_keyboard: true,
    },
  });
});

// 📌 Mening maqsadlarim
bot.onText(/📌 Mening maqsadlarim/, (msg) => {
  const chatId = msg.chat.id;
  if (userGoals[chatId] && userGoals[chatId].length > 0) {
    const goals = userGoals[chatId].join("\n");
    bot.sendMessage(chatId, `📋 Sizning maqsadlaringiz:\n${goals}`, {
      reply_markup: {
        keyboard: [
          ["📅 Bugungi maqsadlarim", "🔙 Asosiy menyuga"],
          ["✏️ Maqsadlarni tahrirlash"],
        ],
        resize_keyboard: true,
      },
    });
  } else {
    bot.sendMessage(
      chatId,
      "⛔ Sizda hozirda maqsadlar yo‘q. Iltimos, avval maqsadlaringizni kiriting."
    );
  }
});

// 🔍 Maqsaddosh izlash
bot.onText(/🔍 Maqsaddosh izlash/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    "O'z maqsadingizni kiriting (masalan: Matematika, Kimyo):"
  );

  bot.once("message", (reply) => {
    const userGoal = reply.text.trim();

    // Maqsadlarni saqlash
    if (!userGoals[chatId]) {
      userGoals[chatId] = [];
    }
    userGoals[chatId].push(userGoal);

    bot.sendMessage(chatId, `✅ Sizning maqsadingiz: "${userGoal}" saqlandi.`);

    let found = false;
    for (const goal of userGoals[chatId]) {
      if (!waitingUsers[goal]) waitingUsers[goal] = [];
      const otherUser = waitingUsers[goal].find(
        (id) => id !== chatId && !pairedUsers[id]
      );
      if (otherUser) {
        pairedUsers[chatId] = otherUser;
        pairedUsers[otherUser] = chatId;
        bot.sendMessage(
          chatId,
          "✅ Sizga maqsaddosh topildi! Chatni boshlang."
        );
        bot.sendMessage(
          otherUser,
          "✅ Sizga maqsaddosh topildi! Chatni boshlang."
        );
        found = true;
        break;
      } else {
        waitingUsers[goal].push(chatId);
      }
    }

    if (!found) {
      bot.sendMessage(chatId, "⏳ Maqsaddosh topilmagan. Boshqalarni kuting.");
    }
  });
});

// 🔁 Eski maqsaddosh bilan suhbatni to‘xtatish
bot.onText(/🔁 Eski maqsaddosh bilan suhbatni to‘xtatish/, (msg) => {
  const chatId = msg.chat.id;
  const partnerId = pairedUsers[chatId];
  if (partnerId) {
    delete pairedUsers[chatId];
    delete pairedUsers[partnerId];
    bot.sendMessage(
      chatId,
      "✅ Suhbat to‘xtatildi. Yangi maqsaddosh izlashni boshlang."
    );
    bot.sendMessage(partnerId, "✅ Suhbat to‘xtatildi.");
  } else {
    bot.sendMessage(
      chatId,
      "⛔ Siz hozirda hech qanday maqsaddoshga ega emassiz."
    );
  }
});

// Maqsaddosh bilan chat
bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const partnerId = pairedUsers[chatId];
  if (
    partnerId &&
    !msg.text.includes("Maqsad") &&
    !msg.text.includes("Tugma") &&
    !msg.text.startsWith("/") &&
    !msg.text.includes("🔙")
  ) {
    bot.sendMessage(partnerId, `💬 [Maqsaddoshingiz]: ${msg.text}`);
  }
});

// Har daqiqada tekshiradi
setInterval(() => {
  // Kirish qilingan vaqtlar va boshqa operatsiyalarni optimallashtirish
}, 60000);
