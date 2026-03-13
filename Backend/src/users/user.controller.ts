import { Request, Response, NextFunction } from "express";
import {
  createUserService,
  deleteUserService,
  getUserByIdService,
  getUsersService,
  updateUserService,
  updateProfileService,
} from "./user.service";

/* ================================
   GET ALL USERS
================================ */

export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await getUsersService();

    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

/* ================================
   GET USER BY ID
================================ */

export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = Number(req.params.id);

  if (isNaN(userId)) {
    res.status(400).json({ message: "Invalid user ID" });
    return;
  }

  try {
    const user = await getUserByIdService(userId);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

/* ================================
   CREATE USER
================================ */

export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password, role, fullName } = req.body;

  if (!email || !password || !role || !fullName) {
    res.status(400).json({
      message: "Full name, email, password and role required",
    });
    return;
  }

  try {
    const user = await createUserService(req.body);

    res.status(201).json({
      message: "User created successfully",
      user,
    });
  } catch (error) {
    next(error);
  }
};

/* ================================
   UPDATE USER
================================ */

export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = Number(req.params.id);

  if (isNaN(userId)) {
    res.status(400).json({ message: "Invalid user ID" });
    return;
  }

  try {
    const message = await updateUserService(userId, req.body);

    res.status(200).json({ message });
  } catch (error) {
    next(error);
  }
};

/* ================================
   DELETE USER
================================ */

export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = Number(req.params.id);

  try {
    const deleted = await deleteUserService(userId);

    if (!deleted) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

/* ================================
   UPDATE PROFILE
================================ */

export const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const message = await updateProfileService(
      req.user.userId,
      req.body
    );

    res.status(200).json({ message });
  } catch (error) {
    next(error);
  }
};