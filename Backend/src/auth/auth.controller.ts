import { Request, Response } from "express";
import { registerService, loginService } from "./auth.service";

// roles from schema
const allowedRoles = ["admin", "landlord", "student"] as const;
type AllowedRole = typeof allowedRoles[number];

// ────────────────────────────────
// REGISTER
// ────────────────────────────────

export const registerController = async (
  req: Request,
  res: Response
): Promise<void> => {

  try {

    const { fullName, email, phone, password, role } = req.body;

    if (!fullName || !email || !password || !role) {
      res.status(400).json({
        error: "fullName, email, password and role are required",
      });
      return;
    }

    if (!allowedRoles.includes(role)) {
      res.status(400).json({
        error: "Invalid role",
      });
      return;
    }

    const user = await registerService({
      fullName,
      email,
      phone,
      password,
      role,
    } as any);

    res.status(201).json({
      message: "User registered successfully",
      user,
    });

  } catch (error) {

    res.status(400).json({
      error: (error as Error).message,
    });

  }
};

// ────────────────────────────────
// LOGIN
// ────────────────────────────────

export const loginController = async (
  req: Request,
  res: Response
): Promise<void> => {

  try {

    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        error: "Email and password are required",
      });
      return;
    }

    const result = await loginService(email, password);

    res.status(200).json({
      message: "Login successful",
      ...result,
    });

  } catch (error) {

    res.status(401).json({
      error: (error as Error).message,
    });

  }
};