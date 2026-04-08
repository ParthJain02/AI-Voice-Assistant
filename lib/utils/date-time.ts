import { fromZonedTime } from "date-fns-tz";

export function toUtcDate(dateTimeIso: string, timezone: string) {
  return fromZonedTime(dateTimeIso, timezone);
}
