const TelegramBot = require("node-telegram-bot-api");
const token = "7711842324:AAHMFaGCwkSo4F1FXqFAFqapsOuMAe9HgfU";
const bot = new TelegramBot(token, { polling: true });

const userGoals = {}; // { chatId: [ { time: "08:00", task: "Uygonaman", done: false } ] }

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const firstName = msg.from.first_name || "Foydalanuvchi";

  bot.sendMessage(
    chatId,
    `Salom👋, ${firstName}! Bu bot @shohjaxon_0000 tomonidan yaratildi.\nQo'shimcha g'oya va takliflar bo'lsa marhamat😊`,
    {
      reply_markup: {
        keyboard: [[{ text: "🕒Tugmani Bosing" }], [{ text: "📌 Maqsadlar" }]],
        resize_keyboard: true,
      },
    }
  );
});

// 📌 Maqsadlar tugmasi
bot.onText(/📌 Maqsadlar/, (msg) => {
  const chatId = msg.chat.id;

  bot.sendMessage(chatId, "Maqsadlar bo'limiga xush kelibsiz!", {
    reply_markup: {
      keyboard: [
        [{ text: "📌 Bugungi maqsadlar" }],
        [{ text: "🗑 Maqsadlarni o'chirish" }],
        [{ text: "📍 Maqsadlarni o'zgartirish" }],
        [{ text: "🔙 Orqaga qaytish" }],
      ],
      resize_keyboard: true,
    },
  });
});

// Orqaga qaytish tugmasi
bot.onText(/🔙 Orqaga qaytish/, (msg) => {
  const chatId = msg.chat.id;

  bot.sendMessage(chatId, "Asosiy menyu:", {
    reply_markup: {
      keyboard: [[{ text: "🕒Tugmani Bosing" }], [{ text: "📌 Maqsadlar" }]],
      resize_keyboard: true,
    },
  });
});

// 🕒 Tugmani bos
bot.onText(/🕒Tugmani Bos/, (msg) => {
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

// 📌 Bugungi maqsadlar tugmasi
bot.onText(/📌 Bugungi maqsadlar/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    "Bugungi maqsadlaringizni yozing. Har birini yangi qatorda va vaqt bilan yozing:\n\nMasalan:\n08:00 Uyg'onaman\n12:09 Tushlik qilaman"
  );

  bot.once("message", (reply) => {
    const lines = reply.text.split("\n");
    userGoals[chatId] = [];

    lines.forEach((line) => {
      const match = line.match(/^(\d{2}:\d{2})\s+(.+)/);
      if (match) {
        userGoals[chatId].push({
          time: match[1],
          task: match[2],
          done: false,
        });
      }
    });

    bot.sendMessage(
      chatId,
      "✅ Maqsadlaringiz saqlandi! Vaqti kelganda eslatib turaman. ",
      {
        reply_markup: {
          keyboard: [
            [{ text: "🕒Tugmani Bosing" }],
            [{ text: "📌 Maqsadlar" }],
          ],
          resize_keyboard: true,
        },
      }
    );
  });
});

// 🗑 Maqsadlarni o'chirish
bot.onText(/🗑 Maqsadlarni o'chirish/, (msg) => {
  const chatId = msg.chat.id;
  delete userGoals[chatId];
  bot.sendMessage(chatId, "📭 Barcha maqsadlar o‘chirildi.");
});

// 📍 Maqsadlarni o'zgartirish
bot.onText(/📍 Maqsadlarni o'zgartirish/, (msg) => {
  const chatId = msg.chat.id;

  if (!userGoals[chatId] || userGoals[chatId].length === 0) {
    bot.sendMessage(
      chatId,
      "Sizda hech qanday maqsadlar mavjud emas. Avval maqsadlar qo'shing."
    );
    return;
  }

  let message = "Maqsadlaringiz:\n";
  userGoals[chatId].forEach((goal, index) => {
    message += `${index + 1}. ${goal.time} - ${goal.task}\n`;
  });
  message += "\nYangi maqsadni o'zgartirish uchun raqamni kiriting (1-5):";

  bot.sendMessage(chatId, message);
});

// Maqsadni o'zgartirish jarayoni
bot.on("message", (msg) => {
  const chatId = msg.chat.id;

  if (msg.text.match(/^[1-9]$/)) {
    const goalIndex = parseInt(msg.text) - 1;

    if (userGoals[chatId][goalIndex]) {
      bot.sendMessage(chatId, `Maqsadni o'zgartiring:\nVaqt (masalan, 08:00):`);

      bot.once("message", (newTimeMsg) => {
        const newTime = newTimeMsg.text;

        bot.sendMessage(
          chatId,
          `Yangi vazifani yozing (masalan, "Tushlik qilaman"):`
        );

        bot.once("message", (newTaskMsg) => {
          const newTask = newTaskMsg.text;

          // Maqsadni yangilash
          userGoals[chatId][goalIndex].time = newTime;
          userGoals[chatId][goalIndex].task = newTask;

          bot.sendMessage(
            chatId,
            `✅ Maqsadingiz yangilandi:\n${newTime} - ${newTask}`
          );
        });
      });
    } else {
      bot.sendMessage(
        chatId,
        "Bunday maqsad mavjud emas. Iltimos, to'g'ri raqamni kiriting."
      );
    }
  }
});
