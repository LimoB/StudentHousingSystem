import { relations } from "drizzle-orm";
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
   TABLES
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

export const notifications = pgTable("notifications", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow()
});

/* ================================
   RELATIONS
================================== */

export const userRelations = relations(users, ({ many }) => ({
  properties: many(properties),
  bookings: many(bookings),
  payments: many(payments),
  leases: many(leases),
  maintenanceRequests: many(maintenanceRequests),
  notifications: many(notifications)
}));

export const propertyRelations = relations(properties, ({ one, many }) => ({
  landlord: one(users, {
    fields: [properties.landlordId],
    references: [users.id],
  }),
  units: many(units)
}));

export const unitRelations = relations(units, ({ one, many }) => ({
  property: one(properties, {
    fields: [units.propertyId],
    references: [properties.id],
  }),
  bookings: many(bookings),
  leases: many(leases),
  maintenanceRequests: many(maintenanceRequests)
}));

export const bookingRelations = relations(bookings, ({ one, many }) => ({
  student: one(users, {
    fields: [bookings.studentId],
    references: [users.id],
  }),
  unit: one(units, {
    fields: [bookings.unitId],
    references: [units.id],
  }),
  payments: many(payments)
}));

export const paymentRelations = relations(payments, ({ one }) => ({
  student: one(users, {
    fields: [payments.studentId],
    references: [users.id],
  }),
  booking: one(bookings, {
    fields: [payments.bookingId],
    references: [bookings.id],
  })
}));

export const leaseRelations = relations(leases, ({ one }) => ({
  student: one(users, {
    fields: [leases.studentId],
    references: [users.id],
  }),
  unit: one(units, {
    fields: [leases.unitId],
    references: [units.id],
  })
}));

export const maintenanceRequestRelations = relations(maintenanceRequests, ({ one }) => ({
    student: one(users, {
      fields: [maintenanceRequests.studentId],
      references: [users.id],
    }),
    unit: one(units, {
      fields: [maintenanceRequests.unitId],
      references: [units.id],
    })
}));

export const notificationRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  })
}));