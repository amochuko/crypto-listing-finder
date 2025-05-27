import { Telegraf } from "telegraf";
import { BlockchainNetwork } from "../../types";
import { TELEGRAM_BOT_TOKEN } from "../env.config";
import { getNewListingsFromCoinmarketcap } from "../queries";

/**
 * The bot function that accept in the liquidity value via terminal input (at the moment)
 * @param liquidity
 * @returns bot {Telegraf<Context<Update>>}
 */
export async function runTelegramBot(liquidity = 100_000_000_000) {
  const bot = new Telegraf(TELEGRAM_BOT_TOKEN);

  try {
    console.log("Bot activated!");

    bot.command("start", (ctx) => {
      bot.telegram.sendMessage(
        ctx.chat.id,
        `Hello there! welcome to my telegram bot. \nI respond to /newlistings. Please try it', `,
        {}
      );
    });

    bot.command("newlistings", async (ctx) => {
      console.log("newlisting requested.");
      
      try {
        const msg = await getNewListingsFromCoinmarketcap({
          minLiquidity: liquidity,
          network: BlockchainNetwork.eth,
          take: 10,
        });

        bot.telegram.sendMessage(ctx.chat.id, msg);
      } catch (err) {
        console.error("Error newListtings()", err);
      }
    });

    bot.command("about", (ctx) => {
      bot.telegram.sendMessage(
        ctx.chat.id,
        "I bring the latest listing of tokens on Coinmarketcap."
      );
    });

    bot.launch();

    return bot;
  } catch (error) {
    console.error("Error sending Telegram message:", error);
  }
}
