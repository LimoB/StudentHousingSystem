import { Request, Response, NextFunction } from "express";
import {
  createUnitService,
  deleteUnitService,
  getUnitByIdService,
  getUnitsByPropertyService,
  getUnitsService,
  updateUnitService,
} from "./unit.service";

export const getUnits = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await getUnitsService();
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

export const getUnitById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const unitId = Number(req.params.id);
    if (isNaN(unitId)) return res.status(400).json({ message: "Invalid ID" });

    const unit = await getUnitByIdService(unitId);
    if (!unit) return res.status(404).json({ message: "Unit not found" });

    res.status(200).json(unit);
  } catch (error) {
    next(error);
  }
};

export const getUnitsByProperty = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const propertyId = Number(req.params.propertyId);
    if (isNaN(propertyId)) return res.status(400).json({ message: "Invalid Property ID" });

    const data = await getUnitsByPropertyService(propertyId);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

export const createUnit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const unit = await createUnitService(req.body);
    res.status(201).json({ message: "Unit created successfully", unit });
  } catch (error) {
    next(error);
  }
};

export const updateUnit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const unitId = Number(req.params.id);
    const message = await updateUnitService(unitId, req.body);
    res.status(200).json({ message });
  } catch (error) {
    next(error);
  }
};

export const deleteUnit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deleted = await deleteUnitService(Number(req.params.id));
    if (!deleted) return res.status(404).json({ message: "Unit not found" });
    res.status(200).json({ message: "Unit deleted successfully" });
  } catch (error) {
    next(error);
  }
};