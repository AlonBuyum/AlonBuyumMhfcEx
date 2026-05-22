import { Router } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { queryOne } from "../db/index.js";
import { signToken } from "../middleware/auth.js";
import { HttpError } from "../middleware/errorHandler.js";

const router = Router();

const registerSchema = z.object({
  email: z.string().email("Invalid email").toLowerCase().trim(),
  name: z.string().min(1, "Name is required").max(100).trim(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password too long"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email").toLowerCase().trim(),
  password: z.string().min(1, "Password is required"),
});

interface UserRow {
  id: number;
  email: string;
  name: string;
  password_hash: string;
}

router.post("/register", async (req, res, next) => {
  try {
    const { email, name, password } = registerSchema.parse(req.body);

    const existing = await queryOne<UserRow>("SELECT id FROM users WHERE email = $1", [email]);
    if (existing) {
      throw new HttpError(409, "An account with this email already exists");
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await queryOne<UserRow>(
      `INSERT INTO users (email, name, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, email, name, password_hash`,
      [email, name, passwordHash]
    );
    if (!user) throw new HttpError(500, "Failed to create user");

    const token = signToken({ id: user.id, email: user.email });
    res.status(201).json({
      token,
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (err) {
    next(err);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await queryOne<UserRow>(
      "SELECT id, email, name, password_hash FROM users WHERE email = $1",
      [email]
    );
    if (!user) {
      throw new HttpError(401, "Invalid email or password");
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      throw new HttpError(401, "Invalid email or password");
    }

    const token = signToken({ id: user.id, email: user.email });
    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
