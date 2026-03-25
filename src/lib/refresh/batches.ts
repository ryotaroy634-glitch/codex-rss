export const REFRESH_BATCHES = {
  "1": [
    "wall-street-journal",
    "bloomberg",
    "reuters",
    "financial-times",
    "new-york-times",
    "washington-post",
    "cnbc",
    "yahoo-japan-it"
  ],
  "2": [
    "axios",
    "openai",
    "google",
    "meta",
    "anthropic",
    "apple"
  ],
  "3": [
    "amazon",
    "microsoft",
    "netflix"
  ],
  "4": [
    "uber",
    "airbnb",
    "nvidia",
    "amd",
    "intel"
  ]
} as const;

export type RefreshBatchId = keyof typeof REFRESH_BATCHES;

export const REFRESH_BATCH_IDS = Object.keys(REFRESH_BATCHES) as RefreshBatchId[];

export function isRefreshBatchId(value: string | null | undefined): value is RefreshBatchId {
  if (!value) {
    return false;
  }

  return value in REFRESH_BATCHES;
}
