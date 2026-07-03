ALTER TABLE "movie" ADD COLUMN "release_year" integer;--> statement-breakpoint
ALTER TABLE "movie" ADD COLUMN "runtime_minutes" integer;--> statement-breakpoint
ALTER TABLE "movie" ADD COLUMN "directors" text[];--> statement-breakpoint
ALTER TABLE "movie" ADD COLUMN "actors" text[];--> statement-breakpoint
ALTER TABLE "movie" ADD COLUMN "genres" text[];
