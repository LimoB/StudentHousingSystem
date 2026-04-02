import { Router } from "express";
import {
  createUnit,
  deleteUnit,
  getUnitById,
  getUnits,
  getUnitsByProperty,
  updateUnit,
} from "./unit.controller";

import {
  authMiddleware,
  adminOrLandlord,
} from "../middleware/authMiddleware";

// IMPORT THE UPLOAD MIDDLEWARE
import { upload } from "../middleware/cloudinary"; 

export const unitRouter = Router();

/* ================================
   VIEW UNITS
================================ */

unitRouter.get("/", authMiddleware, getUnits);

unitRouter.get("/:id", authMiddleware, getUnitById);

unitRouter.get(
  "/property/:propertyId",
  authMiddleware,
  getUnitsByProperty
);

/* ================================
   MANAGE UNITS
================================ */

/**
 * CREATE UNIT
 * upload.single("image") looks for a field named 'image' in your FormData
 */
unitRouter.post(
  "/",
  authMiddleware,
  adminOrLandlord,
  upload.single("image"), // Added Middleware
  createUnit
);

/**
 * UPDATE UNIT
 */
unitRouter.put(
  "/:id",
  authMiddleware,
  adminOrLandlord,
  upload.single("image"), // Added Middleware
  updateUnit
);

unitRouter.delete(
  "/:id",
  authMiddleware,
  adminOrLandlord,
  deleteUnit
);