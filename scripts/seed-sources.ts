import { ensureSources, listSources } from "@/lib/db/repository";
import { getSql } from "@/lib/db/sql";

async function main() {
  await ensureSources();
  const sources = await listSources();
  console.log(
    JSON.stringify(
      {
        count: sources.length,
        firstFive: sources.slice(0, 5).map((source) => ({
          slug: source.slug,
          name: source.name,
          category: source.category
        }))
      },
      null,
      2
    )
  );

  await getSql().end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
