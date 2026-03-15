import { Request, Response, NextFunction } from "express";
import {
  createPropertyService,
  deletePropertyService,
  getPropertiesService,
  getPropertyByIdService,
  updatePropertyService,
} from "./property.service";

export const getProperties = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userRole = (req as any).user?.role;
    // Students only see available hostels; Admins/Landlords see the full inventory
    const filter = userRole === "student" ? { status: "available" as const } : undefined;
    
    const data = await getPropertiesService(filter);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

export const getPropertyById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const propertyId = Number(req.params.id);
    if (isNaN(propertyId)) return res.status(400).json({ message: "Invalid ID" });

    const userRole = (req as any).user?.role;
    const filter = userRole === "student" ? { status: "available" as const } : undefined;

    const property = await getPropertyByIdService(propertyId, filter);

    if (!property) return res.status(404).json({ message: "Property not found or unavailable" });

    res.status(200).json(property);
  } catch (error) {
    next(error);
  }
};

export const createProperty = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Automatically set landlordId from the authenticated user
    const landlordId = (req as any).user?.userId;
    const property = await createPropertyService({ ...req.body, landlordId });

    res.status(201).json({ message: "Property created successfully", property });
  } catch (error) {
    next(error);
  }
};

export const updateProperty = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const message = await updatePropertyService(Number(req.params.id), req.body);
    res.status(200).json({ message });
  } catch (error) {
    next(error);
  }
};

export const deleteProperty = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deleted = await deletePropertyService(Number(req.params.id));
    if (!deleted) return res.status(404).json({ message: "Property not found" });
    res.status(200).json({ message: "Property deleted successfully" });
  } catch (error) {
    next(error);
  }
};