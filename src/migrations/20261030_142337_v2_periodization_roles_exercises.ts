import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_users_roles" AS ENUM('student', 'personal', 'nutritionist');
  CREATE TYPE "public"."enum_users_primary_pro_role" AS ENUM('personal', 'nutritionist');
  CREATE TYPE "public"."enum_users_student_tier" AS ENUM('free', 'pro');
  CREATE TYPE "public"."enum_exercises_primary_muscles" AS ENUM('chest', 'lats', 'middle back', 'lower back', 'traps', 'shoulders', 'biceps', 'triceps', 'forearms', 'quadriceps', 'hamstrings', 'glutes', 'adductors', 'abductors', 'calves', 'abdominals', 'neck');
  CREATE TYPE "public"."enum_exercises_secondary_muscles" AS ENUM('chest', 'lats', 'middle back', 'lower back', 'traps', 'shoulders', 'biceps', 'triceps', 'forearms', 'quadriceps', 'hamstrings', 'glutes', 'adductors', 'abductors', 'calves', 'abdominals', 'neck');
  CREATE TYPE "public"."enum_exercises_muscle_group" AS ENUM('Peito', 'Costas', 'Ombro', 'Bíceps', 'Tríceps', 'Pernas', 'Glúteos', 'Abdômen');
  CREATE TYPE "public"."enum_exercises_equipment" AS ENUM('barbell', 'dumbbell', 'machine', 'cable', 'body only', 'kettlebells', 'bands', 'medicine ball', 'exercise ball', 'e-z curl bar', 'foam roll', 'other');
  CREATE TYPE "public"."enum_exercises_level" AS ENUM('beginner', 'intermediate', 'expert');
  CREATE TYPE "public"."enum_exercises_mechanic" AS ENUM('compound', 'isolation');
  CREATE TYPE "public"."enum_exercises_category" AS ENUM('strength', 'stretching', 'plyometrics', 'cardio', 'powerlifting', 'olympic weightlifting', 'strongman');
  CREATE TYPE "public"."enum_exercises_instructions_lang" AS ENUM('pt', 'en');
  CREATE TYPE "public"."enum_training_cycles_phases_kind" AS ENUM('adaptation', 'accumulation', 'hypertrophy', 'strength', 'intensification', 'power', 'realization', 'deload', 'transition', 'cutting');
  CREATE TYPE "public"."enum_training_cycles_phases_diet_phase" AS ENUM('deficit', 'maintenance', 'surplus', 'diet_break');
  CREATE TYPE "public"."enum_training_cycles_goal" AS ENUM('hypertrophy', 'strength', 'fat_loss', 'recomposition', 'conditioning', 'performance');
  CREATE TYPE "public"."enum_training_cycles_model" AS ENUM('linear', 'undulating_weekly', 'undulating_daily', 'block', 'reverse');
  CREATE TYPE "public"."enum_training_cycles_level" AS ENUM('beginner', 'intermediate', 'advanced');
  CREATE TYPE "public"."enum_training_cycles_status" AS ENUM('draft', 'active', 'completed', 'archived');
  CREATE TYPE "public"."enum_cycle_weeks_status" AS ENUM('on_track', 'behind', 'ahead', 'attention', 'no_data', 'upcoming');
  ALTER TYPE "public"."enum_users_checkout_tier" ADD VALUE 'student_monthly';
  ALTER TYPE "public"."enum_users_checkout_tier" ADD VALUE 'student_semester';
  ALTER TYPE "public"."enum_users_checkout_tier" ADD VALUE 'student_annual';
  ALTER TYPE "public"."enum_workouts_source" ADD VALUE 'self';
  ALTER TYPE "public"."enum_meal_plans_source" ADD VALUE 'self';
  CREATE TABLE "users_roles" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_users_roles",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "workout_logs_exercises_sets" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"reps" numeric,
  	"load_kg" numeric,
  	"rir" numeric,
  	"done" boolean DEFAULT true
  );
  
  CREATE TABLE "exercises_primary_muscles" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_exercises_primary_muscles",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "exercises_secondary_muscles" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_exercises_secondary_muscles",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "exercises_instructions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "exercises_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "exercises" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"name_en" varchar,
  	"slug" varchar NOT NULL,
  	"muscle_group" "enum_exercises_muscle_group",
  	"equipment" "enum_exercises_equipment",
  	"level" "enum_exercises_level",
  	"mechanic" "enum_exercises_mechanic",
  	"category" "enum_exercises_category",
  	"instructions_lang" "enum_exercises_instructions_lang" DEFAULT 'pt',
  	"youtube_url" varchar,
  	"is_custom" boolean DEFAULT false,
  	"author_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "training_cycles_baseline_lifts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"exercise_id" integer,
  	"name" varchar NOT NULL,
  	"e1rm" numeric
  );
  
  CREATE TABLE "training_cycles_phases" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"kind" "enum_training_cycles_phases_kind" NOT NULL,
  	"weeks" numeric NOT NULL,
  	"rep_range" varchar,
  	"rir_start" numeric,
  	"rir_end" numeric,
  	"intensity_min" numeric,
  	"intensity_max" numeric,
  	"sets_start" numeric,
  	"sets_end" numeric,
  	"cardio_min" numeric,
  	"diet_phase" "enum_training_cycles_phases_diet_phase",
  	"kcal_delta" numeric,
  	"protein_g_per_kg" numeric,
  	"notes" varchar
  );
  
  CREATE TABLE "training_cycles" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"student_id" integer NOT NULL,
  	"author_id" integer,
  	"coach_id" integer,
  	"nutritionist_id" integer,
  	"goal" "enum_training_cycles_goal" DEFAULT 'hypertrophy' NOT NULL,
  	"model" "enum_training_cycles_model" DEFAULT 'block',
  	"level" "enum_training_cycles_level" DEFAULT 'beginner' NOT NULL,
  	"start_date" timestamp(3) with time zone NOT NULL,
  	"sessions_per_week" numeric DEFAULT 4,
  	"status" "enum_training_cycles_status" DEFAULT 'draft' NOT NULL,
  	"template_id" varchar,
  	"baseline_weight_kg" numeric,
  	"baseline_body_fat_percent" numeric,
  	"baseline_waist_cm" numeric,
  	"targets_weight_kg" numeric,
  	"targets_body_fat_percent" numeric,
  	"targets_notes" varchar,
  	"total_weeks" numeric,
  	"notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "cycle_weeks" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"cycle_id" integer NOT NULL,
  	"student_id" integer NOT NULL,
  	"author_id" integer,
  	"coach_id" integer,
  	"nutritionist_id" integer,
  	"index" numeric NOT NULL,
  	"phase_index" numeric NOT NULL,
  	"phase_name" varchar,
  	"phase_kind" varchar,
  	"week_in_phase" numeric,
  	"start_date" timestamp(3) with time zone NOT NULL,
  	"end_date" timestamp(3) with time zone NOT NULL,
  	"is_deload" boolean DEFAULT false,
  	"planned" jsonb,
  	"expected" jsonb,
  	"actual" jsonb,
  	"status" "enum_cycle_weeks_status" DEFAULT 'no_data',
  	"reasons" jsonb,
  	"suggestions" jsonb,
  	"coach_note" varchar,
  	"computed_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "body_metrics" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"student_id" integer NOT NULL,
  	"recorded_by_id" integer,
  	"date" timestamp(3) with time zone NOT NULL,
  	"weight_kg" numeric,
  	"waist_cm" numeric,
  	"body_fat_percent" numeric,
  	"notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "weekly_checkins" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"student_id" integer NOT NULL,
  	"date" timestamp(3) with time zone NOT NULL,
  	"sleep" numeric,
  	"energy" numeric,
  	"soreness" numeric,
  	"stress" numeric,
  	"hunger" numeric,
  	"diet_adherence" numeric,
  	"notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "users" ADD COLUMN "primary_pro_role" "enum_users_primary_pro_role";
  ALTER TABLE "users" ADD COLUMN "secondary_professional_id" varchar;
  ALTER TABLE "users" ADD COLUMN "student_tier" "enum_users_student_tier" DEFAULT 'free';
  ALTER TABLE "workouts_exercises" ADD COLUMN "exercise_id" integer;
  ALTER TABLE "workouts_exercises" ADD COLUMN "target_rir" numeric;
  ALTER TABLE "workouts_exercises" ADD COLUMN "intensity_pct" numeric;
  ALTER TABLE "workouts_exercises" ADD COLUMN "tempo" varchar;
  ALTER TABLE "workouts" ADD COLUMN "cycle_id" integer;
  ALTER TABLE "workouts" ADD COLUMN "phase_index" numeric;
  ALTER TABLE "workouts" ADD COLUMN "week_from" numeric;
  ALTER TABLE "workouts" ADD COLUMN "week_to" numeric;
  ALTER TABLE "workout_logs_exercises" ADD COLUMN "exercise_id" integer;
  ALTER TABLE "workout_logs_exercises" ADD COLUMN "muscle_group" varchar;
  ALTER TABLE "workout_logs" ADD COLUMN "session_rpe" numeric;
  ALTER TABLE "workout_logs" ADD COLUMN "duration_min" numeric;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "exercises_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "training_cycles_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "cycle_weeks_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "body_metrics_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "weekly_checkins_id" integer;
  ALTER TABLE "users_roles" ADD CONSTRAINT "users_roles_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "workout_logs_exercises_sets" ADD CONSTRAINT "workout_logs_exercises_sets_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."workout_logs_exercises"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "exercises_primary_muscles" ADD CONSTRAINT "exercises_primary_muscles_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."exercises"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "exercises_secondary_muscles" ADD CONSTRAINT "exercises_secondary_muscles_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."exercises"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "exercises_instructions" ADD CONSTRAINT "exercises_instructions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."exercises"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "exercises_images" ADD CONSTRAINT "exercises_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."exercises"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "exercises" ADD CONSTRAINT "exercises_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "training_cycles_baseline_lifts" ADD CONSTRAINT "training_cycles_baseline_lifts_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "training_cycles_baseline_lifts" ADD CONSTRAINT "training_cycles_baseline_lifts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."training_cycles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "training_cycles_phases" ADD CONSTRAINT "training_cycles_phases_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."training_cycles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "training_cycles" ADD CONSTRAINT "training_cycles_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "training_cycles" ADD CONSTRAINT "training_cycles_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "training_cycles" ADD CONSTRAINT "training_cycles_coach_id_users_id_fk" FOREIGN KEY ("coach_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "training_cycles" ADD CONSTRAINT "training_cycles_nutritionist_id_users_id_fk" FOREIGN KEY ("nutritionist_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cycle_weeks" ADD CONSTRAINT "cycle_weeks_cycle_id_training_cycles_id_fk" FOREIGN KEY ("cycle_id") REFERENCES "public"."training_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cycle_weeks" ADD CONSTRAINT "cycle_weeks_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cycle_weeks" ADD CONSTRAINT "cycle_weeks_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cycle_weeks" ADD CONSTRAINT "cycle_weeks_coach_id_users_id_fk" FOREIGN KEY ("coach_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cycle_weeks" ADD CONSTRAINT "cycle_weeks_nutritionist_id_users_id_fk" FOREIGN KEY ("nutritionist_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "body_metrics" ADD CONSTRAINT "body_metrics_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "body_metrics" ADD CONSTRAINT "body_metrics_recorded_by_id_users_id_fk" FOREIGN KEY ("recorded_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "weekly_checkins" ADD CONSTRAINT "weekly_checkins_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "users_roles_order_idx" ON "users_roles" USING btree ("order");
  CREATE INDEX "users_roles_parent_idx" ON "users_roles" USING btree ("parent_id");
  CREATE INDEX "workout_logs_exercises_sets_order_idx" ON "workout_logs_exercises_sets" USING btree ("_order");
  CREATE INDEX "workout_logs_exercises_sets_parent_id_idx" ON "workout_logs_exercises_sets" USING btree ("_parent_id");
  CREATE INDEX "exercises_primary_muscles_order_idx" ON "exercises_primary_muscles" USING btree ("order");
  CREATE INDEX "exercises_primary_muscles_parent_idx" ON "exercises_primary_muscles" USING btree ("parent_id");
  CREATE INDEX "exercises_secondary_muscles_order_idx" ON "exercises_secondary_muscles" USING btree ("order");
  CREATE INDEX "exercises_secondary_muscles_parent_idx" ON "exercises_secondary_muscles" USING btree ("parent_id");
  CREATE INDEX "exercises_instructions_order_idx" ON "exercises_instructions" USING btree ("_order");
  CREATE INDEX "exercises_instructions_parent_id_idx" ON "exercises_instructions" USING btree ("_parent_id");
  CREATE INDEX "exercises_images_order_idx" ON "exercises_images" USING btree ("_order");
  CREATE INDEX "exercises_images_parent_id_idx" ON "exercises_images" USING btree ("_parent_id");
  CREATE INDEX "exercises_name_idx" ON "exercises" USING btree ("name");
  CREATE UNIQUE INDEX "exercises_slug_idx" ON "exercises" USING btree ("slug");
  CREATE INDEX "exercises_muscle_group_idx" ON "exercises" USING btree ("muscle_group");
  CREATE INDEX "exercises_equipment_idx" ON "exercises" USING btree ("equipment");
  CREATE INDEX "exercises_is_custom_idx" ON "exercises" USING btree ("is_custom");
  CREATE INDEX "exercises_author_idx" ON "exercises" USING btree ("author_id");
  CREATE INDEX "exercises_updated_at_idx" ON "exercises" USING btree ("updated_at");
  CREATE INDEX "exercises_created_at_idx" ON "exercises" USING btree ("created_at");
  CREATE INDEX "training_cycles_baseline_lifts_order_idx" ON "training_cycles_baseline_lifts" USING btree ("_order");
  CREATE INDEX "training_cycles_baseline_lifts_parent_id_idx" ON "training_cycles_baseline_lifts" USING btree ("_parent_id");
  CREATE INDEX "training_cycles_baseline_lifts_exercise_idx" ON "training_cycles_baseline_lifts" USING btree ("exercise_id");
  CREATE INDEX "training_cycles_phases_order_idx" ON "training_cycles_phases" USING btree ("_order");
  CREATE INDEX "training_cycles_phases_parent_id_idx" ON "training_cycles_phases" USING btree ("_parent_id");
  CREATE INDEX "training_cycles_student_idx" ON "training_cycles" USING btree ("student_id");
  CREATE INDEX "training_cycles_author_idx" ON "training_cycles" USING btree ("author_id");
  CREATE INDEX "training_cycles_coach_idx" ON "training_cycles" USING btree ("coach_id");
  CREATE INDEX "training_cycles_nutritionist_idx" ON "training_cycles" USING btree ("nutritionist_id");
  CREATE INDEX "training_cycles_start_date_idx" ON "training_cycles" USING btree ("start_date");
  CREATE INDEX "training_cycles_status_idx" ON "training_cycles" USING btree ("status");
  CREATE INDEX "training_cycles_updated_at_idx" ON "training_cycles" USING btree ("updated_at");
  CREATE INDEX "training_cycles_created_at_idx" ON "training_cycles" USING btree ("created_at");
  CREATE INDEX "cycle_weeks_cycle_idx" ON "cycle_weeks" USING btree ("cycle_id");
  CREATE INDEX "cycle_weeks_student_idx" ON "cycle_weeks" USING btree ("student_id");
  CREATE INDEX "cycle_weeks_author_idx" ON "cycle_weeks" USING btree ("author_id");
  CREATE INDEX "cycle_weeks_coach_idx" ON "cycle_weeks" USING btree ("coach_id");
  CREATE INDEX "cycle_weeks_nutritionist_idx" ON "cycle_weeks" USING btree ("nutritionist_id");
  CREATE INDEX "cycle_weeks_index_idx" ON "cycle_weeks" USING btree ("index");
  CREATE INDEX "cycle_weeks_start_date_idx" ON "cycle_weeks" USING btree ("start_date");
  CREATE INDEX "cycle_weeks_status_idx" ON "cycle_weeks" USING btree ("status");
  CREATE INDEX "cycle_weeks_updated_at_idx" ON "cycle_weeks" USING btree ("updated_at");
  CREATE INDEX "cycle_weeks_created_at_idx" ON "cycle_weeks" USING btree ("created_at");
  CREATE INDEX "body_metrics_student_idx" ON "body_metrics" USING btree ("student_id");
  CREATE INDEX "body_metrics_recorded_by_idx" ON "body_metrics" USING btree ("recorded_by_id");
  CREATE INDEX "body_metrics_date_idx" ON "body_metrics" USING btree ("date");
  CREATE INDEX "body_metrics_updated_at_idx" ON "body_metrics" USING btree ("updated_at");
  CREATE INDEX "body_metrics_created_at_idx" ON "body_metrics" USING btree ("created_at");
  CREATE INDEX "weekly_checkins_student_idx" ON "weekly_checkins" USING btree ("student_id");
  CREATE INDEX "weekly_checkins_date_idx" ON "weekly_checkins" USING btree ("date");
  CREATE INDEX "weekly_checkins_updated_at_idx" ON "weekly_checkins" USING btree ("updated_at");
  CREATE INDEX "weekly_checkins_created_at_idx" ON "weekly_checkins" USING btree ("created_at");
  ALTER TABLE "workouts_exercises" ADD CONSTRAINT "workouts_exercises_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "workouts" ADD CONSTRAINT "workouts_cycle_id_training_cycles_id_fk" FOREIGN KEY ("cycle_id") REFERENCES "public"."training_cycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "workout_logs_exercises" ADD CONSTRAINT "workout_logs_exercises_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_exercises_fk" FOREIGN KEY ("exercises_id") REFERENCES "public"."exercises"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_training_cycles_fk" FOREIGN KEY ("training_cycles_id") REFERENCES "public"."training_cycles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_cycle_weeks_fk" FOREIGN KEY ("cycle_weeks_id") REFERENCES "public"."cycle_weeks"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_body_metrics_fk" FOREIGN KEY ("body_metrics_id") REFERENCES "public"."body_metrics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_weekly_checkins_fk" FOREIGN KEY ("weekly_checkins_id") REFERENCES "public"."weekly_checkins"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "workouts_exercises_exercise_idx" ON "workouts_exercises" USING btree ("exercise_id");
  CREATE INDEX "workouts_cycle_idx" ON "workouts" USING btree ("cycle_id");
  CREATE INDEX "workout_logs_exercises_exercise_idx" ON "workout_logs_exercises" USING btree ("exercise_id");
  CREATE INDEX "payload_locked_documents_rels_exercises_id_idx" ON "payload_locked_documents_rels" USING btree ("exercises_id");
  CREATE INDEX "payload_locked_documents_rels_training_cycles_id_idx" ON "payload_locked_documents_rels" USING btree ("training_cycles_id");
  CREATE INDEX "payload_locked_documents_rels_cycle_weeks_id_idx" ON "payload_locked_documents_rels" USING btree ("cycle_weeks_id");
  CREATE INDEX "payload_locked_documents_rels_body_metrics_id_idx" ON "payload_locked_documents_rels" USING btree ("body_metrics_id");
  CREATE INDEX "payload_locked_documents_rels_weekly_checkins_id_idx" ON "payload_locked_documents_rels" USING btree ("weekly_checkins_id");
  -- Contas existentes: papel atual (+ aluno para profissionais) e área principal
  INSERT INTO "users_roles" ("order", "parent_id", "value")
    SELECT 1, u."id", u."role"::text::"enum_users_roles" FROM "users" u WHERE u."role" IN ('student', 'personal', 'nutritionist');
  INSERT INTO "users_roles" ("order", "parent_id", "value")
    SELECT 2, u."id", 'student'::"enum_users_roles" FROM "users" u WHERE u."role" IN ('personal', 'nutritionist');
  UPDATE "users" SET "primary_pro_role" = "role"::text::"enum_users_primary_pro_role" WHERE "role" IN ('personal', 'nutritionist');`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "users_roles" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "workout_logs_exercises_sets" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "exercises_primary_muscles" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "exercises_secondary_muscles" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "exercises_instructions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "exercises_images" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "exercises" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "training_cycles_baseline_lifts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "training_cycles_phases" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "training_cycles" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "cycle_weeks" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "body_metrics" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "weekly_checkins" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "users_roles" CASCADE;
  DROP TABLE "workout_logs_exercises_sets" CASCADE;
  DROP TABLE "exercises_primary_muscles" CASCADE;
  DROP TABLE "exercises_secondary_muscles" CASCADE;
  DROP TABLE "exercises_instructions" CASCADE;
  DROP TABLE "exercises_images" CASCADE;
  DROP TABLE "exercises" CASCADE;
  DROP TABLE "training_cycles_baseline_lifts" CASCADE;
  DROP TABLE "training_cycles_phases" CASCADE;
  DROP TABLE "training_cycles" CASCADE;
  DROP TABLE "cycle_weeks" CASCADE;
  DROP TABLE "body_metrics" CASCADE;
  DROP TABLE "weekly_checkins" CASCADE;
  ALTER TABLE "workouts_exercises" DROP CONSTRAINT "workouts_exercises_exercise_id_exercises_id_fk";
  
  ALTER TABLE "workouts" DROP CONSTRAINT "workouts_cycle_id_training_cycles_id_fk";
  
  ALTER TABLE "workout_logs_exercises" DROP CONSTRAINT "workout_logs_exercises_exercise_id_exercises_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_exercises_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_training_cycles_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_cycle_weeks_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_body_metrics_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_weekly_checkins_fk";
  
  ALTER TABLE "users" ALTER COLUMN "checkout_tier" SET DATA TYPE text;
  DROP TYPE "public"."enum_users_checkout_tier";
  CREATE TYPE "public"."enum_users_checkout_tier" AS ENUM('pro', 'elite');
  ALTER TABLE "users" ALTER COLUMN "checkout_tier" SET DATA TYPE "public"."enum_users_checkout_tier" USING "checkout_tier"::"public"."enum_users_checkout_tier";
  ALTER TABLE "workouts" ALTER COLUMN "source" SET DATA TYPE text;
  ALTER TABLE "workouts" ALTER COLUMN "source" SET DEFAULT 'professional'::text;
  DROP TYPE "public"."enum_workouts_source";
  CREATE TYPE "public"."enum_workouts_source" AS ENUM('professional', 'ai');
  ALTER TABLE "workouts" ALTER COLUMN "source" SET DEFAULT 'professional'::"public"."enum_workouts_source";
  ALTER TABLE "workouts" ALTER COLUMN "source" SET DATA TYPE "public"."enum_workouts_source" USING "source"::"public"."enum_workouts_source";
  ALTER TABLE "meal_plans" ALTER COLUMN "source" SET DATA TYPE text;
  ALTER TABLE "meal_plans" ALTER COLUMN "source" SET DEFAULT 'professional'::text;
  DROP TYPE "public"."enum_meal_plans_source";
  CREATE TYPE "public"."enum_meal_plans_source" AS ENUM('professional', 'ai');
  ALTER TABLE "meal_plans" ALTER COLUMN "source" SET DEFAULT 'professional'::"public"."enum_meal_plans_source";
  ALTER TABLE "meal_plans" ALTER COLUMN "source" SET DATA TYPE "public"."enum_meal_plans_source" USING "source"::"public"."enum_meal_plans_source";
  DROP INDEX "workouts_exercises_exercise_idx";
  DROP INDEX "workouts_cycle_idx";
  DROP INDEX "workout_logs_exercises_exercise_idx";
  DROP INDEX "payload_locked_documents_rels_exercises_id_idx";
  DROP INDEX "payload_locked_documents_rels_training_cycles_id_idx";
  DROP INDEX "payload_locked_documents_rels_cycle_weeks_id_idx";
  DROP INDEX "payload_locked_documents_rels_body_metrics_id_idx";
  DROP INDEX "payload_locked_documents_rels_weekly_checkins_id_idx";
  ALTER TABLE "users" DROP COLUMN "primary_pro_role";
  ALTER TABLE "users" DROP COLUMN "secondary_professional_id";
  ALTER TABLE "users" DROP COLUMN "student_tier";
  ALTER TABLE "workouts_exercises" DROP COLUMN "exercise_id";
  ALTER TABLE "workouts_exercises" DROP COLUMN "target_rir";
  ALTER TABLE "workouts_exercises" DROP COLUMN "intensity_pct";
  ALTER TABLE "workouts_exercises" DROP COLUMN "tempo";
  ALTER TABLE "workouts" DROP COLUMN "cycle_id";
  ALTER TABLE "workouts" DROP COLUMN "phase_index";
  ALTER TABLE "workouts" DROP COLUMN "week_from";
  ALTER TABLE "workouts" DROP COLUMN "week_to";
  ALTER TABLE "workout_logs_exercises" DROP COLUMN "exercise_id";
  ALTER TABLE "workout_logs_exercises" DROP COLUMN "muscle_group";
  ALTER TABLE "workout_logs" DROP COLUMN "session_rpe";
  ALTER TABLE "workout_logs" DROP COLUMN "duration_min";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "exercises_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "training_cycles_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "cycle_weeks_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "body_metrics_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "weekly_checkins_id";
  DROP TYPE "public"."enum_users_roles";
  DROP TYPE "public"."enum_users_primary_pro_role";
  DROP TYPE "public"."enum_users_student_tier";
  DROP TYPE "public"."enum_exercises_primary_muscles";
  DROP TYPE "public"."enum_exercises_secondary_muscles";
  DROP TYPE "public"."enum_exercises_muscle_group";
  DROP TYPE "public"."enum_exercises_equipment";
  DROP TYPE "public"."enum_exercises_level";
  DROP TYPE "public"."enum_exercises_mechanic";
  DROP TYPE "public"."enum_exercises_category";
  DROP TYPE "public"."enum_exercises_instructions_lang";
  DROP TYPE "public"."enum_training_cycles_phases_kind";
  DROP TYPE "public"."enum_training_cycles_phases_diet_phase";
  DROP TYPE "public"."enum_training_cycles_goal";
  DROP TYPE "public"."enum_training_cycles_model";
  DROP TYPE "public"."enum_training_cycles_level";
  DROP TYPE "public"."enum_training_cycles_status";
  DROP TYPE "public"."enum_cycle_weeks_status";`)
}
