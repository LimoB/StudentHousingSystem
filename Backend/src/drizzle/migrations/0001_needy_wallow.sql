ALTER TABLE "units" ADD COLUMN "size" varchar(50) DEFAULT 'Single Room';--> statement-breakpoint
ALTER TABLE "units" ADD COLUMN "updated_at" timestamp DEFAULT now();