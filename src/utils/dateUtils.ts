export class DateUtil {
  /**
   * Calculates inclusive number of days between start and end dates.
   * Same start & end date returns 1 day.
   */
  public static calculateDays(startDate: string | Date, endDate: string | Date): number {
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Normalize to UTC date components to avoid timezone offsets
    const utcStart = Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate());
    const utcEnd = Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate());

    if (utcEnd < utcStart) {
      throw new Error('End date cannot be earlier than start date');
    }

    const msPerDay = 1000 * 60 * 60 * 24;
    return Math.floor((utcEnd - utcStart) / msPerDay) + 1;
  }

  /**
   * Formats YYYY-MM into start (YYYY-MM-01) and end date (last day of month).
   */
  public static getMonthBounds(monthStr: string): { startStr: string; endStr: string } {
    const match = monthStr.match(/^(\d{4})-(\d{2})$/);
    if (!match) {
      throw new Error('Invalid month format. Expected YYYY-MM');
    }

    const year = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);

    if (month < 1 || month > 12) {
      throw new Error('Invalid month value in date');
    }

    const startDate = new Date(Date.UTC(year, month - 1, 1));
    const endDate = new Date(Date.UTC(year, month, 0)); // last day of month

    const format = (d: Date) => d.toISOString().split('T')[0];

    return {
      startStr: format(startDate),
      endStr: format(endDate)
    };
  }
}
