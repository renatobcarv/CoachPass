import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Coluna usada pelo armazenamento do Vercel Blob (o plugin só liga quando há BLOB_READ_WRITE_TOKEN;
// a coluna fica disponível em todos os ambientes que usam este banco)
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "_objectkey" varchar;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`ALTER TABLE "media" DROP COLUMN IF EXISTS "_objectkey";`)
}
