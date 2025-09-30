import app from "../src/app.js";
import { connectMongo } from "../src/config/database.js";

let isConnected = false;

export default async function handler(req, res) {
  if (!isConnected) {
    await connectMongo();
    isConnected = true;
  }
  return app(req, res);
}
