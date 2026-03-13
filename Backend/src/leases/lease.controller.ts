import { Request, Response, NextFunction } from "express";
import {
  createLeaseService,
  deleteLeaseService,
  endLeaseService,
  getLeaseByIdService,
  getLeasesService,
  getStudentLeasesService,
} from "./lease.service";

/* ================================
   GET ALL LEASES
================================ */

export const getLeases = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const leases = await getLeasesService();

    res.status(200).json(leases);
  } catch (error) {
    next(error);
  }
};

/* ================================
   GET LEASE BY ID
================================ */

export const getLeaseById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const leaseId = Number(req.params.id);

  if (isNaN(leaseId)) {
    res.status(400).json({ message: "Invalid lease ID" });
    return;
  }

  try {
    const lease = await getLeaseByIdService(leaseId);

    if (!lease) {
      res.status(404).json({ message: "Lease not found" });
      return;
    }

    res.status(200).json(lease);
  } catch (error) {
    next(error);
  }
};

/* ================================
   GET MY LEASES
================================ */

export const getMyLeases = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const leases = await getStudentLeasesService(req.user.userId);

    res.status(200).json(leases);
  } catch (error) {
    next(error);
  }
};

/* ================================
   CREATE LEASE
================================ */

export const createLease = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const lease = await createLeaseService(req.body);

    res.status(201).json({
      message: "Lease created successfully",
      lease,
    });
  } catch (error) {
    next(error);
  }
};

/* ================================
   END LEASE
================================ */

export const endLease = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const leaseId = Number(req.params.id);

  try {
    const message = await endLeaseService(leaseId);

    res.status(200).json({ message });
  } catch (error) {
    next(error);
  }
};

/* ================================
   DELETE LEASE
================================ */

export const deleteLease = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const leaseId = Number(req.params.id);

  try {
    const deleted = await deleteLeaseService(leaseId);

    if (!deleted) {
      res.status(404).json({ message: "Lease not found" });
      return;
    }

    res.status(200).json({
      message: "Lease deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};