const PACIFIC_TZ = "America/Los_Angeles";

export function getPacificTimeParts(date = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: PACIFIC_TZ,
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });

  const parts = formatter.formatToParts(date);
  const lookup = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return {
    year: Number(lookup.year),
    month: Number(lookup.month),
    day: Number(lookup.day),
    hour: Number(lookup.hour),
    minute: Number(lookup.minute)
  };
}

export function isWithinRefreshWindow(date = new Date()) {
  const { hour, minute } = getPacificTimeParts(date);
  const minutesSinceMidnight = hour * 60 + minute;

  return minutesSinceMidnight >= 5 * 60 && minutesSinceMidnight <= 22 * 60;
}
