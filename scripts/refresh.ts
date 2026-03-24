async function main() {
  console.log("[boot] refresh script");
  const sourceSlugs = process.argv.slice(2);
  const { getSql } = await import("@/lib/db/sql");
  console.log("[boot] db/sql loaded");
  await import("@/lib/feeds/fetch");
  console.log("[boot] feeds/fetch loaded");
  await import("@/lib/feeds/scrape");
  console.log("[boot] feeds/scrape loaded");
  await import("@/lib/feeds/sources");
  console.log("[boot] feeds/sources loaded");
  const { refreshAllSources } = await import("@/lib/feeds/ingest");
  console.log("[boot] ingest loaded");

  const summary = await refreshAllSources({
    force: true,
    sourceSlugs: sourceSlugs.length ? sourceSlugs : undefined,
    onSourceStart: (slug) => {
      console.log(`[start] ${slug}`);
    },
    onSourceComplete: (result) => {
      console.log(
        `[done] ${result.sourceSlug} status=${result.status} fetched=${result.fetchedCount} inserted=${result.insertedCount}`
      );
    }
  });

  console.log(
    JSON.stringify(
      {
        insertedCount: summary.insertedCount,
        fetchedCount: summary.fetchedCount,
        successCount: summary.successCount,
        failureCount: summary.failureCount,
        skipped: summary.skipped,
        results: summary.results
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
