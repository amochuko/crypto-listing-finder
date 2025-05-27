import { Telegraf } from "telegraf";
import { appShutdown } from "./utils/appShutdown";
import { runTelegramBot } from "./utils/telegram/tg.bot";

let bot: Telegraf;

async function main(argv: string[], shutdownSignal: EventTarget) {
  console.log("Starting app with:", argv[2]);

  // Process stays alive
  bot = await runTelegramBot();

  await new Promise<void>((resolve, reject) => {
    shutdownSignal.addEventListener("abort", () => {
      console.log("Shutdown signal received in main(). Cleaning up...");
      resolve();
    });
  });

}

const abortCtlr = new AbortController();
const signal = abortCtlr.signal;

const shutdown = appShutdown((reason: string) => {
  abortCtlr.abort(); // Signal to main
  bot.stop(reason);
});

main(process.argv, signal).catch((err) => {
  console.error(err, `Uncaught error: ${err.message}`);
  shutdown("main() threw an error", err);
});
