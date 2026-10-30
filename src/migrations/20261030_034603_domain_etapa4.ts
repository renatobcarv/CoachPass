import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Completa a etapa 3 (escrita à mão): colunas de bloqueio de documento do admin
 * para workout_logs, foods e transactions, e os índices que o Payload espera.
 * Tudo com IF NOT EXISTS para não quebrar em bancos que já tenham isso via push.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "workout_logs_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "foods_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "transactions_id" integer;

  DO $$ BEGIN
    ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_workout_logs_fk" FOREIGN KEY ("workout_logs_id") REFERENCES "public"."workout_logs"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN
    ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_foods_fk" FOREIGN KEY ("foods_id") REFERENCES "public"."foods"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN
    ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_transactions_fk" FOREIGN KEY ("transactions_id") REFERENCES "public"."transactions"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL; END $$;

  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_workout_logs_id_idx" ON "payload_locked_documents_rels" USING btree ("workout_logs_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_foods_id_idx" ON "payload_locked_documents_rels" USING btree ("foods_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_transactions_id_idx" ON "payload_locked_documents_rels" USING btree ("transactions_id");

  CREATE INDEX IF NOT EXISTS "workout_logs_exercises_order_idx" ON "workout_logs_exercises" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "workout_logs_exercises_parent_id_idx" ON "workout_logs_exercises" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "workout_logs_updated_at_idx" ON "workout_logs" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "workout_logs_created_at_idx" ON "workout_logs" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "foods_updated_at_idx" ON "foods" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "foods_created_at_idx" ON "foods" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "transactions_updated_at_idx" ON "transactions" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "transactions_created_at_idx" ON "transactions" USING btree ("created_at");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  DROP INDEX IF EXISTS "transactions_created_at_idx";
  DROP INDEX IF EXISTS "transactions_updated_at_idx";
  DROP INDEX IF EXISTS "foods_created_at_idx";
  DROP INDEX IF EXISTS "foods_updated_at_idx";
  DROP INDEX IF EXISTS "workout_logs_created_at_idx";
  DROP INDEX IF EXISTS "workout_logs_updated_at_idx";
  DROP INDEX IF EXISTS "workout_logs_exercises_parent_id_idx";
  DROP INDEX IF EXISTS "workout_logs_exercises_order_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_workout_logs_fk";
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_foods_fk";
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_transactions_fk";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_workout_logs_id_idx";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_foods_id_idx";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_transactions_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "workout_logs_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "foods_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "transactions_id";
  `)
}
