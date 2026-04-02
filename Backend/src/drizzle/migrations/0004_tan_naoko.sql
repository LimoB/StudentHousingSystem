ALTER TABLE "maintenance_requests" ADD COLUMN "attachment_url" text;--> statement-breakpoint
ALTER TABLE "maintenance_requests" ADD COLUMN "attachment_public_id" varchar(255);--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "image_url" text;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "image_public_id" varchar(255);--> statement-breakpoint
ALTER TABLE "units" ADD COLUMN "image_url" text;--> statement-breakpoint
ALTER TABLE "units" ADD COLUMN "image_public_id" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "avatar_url" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "avatar_public_id" varchar(255);