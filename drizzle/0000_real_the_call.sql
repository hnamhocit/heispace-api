CREATE TYPE "public"."user_gender" AS ENUM('male', 'female', 'other', 'prefer_not_to_say');--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"clerk_user_id" varchar(64) NOT NULL,
	"email" varchar(255) NOT NULL,
	"full_name" varchar(120),
	"avatar" text,
	"username" varchar(24),
	"is_active" boolean DEFAULT true NOT NULL,
	"onboarding_completed" boolean DEFAULT false NOT NULL,
	"phone_number" varchar(20),
	"gender" "user_gender" DEFAULT 'prefer_not_to_say' NOT NULL,
	"birth_day" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_clerk_user_id_unique" UNIQUE("clerk_user_id"),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
