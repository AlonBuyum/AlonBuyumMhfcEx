import { apiClient } from "./client";
import type { LoginFormValues, RegisterFormValues } from "../lib/validation";
import type { StoredUser } from "../lib/auth-storage";

export interface AuthResponse {
  token: string;
  user: StoredUser;
}

export async function login(values: LoginFormValues): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>("/auth/login", values);
  return data;
}

export async function register(values: RegisterFormValues): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>("/auth/register", values);
  return data;
}
