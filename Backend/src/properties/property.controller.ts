import { Request, Response, NextFunction } from "express";
import {
  createPropertyService,
  deletePropertyService,
  getPropertiesService,
  getPropertyByIdService,
  updatePropertyService,
} from "./property.service";

// Note: AuthRequest removed. We use the global Request definition instead.

export const getProperties = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userRole = req.user?.role;
    const userId = req.user?.userId;

    let filter: any = {};

    if (userRole === "student") {
      filter.status = "available";
    } 
    else if (userRole === "landlord") {
      // Now the landlord only sees their own
      filter.landlordId = userId;
    }

    const data = await getPropertiesService(Object.keys(filter).length ? filter : undefined);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

export const getPropertyById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const propertyId = Number(req.params.id);
    if (isNaN(propertyId)) return res.status(400).json({ message: "Invalid ID" });

    const userRole = req.user?.role;
    const userId = req.user?.userId;

    let filter: any = {};
    if (userRole === "student") filter.status = "available";
    if (userRole === "landlord") filter.landlordId = userId;

    const property = await getPropertyByIdService(propertyId, Object.keys(filter).length ? filter : undefined);

    if (!property) return res.status(404).json({ message: "Property not found or access restricted" });

    res.status(200).json(property);
  } catch (error) {
    next(error);
  }
};

export const createProperty = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const landlordId = req.user?.userId;
    // Spread req.body and override landlordId with the one from the token
    const property = await createPropertyService({ ...req.body, landlordId });

    res.status(201).json({ message: "Property created successfully", property });
  } catch (error) {
    next(error);
  }
};

export const updateProperty = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const propertyId = Number(req.params.id);
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    // Security: Landlords can only update their own properties
    if (userRole === "landlord") {
      const existing = await getPropertyByIdService(propertyId, { landlordId: userId });
      if (!existing) return res.status(403).json({ message: "Unauthorized: You do not own this property" });
    }

    const message = await updatePropertyService(propertyId, req.body);
    res.status(200).json({ message });
  } catch (error) {
    next(error);
  }
};

export const deleteProperty = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const propertyId = Number(req.params.id);
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    // Security: Landlords can only delete their own properties
    if (userRole === "landlord") {
      const existing = await getPropertyByIdService(propertyId, { landlordId: userId });
      if (!existing) return res.status(403).json({ message: "Unauthorized: You do not own this property" });
    }

    const deleted = await deletePropertyService(propertyId);
    if (!deleted) return res.status(404).json({ message: "Property not found" });
    res.status(200).json({ message: "Property deleted successfully" });
  } catch (error) {
    next(error);
  }
};