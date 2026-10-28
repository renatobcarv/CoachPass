import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_workouts_weekday" AS ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');
  CREATE TYPE "public"."enum_ai_generations_type" AS ENUM('workout', 'meal_plan', 'chat');
  CREATE TYPE "public"."enum_ai_generations_status" AS ENUM('pending', 'succeeded', 'failed', 'blocked');
  CREATE TYPE "public"."enum_assessments_kind" AS ENUM('physical', 'consultation');
  CREATE TYPE "public"."enum_sessions_type" AS ENUM('training', 'assessment', 'consultation', 'followup');
  CREATE TYPE "public"."enum_sessions_status" AS ENUM('scheduled', 'completed', 'cancelled');
  CREATE TYPE "public"."enum_restrictions_type" AS ENUM('injury', 'medical', 'dietary', 'other');
  CREATE TYPE "public"."enum_restrictions_severity" AS ENUM('low', 'moderate', 'high');
  CREATE TYPE "public"."enum_anamneses_status" AS ENUM('draft', 'completed');
  ALTER TYPE "public"."enum_users_plan" ADD VALUE 'free' BEFORE 'monthly';
  CREATE TABLE "users_specialties" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar NOT NULL
  );
  
  CREATE TABLE "ai_generations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_id" integer NOT NULL,
  	"type" "enum_ai_generations_type" NOT NULL,
  	"status" "enum_ai_generations_status" DEFAULT 'pending' NOT NULL,
  	"provider" varchar,
  	"error_message" varchar,
  	"result_id" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "assessments" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"kind" "enum_assessments_kind" NOT NULL,
  	"student_id" integer NOT NULL,
  	"professional_id" integer NOT NULL,
  	"date" timestamp(3) with time zone NOT NULL,
  	"weight_kg" numeric,
  	"body_fat_percent" numeric,
  	"muscle_mass_kg" numeric,
  	"visceral_fat" numeric,
  	"bmr" numeric,
  	"hydration_percent" numeric,
  	"circumferences_chest" numeric,
  	"circumferences_waist" numeric,
  	"circumferences_hip" numeric,
  	"circumferences_arm" numeric,
  	"circumferences_thigh" numeric,
  	"resting_heart_rate" numeric,
  	"blood_pressure" varchar,
  	"adherence_score" numeric,
  	"energy_score" numeric,
  	"sleep_score" numeric,
  	"parq" jsonb,
  	"notes" varchar,
  	"next_date" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "sessions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"student_id" integer NOT NULL,
  	"professional_id" integer NOT NULL,
  	"date" timestamp(3) with time zone NOT NULL,
  	"time" varchar,
  	"duration_min" numeric,
  	"type" "enum_sessions_type" DEFAULT 'training' NOT NULL,
  	"location" varchar,
  	"status" "enum_sessions_status" DEFAULT 'scheduled' NOT NULL,
  	"recurring" boolean DEFAULT false,
  	"notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "restrictions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"student_id" integer NOT NULL,
  	"professional_id" integer NOT NULL,
  	"type" "enum_restrictions_type" NOT NULL,
  	"title" varchar NOT NULL,
  	"description" varchar,
  	"severity" "enum_restrictions_severity" DEFAULT 'moderate' NOT NULL,
  	"start_date" timestamp(3) with time zone,
  	"end_date" timestamp(3) with time zone,
  	"medical_clearance" boolean DEFAULT false,
  	"active" boolean DEFAULT true,
  	"notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "anamneses" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"student_id" integer NOT NULL,
  	"professional_id" integer NOT NULL,
  	"answers" jsonb,
  	"status" "enum_anamneses_status" DEFAULT 'draft' NOT NULL,
  	"completed_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "users" ALTER COLUMN "plan" SET DEFAULT 'free';
  ALTER TABLE "users" ADD COLUMN "bio" varchar;
  ALTER TABLE "users" ADD COLUMN "avatar_url" varchar;
  ALTER TABLE "users" ADD COLUMN "city" varchar;
  ALTER TABLE "users" ADD COLUMN "instagram" varchar;
  ALTER TABLE "users" ADD COLUMN "consent_accepted_at" timestamp(3) with time zone;
  ALTER TABLE "users" ADD COLUMN "consent_version" varchar;
  ALTER TABLE "users" ADD COLUMN "health_data_consent_at" timestamp(3) with time zone;
  ALTER TABLE "users" ADD COLUMN "password_changed_at" timestamp(3) with time zone;
  ALTER TABLE "users" ADD COLUMN "preferences" jsonb;
  ALTER TABLE "users" ADD COLUMN "reset_password_requested_at" timestamp(3) with time zone;
  ALTER TABLE "media" ADD COLUMN "owner_id" integer;
  ALTER TABLE "professional_links" ADD COLUMN "accepted_at" timestamp(3) with time zone;
  ALTER TABLE "professional_links" ADD COLUMN "revoked_at" timestamp(3) with time zone;
  ALTER TABLE "workouts_exercises" ADD COLUMN "instructions" varchar;
  ALTER TABLE "workouts_exercises" ADD COLUMN "youtube_url" varchar;
  ALTER TABLE "workouts_exercises" ADD COLUMN "muscle_image" varchar;
  ALTER TABLE "workouts" ADD COLUMN "weekday" "enum_workouts_weekday";
  ALTER TABLE "workouts" ADD COLUMN "split_label" varchar;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "ai_generations_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "assessments_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "sessions_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "restrictions_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "anamneses_id" integer;
  ALTER TABLE "users_specialties" ADD CONSTRAINT "users_specialties_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ai_generations" ADD CONSTRAINT "ai_generations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "assessments" ADD CONSTRAINT "assessments_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "assessments" ADD CONSTRAINT "assessments_professional_id_users_id_fk" FOREIGN KEY ("professional_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "sessions" ADD CONSTRAINT "sessions_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "sessions" ADD CONSTRAINT "sessions_professional_id_users_id_fk" FOREIGN KEY ("professional_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "restrictions" ADD CONSTRAINT "restrictions_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "restrictions" ADD CONSTRAINT "restrictions_professional_id_users_id_fk" FOREIGN KEY ("professional_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "anamneses" ADD CONSTRAINT "anamneses_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "anamneses" ADD CONSTRAINT "anamneses_professional_id_users_id_fk" FOREIGN KEY ("professional_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "users_specialties_order_idx" ON "users_specialties" USING btree ("_order");
  CREATE INDEX "users_specialties_parent_id_idx" ON "users_specialties" USING btree ("_parent_id");
  CREATE INDEX "ai_generations_user_idx" ON "ai_generations" USING btree ("user_id");
  CREATE INDEX "ai_generations_status_idx" ON "ai_generations" USING btree ("status");
  CREATE INDEX "ai_generations_updated_at_idx" ON "ai_generations" USING btree ("updated_at");
  CREATE INDEX "ai_generations_created_at_idx" ON "ai_generations" USING btree ("created_at");
  CREATE INDEX "assessments_student_idx" ON "assessments" USING btree ("student_id");
  CREATE INDEX "assessments_professional_idx" ON "assessments" USING btree ("professional_id");
  CREATE INDEX "assessments_updated_at_idx" ON "assessments" USING btree ("updated_at");
  CREATE INDEX "assessments_created_at_idx" ON "assessments" USING btree ("created_at");
  CREATE INDEX "sessions_student_idx" ON "sessions" USING btree ("student_id");
  CREATE INDEX "sessions_professional_idx" ON "sessions" USING btree ("professional_id");
  CREATE INDEX "sessions_date_idx" ON "sessions" USING btree ("date");
  CREATE INDEX "sessions_status_idx" ON "sessions" USING btree ("status");
  CREATE INDEX "sessions_updated_at_idx" ON "sessions" USING btree ("updated_at");
  CREATE INDEX "sessions_created_at_idx" ON "sessions" USING btree ("created_at");
  CREATE INDEX "restrictions_student_idx" ON "restrictions" USING btree ("student_id");
  CREATE INDEX "restrictions_professional_idx" ON "restrictions" USING btree ("professional_id");
  CREATE INDEX "restrictions_active_idx" ON "restrictions" USING btree ("active");
  CREATE INDEX "restrictions_updated_at_idx" ON "restrictions" USING btree ("updated_at");
  CREATE INDEX "restrictions_created_at_idx" ON "restrictions" USING btree ("created_at");
  CREATE INDEX "anamneses_student_idx" ON "anamneses" USING btree ("student_id");
  CREATE INDEX "anamneses_professional_idx" ON "anamneses" USING btree ("professional_id");
  CREATE INDEX "anamneses_updated_at_idx" ON "anamneses" USING btree ("updated_at");
  CREATE INDEX "anamneses_created_at_idx" ON "anamneses" USING btree ("created_at");
  ALTER TABLE "media" ADD CONSTRAINT "media_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_ai_generations_fk" FOREIGN KEY ("ai_generations_id") REFERENCES "public"."ai_generations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_assessments_fk" FOREIGN KEY ("assessments_id") REFERENCES "public"."assessments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_sessions_fk" FOREIGN KEY ("sessions_id") REFERENCES "public"."sessions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_restrictions_fk" FOREIGN KEY ("restrictions_id") REFERENCES "public"."restrictions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_anamneses_fk" FOREIGN KEY ("anamneses_id") REFERENCES "public"."anamneses"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "media_owner_idx" ON "media" USING btree ("owner_id");
  CREATE INDEX "workouts_weekday_idx" ON "workouts" USING btree ("weekday");
  CREATE INDEX "payload_locked_documents_rels_ai_generations_id_idx" ON "payload_locked_documents_rels" USING btree ("ai_generations_id");
  CREATE INDEX "payload_locked_documents_rels_assessments_id_idx" ON "payload_locked_documents_rels" USING btree ("assessments_id");
  CREATE INDEX "payload_locked_documents_rels_sessions_id_idx" ON "payload_locked_documents_rels" USING btree ("sessions_id");
  CREATE INDEX "payload_locked_documents_rels_restrictions_id_idx" ON "payload_locked_documents_rels" USING btree ("restrictions_id");
  CREATE INDEX "payload_locked_documents_rels_anamneses_id_idx" ON "payload_locked_documents_rels" USING btree ("anamneses_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "users_specialties" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "ai_generations" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "assessments" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "sessions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "restrictions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "anamneses" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "users_specialties" CASCADE;
  DROP TABLE "ai_generations" CASCADE;
  DROP TABLE "assessments" CASCADE;
  DROP TABLE "sessions" CASCADE;
  DROP TABLE "restrictions" CASCADE;
  DROP TABLE "anamneses" CASCADE;
  ALTER TABLE "media" DROP CONSTRAINT "media_owner_id_users_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_ai_generations_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_assessments_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_sessions_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_restrictions_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_anamneses_fk";
  
  ALTER TABLE "users" ALTER COLUMN "plan" SET DATA TYPE text;
  DROP TYPE "public"."enum_users_plan";
  CREATE TYPE "public"."enum_users_plan" AS ENUM('monthly', 'semester', 'annual');
  ALTER TABLE "users" ALTER COLUMN "plan" SET DATA TYPE "public"."enum_users_plan" USING "plan"::"public"."enum_users_plan";
  DROP INDEX "media_owner_idx";
  DROP INDEX "workouts_weekday_idx";
  DROP INDEX "payload_locked_documents_rels_ai_generations_id_idx";
  DROP INDEX "payload_locked_documents_rels_assessments_id_idx";
  DROP INDEX "payload_locked_documents_rels_sessions_id_idx";
  DROP INDEX "payload_locked_documents_rels_restrictions_id_idx";
  DROP INDEX "payload_locked_documents_rels_anamneses_id_idx";
  ALTER TABLE "users" ALTER COLUMN "plan" DROP DEFAULT;
  ALTER TABLE "users" DROP COLUMN "bio";
  ALTER TABLE "users" DROP COLUMN "avatar_url";
  ALTER TABLE "users" DROP COLUMN "city";
  ALTER TABLE "users" DROP COLUMN "instagram";
  ALTER TABLE "users" DROP COLUMN "consent_accepted_at";
  ALTER TABLE "users" DROP COLUMN "consent_version";
  ALTER TABLE "users" DROP COLUMN "health_data_consent_at";
  ALTER TABLE "users" DROP COLUMN "password_changed_at";
  ALTER TABLE "users" DROP COLUMN "preferences";
  ALTER TABLE "users" DROP COLUMN "reset_password_requested_at";
  ALTER TABLE "media" DROP COLUMN "owner_id";
  ALTER TABLE "professional_links" DROP COLUMN "accepted_at";
  ALTER TABLE "professional_links" DROP COLUMN "revoked_at";
  ALTER TABLE "workouts_exercises" DROP COLUMN "instructions";
  ALTER TABLE "workouts_exercises" DROP COLUMN "youtube_url";
  ALTER TABLE "workouts_exercises" DROP COLUMN "muscle_image";
  ALTER TABLE "workouts" DROP COLUMN "weekday";
  ALTER TABLE "workouts" DROP COLUMN "split_label";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "ai_generations_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "assessments_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "sessions_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "restrictions_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "anamneses_id";
  DROP TYPE "public"."enum_workouts_weekday";
  DROP TYPE "public"."enum_ai_generations_type";
  DROP TYPE "public"."enum_ai_generations_status";
  DROP TYPE "public"."enum_assessments_kind";
  DROP TYPE "public"."enum_sessions_type";
  DROP TYPE "public"."enum_sessions_status";
  DROP TYPE "public"."enum_restrictions_type";
  DROP TYPE "public"."enum_restrictions_severity";
  DROP TYPE "public"."enum_anamneses_status";`)
}
