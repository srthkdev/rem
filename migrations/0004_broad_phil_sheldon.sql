ALTER TABLE "projects" ADD COLUMN "paper_text" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "status" text DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "summary_eli5" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "summary_college" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "summary_expert" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "extracted_code_snippets" jsonb;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "extracted_references" jsonb;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "key_terms" jsonb;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "diagram_syntax" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "vector_store_path" text;