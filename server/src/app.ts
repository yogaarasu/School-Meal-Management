import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import "./types/auth.js";
import { env } from "./config/env.js";
import { errorMiddleware } from "./middleware/error.js";
import { adminRouter } from "./routes/admin/index.js";
import { authRouter } from "./routes/auth/index.js";
import { organizerRouter } from "./routes/organizer/index.js";

export const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || env.clientOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Not allowed by CORS"));
    },
    credentials: true
  })
);
app.use(express.json());
app.use(cookieParser());

app.get("/api/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);
app.use("/api/organizer", organizerRouter);

app.use(errorMiddleware);
