CREATE TABLE "auth_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"role" varchar(50) DEFAULT 'user' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "auth_users_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "auth_users_email_unique" UNIQUE("email")
);
