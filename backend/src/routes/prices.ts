import { Router } from "express";
import { fetchPrices } from "../services/coingecko.js";

const router = Router();

router.get("/", async (_req, res, next) => {
  try {
    const result = await fetchPrices();
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
