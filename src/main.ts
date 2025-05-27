import { getNewListingsAndPushToTelegram } from "./utils/queries";

async function main(argv: string[]) {
  await getNewListingsAndPushToTelegram(parseInt(argv[2]));
}

main(process.argv).catch((err) => {
  console.error(err, `Uncaught error: ${err.message}`);
  process.exitCode = 1;
});

process
  .on("unhandledRejection", (why) => {
    console.error(why ?? {}, `Unhandled rejection: ${(why as Error)?.message}`);
  })
  .on("SIGTERM", () => {
    console.error("SIGTERM signal received: closing HTTP server");
  })
  .on("uncaughtException", (err) => {
    console.error(err, `Uncaught Exception: ${err.message}`);
    process.exitCode = 1;
  });
