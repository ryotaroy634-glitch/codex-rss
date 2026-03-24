import { ensureSchema, getSql } from "@/lib/db/sql";

async function main() {
  await ensureSchema();
  const sql = getSql();

  const [{ db, user_name }] = await sql<{ db: string; user_name: string }[]>`
    select current_database() as db, current_user as user_name
  `;

  const tableRows = await sql<{ tablename: string }[]>`
    select tablename
    from pg_tables
    where schemaname = 'public'
      and tablename in ('sources', 'articles', 'refresh_logs')
    order by tablename
  `;

  console.log(JSON.stringify({ db, user_name, tables: tableRows }, null, 2));
  await sql.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
