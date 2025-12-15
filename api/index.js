const TelegramBot = require("node-telegram-bot-api");

// Token Render Environment Variables dan olinadi
const bot = new TelegramBot(process.env.BOT_TOKEN, {
  polling: true
});

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;

  const photoUrl =
    "https://raw.githubusercontent.com/ProgUzmiR-code/proguzmir-server/main/welcome.jpg";

  const caption = `👋 Welcome to ProgUzmiR!

🚀 Mini App ni ochish uchun pastdagi tugmani bosing.`;

  const keyboard = {
    inline_keyboard: [
      [
        {
          text: "🚀 Mini App ni ochish",
          web_app: {
            url: "https://proguzmir.vercel.app/"
          }
        }
      ]
    ]
  };

  try {
    await bot.sendPhoto(chatId, photoUrl, {
      caption,
      reply_markup: keyboard
    });
  } catch (err) {
    console.error("❌ Rasm yuborishda xato:", err.message);

    // Agar rasm yuborilmasa — oddiy xabar
    await bot.sendMessage(chatId, caption, {
      reply_markup: keyboard
    });
  }
});

console.log("✅ Bot ishga tushdi...");