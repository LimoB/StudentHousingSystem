import { Request, Response, NextFunction } from "express";
import {
  createUnitService,
  deleteUnitService,
  getUnitByIdService,
  getUnitsByPropertyService,
  getUnitsService,
  updateUnitService,
} from "./unit.service";

/**
 * GET ALL UNITS
 * Logic: If Admin, return all. If Landlord, return owned units.
 */
export const getUnits = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const role = req.user?.role; // Assuming role is in your decoded token

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    // FIX: If admin, we pass undefined to the service to signal "Fetch All"
    // If landlord, we pass their specific userId.
    const landlordId = role === 'admin' ? undefined : userId;

    const data = await getUnitsService(landlordId);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

/**
 * GET UNIT BY ID
 */
export const getUnitById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const role = req.user?.role;
    const unitId = Number(req.params.id);
    
    if (!userId || isNaN(unitId)) {
      return res.status(400).json({ message: "Invalid Request" });
    }

    // FIX: Admins should bypass the ownership check
    const landlordId = role === 'admin' ? undefined : userId;

    const unit = await getUnitByIdService(unitId, landlordId);
    if (!unit) return res.status(404).json({ message: "Unit not found or access denied" });

    res.status(200).json(unit);
  } catch (error) {
    next(error);
  }
};

/**
 * GET UNITS BY PROPERTY
 */
export const getUnitsByProperty = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const role = req.user?.role;
    const propertyId = Number(req.params.propertyId);
    
    if (!userId || isNaN(propertyId)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    // FIX: Admins bypass ownership filter
    const landlordId = role === 'admin' ? undefined : userId;

    const data = await getUnitsByPropertyService(propertyId, landlordId);
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
    const userId = req.user?.userId;
    const role = req.user?.role;
    const unitId = Number(req.params.id);
    
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    // FIX: Admins can update any unit, Landlords only their own
    const landlordId = role === 'admin' ? undefined : userId;
    const unit = await getUnitByIdService(unitId, landlordId);
    
    if (!unit) return res.status(403).json({ message: "Unauthorized to update this unit" });

    const message = await updateUnitService(unitId, req.body);
    res.status(200).json({ message });
  } catch (error) {
    next(error);
  }
};

export const deleteUnit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const role = req.user?.role;
    const unitId = Number(req.params.id);

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    // FIX: Admins can delete any unit, Landlords only their own
    const landlordId = role === 'admin' ? undefined : userId;
    const unit = await getUnitByIdService(unitId, landlordId);
    
    if (!unit) return res.status(403).json({ message: "Unauthorized to delete this unit" });

    const deleted = await deleteUnitService(unitId);
    if (!deleted) return res.status(404).json({ message: "Unit not found" });

    res.status(200).json({ message: "Unit deleted successfully" });
  } catch (error) {
    next(error);
  }
};