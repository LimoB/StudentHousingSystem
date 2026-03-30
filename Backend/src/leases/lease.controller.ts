import { Request, Response, NextFunction } from "express";
import {
  createLeaseService,
  deleteLeaseService,
  endLeaseService,
  getLeaseByIdService,
  getLeasesService,
  getStudentLeasesService,
  getLandlordLeasesService, // Added missing import
} from "./lease.service";

/* ================================
   GET ALL LEASES (Admin)
================================ */
export const getLeases = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await getLeasesService();
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

/* ================================
   GET LEASE BY ID
================================ */
export const getLeaseById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const leaseId = Number(req.params.id);
    if (isNaN(leaseId)) return res.status(400).json({ message: "Invalid ID" });

    const lease = await getLeaseByIdService(leaseId);
    if (!lease) return res.status(404).json({ message: "Lease not found" });

    res.status(200).json(lease);
  } catch (error) {
    next(error);
  }
};

/* ================================
   GET MY LEASES (Student)
================================ */
export const getMyLeases = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const studentId = req.user?.userId; 
    
    if (!studentId) {
      return res.status(401).json({ 
        message: "You must be logged in as a student to view your leases" 
      });
    }

    const data = await getStudentLeasesService(studentId);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

/* ================================
   GET LANDLORD LEASES
================================ */
export const getLandlordLeases = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const landlordId = req.user?.userId; 

    if (!landlordId) {
      return res.status(401).json({ message: "Unauthorized: Landlord ID not found" });
    }

    const data = await getLandlordLeasesService(landlordId);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

/* ================================
   CREATE LEASE
================================ */
export const createLease = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const lease = await createLeaseService(req.body);
    res.status(201).json({ message: "Lease created successfully", lease });
  } catch (error) {
    next(error);
  }
};

/* ================================
   END LEASE
================================ */
export const endLease = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const leaseId = Number(req.params.id);
    if (isNaN(leaseId)) return res.status(400).json({ message: "Invalid Lease ID" });

    const message = await endLeaseService(leaseId);
    res.status(200).json({ message });
  } catch (error) {
    next(error);
  }
};

/* ================================
   DELETE LEASE
================================ */
export const deleteLease = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const leaseId = Number(req.params.id);
    if (isNaN(leaseId)) return res.status(400).json({ message: "Invalid Lease ID" });

    const deleted = await deleteLeaseService(leaseId);
    if (!deleted) return res.status(404).json({ message: "Lease not found" });
    res.status(200).json({ message: "Lease deleted successfully" });
  } catch (error) {
    next(error);
  }
};