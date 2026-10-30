import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Separado da etapa 2: o Postgres não deixa usar um valor de enum criado na mesma transação.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`ALTER TABLE "users" ALTER COLUMN "plan" SET DEFAULT 'free';`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`ALTER TABLE "users" ALTER COLUMN "plan" DROP DEFAULT;`)
}
