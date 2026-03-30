import { Request, Response, NextFunction } from "express";
import * as PaymentService from "./payment.service";

/**
 * 1. M-PESA: INITIATE STK PUSH
 */
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
    // This call now internally handles deleting old 'pending' records 
    // before creating the new one in the database.
    const result = await PaymentService.initiateSTKPushService(phone, amount, bookingId, studentId);
    
    console.log("STK Push Success Response:", result);

    // Return the CheckoutRequestID directly so the frontend can 
    // immediately start polling /api/payments/status/:id
    res.status(200).json({ 
      message: "STK Push initiated successfully. Please check your phone.", 
      checkoutRequestID: result.CheckoutRequestID, // Helper for frontend polling
      data: result 
    });
  } catch (error: any) {
    console.error("STK Push Service Error:", error.message);
    
    // Check for specific error messages from the service (like 'Unit unavailable')
    if (error.message.includes("no longer available")) {
      res.status(409).json({ error: error.message });
      return;
    }
    
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
/**
 * 3. GET STATUS FOR FRONTEND POLLING
 */
export const checkPaymentStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const checkoutID = req.params.checkoutRequestID as string;
    console.log(`Checking status for CheckoutID: ${checkoutID}`);
    
    const data = await PaymentService.getPaymentStatusService(checkoutID);
    
    if (data) {
      // If found in DB, return the actual record (Completed or Failed)
      console.log(`Status found for ${checkoutID}: ${data.status}`);
      res.status(200).json(data);
    } else {
      /**
       * FIX: Instead of 404, return 200 with a pending status.
       * This prevents Axios from throwing an error on the frontend
       * and allows the polling interval to keep running until the callback hits.
       */
      console.warn(`Callback not yet received for ${checkoutID}. Still polling...`);
      res.status(200).json({ 
        status: "pending", 
        message: "Waiting for M-Pesa confirmation..." 
      });
    }
  } catch (error) {
    console.error("Error checking payment status:", error);
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
    // 1. Get user from request (populated by authMiddleware)
    const user = req.user; 
    
    if (!user) {
      console.error("[ERROR] getPayments called without authenticated user");
      return res.status(401).json({ error: "Unauthorized: No user found in request" });
    }

    // 2. Align with your DecodedToken type (userId)
    const currentUserId = Number(user.userId);
    const userRole = user.role?.toLowerCase();

    console.log(`[DEBUG] Fetching payments for Role: ${userRole}, ID: ${currentUserId}`);

    let data;

    // 3. Logic Branching
    if (userRole === "landlord") {
      // Landlords only see payments for their properties
      data = await PaymentService.getAllPaymentsService(undefined, currentUserId);
    } else if (userRole === "student") {
      // Students only see their own payments
      data = await PaymentService.getAllPaymentsService(currentUserId);
    } else if (userRole === "admin") {
      // Admins see everything
      data = await PaymentService.getAllPaymentsService();
    } else {
      return res.status(403).json({ error: "Forbidden: Invalid role" });
    }
    
    // 4. Final response
    console.log(`[SUCCESS] Returning ${data?.length || 0} payment records.`);
    res.status(200).json(data);

  } catch (error) {
    console.error("[CONTROLLER ERROR] getPayments:", error);
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