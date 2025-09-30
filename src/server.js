import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import { connectMongo } from "./config/database.js";

const PORT = process.env.PORT || 3000;

async function start() {
  await connectMongo();
  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server listening on port ${PORT}`);
  });
}

start().catch((error) => {
  // eslint-disable-next-line no-console
  console.error("Failed to start server", error);
  process.exit(1);
});
