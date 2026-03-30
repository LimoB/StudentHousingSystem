import { Request, Response, NextFunction } from "express";
import {
  createUnitService,
  deleteUnitService,
  getUnitByIdService,
  getUnitsByPropertyService,
  getUnitsService,
  updateUnitService,
} from "./unit.service";

// NOTE: We don't need a separate AuthRequest interface because 
// your Auth file already globally extended the Express Request.
// We just use the correct property names from your DecodedToken (userId).

export const getUnits = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Using userId as defined in your DecodedToken type
    const landlordId = req.user?.userId;
    if (!landlordId) return res.status(401).json({ message: "Unauthorized" });

    const data = await getUnitsService(landlordId);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

export const getUnitById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const landlordId = req.user?.userId;
    const unitId = Number(req.params.id);
    
    if (!landlordId || isNaN(unitId)) {
      return res.status(400).json({ message: "Invalid Request" });
    }

    const unit = await getUnitByIdService(unitId, landlordId);
    if (!unit) return res.status(404).json({ message: "Unit not found or access denied" });

    res.status(200).json(unit);
  } catch (error) {
    next(error);
  }
};

export const getUnitsByProperty = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const landlordId = req.user?.userId;
    const propertyId = Number(req.params.propertyId);
    
    if (!landlordId || isNaN(propertyId)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const data = await getUnitsByPropertyService(propertyId, landlordId);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

export const createUnit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Optional: You could verify property ownership here too before creating
    const unit = await createUnitService(req.body);
    res.status(201).json({ message: "Unit created successfully", unit });
  } catch (error) {
    next(error);
  }
};

export const updateUnit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const landlordId = req.user?.userId;
    const unitId = Number(req.params.id);
    
    if (!landlordId) return res.status(401).json({ message: "Unauthorized" });

    // Check if landlord owns this unit before updating
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
    const landlordId = req.user?.userId;
    const unitId = Number(req.params.id);

    if (!landlordId) return res.status(401).json({ message: "Unauthorized" });

    // Check ownership
    const unit = await getUnitByIdService(unitId, landlordId);
    if (!unit) return res.status(403).json({ message: "Unauthorized to delete this unit" });

    const deleted = await deleteUnitService(unitId);
    if (!deleted) return res.status(404).json({ message: "Unit not found" });

    res.status(200).json({ message: "Unit deleted successfully" });
  } catch (error) {
    next(error);
  }
};