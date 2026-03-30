import { Request, Response, NextFunction } from "express";
import {
  createMaintenanceRequestService,
  deleteMaintenanceRequestService,
  getMaintenanceRequestsService,
  getLandlordMaintenanceRequestsService,
  getMaintenanceRequestByIdService,
  getMyMaintenanceRequestsService,
  updateMaintenanceStatusService,
} from "./maintenance.service";

export const getMaintenanceRequests = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    let data;

    if (user?.role === "admin") {
      data = await getMaintenanceRequestsService();
    } else if (user?.role === "landlord") {
      data = await getLandlordMaintenanceRequestsService(user.userId);
    } else {
      return res.status(403).json({ message: "Forbidden: Access denied" });
    }

    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

export const getMaintenanceRequestById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const requestId = Number(req.params.id);
    if (isNaN(requestId)) return res.status(400).json({ message: "Invalid ID" });

    const request = await getMaintenanceRequestByIdService(requestId);
    if (!request) return res.status(404).json({ message: "Request not found" });

    res.status(200).json(request);
  } catch (error) {
    next(error);
  }
};

export const getMyMaintenanceRequests = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const studentId = (req as any).user?.userId;
    if (!studentId) return res.status(401).json({ message: "Unauthorized" });

    const data = await getMyMaintenanceRequestsService(studentId);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

export const createMaintenanceRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const studentId = (req as any).user?.userId;
    const request = await createMaintenanceRequestService({
      ...req.body,
      studentId,
    });
    res.status(201).json({ message: "Created successfully", request });
  } catch (error) {
    next(error);
  }
};

export const updateMaintenanceStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Note: You might want to add a check here to ensure the landlord
    // actually owns the property this request belongs to.
    const message = await updateMaintenanceStatusService(Number(req.params.id), req.body.status);
    res.status(200).json({ message });
  } catch (error) {
    next(error);
  }
};

export const deleteMaintenanceRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deleted = await deleteMaintenanceRequestService(Number(req.params.id));
    if (!deleted) return res.status(404).json({ message: "Request not found" });
    res.status(200).json({ message: "Deleted successfully" });
  } catch (error) {
    next(error);
  }
};