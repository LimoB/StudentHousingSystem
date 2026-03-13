import { eq } from "drizzle-orm";
import db from "../drizzle/db";
import { users } from "../drizzle/schema";
import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// TYPES
type UserInsert = InferInsertModel<typeof users>;
type UserSelect = InferSelectModel<typeof users>;
type SafeUser = Omit<UserSelect, "password">;

// ────────────────────────────────
// REGISTER
// ────────────────────────────────

export const registerService = async (
  userData: UserInsert
): Promise<SafeUser> => {

  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, userData.email),
  });

  if (existingUser) {
    throw new Error("User with this email already exists");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(userData.password, salt);

  const [newUser] = await db
    .insert(users)
    .values({
      ...userData,
      password: hashedPassword,
    })
    .returning();

  const { password, ...safeUser } = newUser;

  return safeUser;
};

// ────────────────────────────────
// LOGIN
// ────────────────────────────────

export const loginService = async (
  email: string,
  password: string
): Promise<{ user: SafeUser; token: string }> => {

  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Invalid email or password");
  }

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET not configured");
  }

  const token = jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
    },
    secret,
    { expiresIn: "1d" }
  );

  const { password: _, ...safeUser } = user;

  return {
    user: safeUser,
    token,
  };
};