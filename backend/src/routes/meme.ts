import { Router } from "express";
import { fetchRandomMeme } from "../services/reddit.js";

const router = Router();

router.get("/", async (_req, res, next) => {
  try {
    const meme = await fetchRandomMeme();
    res.json(meme);
  } catch (err) {
    next(err);
  }
});

export default router;
