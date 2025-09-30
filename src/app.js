import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import {
  errorHandler,
  notFoundHandler,
} from "./middleware/error.middleware.js";
import { attachResponseHelpers } from "./middleware/response.middleware.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
// docs removed

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: true, // reflect request origin
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.options("*", cors({ origin: true, credentials: true }));
app.use(morgan("dev"));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(attachResponseHelpers);

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/v1/auth", authLimiter);

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
// docs route removed

app.get("/health", (req, res) => {
  return res.ok("OK", { uptime: process.uptime() });
});

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
