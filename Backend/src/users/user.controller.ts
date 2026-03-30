import { Request, Response, NextFunction } from "express";
import {
  createUserService,
  deleteUserService,
  getUserByIdService,
  getUsersService,
  updateUserService,
  updateProfileService,
} from "./user.service";

export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await getUsersService();
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = Number(req.params.id);
    if (isNaN(userId)) return res.status(400).json({ message: "Invalid ID" });

    const user = await getUserByIdService(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await createUserService(req.body);
    res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const updatedUser = await updateUserService(id, req.body);
    
    // Returning the user object here is what makes the Frontend work
    res.status(200).json({ 
      message: "User updated successfully", 
      user: updatedUser 
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deleted = await deleteUserService(Number(req.params.id));
    if (!deleted) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const updatedProfile = await updateProfileService(userId, req.body);
    res.status(200).json({ 
      message: "Profile updated successfully", 
      user: updatedProfile 
    });
  } catch (error) {
    next(error);
  }
};