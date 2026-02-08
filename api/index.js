import TelegramBot from "node-telegram-bot-api";
import express from "express";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const TOKEN = process.env.BOT_TOKEN || process.env.TELEGRAM_TOKEN;
const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL; // Render URL

if (!TOKEN) throw new Error("❌ BOT_TOKEN topilmadi!");
if (!BASE_URL) throw new Error("❌ BASE_URL topilmadi!");

const app = express();
app.use(express.json());

// Telegram bot (WEBHOOK rejim)
const bot = new TelegramBot(TOKEN, { webHook: true });

// Webhook o'rnatish
const WEBHOOK_PATH = `/bot${TOKEN}`;
const WEBHOOK_URL = `${BASE_URL}${WEBHOOK_PATH}`;

// Top-level await ishlatish uchun (agar Node versiyangiz to'g'ri kelsa)
// Yoki buni async funksiya ichiga olishingiz mumkin.
try {
  await bot.setWebHook(WEBHOOK_URL);
  console.log("✅ Webhook o‘rnatildi:", WEBHOOK_URL);
} catch (error) {
  console.error("❌ Webhook xatosi:", error);
}

// Update qabul qilish
app.post(WEBHOOK_PATH, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// Health check
app.get("/", (req, res) => {
  res.json({ ok: true, status: "Bot ishlamoqda 🚀" });
});

// --- ASOSIY O'ZGARISH SHU YERDA ---

// Regex o'zgardi: /\/start(?: (.+))?/ -> Bu "start" dan keyingi so'zlarni (ref kodni) tutib oladi
bot.onText(/\/start(?: (.+))?/, async (msg, match) => {
  const chatId = msg.chat.id;
  const firstName = msg.from.first_name || "Friend";
  
  // 1. Start parametreni (ref kodni) ushlab olamiz
  // match[1] ichida "ref_12345" kabi qiymat bo'ladi (agar bor bo'lsa)
  const startParam = match[1]; 

  // 2. Ilova havolasini tayyorlaymiz
  let webAppUrl = "https://proguzmir.vercel.app/";

  // Agar referal kod bo'lsa, uni URLga qo'shamiz
  if (startParam) {
    // ?start_param= bu Telegramning standart parametri
    // Frontendda initDataUnsafe.start_param orqali o'qiladi
    webAppUrl += `?start_param=${startParam}`;
  }

  console.log(`User: ${firstName}, Param: ${startParam || "No"}, URL: ${webAppUrl}`);

  const keyboard = {
    inline_keyboard: [
      [
        {
          text: "🎮 Open the game 🎮",
          web_app: { url: webAppUrl } // <-- Dinamik URL berildi
        }
      ]
    ]
  };

  const caption = `Hi 👋 ${firstName}, this is ProgUzmiR! 

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
        contentType: "image/jpg"
      });
    } else {
      await bot.sendMessage(chatId, caption, {
        reply_markup: keyboard
      });
    }
  } catch (err) {
    console.error("❌ /start xatosi:", err.message);
    // Xatolik bo'lsa ham foydalanuvchi javobsiz qolmasligi uchun:
    await bot.sendMessage(chatId, caption, { reply_markup: keyboard }).catch(() => {});
  }
});

// Server ishga tushadi
app.listen(PORT, () => {
  console.log(`🚀 Server ${PORT}-portda ishlayapti`);
});
