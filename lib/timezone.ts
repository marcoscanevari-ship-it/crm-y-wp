import { toZonedTime } from "date-fns-tz";

const ARGENTINA_TZ = "America/Argentina/Buenos_Aires";

/**
 * true si la hora actual en Argentina está entre 10:00 y 20:00 (inclusive el inicio, exclusive el fin).
 */
export function isWithinFollowupWindowArgentina(date: Date = new Date()): boolean {
  const zoned = toZonedTime(date, ARGENTINA_TZ);
  const hour = zoned.getHours();
  return hour >= 10 && hour < 20;
}

export function hoursSince(date: Date, now: Date = new Date()): number {
  return (now.getTime() - date.getTime()) / (1000 * 60 * 60);
}
