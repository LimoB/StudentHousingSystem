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

unitRouter.post(
  "/",
  authMiddleware,
  adminOrLandlord,
  createUnit
);

unitRouter.put(
  "/:id",
  authMiddleware,
  adminOrLandlord,
  updateUnit
);

unitRouter.delete(
  "/:id",
  authMiddleware,
  adminOrLandlord,
  deleteUnit
);