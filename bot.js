const TelegramBot = require("node-telegram-bot-api");
const token = "YOUR_BOT_TOKEN";
const bot = new TelegramBot(token, { polling: true });

const userGoals = {};
const userTopics = {}; // chatId: ["Sport", "Matematika"]
const topicGroups = {}; // topic: [chatId]

// START
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const firstName = msg.from.first_name || "Foydalanuvchi";

  bot.sendMessage(
    chatId,
    `Salom👋, ${firstName}! Bu bot @shohjaxon_0000 tomonidan yaratildi.\nQo'shimcha g'oya va takliflar bo'lsa marhamat😊`,
    {
      reply_markup: {
        keyboard: [
          [{ text: "🕒Tugmani Bosing" }],
          [{ text: "👥 Maqsaddoshlar" }],
        ],
        resize_keyboard: true,
      },
    }
  );
});

// Vaqt ko‘rsatish
bot.onText(/🕒Tugmani Bosing/, (msg) => {
  const chatId = msg.chat.id;
  const now = new Date().toLocaleString("en-US", { timeZone: "Asia/Tashkent" });
  const uzTime = new Date(now);
  const newTime = uzTime.toLocaleTimeString("uz-UZ", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  bot.sendMessage(chatId, `🕔 Hozirgi vaqt: ${newTime}`);
});

// 👥 Maqsaddoshlar menyusi
bot.onText(/👥 Maqsaddoshlar/, (msg) => {
  const chatId = msg.chat.id;

  bot.sendMessage(chatId, "Maqsaddoshlar bo‘limiga xush kelibsiz!", {
    reply_markup: {
      keyboard: [
        [{ text: "🎯 Mening maqsadlarim" }],
        [{ text: "🔍 Maqsaddosh izlash" }],
        [{ text: "✏️ Maqsadlarni tahrirlash" }],
        [{ text: "🔙 Orqaga qaytish" }],
      ],
      resize_keyboard: true,
    },
  });
});

// Orqaga qaytish
bot.onText(/🔙 Orqaga qaytish/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, "Asosiy menyu:", {
    reply_markup: {
      keyboard: [
        [{ text: "🕒Tugmani Bosing" }],
        [{ text: "👥 Maqsaddoshlar" }],
      ],
      resize_keyboard: true,
    },
  });
});

// 🎯 Mening maqsadlarim
bot.onText(/🎯 Mening maqsadlarim/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    "Maqsadlaringizni yozing (har birini vergul bilan ajrating, masalan: Sport, Matematika):"
  );

  bot.once("message", (reply) => {
    const topics = reply.text.split(",").map((t) => t.trim());
    userTopics[chatId] = topics;

    topics.forEach((topic) => {
      if (!topicGroups[topic]) topicGroups[topic] = [];
      if (!topicGroups[topic].includes(chatId)) {
        topicGroups[topic].push(chatId);
      }
    });

    bot.sendMessage(chatId, "✅ Maqsadlaringiz saqlandi.");
  });
});

// 🔍 Maqsaddosh izlash
bot.onText(/🔍 Maqsaddosh izlash/, (msg) => {
  const chatId = msg.chat.id;

  const userTopicsList = userTopics[chatId] || [];

  if (userTopicsList.length === 0) {
    bot.sendMessage(chatId, "Siz hali maqsadlaringizni kiritmagansiz.");
    return;
  }

  let matched = false;

  userTopicsList.forEach((topic) => {
    const group = topicGroups[topic] || [];
    group.forEach((otherChatId) => {
      if (otherChatId !== chatId) {
        matched = true;

        bot.sendMessage(
          chatId,
          `🧑‍🤝‍🧑 Siz "${topic}" bo‘yicha maqsaddosh topdingiz!`
        );
        bot.sendMessage(
          otherChatId,
          `🧑‍🤝‍🧑 Yangi maqsaddoshingiz bor: ${msg.from.first_name}\nU sizga xabar yoza oladi.`
        );

        // Ikkalasiga yozilgan matn boshqa foydalanuvchiga boradi
        bot.on("message", (newMsg) => {
          if (
            newMsg.chat.id === chatId &&
            newMsg.text !== "🔍 Maqsaddosh izlash"
          ) {
            bot.sendMessage(
              otherChatId,
              `${msg.from.first_name}: ${newMsg.text}`
            );
          }
          if (
            newMsg.chat.id === otherChatId &&
            newMsg.text !== "🔍 Maqsaddosh izlash"
          ) {
            bot.sendMessage(chatId, `Maqsaddoshingiz: ${newMsg.text}`);
          }
        });
      }
    });
  });

  if (!matched) {
    bot.sendMessage(chatId, "😕 Hozircha sizga mos maqsaddosh topilmadi.");
  }
});

// ✏️ Maqsadlarni tahrirlash
bot.onText(/✏️ Maqsadlarni tahrirlash/, (msg) => {
  const chatId = msg.chat.id;
  if (!userTopics[chatId] || userTopics[chatId].length === 0) {
    bot.sendMessage(chatId, "Sizda maqsadlar mavjud emas.");
    return;
  }

  bot.sendMessage(
    chatId,
    `Hozirgi maqsadlaringiz:\n${userTopics[chatId].join(
      ", "
    )}\n\nYangi maqsadlarni kiriting:`
  );

  bot.once("message", (newMsg) => {
    const topics = newMsg.text.split(",").map((t) => t.trim());
    userTopics[chatId] = topics;

    topics.forEach((topic) => {
      if (!topicGroups[topic]) topicGroups[topic] = [];
      if (!topicGroups[topic].includes(chatId)) {
        topicGroups[topic].push(chatId);
      }
    });

    bot.sendMessage(chatId, "✅ Maqsadlaringiz yangilandi.");
  });
});
