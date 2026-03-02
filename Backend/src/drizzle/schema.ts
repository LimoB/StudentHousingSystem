import {
  pgTable,
  varchar,
  text,
  numeric,
  boolean,
  timestamp,
  integer,
  date,
  pgEnum
} from "drizzle-orm/pg-core";

/* ================================
   ENUMS
================================== */

export const userRoleEnum = pgEnum("user_role", [
  "admin",
  "landlord",
  "student"
]);

export const propertyStatusEnum = pgEnum("property_status", [
  "available",
  "occupied"
]);

export const bookingStatusEnum = pgEnum("booking_status", [
  "pending",
  "approved",
  "rejected"
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "paid"
]);

export const leaseStatusEnum = pgEnum("lease_status", [
  "active",
  "ended"
]);

/* ================================
   USERS
================================== */

export const users = pgTable("users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

  fullName: varchar("full_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 100 }).unique().notNull(),
  phone: varchar("phone", { length: 20 }),

  role: userRoleEnum("role").notNull(),
  password: text("password").notNull(),

  createdAt: timestamp("created_at").defaultNow()
});

/* ================================
   PROPERTIES
================================== */

export const properties = pgTable("properties", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

  landlordId: integer("landlord_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),

  name: varchar("name", { length: 100 }).notNull(),
  location: varchar("location", { length: 150 }).notNull(),
  description: text("description"),

  status: propertyStatusEnum("status").default("available"),

  createdAt: timestamp("created_at").defaultNow()
});

/* ================================
   UNITS
================================== */

export const units = pgTable("units", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

  propertyId: integer("property_id")
    .references(() => properties.id, { onDelete: "cascade" })
    .notNull(),

  unitNumber: varchar("unit_number", { length: 20 }).notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),

  isAvailable: boolean("is_available").default(true),

  createdAt: timestamp("created_at").defaultNow()
});

/* ================================
   BOOKINGS
================================== */

export const bookings = pgTable("bookings", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

  studentId: integer("student_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),

  unitId: integer("unit_id")
    .references(() => units.id, { onDelete: "cascade" })
    .notNull(),

  status: bookingStatusEnum("status").default("pending"),

  moveInDate: date("move_in_date"),

  createdAt: timestamp("created_at").defaultNow()
});

/* ================================
   PAYMENTS
================================== */

export const payments = pgTable("payments", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

  studentId: integer("student_id")
    .references(() => users.id)
    .notNull(),

  bookingId: integer("booking_id")
    .references(() => bookings.id)
    .notNull(),

  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),

  status: paymentStatusEnum("status").default("pending"),

  reference: varchar("reference", { length: 100 }),

  createdAt: timestamp("created_at").defaultNow()
});

/* ================================
   LEASES
================================== */

export const leases = pgTable("leases", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

  studentId: integer("student_id")
    .references(() => users.id)
    .notNull(),

  unitId: integer("unit_id")
    .references(() => units.id)
    .notNull(),

  startDate: date("start_date"),
  endDate: date("end_date"),

  status: leaseStatusEnum("status").default("active"),

  createdAt: timestamp("created_at").defaultNow()
});

/* ================================
   MAINTENANCE REQUESTS
================================== */

export const maintenanceRequests = pgTable("maintenance_requests", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

  studentId: integer("student_id")
    .references(() => users.id)
    .notNull(),

  unitId: integer("unit_id")
    .references(() => units.id)
    .notNull(),

  description: text("description").notNull(),

  status: varchar("status", { length: 50 }).default("pending"),

  createdAt: timestamp("created_at").defaultNow()
});

/* ================================
   NOTIFICATIONS
================================== */

export const notifications = pgTable("notifications", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),

  message: text("message").notNull(),

  isRead: boolean("is_read").default(false),

  createdAt: timestamp("created_at").defaultNow()
});