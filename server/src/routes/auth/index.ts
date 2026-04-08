import { Router } from "express";
import { loginController, logoutController, sessionController } from "../../controllers/auth/auth.controller.js";

export const authRouter = Router();

authRouter.post("/login", loginController);
authRouter.get("/session", sessionController);
authRouter.post("/logout", logoutController);