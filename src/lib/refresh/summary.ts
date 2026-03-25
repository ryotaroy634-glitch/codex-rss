import { RefreshRunSummary } from "@/types";

export function combineRefreshSummaries(summaries: RefreshRunSummary[]): RefreshRunSummary {
  if (!summaries.length) {
    const now = new Date().toISOString();
    return {
      startedAt: now,
      finishedAt: now,
      insertedCount: 0,
      fetchedCount: 0,
      successCount: 0,
      failureCount: 0,
      skipped: false,
      results: []
    };
  }

  return {
    startedAt: summaries[0].startedAt,
    finishedAt: summaries[summaries.length - 1].finishedAt,
    insertedCount: summaries.reduce((sum, summary) => sum + summary.insertedCount, 0),
    fetchedCount: summaries.reduce((sum, summary) => sum + summary.fetchedCount, 0),
    successCount: summaries.reduce((sum, summary) => sum + summary.successCount, 0),
    failureCount: summaries.reduce((sum, summary) => sum + summary.failureCount, 0),
    skipped: summaries.every((summary) => summary.skipped),
    reason: summaries.find((summary) => summary.reason)?.reason,
    results: summaries.flatMap((summary) => summary.results)
  };
}
