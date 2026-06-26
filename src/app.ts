import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { rateLimit } from "express-rate-limit";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import router from "./routes/index.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { sendResponse } from "./utils/response.js";

dotenv.config();

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);
app.use(cookieParser());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again after 15 minutes",
  },
});
app.use(limiter);

// Better Auth handler MUST be mounted before body parsing middlewares
app.all("/api/auth/*", toNodeHandler(auth));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

// Catch-all 404
app.use((req, res) => {
  return sendResponse(res, 404, false, `Route ${req.originalUrl} not found`);
});

app.use(errorHandler);

export default app;
