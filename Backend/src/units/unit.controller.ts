import { Request, Response, NextFunction } from "express";
import cloudinary from "../middleware/cloudinary"; 
import {
  createUnitService,
  deleteUnitService,
  getUnitByIdService,
  getUnitsByPropertyService,
  getUnitsService,
  updateUnitService,
} from "./unit.service";

/**
 * Helper to handle manual Cloudinary Uploads (Fallback only)
 * Used only if Multer fails but a Base64 string exists
 */
const uploadToCloudinary = async (fileStr: string) => {
  try {
    console.log("[Cloudinary] Manual Upload Triggered (Timeout: 240s)");
    const uploadRes = await cloudinary.uploader.upload(fileStr, {
      folder: "rental_app/units",
      resource_type: "auto",
      timeout: 240000, 
    });
    return { url: uploadRes.secure_url, publicId: uploadRes.public_id };
  } catch (error: any) {
    console.error("[Cloudinary Detailed Error]:", error);
    throw new Error("Failed to upload image to cloud storage");
  }
};

/**
 * Optimized Cloudinary cleanup helper
 */
const deleteFromCloudinary = async (publicId: string) => {
  try {
    console.log(`[Cloudinary] Deleting old asset: ${publicId}`);
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.warn(`[Cloudinary] Cleanup failed for ${publicId}:`, err);
  }
};
/**
 * UPDATE UNIT - Final Version (Fixed TS Overwrite & Object Return)
 */
export const updateUnit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const unitId = Number(req.params.id);
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    console.log(`\n--- [START] UPDATE UNIT ID: ${unitId} ---`);

    if (isNaN(unitId)) {
      return res.status(400).json({ message: "Invalid Unit ID" });
    }

    // 1. Fetch current unit state
    const existingUnit = await getUnitByIdService(unitId);
    if (!existingUnit) {
      return res.status(404).json({ message: "Unit not found" });
    }

    // 2. Ownership logic
    const propertyData = existingUnit.property;
    let ownerId: any = null;

    if (Array.isArray(propertyData)) {
      ownerId = propertyData[1]; 
    } else if (propertyData && typeof propertyData === 'object' && 'landlordId' in propertyData) {
      ownerId = (propertyData as any).landlordId;
    }

    if (userRole === "landlord" && ownerId && Number(ownerId) !== Number(userId)) {
      console.warn(`[Auth] Denied: Owner ${ownerId} !== User ${userId}`);
      return res.status(403).json({ message: "Unauthorized: Access Denied" });
    }

    // 3. Prepare data
    const { propertyId, price, isAvailable, image, ...updateData } = req.body;
    const finalUpdate: any = { ...updateData };

    if (propertyId) finalUpdate.propertyId = Number(propertyId);
    if (price) finalUpdate.price = Number(price);
    if (isAvailable !== undefined) {
      finalUpdate.isAvailable = isAvailable === 'true' || isAvailable === true;
    }

    // 4. Image Logic
    const file = req.file as any;
    if (file) {
      if (existingUnit.imagePublicId) {
        await deleteFromCloudinary(existingUnit.imagePublicId);
      }
      finalUpdate.imageUrl = file.path;
      finalUpdate.imagePublicId = file.filename;
    }

    // 5. Update Database
    console.log("[Database] Calling updateUnitService...");
    const result = await updateUnitService(unitId, finalUpdate);
    
    // Explicitly typed as 'any' to handle the transition from null to object/string
    let responseData: any = null;

    // Check if result is the actual object
    if (result && typeof result === 'object' && 'id' in result) {
      responseData = result;
    } else {
      console.warn("[Controller] Service returned message string. Re-fetching full object...");
      responseData = await getUnitByIdService(unitId);
    }

    /**
     * FINAL SAFETY FALLBACK
     * Fixes: 'id' is specified more than once (ts2783)
     */
    if (!responseData || typeof responseData === 'string') {
      // Destructure 'id' out of existingUnit so we don't spread it twice
      const { id: _, ...restOfExisting } = existingUnit;

      responseData = { 
        id: unitId,      // Assign the ID once here
        ...restOfExisting, 
        ...finalUpdate   // Overwrite with the latest changes
      };
    }

    console.log(`--- [SUCCESS] UNIT ${unitId} UPDATED --- \n`);
    
    // Return the OBJECT. This ensures Redux's .id check passes 
    // and your success toaster appears!
    return res.status(200).json(responseData);

  } catch (error: any) {
    console.error("!!! [Controller Error] updateUnit Crash !!!", error.message);
    return res.status(500).json({ 
      message: error.message || "Internal Server Error"
    });
  }
};

/**
 * CREATE UNIT 
 */
export const createUnit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("\n--- [START] CREATE UNIT ---");
    const { propertyId, price, isAvailable, image, ...unitData } = req.body;
    let imageUrl = null;
    let imagePublicId = null;

    const file = req.file as any;
    if (file) {
      console.log("[Upload] Using file from Multer");
      imageUrl = file.path;
      imagePublicId = file.filename;
    } else if (image && typeof image === 'string' && image.startsWith('data:image')) {
      console.log("[Upload] Using Base64 fallback");
      const upload = await uploadToCloudinary(image);
      imageUrl = upload.url;
      imagePublicId = upload.publicId;
    }

    const unitPayload = {
      ...unitData,
      propertyId: Number(propertyId),
      price: Number(price),
      isAvailable: isAvailable === 'true' || isAvailable === true,
      imageUrl,       
      imagePublicId, 
    };

    const unit = await createUnitService(unitPayload);
    console.log("[Success] Unit Created:", unit.id);
    res.status(201).json(unit); // Return the unit directly
  } catch (error: any) {
    console.error("[Create Error]:", error);
    res.status(500).json({ message: error.message || "Failed to create unit" });
  }
};

/**
 * DELETE UNIT
 */
export const deleteUnit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const unitId = Number(req.params.id);
    console.log(`[Delete] Attempting to delete unit ${unitId}`);
    
    const existingUnit = await getUnitByIdService(unitId);
    if (!existingUnit) return res.status(404).json({ message: "Unit not found" });

    if (existingUnit.imagePublicId) {
      await deleteFromCloudinary(existingUnit.imagePublicId);
    }

    await deleteUnitService(unitId);
    res.status(200).json({ message: "Unit deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// ... Standard GET handlers
export const getUnits = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const role = req.user?.role;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const landlordId = role === 'admin' ? undefined : userId;
    const data = await getUnitsService(landlordId);
    res.status(200).json(data);
  } catch (error) { next(error); }
};

export const getUnitById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const unitId = Number(req.params.id);
    const unit = await getUnitByIdService(unitId);
    if (!unit) return res.status(404).json({ message: "Unit not found" });
    res.status(200).json(unit);
  } catch (error) { next(error); }
};

export const getUnitsByProperty = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const propertyId = Number(req.params.propertyId);
    const data = await getUnitsByPropertyService(propertyId);
    res.status(200).json(data);
  } catch (error) { next(error); }
};