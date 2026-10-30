import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "professional_links" ADD COLUMN "professional_name" varchar;
  -- Convites já existentes: copia o nome do profissional
  UPDATE "professional_links" pl SET "professional_name" = u."name" FROM "users" u WHERE u."id" = pl."professional_id";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "professional_links" DROP COLUMN "professional_name";`)
}
