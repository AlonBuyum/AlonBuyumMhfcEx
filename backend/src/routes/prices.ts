import { Router } from "express";
import { fetchPrices } from "../services/coingecko.js";

const router = Router();

router.get("/", async (_req, res, next) => {
  try {
    const coins = await fetchPrices();
    res.json({ coins });
  } catch (err) {
    next(err);
  }
});

export default router;
