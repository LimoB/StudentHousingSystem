import { Request, Response, NextFunction } from "express";
import {
  createUnitService,
  deleteUnitService,
  getUnitByIdService,
  getUnitsByPropertyService,
  getUnitsService,
  updateUnitService,
} from "./unit.service";

/* ================================
   GET ALL UNITS
================================ */

export const getUnits = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const units = await getUnitsService();

    res.status(200).json(units);
  } catch (error) {
    next(error);
  }
};

/* ================================
   GET UNIT BY ID
================================ */

export const getUnitById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const unitId = Number(req.params.id);

  if (isNaN(unitId)) {
    res.status(400).json({ message: "Invalid unit ID" });
    return;
  }

  try {
    const unit = await getUnitByIdService(unitId);

    if (!unit) {
      res.status(404).json({ message: "Unit not found" });
      return;
    }

    res.status(200).json(unit);
  } catch (error) {
    next(error);
  }
};

/* ================================
   GET UNITS BY PROPERTY
================================ */

export const getUnitsByProperty = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const propertyId = Number(req.params.propertyId);

  if (isNaN(propertyId)) {
    res.status(400).json({ message: "Invalid property ID" });
    return;
  }

  try {
    const units = await getUnitsByPropertyService(propertyId);

    res.status(200).json(units);
  } catch (error) {
    next(error);
  }
};

/* ================================
   CREATE UNIT
================================ */

export const createUnit = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const unit = await createUnitService(req.body);

    res.status(201).json({
      message: "Unit created successfully",
      unit,
    });
  } catch (error) {
    next(error);
  }
};

/* ================================
   UPDATE UNIT
================================ */

export const updateUnit = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const unitId = Number(req.params.id);

  if (isNaN(unitId)) {
    res.status(400).json({ message: "Invalid unit ID" });
    return;
  }

  try {
    const message = await updateUnitService(unitId, req.body);

    res.status(200).json({ message });
  } catch (error) {
    next(error);
  }
};

/* ================================
   DELETE UNIT
================================ */

export const deleteUnit = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const unitId = Number(req.params.id);

  try {
    const deleted = await deleteUnitService(unitId);

    if (!deleted) {
      res.status(404).json({ message: "Unit not found" });
      return;
    }

    res.status(200).json({
      message: "Unit deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};