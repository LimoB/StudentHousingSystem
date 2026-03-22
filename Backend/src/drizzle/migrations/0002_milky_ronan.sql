ALTER TYPE "public"."payment_status" ADD VALUE 'failed';--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "checkout_request_id" varchar(100);--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "mpesa_receipt_number" varchar(100);--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "phone" varchar(20) NOT NULL;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_checkout_request_id_unique" UNIQUE("checkout_request_id");--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_mpesa_receipt_number_unique" UNIQUE("mpesa_receipt_number");