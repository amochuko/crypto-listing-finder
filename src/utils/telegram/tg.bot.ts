import { Telegraf } from "telegraf";
import { TELEGRAM_BOT_TOKEN } from "../env.config";

interface TelegramReponse {
  data: Record<string, any>;
  [key: string]: any;
}

const bot = new Telegraf(TELEGRAM_BOT_TOKEN);

export async function sendTelegramMessage(msg: string) {
  try {
    bot.command("start", (ctx) => {
      bot.telegram.sendMessage(
        ctx.chat.id,
        `Hello there! welcome to my telegram bot. \nI respond to /newlistings. Please try it', `,
        {}
      );
    });

    bot.command("newlistings", (ctx) => {
      bot.telegram.sendMessage(ctx.chat.id, msg);
    });

    bot.command("about", (ctx) => {
      bot.telegram.sendMessage(
        ctx.chat.id,
        "I bring the latest listing of tokens on Coinmarketcap."
      );
    });

    bot.command("demo", (ctx) => {
      bot.telegram.sendMessage(
        ctx.chat.id,
        "For a starter, try sending me `/newlistings`."
      );
    });

    bot.launch();
  } catch (error) {
    console.log("Error sending Telegram message:", error);
  }
}
