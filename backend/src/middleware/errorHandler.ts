import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import jwt from "jsonwebtoken";
import { config } from "../config.js";

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "HttpError";
  }
}

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: "Validation failed",
      details: err.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
    });
    return;
  }

  if (err instanceof jwt.JsonWebTokenError || err instanceof jwt.TokenExpiredError) {
    res.status(401).json({ error: "Invalid or expired token" });
    return;
  }

  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message });
    return;
  }

  console.error("[error]", err);
  res.status(500).json({
    error: config.isProd ? "Internal server error" : (err as Error)?.message ?? "Unknown error",
  });
};
