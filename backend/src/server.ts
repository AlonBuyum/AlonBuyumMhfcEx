import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { config } from "./config.js";
import { migrate } from "./db/migrate.js";
import { requireAuth } from "./middleware/auth.js";
import { errorHandler } from "./middleware/errorHandler.js";
import authRouter from "./routes/auth.js";
import newsRouter from "./routes/news.js";
import pricesRouter from "./routes/prices.js";
import memeRouter from "./routes/meme.js";

const app = express();

if (config.isProd) {
  app.set("trust proxy", 1);
}

app.use(helmet());
app.use(cors({ origin: config.frontendUrl }));
app.use(express.json({ limit: "100kb" }));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later" },
});

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", uptime: process.uptime() });
});

app.use("/auth", authLimiter, authRouter);
app.use("/api/news", requireAuth, newsRouter);
app.use("/api/prices", requireAuth, pricesRouter);
app.use("/api/meme", requireAuth, memeRouter);

app.use(errorHandler);

migrate()
  .then(() => {
    app.listen(config.port, () => {
      console.log(`[server] listening on http://localhost:${config.port}`);
      console.log(`[server] env: ${config.nodeEnv}, frontend: ${config.frontendUrl}`);
    });
  })
  .catch((err) => {
    console.error("[server] startup failed:", err);
    process.exit(1);
  });
