import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  CREATE TYPE "public"."enum_workout_logs_status" AS ENUM('completed', 'partial', 'skipped');
  CREATE TYPE "public"."enum_foods_category" AS ENUM('protein', 'carb', 'fat', 'vegetable', 'fruit', 'dairy');
  CREATE TYPE "public"."enum_foods_source" AS ENUM('taco', 'tbca', 'usda', 'manufacturer', 'manual');
  CREATE TYPE "public"."enum_transactions_kind" AS ENUM('charge', 'payment', 'expense');
  CREATE TYPE "public"."enum_transactions_status" AS ENUM('pending', 'paid', 'overdue', 'cancelled');

  CREATE TABLE "workout_logs" (
    "id" serial PRIMARY KEY NOT NULL,
    "student_id" integer NOT NULL,
    "workout_id" integer NOT NULL,
    "performed_at" timestamp(3) with time zone NOT NULL,
    "status" "enum_workout_logs_status" DEFAULT 'completed' NOT NULL,
    "rpe" numeric,
    "notes" varchar,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "workout_logs_exercises" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "name" varchar NOT NULL,
    "sets_completed" numeric,
    "load" varchar,
    "notes" varchar
  );

  CREATE TABLE "foods" (
    "id" serial PRIMARY KEY NOT NULL,
    "name" varchar NOT NULL,
    "category" "enum_foods_category" NOT NULL,
    "calories" numeric NOT NULL,
    "protein" numeric NOT NULL,
    "carbs" numeric NOT NULL,
    "fat" numeric NOT NULL,
    "fiber" numeric,
    "sodium" numeric,
    "unit" varchar DEFAULT 'g' NOT NULL,
    "portion_label" varchar DEFAULT '100g',
    "source" "enum_foods_source" DEFAULT 'taco' NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "transactions" (
    "id" serial PRIMARY KEY NOT NULL,
    "professional_id" integer NOT NULL,
    "student_id" integer NOT NULL,
    "description" varchar NOT NULL,
    "amount" numeric NOT NULL,
    "kind" "enum_transactions_kind" DEFAULT 'charge' NOT NULL,
    "status" "enum_transactions_status" DEFAULT 'pending' NOT NULL,
    "due_date" timestamp(3) with time zone,
    "paid_at" timestamp(3) with time zone,
    "notes" varchar,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  ALTER TABLE "workout_logs" ADD CONSTRAINT "workout_logs_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "workout_logs" ADD CONSTRAINT "workout_logs_workout_id_workouts_id_fk" FOREIGN KEY ("workout_id") REFERENCES "public"."workouts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "workout_logs_exercises" ADD CONSTRAINT "workout_logs_exercises_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."workout_logs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "transactions" ADD CONSTRAINT "transactions_professional_id_users_id_fk" FOREIGN KEY ("professional_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "transactions" ADD CONSTRAINT "transactions_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;

  CREATE INDEX "workout_logs_student_idx" ON "workout_logs" USING btree ("student_id");
  CREATE INDEX "workout_logs_workout_idx" ON "workout_logs" USING btree ("workout_id");
  CREATE INDEX "foods_name_idx" ON "foods" USING btree ("name");
  CREATE INDEX "foods_category_idx" ON "foods" USING btree ("category");
  CREATE INDEX "transactions_professional_idx" ON "transactions" USING btree ("professional_id");
  CREATE INDEX "transactions_student_idx" ON "transactions" USING btree ("student_id");
  CREATE INDEX "transactions_status_idx" ON "transactions" USING btree ("status");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  DROP TABLE "workout_logs_exercises" CASCADE;
  DROP TABLE "workout_logs" CASCADE;
  DROP TABLE "foods" CASCADE;
  DROP TABLE "transactions" CASCADE;
  DROP TYPE "public"."enum_workout_logs_status";
  DROP TYPE "public"."enum_foods_category";
  DROP TYPE "public"."enum_foods_source";
  DROP TYPE "public"."enum_transactions_kind";
  DROP TYPE "public"."enum_transactions_status";
  `)
}
