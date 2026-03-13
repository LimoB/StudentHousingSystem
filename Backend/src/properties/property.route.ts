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

export const propertyRouter = Router();

/* ================================
   PUBLIC / AUTHENTICATED
================================ */

propertyRouter.get("/", authMiddleware, getProperties);

propertyRouter.get("/:id", authMiddleware, getPropertyById);

/* ================================
   LANDLORD / ADMIN
================================ */

propertyRouter.post(
  "/",
  authMiddleware,
  adminOrLandlord,
  createProperty
);

propertyRouter.put(
  "/:id",
  authMiddleware,
  adminOrLandlord,
  updateProperty
);

propertyRouter.delete(
  "/:id",
  authMiddleware,
  adminOrLandlord,
  deleteProperty
);