// Shutdown helper
export function appShutdown(shuttingdownCallback: Function) {
  let shuttingDown = false;

  const shutdown = async (reason: string, err = null) => {
    if (shuttingDown) return;
    shuttingDown = true;

    if (err) {
      console.error(err, `Shutting down due to: ${reason}`);
    } else {
      console.log(`Shutting down due to: ${reason}`);
    }

    try {
      await shuttingdownCallback();
    } catch (shutdownErr) {
      console.error("Error during shutdown:", shutdownErr);
      process.exit(1);
    } finally {
      process.exit(err ? 1 : 0);
    }
  };

  process.on("unhandledRejection", (why) =>
    shutdown("Unhandle promise rejection", why)
  );
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("uncaughtException", (err) =>
    shutdown("Uncaught Exception:", `${err.message}`)
  );

  return shutdown;
}
