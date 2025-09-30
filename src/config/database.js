import mongoose from "mongoose";

export async function connectMongo() {
  const mongoUri =
    process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/app_db";
  mongoose.set("strictQuery", true);
  await mongoose.connect(mongoUri, {
    autoIndex: true,
  });
  // eslint-disable-next-line no-console
  console.log("MongoDB connected");
}
