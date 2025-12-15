import TelegramBot from "node-telegram-bot-api";
import express from "express";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const TOKEN = process.env.BOT_TOKEN || process.env.TELEGRAM_TOKEN;
const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL; // Render URL

if (!TOKEN) {
  throw new Error("❌ BOT_TOKEN topilmadi!");
}

if (!BASE_URL) {
  throw new Error("❌ BASE_URL topilmadi! (Render domeni)");
}

const app = express();
app.use(express.json());

// Telegram bot (WEBHOOK rejim)
const bot = new TelegramBot(TOKEN, { webHook: true });

// Webhook ni o‘rnatish
const WEBHOOK_PATH = `/bot${TOKEN}`;
const WEBHOOK_URL = `${BASE_URL}${WEBHOOK_PATH}`;

await bot.setWebHook(WEBHOOK_URL);
console.log("✅ Webhook o‘rnatildi:", WEBHOOK_URL);

// Telegram update qabul qilish
app.post(WEBHOOK_PATH, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// Health check
app.get("/", (req, res) => {
  res.json({ ok: true, status: "Bot ishlamoqda 🚀" });
});

// /start komandasi
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const firstName = msg.from.first_name || "playng";

  const keyboard = {
    inline_keyboard: [
      [
        {
          text: "🎮 Open the game 🎮",
          web_app: { url: "https://proguzmir.vercel.app/" }
        }
      ]
    ]
  };

  const caption = `Hi 👋 ${firstName} the is ProgUzmiR! 

Welcome to the ProgUzmiR game! 🎯

🪙 Click on the coin and watch your balance grow.
👥 Invite your friends.
🚀 Start the game now!
`;

  try {
    const photoPath = path.join(process.cwd(), "welcome.jpg");

    if (fs.existsSync(photoPath)) {
      await bot.sendPhoto(chatId, fs.createReadStream(photoPath), {
        caption,
        reply_markup: keyboard,
        filename: "welcome.jpg",
        contentType: "image/jpg"
      });
    } else {
      await bot.sendMessage(chatId, caption, {
        reply_markup: keyboard
      });
      await bot.sendMessage(msg.chat.id, "Xatolik yuz berdi. Keyinroq urinib ko'ring.");
    }
  }
   catch (err) {
    console.error("❌ /start xatosi:", err.message);
  }
});


// Server ishga tushadi
app.listen(PORT, () => {
  console.log(`🚀 Server ${PORT}-portda ishlayapti`);
});