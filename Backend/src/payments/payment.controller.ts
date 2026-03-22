import { Request, Response, NextFunction } from "express";
import * as PaymentService from "./payment.service";

/**
 * 1. M-PESA: INITIATE STK PUSH
 */
export const collectPayment = async (req: Request, res: Response, next: NextFunction) => {
  // LOG THE INCOMING PAYLOAD
  console.log("--- STK PUSH REQUEST ---");
  console.log("Payload:", req.body);

  const { phone, amount, bookingId, studentId } = req.body;
  
  if (!phone || !amount || !bookingId || !studentId) {
    console.error("Validation Failed: Missing required fields", { phone, amount, bookingId, studentId });
    res.status(400).json({ error: "Missing required fields: phone, amount, bookingId, and studentId" });
    return;
  }
  
  try {
    const result = await PaymentService.initiateSTKPushService(phone, amount, bookingId, studentId);
    console.log("STK Push Success Response:", result);
    res.status(200).json({ message: "STK Push initiated successfully", data: result });
  } catch (error: any) {
    console.error("STK Push Service Error:", error.message);
    next(error);
  }
};

/**
 * 2. M-PESA: CALLBACK HANDLER (Public)
 */
export const mpesaCallback = async (req: Request, res: Response, next: NextFunction) => {
  console.log("--- MPESA CALLBACK RECEIVED ---");
  // Log the full body to see exactly what Safaricom sends
  console.dir(req.body, { depth: null }); 

  try {
    const result = await PaymentService.processMpesaCallbackService(req.body.Body.stkCallback);
    console.log("Callback Processing Result:", result);
    res.status(200).json(result);
  } catch (error: any) {
    console.error("Callback Error:", error.message);
    next(error);
  }
};

/**
 * 3. GET STATUS FOR FRONTEND POLLING
 */
export const checkPaymentStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const checkoutID = req.params.checkoutRequestID as string;
    console.log(`Checking status for CheckoutID: ${checkoutID}`);
    
    const data = await PaymentService.getPaymentStatusService(checkoutID);
    
    if (data) {
      console.log(`Status found for ${checkoutID}: ${data.status}`);
      res.status(200).json(data);
    } else {
      console.warn(`No payment session found for ${checkoutID}`);
      res.status(404).json({ message: "Payment session not found" });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * 4. CRUD: GET ALL
 */
// export const getPayments = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const data = await PaymentService.getAllPaymentsService();
//     res.status(200).json(data);
//   } catch (error) {
//     next(error);
//   }
// };

export const getPayments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. Get studentId from the request object (attached by your Auth Middleware)
    // Adjust 'req.user.id' or 'req.user.userId' based on your JWT payload structure
    const studentId = (req as any).user?.id || (req as any).user?.userId;

    // 2. Pass the studentId to the service
    const data = await PaymentService.getAllPaymentsService(studentId);
    
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

/**
 * 5. CRUD: GET BY ID
 */
export const getPaymentById = async (req: Request, res: Response, next: NextFunction) => {
  const id = parseInt(req.params.id as string);
  try {
    const data = await PaymentService.getPaymentByIdService(id);
    data ? res.status(200).json(data) : res.status(404).json({ message: "Payment not found" });
  } catch (error) {
    next(error);
  }
};

/**
 * 6. CRUD: UPDATE
 */
export const updatePayment = async (req: Request, res: Response, next: NextFunction) => {
  const id = parseInt(req.params.id as string);
  console.log(`Updating Payment ID: ${id}`, req.body);
  try {
    const count = await PaymentService.updatePaymentService(id, req.body);
    res.status(200).json({ success: count > 0 });
  } catch (error) {
    next(error);
  }
};

/**
 * 7. CRUD: DELETE
 */
export const deletePayment = async (req: Request, res: Response, next: NextFunction) => {
  const id = parseInt(req.params.id as string);
  console.log(`Deleting Payment ID: ${id}`);
  try {
    const count = await PaymentService.deletePaymentService(id);
    res.status(200).json({ success: count > 0 });
  } catch (error) {
    next(error);
  }
};