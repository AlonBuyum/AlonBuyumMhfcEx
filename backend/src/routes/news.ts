import { Router } from "express";
import { fetchNews } from "../services/coindesk.js";

const router = Router();

router.get("/", async (_req, res, next) => {
  try {
    const { items, usedFallback } = await fetchNews();
    res.json({ items, usedFallback });
  } catch (err) {
    next(err);
  }
});

export default router;
