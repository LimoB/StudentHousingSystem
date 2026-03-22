import { Request, Response, NextFunction } from "express";
import {
  createLeaseService,
  deleteLeaseService,
  endLeaseService,
  getLeaseByIdService,
  getLeasesService,
  getStudentLeasesService,
} from "./lease.service";

export const getLeases = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await getLeasesService();
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

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

//   GET MY LEASES
//  Standardized to use 'userId' from the Auth Middleware payload.
 
export const getMyLeases = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. Use .userId to match your DecodedToken type in authMiddleware
    // No need for (req as any) because you extended the Request interface!
    const studentId = req.user?.userId; 
    
    if (!studentId) {
      return res.status(401).json({ 
        message: "You must be logged in as a student to view your leases" 
      });
    }

    // 2. Fetch leases using the validated studentId
    const data = await getStudentLeasesService(studentId);

    // 3. Handle empty vs successful response
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};


export const createLease = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const lease = await createLeaseService(req.body);
    res.status(201).json({ message: "Lease created successfully", lease });
  } catch (error) {
    next(error);
  }
};

export const endLease = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const message = await endLeaseService(Number(req.params.id));
    res.status(200).json({ message });
  } catch (error) {
    next(error);
  }
};

export const deleteLease = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deleted = await deleteLeaseService(Number(req.params.id));
    if (!deleted) return res.status(404).json({ message: "Lease not found" });
    res.status(200).json({ message: "Lease deleted successfully" });
  } catch (error) {
    next(error);
  }
};