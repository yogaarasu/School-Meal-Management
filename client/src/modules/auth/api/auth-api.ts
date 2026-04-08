import { http } from "@/lib/http";
import type { AuthUser } from "@/modules/shared/types/domain";

export const loginRequest = (payload: { email: string; password: string }) =>
  http<{ user: AuthUser }>("/api/auth/login", { method: "POST", body: payload });

export const logoutRequest = () => http<{ message: string }>("/api/auth/logout", { method: "POST" });

export const sessionRequest = () => http<{ user: AuthUser | null }>("/api/auth/session");
