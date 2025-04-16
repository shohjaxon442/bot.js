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
        ["✏️ Maqsadlarni tahrirlash"],
        ["🔙 Asosiy menyuga"],
      ],
      resize_keyboard: true,
    },
  });
});

// 📌 Mening maqsadlarim
bot.onText(/📌 Mening maqsadlarim/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    "Maqsadlaringizni vergul bilan yozing (Masalan: Sport, O‘qish):"
  );
  bot.once("message", (reply) => {
    const goals = reply.text.split(",").map((g) => g.trim());
    userGoals[chatId] = goals;
    bot.sendMessage(chatId, "✅ Maqsadlaringiz saqlandi.");
  });
});

// 🔍 Maqsaddosh izlash
bot.onText(/🔍 Maqsaddosh izlash/, (msg) => {
  const chatId = msg.chat.id;
  const goals = userGoals[chatId];
  if (!goals || goals.length === 0) {
    return bot.sendMessage(chatId, "⛔ Avval maqsadlaringizni kiriting.");
  }

  let found = false;
  for (const goal of goals) {
    if (!waitingUsers[goal]) waitingUsers[goal] = [];
    const otherUser = waitingUsers[goal].find(
      (id) => id !== chatId && !pairedUsers[id]
    );
    if (otherUser) {
      pairedUsers[chatId] = otherUser;
      pairedUsers[otherUser] = chatId;
      bot.sendMessage(chatId, "✅ Sizga maqsaddosh topildi! Chatni boshlang.");
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
  const now = new Date().toLocaleString("en-US", { timeZone: "Asia/Tashkent" });
  const currentTime = new Date(now)
    .toLocaleTimeString("uz-UZ", {
      hour: "2-digit",
      minute: "2-digit",
    })
    .slice(0, 5);

  for (const chatId in userDayGoals) {
    userDayGoals[chatId].forEach((goal) => {
      if (goal.time === currentTime && !goal.done && !goal.notified) {
        bot.sendMessage(
          chatId,
          `⏰ ${goal.time} - ${goal.task}\n\nBajarildimi?`,
          {
            reply_markup: {
              keyboard: [["✅ Ha", "❌ Yo‘q"]],
              resize_keyboard: true,
            },
          }
        );
        goal.notified = true;
      }
    });
  }
}, 60 * 1000); // Har 1 daqiqada tekshiradi

// ✅ Ha
bot.onText(/✅ Ha/, (msg) => {
  const chatId = msg.chat.id;
  const now = new Date();
  const time = `${now.getHours().toString().padStart(2, "0")}:${now
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
  const goal = userDayGoals[chatId]?.find(
    (g) => g.time === time && g.notified && !g.done
  );
  if (goal) {
    goal.done = true;
    bot.sendMessage(chatId, "✅ Zo‘r! Endi keyingi maqsadga o‘ting.", {
      reply_markup: {
        keyboard: [["🕒 Vaqt", "📅 Bugungi maqsadlar"], ["🤝 Maqsaddoshlar"]],
        resize_keyboard: true,
      },
    });
  }
});

// ❌ Yo‘q
bot.onText(/❌ Yo‘q/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, "😐 Mayli, keyingi safar yaxshiroq harakat qiling!", {
    reply_markup: {
      keyboard: [["🕒 Vaqt", "📅 Bugungi maqsadlar"], ["🤝 Maqsaddoshlar"]],
      resize_keyboard: true,
    },
  });
});
