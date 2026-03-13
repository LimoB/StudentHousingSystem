import { Router } from "express";
import {
  registerController,
  loginController
} from "./auth.controller";

export const authRouter = Router();

// REGISTER
authRouter.post(
  "/register",
  registerController
);

// LOGIN
authRouter.post(
  "/login",
  loginController
);