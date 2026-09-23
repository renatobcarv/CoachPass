import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_users_role" AS ENUM('master', 'student', 'personal', 'nutritionist');
  CREATE TYPE "public"."enum_users_plan" AS ENUM('monthly', 'semester', 'annual');
  CREATE TYPE "public"."enum_student_profiles_equipment_access" AS ENUM('full_gym', 'basic_gym', 'home_weights', 'bodyweight', 'outdoor');
  CREATE TYPE "public"."enum_student_profiles_sex" AS ENUM('male', 'female', 'other', 'undisclosed');
  CREATE TYPE "public"."enum_student_profiles_goal" AS ENUM('weight_loss', 'hypertrophy');
  CREATE TYPE "public"."enum_student_profiles_experience_level" AS ENUM('beginner', 'intermediate', 'advanced');
  CREATE TYPE "public"."enum_professional_links_professional_role" AS ENUM('personal', 'nutritionist');
  CREATE TYPE "public"."enum_professional_links_status" AS ENUM('pending', 'active', 'revoked');
  CREATE TYPE "public"."enum_workouts_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_workouts_source" AS ENUM('professional', 'ai');
  CREATE TYPE "public"."enum_meal_plans_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_meal_plans_source" AS ENUM('professional', 'ai');
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"is_super_admin" boolean DEFAULT false,
  	"role" "enum_users_role" DEFAULT 'student',
  	"whatsapp" varchar,
  	"professional_id" varchar,
  	"plan" "enum_users_plan",
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "student_profiles_equipment_access" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_student_profiles_equipment_access",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "student_profiles" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_id" integer NOT NULL,
  	"display_name" varchar NOT NULL,
  	"phone" varchar NOT NULL,
  	"birth_date" timestamp(3) with time zone NOT NULL,
  	"height_cm" numeric NOT NULL,
  	"weight_kg" numeric NOT NULL,
  	"sex" "enum_student_profiles_sex" NOT NULL,
  	"goal" "enum_student_profiles_goal" NOT NULL,
  	"body_fat_percent" numeric,
  	"experience_level" "enum_student_profiles_experience_level",
  	"training_days_per_week" numeric,
  	"session_minutes" numeric,
  	"food_allergies" varchar,
  	"dietary_restrictions" varchar,
  	"medical_conditions" varchar,
  	"injuries" varchar,
  	"medications" varchar,
  	"onboarding_completed" boolean DEFAULT false,
  	"onboarding_completed_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "professional_links" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"student_id" integer NOT NULL,
  	"professional_id" integer NOT NULL,
  	"professional_role" "enum_professional_links_professional_role" NOT NULL,
  	"status" "enum_professional_links_status" DEFAULT 'pending' NOT NULL,
  	"notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "workouts_exercises" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"sets" numeric,
  	"reps" varchar,
  	"weight" varchar,
  	"rest" varchar,
  	"muscle" varchar,
  	"notes" varchar
  );
  
  CREATE TABLE "workouts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"student_id" integer NOT NULL,
  	"author_id" integer,
  	"status" "enum_workouts_status" DEFAULT 'draft' NOT NULL,
  	"source" "enum_workouts_source" DEFAULT 'professional' NOT NULL,
  	"observations" varchar,
  	"published_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "meal_plans_meals_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"quantity" varchar,
  	"calories" numeric
  );
  
  CREATE TABLE "meal_plans_meals" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"time" varchar,
  	"calories" numeric,
  	"notes" varchar
  );
  
  CREATE TABLE "meal_plans" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"student_id" integer NOT NULL,
  	"author_id" integer,
  	"status" "enum_meal_plans_status" DEFAULT 'draft' NOT NULL,
  	"source" "enum_meal_plans_source" DEFAULT 'professional' NOT NULL,
  	"observations" varchar,
  	"is_informational" boolean DEFAULT false,
  	"published_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"media_id" integer,
  	"student_profiles_id" integer,
  	"professional_links_id" integer,
  	"workouts_id" integer,
  	"meal_plans_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "student_profiles_equipment_access" ADD CONSTRAINT "student_profiles_equipment_access_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."student_profiles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "student_profiles" ADD CONSTRAINT "student_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "professional_links" ADD CONSTRAINT "professional_links_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "professional_links" ADD CONSTRAINT "professional_links_professional_id_users_id_fk" FOREIGN KEY ("professional_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "workouts_exercises" ADD CONSTRAINT "workouts_exercises_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."workouts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "workouts" ADD CONSTRAINT "workouts_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "workouts" ADD CONSTRAINT "workouts_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "meal_plans_meals_items" ADD CONSTRAINT "meal_plans_meals_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."meal_plans_meals"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "meal_plans_meals" ADD CONSTRAINT "meal_plans_meals_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."meal_plans"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "meal_plans" ADD CONSTRAINT "meal_plans_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "meal_plans" ADD CONSTRAINT "meal_plans_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_student_profiles_fk" FOREIGN KEY ("student_profiles_id") REFERENCES "public"."student_profiles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_professional_links_fk" FOREIGN KEY ("professional_links_id") REFERENCES "public"."professional_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_workouts_fk" FOREIGN KEY ("workouts_id") REFERENCES "public"."workouts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_meal_plans_fk" FOREIGN KEY ("meal_plans_id") REFERENCES "public"."meal_plans"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "student_profiles_equipment_access_order_idx" ON "student_profiles_equipment_access" USING btree ("order");
  CREATE INDEX "student_profiles_equipment_access_parent_idx" ON "student_profiles_equipment_access" USING btree ("parent_id");
  CREATE UNIQUE INDEX "student_profiles_user_idx" ON "student_profiles" USING btree ("user_id");
  CREATE INDEX "student_profiles_onboarding_completed_idx" ON "student_profiles" USING btree ("onboarding_completed");
  CREATE INDEX "student_profiles_updated_at_idx" ON "student_profiles" USING btree ("updated_at");
  CREATE INDEX "student_profiles_created_at_idx" ON "student_profiles" USING btree ("created_at");
  CREATE INDEX "professional_links_student_idx" ON "professional_links" USING btree ("student_id");
  CREATE INDEX "professional_links_professional_idx" ON "professional_links" USING btree ("professional_id");
  CREATE INDEX "professional_links_status_idx" ON "professional_links" USING btree ("status");
  CREATE INDEX "professional_links_updated_at_idx" ON "professional_links" USING btree ("updated_at");
  CREATE INDEX "professional_links_created_at_idx" ON "professional_links" USING btree ("created_at");
  CREATE INDEX "workouts_exercises_order_idx" ON "workouts_exercises" USING btree ("_order");
  CREATE INDEX "workouts_exercises_parent_id_idx" ON "workouts_exercises" USING btree ("_parent_id");
  CREATE INDEX "workouts_student_idx" ON "workouts" USING btree ("student_id");
  CREATE INDEX "workouts_author_idx" ON "workouts" USING btree ("author_id");
  CREATE INDEX "workouts_status_idx" ON "workouts" USING btree ("status");
  CREATE INDEX "workouts_updated_at_idx" ON "workouts" USING btree ("updated_at");
  CREATE INDEX "workouts_created_at_idx" ON "workouts" USING btree ("created_at");
  CREATE INDEX "meal_plans_meals_items_order_idx" ON "meal_plans_meals_items" USING btree ("_order");
  CREATE INDEX "meal_plans_meals_items_parent_id_idx" ON "meal_plans_meals_items" USING btree ("_parent_id");
  CREATE INDEX "meal_plans_meals_order_idx" ON "meal_plans_meals" USING btree ("_order");
  CREATE INDEX "meal_plans_meals_parent_id_idx" ON "meal_plans_meals" USING btree ("_parent_id");
  CREATE INDEX "meal_plans_student_idx" ON "meal_plans" USING btree ("student_id");
  CREATE INDEX "meal_plans_author_idx" ON "meal_plans" USING btree ("author_id");
  CREATE INDEX "meal_plans_status_idx" ON "meal_plans" USING btree ("status");
  CREATE INDEX "meal_plans_updated_at_idx" ON "meal_plans" USING btree ("updated_at");
  CREATE INDEX "meal_plans_created_at_idx" ON "meal_plans" USING btree ("created_at");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_student_profiles_id_idx" ON "payload_locked_documents_rels" USING btree ("student_profiles_id");
  CREATE INDEX "payload_locked_documents_rels_professional_links_id_idx" ON "payload_locked_documents_rels" USING btree ("professional_links_id");
  CREATE INDEX "payload_locked_documents_rels_workouts_id_idx" ON "payload_locked_documents_rels" USING btree ("workouts_id");
  CREATE INDEX "payload_locked_documents_rels_meal_plans_id_idx" ON "payload_locked_documents_rels" USING btree ("meal_plans_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "student_profiles_equipment_access" CASCADE;
  DROP TABLE "student_profiles" CASCADE;
  DROP TABLE "professional_links" CASCADE;
  DROP TABLE "workouts_exercises" CASCADE;
  DROP TABLE "workouts" CASCADE;
  DROP TABLE "meal_plans_meals_items" CASCADE;
  DROP TABLE "meal_plans_meals" CASCADE;
  DROP TABLE "meal_plans" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TYPE "public"."enum_users_role";
  DROP TYPE "public"."enum_users_plan";
  DROP TYPE "public"."enum_student_profiles_equipment_access";
  DROP TYPE "public"."enum_student_profiles_sex";
  DROP TYPE "public"."enum_student_profiles_goal";
  DROP TYPE "public"."enum_student_profiles_experience_level";
  DROP TYPE "public"."enum_professional_links_professional_role";
  DROP TYPE "public"."enum_professional_links_status";
  DROP TYPE "public"."enum_workouts_status";
  DROP TYPE "public"."enum_workouts_source";
  DROP TYPE "public"."enum_meal_plans_status";
  DROP TYPE "public"."enum_meal_plans_source";`)
}
