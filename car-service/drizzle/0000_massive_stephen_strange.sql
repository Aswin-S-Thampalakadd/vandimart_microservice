CREATE TABLE "cars" (
	"id" serial PRIMARY KEY NOT NULL,
	"brand" varchar(100) NOT NULL,
	"model" varchar(100) NOT NULL,
	"price" integer NOT NULL,
	"seller_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
