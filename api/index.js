import TelegramBot from "node-telegram-bot-api";
import express from "express";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

dotenv.config();

/* __dirname (ESM) */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* Root papkani aniqlash */
const ROOT_DIR = path.resolve(__dirname, "..");

/* ENV */
const TOKEN = process.env.BOT_TOKEN;
const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL;

if (!TOKEN) throw new Error("❌ BOT_TOKEN topilmadi!");
if (!BASE_URL) throw new Error("❌ BASE_URL topilmadi!");

/* Express */
const app = express();
app.use(express.json());

/* Telegram bot (Webhook) */
const bot = new TelegramBot(TOKEN, { webHook: true });

const WEBHOOK_PATH = `/bot${TOKEN}`;
const WEBHOOK_URL = `${BASE_URL}${WEBHOOK_PATH}`;

await bot.setWebHook(WEBHOOK_URL);
console.log("✅ Webhook o‘rnatildi:", WEBHOOK_URL);

/* Update */
app.post(WEBHOOK_PATH, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

/* Health check */
app.get("/", (req, res) => {
  res.json({ ok: true, status: "Bot ishlayapti 🚀" });
});

/* /start */
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const firstName = msg.from?.first_name || "O'yinchi";

  const caption = `Assalomu alaykum, ${firstName}! 👋

🎮 ProgUzmiR o'yiniga xush kelibsiz!

🪙 Tangani bosing va balansingizni oshiring
👥 Do‘stlaringizni taklif qiling
🚀 Hoziroq boshlang!
`;

  const keyboard = {
    inline_keyboard: [
      [
        {
          text: "🎮 O‘YINNI OCHISH",
          web_app: { url: "https://proguzmir.vercel.app/" }
        }
      ]
    ]
  };

  try {
    const photoPath = path.join(ROOT_DIR, "welcome.jpg");

    if (fs.existsSync(photoPath)) {
      const photoBuffer = fs.readFileSync(photoPath);

      await bot.sendPhoto(
        chatId,
        {
          source: photoBuffer,
          filename: "welcome.jpg"
        },
        {
          caption,
          reply_markup: keyboard
        }
      );
    } else {
      await bot.sendMessage(chatId, caption, {
        reply_markup: keyboard
      });
    }
  } catch (err) {
    console.error("❌ /start xatosi:", err.message);
  }
});

/* Server */
app.listen(PORT, () => {
  console.log(`🚀 Server ${PORT}-portda ishlayapti`);
});