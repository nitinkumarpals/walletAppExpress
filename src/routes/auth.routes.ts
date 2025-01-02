import { Router } from "express";
import { registerUser } from "../controllers/authController";
export const authRouter: Router = Router();
authRouter.route("/signup").post(registerUser);
