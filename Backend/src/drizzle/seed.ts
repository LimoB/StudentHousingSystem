import "dotenv/config";
import  db  from "./db";
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
import bcrypt from "bcrypt";

async function seed() {
  console.log("🌱 Seeding database...");

  // =========================
  // USERS
  // =========================
  const hashedPassword = await bcrypt.hash("password123", 10);

  const insertedUsers = await db.insert(users).values([
    {
      fullName: "Admin User",
      email: "admin@example.com",
      phone: "0700000001",
      role: "admin",
      password: hashedPassword
    },
    {
      fullName: "John Landlord",
      email: "landlord@example.com",
      phone: "0700000002",
      role: "landlord",
      password: hashedPassword
    },
    {
      fullName: "Mary Student",
      email: "student@example.com",
      phone: "0700000003",
      role: "student",
      password: hashedPassword
    }
  ]).returning();

  const landlord = insertedUsers[1];
  const student = insertedUsers[2];

  // =========================
  // PROPERTIES
  // =========================
  const insertedProperties = await db.insert(properties).values([
    {
      landlordId: landlord.id,
      name: "Sunrise Apartments",
      location: "Near University Gate A",
      description: "Affordable student housing"
    },
    {
      landlordId: landlord.id,
      name: "Green View Hostel",
      location: "Behind Main Campus",
      description: "Modern rooms with WiFi"
    },
    {
      landlordId: landlord.id,
      name: "City Heights",
      location: "Town Center",
      description: "Secure and accessible"
    }
  ]).returning();

  // =========================
  // UNITS
  // =========================
  const insertedUnits = await db.insert(units).values([
    {
      propertyId: insertedProperties[0].id,
      unitNumber: "A1",
      price: "8000"
    },
    {
      propertyId: insertedProperties[1].id,
      unitNumber: "B1",
      price: "9000"
    },
    {
      propertyId: insertedProperties[2].id,
      unitNumber: "C1",
      price: "10000"
    }
  ]).returning();

  // =========================
  // BOOKINGS
  // =========================
  const insertedBookings = await db.insert(bookings).values([
    {
      studentId: student.id,
      unitId: insertedUnits[0].id,
      status: "approved"
    },
    {
      studentId: student.id,
      unitId: insertedUnits[1].id,
      status: "pending"
    },
    {
      studentId: student.id,
      unitId: insertedUnits[2].id,
      status: "approved"
    }
  ]).returning();

  // =========================
  // PAYMENTS
  // =========================
  await db.insert(payments).values([
    {
      studentId: student.id,
      bookingId: insertedBookings[0].id,
      amount: "8000",
      status: "paid",
      reference: "PAY001"
    },
    {
      studentId: student.id,
      bookingId: insertedBookings[1].id,
      amount: "9000",
      status: "pending",
      reference: "PAY002"
    },
    {
      studentId: student.id,
      bookingId: insertedBookings[2].id,
      amount: "10000",
      status: "paid",
      reference: "PAY003"
    }
  ]);

  // =========================
  // LEASES
  // =========================
  await db.insert(leases).values([
    {
      studentId: student.id,
      unitId: insertedUnits[0].id,
      startDate: "2025-01-01",
      endDate: "2025-12-31",
      status: "active"
    },
    {
      studentId: student.id,
      unitId: insertedUnits[2].id,
      startDate: "2024-01-01",
      endDate: "2024-12-31",
      status: "ended"
    },
    {
      studentId: student.id,
      unitId: insertedUnits[1].id,
      startDate: "2025-06-01",
      endDate: "2026-05-31",
      status: "active"
    }
  ]);

  // =========================
  // MAINTENANCE REQUESTS
  // =========================
  await db.insert(maintenanceRequests).values([
    {
      studentId: student.id,
      unitId: insertedUnits[0].id,
      description: "Water leakage in bathroom",
      status: "pending"
    },
    {
      studentId: student.id,
      unitId: insertedUnits[1].id,
      description: "Broken window",
      status: "in_progress"
    },
    {
      studentId: student.id,
      unitId: insertedUnits[2].id,
      description: "Electric socket not working",
      status: "resolved"
    }
  ]);

  // =========================
  // NOTIFICATIONS
  // =========================
  await db.insert(notifications).values([
    {
      userId: student.id,
      message: "Your booking has been approved."
    },
    {
      userId: student.id,
      message: "Payment received successfully."
    },
    {
      userId: student.id,
      message: "Maintenance request resolved."
    }
  ]);

  console.log("✅ Database seeded successfully!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});