// drizzle/types.ts

import { InferModel } from "drizzle-orm";
import * as schema from "./schema";

/* ============================
   USER TYPES
============================= */

export type User = InferModel<typeof schema.users>;
export type NewUser = InferModel<typeof schema.users, "insert">;


/* ============================
   PROPERTY TYPES
============================= */

export type Property = InferModel<typeof schema.properties>;
export type NewProperty = InferModel<typeof schema.properties, "insert">;

export type Unit = InferModel<typeof schema.units>;
export type NewUnit = InferModel<typeof schema.units, "insert">;


/* ============================
   BOOKINGS
============================= */

export type Booking = InferModel<typeof schema.bookings>;
export type NewBooking = InferModel<typeof schema.bookings, "insert">;


/* ============================
   PAYMENTS
============================= */

export type Payment = InferModel<typeof schema.payments>;
export type NewPayment = InferModel<typeof schema.payments, "insert">;


/* ============================
   LEASES
============================= */

export type Lease = InferModel<typeof schema.leases>;
export type NewLease = InferModel<typeof schema.leases, "insert">;


/* ============================
   MAINTENANCE
============================= */

export type MaintenanceRequest = InferModel<
  typeof schema.maintenanceRequests
>;
export type NewMaintenanceRequest = InferModel<
  typeof schema.maintenanceRequests,
  "insert"
>;


/* ============================
   NOTIFICATIONS
============================= */

export type Notification = InferModel<typeof schema.notifications>;
export type NewNotification = InferModel<
  typeof schema.notifications,
  "insert"
>;