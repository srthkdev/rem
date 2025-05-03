ALTER TABLE "users" ALTER COLUMN "email_verified" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "email_verified" DROP NOT NULL;