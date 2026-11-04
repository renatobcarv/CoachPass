import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_workout_logs_exercises_change" AS ENUM('none', 'substituted', 'added', 'skipped');
  CREATE TYPE "public"."enum_body_metrics_photos_angle" AS ENUM('front', 'side', 'back');
  CREATE TABLE "body_metrics_photos" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"url" varchar NOT NULL,
  	"angle" "enum_body_metrics_photos_angle"
  );
  
  ALTER TABLE "workouts_exercises" ADD COLUMN "load_kg" numeric;
  ALTER TABLE "workouts_exercises" ADD COLUMN "target_rpe" numeric;
  ALTER TABLE "workouts_exercises" ADD COLUMN "rest_sec" numeric;
  ALTER TABLE "workout_logs_exercises_sets" ADD COLUMN "rpe" numeric;
  ALTER TABLE "workout_logs_exercises_sets" ADD COLUMN "rest_sec" numeric;
  ALTER TABLE "workout_logs_exercises" ADD COLUMN "planned_sets" numeric;
  ALTER TABLE "workout_logs_exercises" ADD COLUMN "planned_reps" varchar;
  ALTER TABLE "workout_logs_exercises" ADD COLUMN "planned_load_kg" numeric;
  ALTER TABLE "workout_logs_exercises" ADD COLUMN "planned_rir" numeric;
  ALTER TABLE "workout_logs_exercises" ADD COLUMN "planned_rpe" numeric;
  ALTER TABLE "workout_logs_exercises" ADD COLUMN "planned_rest_sec" numeric;
  ALTER TABLE "workout_logs_exercises" ADD COLUMN "change" "enum_workout_logs_exercises_change" DEFAULT 'none';
  ALTER TABLE "workout_logs_exercises" ADD COLUMN "replaced_name" varchar;
  ALTER TABLE "workout_logs" ADD COLUMN "cycle_id" integer;
  ALTER TABLE "workout_logs" ADD COLUMN "week_index" numeric;
  ALTER TABLE "body_metrics" ADD COLUMN "abdomen_cm" numeric;
  ALTER TABLE "body_metrics" ADD COLUMN "hip_cm" numeric;
  ALTER TABLE "body_metrics" ADD COLUMN "chest_cm" numeric;
  ALTER TABLE "body_metrics" ADD COLUMN "arm_cm" numeric;
  ALTER TABLE "body_metrics" ADD COLUMN "thigh_cm" numeric;
  ALTER TABLE "body_metrics" ADD COLUMN "calf_cm" numeric;
  ALTER TABLE "body_metrics" ADD COLUMN "body_fat_method" varchar;
  ALTER TABLE "weekly_checkins" ADD COLUMN "fatigue" numeric;
  ALTER TABLE "weekly_checkins" ADD COLUMN "readiness" numeric;
  ALTER TABLE "weekly_checkins" ADD COLUMN "joint_pain" numeric;
  ALTER TABLE "weekly_checkins" ADD COLUMN "recovery" numeric;
  ALTER TABLE "body_metrics_photos" ADD CONSTRAINT "body_metrics_photos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."body_metrics"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "body_metrics_photos_order_idx" ON "body_metrics_photos" USING btree ("_order");
  CREATE INDEX "body_metrics_photos_parent_id_idx" ON "body_metrics_photos" USING btree ("_parent_id");
  ALTER TABLE "workout_logs" ADD CONSTRAINT "workout_logs_cycle_id_training_cycles_id_fk" FOREIGN KEY ("cycle_id") REFERENCES "public"."training_cycles"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "workout_logs_cycle_idx" ON "workout_logs" USING btree ("cycle_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "body_metrics_photos" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "body_metrics_photos" CASCADE;
  ALTER TABLE "workout_logs" DROP CONSTRAINT "workout_logs_cycle_id_training_cycles_id_fk";
  
  DROP INDEX "workout_logs_cycle_idx";
  ALTER TABLE "workouts_exercises" DROP COLUMN "load_kg";
  ALTER TABLE "workouts_exercises" DROP COLUMN "target_rpe";
  ALTER TABLE "workouts_exercises" DROP COLUMN "rest_sec";
  ALTER TABLE "workout_logs_exercises_sets" DROP COLUMN "rpe";
  ALTER TABLE "workout_logs_exercises_sets" DROP COLUMN "rest_sec";
  ALTER TABLE "workout_logs_exercises" DROP COLUMN "planned_sets";
  ALTER TABLE "workout_logs_exercises" DROP COLUMN "planned_reps";
  ALTER TABLE "workout_logs_exercises" DROP COLUMN "planned_load_kg";
  ALTER TABLE "workout_logs_exercises" DROP COLUMN "planned_rir";
  ALTER TABLE "workout_logs_exercises" DROP COLUMN "planned_rpe";
  ALTER TABLE "workout_logs_exercises" DROP COLUMN "planned_rest_sec";
  ALTER TABLE "workout_logs_exercises" DROP COLUMN "change";
  ALTER TABLE "workout_logs_exercises" DROP COLUMN "replaced_name";
  ALTER TABLE "workout_logs" DROP COLUMN "cycle_id";
  ALTER TABLE "workout_logs" DROP COLUMN "week_index";
  ALTER TABLE "body_metrics" DROP COLUMN "abdomen_cm";
  ALTER TABLE "body_metrics" DROP COLUMN "hip_cm";
  ALTER TABLE "body_metrics" DROP COLUMN "chest_cm";
  ALTER TABLE "body_metrics" DROP COLUMN "arm_cm";
  ALTER TABLE "body_metrics" DROP COLUMN "thigh_cm";
  ALTER TABLE "body_metrics" DROP COLUMN "calf_cm";
  ALTER TABLE "body_metrics" DROP COLUMN "body_fat_method";
  ALTER TABLE "weekly_checkins" DROP COLUMN "fatigue";
  ALTER TABLE "weekly_checkins" DROP COLUMN "readiness";
  ALTER TABLE "weekly_checkins" DROP COLUMN "joint_pain";
  ALTER TABLE "weekly_checkins" DROP COLUMN "recovery";
  DROP TYPE "public"."enum_workout_logs_exercises_change";
  DROP TYPE "public"."enum_body_metrics_photos_angle";`)
}
