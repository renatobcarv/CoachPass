import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_users_subscription_status" AS ENUM('none', 'pending', 'active', 'cancelled');
  CREATE TYPE "public"."enum_users_checkout_tier" AS ENUM('pro', 'elite');
  ALTER TABLE "users" ADD COLUMN "subscription_status" "enum_users_subscription_status" DEFAULT 'none';
  ALTER TABLE "users" ADD COLUMN "paid_until" timestamp(3) with time zone;
  ALTER TABLE "users" ADD COLUMN "checkout_tier" "enum_users_checkout_tier";
  ALTER TABLE "users" ADD COLUMN "abacate_checkout_id" varchar;
  ALTER TABLE "users" ADD COLUMN "abacate_subscription_id" varchar;
  ALTER TABLE "users" ADD COLUMN "abacate_customer_id" varchar;
  CREATE INDEX "users_abacate_checkout_id_idx" ON "users" USING btree ("abacate_checkout_id");
  CREATE INDEX "users_abacate_subscription_id_idx" ON "users" USING btree ("abacate_subscription_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "users_abacate_checkout_id_idx";
  DROP INDEX "users_abacate_subscription_id_idx";
  ALTER TABLE "users" DROP COLUMN "subscription_status";
  ALTER TABLE "users" DROP COLUMN "paid_until";
  ALTER TABLE "users" DROP COLUMN "checkout_tier";
  ALTER TABLE "users" DROP COLUMN "abacate_checkout_id";
  ALTER TABLE "users" DROP COLUMN "abacate_subscription_id";
  ALTER TABLE "users" DROP COLUMN "abacate_customer_id";
  DROP TYPE "public"."enum_users_subscription_status";
  DROP TYPE "public"."enum_users_checkout_tier";`)
}
