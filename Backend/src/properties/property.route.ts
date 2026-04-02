import { Router } from "express";
import {
  createProperty,
  deleteProperty,
  getProperties,
  getPropertyById,
  updateProperty,
} from "./property.controller";

import {
  authMiddleware,
  adminOrLandlord,
} from "../middleware/authMiddleware";

// IMPORT THE UPLOAD MIDDLEWARE
import { upload } from "../middleware/cloudinary"; 

export const propertyRouter = Router();

/* ================================
   PUBLIC / AUTHENTICATED
================================ */

propertyRouter.get("/", authMiddleware, getProperties);

propertyRouter.get("/:id", authMiddleware, getPropertyById);

/* ================================
   LANDLORD / ADMIN
================================ */

/**
 * CREATE PROPERTY
 * upload.single("image") handles the multipart/form-data
 */
propertyRouter.post(
  "/",
  authMiddleware,
  adminOrLandlord,
  upload.single("image"), // Added Middleware
  createProperty
);

/**
 * UPDATE PROPERTY
 */
propertyRouter.put(
  "/:id",
  authMiddleware,
  adminOrLandlord,
  upload.single("image"), // Added Middleware
  updateProperty
);

propertyRouter.delete(
  "/:id",
  authMiddleware,
  adminOrLandlord,
  deleteProperty
);