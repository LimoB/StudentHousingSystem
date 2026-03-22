import { Router } from "express";
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

// --- M-PESA ENDPOINTS ---
paymentRouter.post("/stkpush", collectPayment);
paymentRouter.post("/callback", mpesaCallback); 
paymentRouter.get("/status/:checkoutRequestID", checkPaymentStatus); 

// --- CRUD ENDPOINTS ---
paymentRouter.get("/", getPayments);
paymentRouter.get("/:id", getPaymentById);
paymentRouter.patch("/:id", updatePayment);
paymentRouter.delete("/:id", deletePayment);

export default paymentRouter;