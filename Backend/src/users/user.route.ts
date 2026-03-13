import { Router } from "express";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateProfile,
} from "./user.controller";

import {
  authMiddleware,
  adminOnly,
} from "../middleware/authMiddleware";

export const userRouter = Router();

/* ================================
   ADMIN ROUTES
================================ */

userRouter.get(
  "/",
  authMiddleware,
  adminOnly,
  getUsers
);

userRouter.get(
  "/:id",
  authMiddleware,
  adminOnly,
  getUserById
);

userRouter.post(
  "/",
  authMiddleware,
  adminOnly,
  createUser
);

userRouter.put(
  "/:id",
  authMiddleware,
  adminOnly,
  updateUser
);

userRouter.delete(
  "/:id",
  authMiddleware,
  adminOnly,
  deleteUser
);

/* ================================
   USER PROFILE
================================ */

userRouter.put(
  "/profile",
  authMiddleware,
  updateProfile
);