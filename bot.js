const TelegramBot = require("node-telegram-bot-api");
const token = "7711842324:AAHMFaGCwkSo4F1FXqFAFqapsOuMAe9HgfU";
const bot = new TelegramBot(token, { polling: true });

const userGoals = {}; // { chatId: ["Sport", "Matematika"] }
const userDayGoals = {}; // { chatId: [ { time: "08:00", task: "Uyg'onaman", done: false } ] }
const pairedUsers = {}; // { chatId: partnerChatId }
const waitingUsers = {}; // { goal: [chatId1, chatId2] }

// Start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const firstName = msg.from.first_name || "Foydalanuvchi";

  bot.sendMessage(
    chatId,
    `Salom👋, ${firstName}! Maqsaddosh botga xush kelibsiz.`,
    {
      reply_markup: {
        keyboard: [
          ["🕒 Tugmani Bosing", "📅 Bugungi maqsadlar"],
          ["🤝 Maqsaddoshlar"],
        ],
        resize_keyboard: true,
      },
    }
  );
});

// Vaqt ko'rsatish
bot.onText(/🕒 Tugmani Bosing/, (msg) => {
  const chatId = msg.chat.id;
  const time = new Date().toLocaleTimeString("uz-UZ", {
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
    "Bugungi maqsadlaringizni vaqt bilan yozing. Masalan:\n08:00 Uyg'onaman\n12:30 Tushlik qilaman"
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
    bot.sendMessage(chatId, "Sizda hali bugungi maqsadlar yo‘q.");
    return;
  }

  const goalList = goals
    .map((g) => `${g.time} - ${g.task} ${g.done ? "✅" : ""}`)
    .join("\n");

  bot.sendMessage(chatId, `📋 Maqsadlaringiz:\n\n${goalList}`, {
    reply_markup: {
      keyboard: [
        ["✏️ Maqsadlarni tahrirlash", "❌ Ularni o‘chirish"],
        ["🔙 Orqaga"],
      ],
      resize_keyboard: true,
    },
  });
});

// ❌ Ularni o‘chirish
bot.onText(/❌ Ularni o‘chirish/, (msg) => {
  const chatId = msg.chat.id;
  userDayGoals[chatId] = [];
  bot.sendMessage(chatId, "❌ Barcha bugungi maqsadlaringiz o‘chirildi.");
});

// 🔙 Asosiy menyuga
bot.onText(/🔙 Asosiy menyuga/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, "Asosiy menyu:", {
    reply_markup: {
      keyboard: [
        ["🕒 Tugmani Bosing", "📅 Bugungi maqsadlar"],
        ["🤝 Maqsaddoshlar"],
      ],
      resize_keyboard: true,
    },
  });
});

// 8:00 uyg‘ondingizmi degan eslatma
setInterval(() => {
  const now = new Date();
  const hour = now.getHours().toString().padStart(2, "0");
  const minute = now.getMinutes().toString().padStart(2, "0");
  const currentTime = `${hour}:${minute}`;

  for (const chatId in userDayGoals) {
    const goals = userDayGoals[chatId];
    goals.forEach((goal) => {
      if (goal.time === currentTime && !goal.done && !goal.notified) {
        bot.sendMessage(
          chatId,
          `⏰ ${goal.time} - ${goal.task}\n\nMaqsadingiz bajarildimi?`,
          {
            reply_markup: {
              keyboard: [["✅ Ha", "❌ Yo‘q"]],
              resize_keyboard: true,
            },
          }
        );
        goal.notified = true; // Bu yerda goal.notified ni faollashtiring
      }
    });
  }
}, 60 * 1000); // Har daqiqada tekshirish

// Javob qaytarish
bot.onText(/✅ Ha/, (msg) => {
  const chatId = msg.chat.id;
  const goals = userDayGoals[chatId];
  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;

  const goal = goals?.find(
    (g) => g.time === currentTime && g.notified && !g.done
  );
  if (goal) {
    goal.done = true;
    bot.sendMessage(chatId, "✅ Zo‘r! Endi keyingi maqsadga o'ting.", {
      reply_markup: {
        keyboard: [
          ["🕒 Tugmani Bosing", "📅 Bugungi maqsadlar"],
          ["🤝 Maqsaddoshlar"],
        ],
        resize_keyboard: true,
      },
    });
  }
});

bot.onText(/❌ Yo‘q/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, "😕 Mayli, keyingi safar yaxshiroq harakat qiling.", {
    reply_markup: {
      keyboard: [
        ["🕒 Tugmani Bosing", "📅 Bugungi maqsadlar"],
        ["🤝 Maqsaddoshlar"],
      ],
      resize_keyboard: true,
    },
  });
});

// Maqsaddoshlar bo‘limi
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

bot.onText(/📌 Mening maqsadlarim/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    "Maqsadlaringizni vergul bilan yozing (masalan: Sport, Matematika):"
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
    waitingUsers[goal] = waitingUsers[goal].filter((id) => id !== chatId);

    const otherUser = waitingUsers[goal].find((id) => !pairedUsers[id]);
    if (otherUser && !pairedUsers[otherUser]) {
      pairedUsers[chatId] = otherUser;
      pairedUsers[otherUser] = chatId;
      waitingUsers[goal] = waitingUsers[goal].filter((id) => id !== otherUser);
      bot.sendMessage(
        chatId,
        "✅ Sizga maqsaddosh topildi! Endi yozishingiz mumkin."
      );
      bot.sendMessage(
        otherUser,
        "✅ Sizga maqsaddosh topildi! Endi yozishingiz mumkin."
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

// Chat yozish
bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const partnerId = pairedUsers[chatId];

  if (
    partnerId &&
    !msg.text.includes("Maqsad") &&
    !msg.text.includes("Tugma") &&
    !msg.text.includes("📌") &&
    !msg.text.includes("🔍") &&
    !msg.text.includes("✏️")
  ) {
    bot.sendMessage(partnerId, `💬 [Maqsaddoshingiz]: ${msg.text}`);
  }
});

// Maqsadlarni tahrirlash
bot.onText(/✏️ Maqsadlarni tahrirlash/, (msg) => {
  const chatId = msg.chat.id;
  userDayGoals[chatId] = [];
  bot.sendMessage(
    chatId,
    "Avvalgi maqsadlarni o'zgartirish uchun yangi maqsadlarni yozing."
  );
});
