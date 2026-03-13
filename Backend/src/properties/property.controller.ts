import { Request, Response, NextFunction } from "express";
import {
  createPropertyService,
  deletePropertyService,
  getPropertiesService,
  getPropertyByIdService,
  updatePropertyService,
} from "./property.service";

/* ================================
   GET ALL PROPERTIES
================================ */

export const getProperties = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const properties = await getPropertiesService();

    res.status(200).json(properties);
  } catch (error) {
    next(error);
  }
};

/* ================================
   GET PROPERTY BY ID
================================ */

export const getPropertyById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const propertyId = Number(req.params.id);

  if (isNaN(propertyId)) {
    res.status(400).json({ message: "Invalid property ID" });
    return;
  }

  try {
    const property = await getPropertyByIdService(propertyId);

    if (!property) {
      res.status(404).json({ message: "Property not found" });
      return;
    }

    res.status(200).json(property);
  } catch (error) {
    next(error);
  }
};

/* ================================
   CREATE PROPERTY
================================ */

export const createProperty = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const property = await createPropertyService(req.body);

    res.status(201).json({
      message: "Property created successfully",
      property,
    });
  } catch (error) {
    next(error);
  }
};

/* ================================
   UPDATE PROPERTY
================================ */

export const updateProperty = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const propertyId = Number(req.params.id);

  if (isNaN(propertyId)) {
    res.status(400).json({ message: "Invalid property ID" });
    return;
  }

  try {
    const message = await updatePropertyService(propertyId, req.body);

    res.status(200).json({ message });
  } catch (error) {
    next(error);
  }
};

/* ================================
   DELETE PROPERTY
================================ */

export const deleteProperty = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const propertyId = Number(req.params.id);

  try {
    const deleted = await deletePropertyService(propertyId);

    if (!deleted) {
      res.status(404).json({ message: "Property not found" });
      return;
    }

    res.status(200).json({
      message: "Property deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};