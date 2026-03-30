import { Router } from "express";
import { 
  authMiddleware, 
  allUsers, 
  adminOrLandlord 
} from "../middleware/authMiddleware"; // <--- Adjust this path to your middleware file
import { 
  collectPayment, 
  mpesaCallback, 
  checkPaymentStatus,
  getPayments, 
  getPaymentById, 
  updatePayment, 
  deletePayment 
} from "./payment.controller";

const paymentRouter = Router();

// --- PUBLIC/SEMIPUBLIC ENDPOINTS ---
// Callback must stay public (no middleware) so Safaricom can hit it
paymentRouter.post("/callback", mpesaCallback); 

// --- PROTECTED ENDPOINTS ---
// Use authMiddleware to populate req.user for these routes
paymentRouter.post("/stkpush", authMiddleware, collectPayment);
paymentRouter.get("/status/:checkoutRequestID", authMiddleware, checkPaymentStatus); 

// This is the one causing your Dashboard 401 error
paymentRouter.get("/", authMiddleware, getPayments);

paymentRouter.get("/:id", authMiddleware, getPaymentById);

// Restricted actions (Optional: use your adminOrLandlord guard)
paymentRouter.patch("/:id", authMiddleware, adminOrLandlord, updatePayment);
paymentRouter.delete("/:id", authMiddleware, adminOrLandlord, deletePayment);

export default paymentRouter;