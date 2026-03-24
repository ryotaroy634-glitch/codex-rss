export function normalizeUrl(url: string, baseUrl?: string) {
  try {
    const normalizedInput = url.startsWith("feed://")
      ? `https://${url.slice("feed://".length)}`
      : url;

    return new URL(normalizedInput, baseUrl).toString();
  } catch {
    return url;
  }
}

export function stripHtml(value?: string | null) {
  if (!value) {
    return null;
  }

  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() || null;
}

export function truncate(value?: string | null, length = 240) {
  if (!value) {
    return null;
  }

  if (value.length <= length) {
    return value;
  }

  return `${value.slice(0, length - 1).trimEnd()}…`;
}

export function formatPacificDate(value: string | null) {
  if (!value) {
    return "Date unknown";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Los_Angeles"
  }).format(new Date(value));
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
