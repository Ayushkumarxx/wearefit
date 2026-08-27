import { DailyLog } from "@/types/health";
import { format, subDays, parseISO } from "date-fns";

/**
 * Calculates true continuous consecutive logged days up to the reference date.
 * If reference date (today) is not yet logged, checks streak leading up to yesterday.
 */
export function calculateConsecutiveStreak(
  dailyLogs: Record<string, DailyLog>,
  referenceDateStr?: string
): number {
  const refDate = referenceDateStr ? parseISO(referenceDateStr) : new Date();
  const refDateFormatted = format(refDate, "yyyy-MM-dd");

  let streak = 0;
  let checkDate = refDate;

  // If today is logged, start counting from today
  if (dailyLogs[refDateFormatted]) {
    streak = 1;
    checkDate = subDays(refDate, 1);
  } else {
    // If today is not yet logged, check if yesterday was logged to preserve active streak
    const yesterday = subDays(refDate, 1);
    const yesterdayFormatted = format(yesterday, "yyyy-MM-dd");
    if (dailyLogs[yesterdayFormatted]) {
      streak = 1;
      checkDate = subDays(yesterday, 1);
    } else {
      return 1; // Baseline active day
    }
  }

  // Count backwards consecutively
  while (true) {
    const dStr = format(checkDate, "yyyy-MM-dd");
    if (dailyLogs[dStr]) {
      streak += 1;
      checkDate = subDays(checkDate, 1);
    } else {
      break;
    }
  }

  return Math.max(1, streak);
}
