import { Request, Response, NextFunction } from "express";
import {
  createMaintenanceRequestService,
  deleteMaintenanceRequestService,
  getMaintenanceRequestsService,
  getMaintenanceRequestByIdService,
  getMyMaintenanceRequestsService,
  updateMaintenanceStatusService,
} from "./maintenance.service";

/* ================================
   GET ALL REQUESTS (ADMIN / LANDLORD)
================================ */
export const getMaintenanceRequests = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const requests = await getMaintenanceRequestsService();
    res.status(200).json(requests);
  } catch (error) {
    next(error);
  }
};

/* ================================
   GET REQUEST BY ID
================================ */
export const getMaintenanceRequestById = async (req: Request, res: Response, next: NextFunction) => {
  const requestId = Number(req.params.id);
  if (isNaN(requestId)) return res.status(400).json({ message: "Invalid request ID" });

  try {
    const request = await getMaintenanceRequestByIdService(requestId);
    if (!request) return res.status(404).json({ message: "Request not found" });

    res.status(200).json(request);
  } catch (error) {
    next(error);
  }
};

/* ================================
   GET MY REQUESTS (STUDENT)
================================ */
export const getMyMaintenanceRequests = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const requests = await getMyMaintenanceRequestsService(req.user.userId);
    res.status(200).json(requests);
  } catch (error) {
    next(error);
  }
};

/* ================================
   CREATE REQUEST (STUDENT)
================================ */
export const createMaintenanceRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const request = await createMaintenanceRequestService({
      ...req.body,
      studentId: req.user.userId,
    });

    res.status(201).json({
      message: "Maintenance request created successfully",
      request,
    });
  } catch (error) {
    next(error);
  }
};

/* ================================
   UPDATE STATUS (ADMIN / LANDLORD)
================================ */
export const updateMaintenanceStatus = async (req: Request, res: Response, next: NextFunction) => {
  const requestId = Number(req.params.id);
  const { status } = req.body;

  try {
    const message = await updateMaintenanceStatusService(requestId, status);
    res.status(200).json({ message });
  } catch (error) {
    next(error);
  }
};

/* ================================
   DELETE REQUEST
================================ */
export const deleteMaintenanceRequest = async (req: Request, res: Response, next: NextFunction) => {
  const requestId = Number(req.params.id);

  try {
    const deleted = await deleteMaintenanceRequestService(requestId);
    if (!deleted) return res.status(404).json({ message: "Request not found" });

    res.status(200).json({ message: "Request deleted successfully" });
  } catch (error) {
    next(error);
  }
};