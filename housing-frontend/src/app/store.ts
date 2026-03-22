import { configureStore } from "@reduxjs/toolkit";

import authReducer from "./slices/authSlice";
import bookingReducer from "./slices/bookingSlice";
import leaseReducer from "./slices/leaseSlice";
import maintenanceReducer from "./slices/maintenanceSlice";
import notificationReducer from "./slices/notificationSlice";
import paymentReducer from "./slices/paymentSlice";
import propertyReducer from "./slices/propertySlice";
import unitReducer from "./slices/unitSlice";
import userReducer from "./slices/userSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    bookings: bookingReducer,
    leases: leaseReducer,
    maintenance: maintenanceReducer,
    notifications: notificationReducer,
    payments: paymentReducer,
    properties: propertyReducer,
    units: unitReducer,
    users: userReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;