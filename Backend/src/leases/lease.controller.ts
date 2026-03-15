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

export const getMyLeases = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Assuming your auth middleware attaches 'user' to the request
    const studentId = (req as any).user?.userId; 
    if (!studentId) return res.status(401).json({ message: "Unauthorized" });

    const data = await getStudentLeasesService(studentId);
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