import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === "") {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

function optional(name: string, fallback: string): string {
  return process.env[name]?.trim() || fallback;
}

export const config = {
  port: Number(optional("PORT", "4000")),
  nodeEnv: optional("NODE_ENV", "development"),
  isProd: process.env.NODE_ENV === "production",

  jwtSecret: required("JWT_SECRET"),
  jwtExpiresIn: "7d" as const,

  databaseUrl: process.env.DATABASE_URL?.trim() || "",
  frontendUrl: optional("FRONTEND_URL", "http://localhost:5173"),

  cryptoPanicKey: process.env.CRYPTOPANIC_KEY?.trim() || "",
};

export type AppConfig = typeof config;
