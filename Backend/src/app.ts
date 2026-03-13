import express, { Application, Request, Response } from "express";
import cors from "cors";

// Middleware
import { logger } from "./middleware/logger";
import { authMiddleware } from "./middleware/authMiddleware";
// import { errorHandler } from "./middleware/errorHandler";

// Routers
import { authRouter } from "./auth/auth.route";
import { userRouter } from "./users/user.route";
import { propertyRouter } from "./properties/property.route";
import { unitRouter } from "./units/unit.route";
import { bookingRouter } from "./bookings/booking.route";
// import { paymentRouter } from "./payments/payment.route";
import { leaseRouter } from "./leases/lease.route";
import { maintenanceRouter } from "./maintenance/maintenance.route";
import { notificationRouter } from "./notifications/notification.route";

const app: Application = express();

// =========================
// CORS CONFIGURATION
// =========================
app.use(
  cors({
    origin: "http://localhost:5173", // frontend URL
    credentials: true,
  })
);

// =========================
// CORE MIDDLEWARE
// =========================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(logger);

// =========================
// HEALTH CHECK ROUTE
// =========================
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "🏠 Student Housing API is running",
  });
});

// =========================
// PUBLIC ROUTES
// =========================
app.use("/api/auth", authRouter);

// =========================
// PROTECTED ROUTES
// =========================
app.use("/api/users", authMiddleware, userRouter);
app.use("/api/properties", authMiddleware, propertyRouter);
app.use("/api/units", authMiddleware, unitRouter);
app.use("/api/bookings", authMiddleware, bookingRouter);
// app.use("/api/payments", authMiddleware, paymentRouter);
app.use("/api/leases", authMiddleware, leaseRouter);
app.use("/api/maintenance", authMiddleware, maintenanceRouter);
app.use("/api/notifications", authMiddleware, notificationRouter);

// =========================
// GLOBAL ERROR HANDLER
// (Always last)
// =========================
// app.use(errorHandler);

export default app;