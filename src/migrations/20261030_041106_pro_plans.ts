import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_users_pro_tier" AS ENUM('free', 'pro', 'elite');
  CREATE TYPE "public"."enum_users_billing_cycle" AS ENUM('monthly', 'annual');
  ALTER TABLE "users" ADD COLUMN "pro_tier" "enum_users_pro_tier" DEFAULT 'free';
  ALTER TABLE "users" ADD COLUMN "billing_cycle" "enum_users_billing_cycle";
  ALTER TABLE "users" ADD COLUMN "trial_ends_at" timestamp(3) with time zone;
  ALTER TABLE "users" ADD COLUMN "trial_used" boolean DEFAULT false;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "users" DROP COLUMN "pro_tier";
  ALTER TABLE "users" DROP COLUMN "billing_cycle";
  ALTER TABLE "users" DROP COLUMN "trial_ends_at";
  ALTER TABLE "users" DROP COLUMN "trial_used";
  DROP TYPE "public"."enum_users_pro_tier";
  DROP TYPE "public"."enum_users_billing_cycle";`)
}
