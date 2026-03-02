// drizzle/relations.ts

import { relations } from "drizzle-orm";
import {
  users,
  properties,
  units,
  bookings,
  payments,
  leases,
  maintenanceRequests,
  notifications
} from "./schema";

/* ================================
   USERS
================================== */

export const userRelations = relations(users, ({ many }) => ({
  // Landlord relations
  properties: many(properties),

  // Student relations
  bookings: many(bookings),
  payments: many(payments),
  leases: many(leases),
  maintenanceRequests: many(maintenanceRequests),

  // Shared
  notifications: many(notifications)
}));

/* ================================
   PROPERTIES
================================== */

export const propertyRelations = relations(properties, ({ one, many }) => ({
  landlord: one(users, {
    fields: [properties.landlordId],
    references: [users.id],
  }),

  units: many(units)
}));

/* ================================
   UNITS
================================== */

export const unitRelations = relations(units, ({ one, many }) => ({
  property: one(properties, {
    fields: [units.propertyId],
    references: [properties.id],
  }),

  bookings: many(bookings),
  leases: many(leases),
  maintenanceRequests: many(maintenanceRequests)
}));

/* ================================
   BOOKINGS
================================== */

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

/* ================================
   PAYMENTS
================================== */

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

/* ================================
   LEASES
================================== */

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

/* ================================
   MAINTENANCE REQUESTS
================================== */

export const maintenanceRequestRelations = relations(
  maintenanceRequests,
  ({ one }) => ({
    student: one(users, {
      fields: [maintenanceRequests.studentId],
      references: [users.id],
    }),

    unit: one(units, {
      fields: [maintenanceRequests.unitId],
      references: [units.id],
    })
  })
);

/* ================================
   NOTIFICATIONS
================================== */

export const notificationRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  })
}));