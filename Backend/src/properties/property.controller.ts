import { Request, Response, NextFunction } from "express";
import cloudinary from "../middleware/cloudinary"; 
import {
  createPropertyService,
  deletePropertyService,
  getPropertiesService,
  getPropertyByIdService,
  updatePropertyService,
} from "./property.service";

/**
 * GET ALL PROPERTIES
 */
export const getProperties = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userRole = req.user?.role;
    const userId = req.user?.userId;

    console.log(`[Controller] Fetching properties for Role: ${userRole}, UserID: ${userId}`);

    let filter: any = {};
    if (userRole === "student") {
      filter.status = "available";
    } 
    else if (userRole === "landlord") {
      // Using landlordId consistently
      filter.landlordId = userId;
    }

    const data = await getPropertiesService(Object.keys(filter).length ? filter : undefined);
    res.status(200).json(data);
  } catch (error) {
    console.error("[Controller Error] getProperties:", error);
    next(error);
  }
};

/**
 * GET PROPERTY BY ID
 */
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
    console.error("[Controller Error] getPropertyById:", error);
    next(error);
  }
};

/**
 * CREATE PROPERTY
 */
export const createProperty = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const landlordId = req.user?.userId;
    const { ...propertyData } = req.body;

    const file = req.file as any;
    const imageUrl = file ? file.path : null;
    const imagePublicId = file ? file.filename : null;

    console.log("[Create] Payload:", { ...propertyData, landlordId });

    const property = await createPropertyService({ 
      ...propertyData, 
      landlordId, // Consistently using landlordId
      imageUrl,
      imagePublicId 
    });

    // Return the created property object directly for the frontend
    res.status(201).json(property); 
  } catch (error) {
    console.error("[Controller Error] createProperty:", error);
    next(error);
  }
};

/**
 * UPDATE PROPERTY
 */
export const updateProperty = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const propertyId = Number(req.params.id);
    const userId = req.user?.userId;
    const userRole = req.user?.role;
    
    console.log(`\n--- START UPDATE PROPERTY ID: ${propertyId} ---`);

    // 1. Fetch Existing
    const existing = await getPropertyByIdService(propertyId);
    if (!existing) {
      console.warn("[Update] Property not found");
      return res.status(404).json({ message: "Property not found" });
    }
    
    // 2. Ownership Check (Using landlordId)
    const ownerId = Number(existing.landlordId);
    if (userRole === "landlord" && ownerId !== Number(userId)) {
      console.warn(`[Update] Unauthorized. Owner: ${ownerId}, Request User: ${userId}`);
      return res.status(403).json({ message: "Unauthorized: Ownership required" });
    }

    // 3. Prepare Update Object
    const updateData = { ...req.body };

    // 4. Handle Image logic via Multer (Streamed upload)
    const file = req.file as any;
    if (file) {
      console.log("[Update] New image uploaded to Cloudinary:", file.filename);
      
      // Cleanup old image
      if (existing.imagePublicId) {
        try {
          await cloudinary.uploader.destroy(existing.imagePublicId);
        } catch (err) {
          console.warn("[Cloudinary] Old asset cleanup failed (skipped)");
        }
      }
      
      updateData.imageUrl = file.path;
      updateData.imagePublicId = file.filename;
    }

    // 5. Commit to Service
    const updatedResult = await updatePropertyService(propertyId, updateData);
    
    console.log("[Update] Success. Returning updated data to frontend.");
    console.log("--- END UPDATE --- \n");

    /**
     * FIX: Return the updatedResult directly. 
     * Frontend checks for properties like updatedResult.id 
     */
    res.status(200).json(updatedResult);

  } catch (error: any) {
    console.error("!!! [Controller Error] updateProperty Crash !!!", error.message);
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

/**
 * DELETE PROPERTY
 */
export const deleteProperty = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const propertyId = Number(req.params.id);
    const userId = req.user?.userId;
    
    const existing = await getPropertyByIdService(propertyId);
    if (!existing) return res.status(404).json({ message: "Property not found" });

    // Ownership check using landlordId
    if (req.user?.role === "landlord" && Number(existing.landlordId) !== Number(userId)) {
      return res.status(403).json({ message: "Unauthorized: Ownership required" });
    }

    if (existing.imagePublicId) {
      await cloudinary.uploader.destroy(existing.imagePublicId);
    }

    await deletePropertyService(propertyId);
    res.status(200).json({ message: "Property deleted successfully" });
  } catch (error) {
    console.error("[Controller Error] deleteProperty:", error);
    next(error);
  }
};