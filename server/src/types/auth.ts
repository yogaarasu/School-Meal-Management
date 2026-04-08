import type { UserRole } from "./domain.js";

export interface AuthTokenPayload {
  id: string;
  role: UserRole;
}

declare global {
  namespace Express {
    interface Request {
      auth?: AuthTokenPayload;
    }
  }
}

export {};