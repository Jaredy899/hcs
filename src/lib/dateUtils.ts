// Shared date formatting utilities

/**
 * Format a date as "MMM D" (e.g., "Jan 15")
 */
export function formatShortDate(date: Date | number): string {
  return new Date(date).toLocaleDateString(undefined, { 
    month: 'short', 
    day: 'numeric' 
  });
}

/**
 * Format a date with time as "MMM D, HH:MM" (e.g., "Jan 15, 2:30 PM")
 */
export function formatShortDateTime(date: Date | number): string {
  return new Date(date).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Calculate quarterly review dates based on annual assessment date
 */
export function getQuarterlyReviewDates(annualAssessmentDate: number): Date[] {
  const date = new Date(annualAssessmentDate);
  const year = date.getFullYear();
  const month = date.getMonth();
  
  // Calculate the dates for each quarter (3 months after annual assessment)
  const q1 = new Date(year, (month + 3) % 12, date.getDate());
  const q2 = new Date(year, (month + 6) % 12, date.getDate());
  const q3 = new Date(year, (month + 9) % 12, date.getDate());
  
  // For Q4, we need to handle the end of the month before the annual assessment
  const q4Month = month === 0 ? 11 : month - 1;
  const q4Year = month === 0 ? year - 1 : year;
  const lastDay = new Date(q4Year, q4Month + 1, 0).getDate();
  const q4 = new Date(q4Year, q4Month, lastDay);

  // Adjust years for quarters that cross into next year
  if (month + 3 >= 12) q1.setFullYear(year + 1);
  if (month + 6 >= 12) q2.setFullYear(year + 1);
  if (month + 9 >= 12) q3.setFullYear(year + 1);

  return [q1, q2, q3, q4];
}

interface ClientWithQRData {
  nextAnnualAssessment: number;
  qr1Completed?: boolean;
  qr2Completed?: boolean;
  qr3Completed?: boolean;
  qr4Completed?: boolean;
  qr1Date?: number | null;
  qr2Date?: number | null;
  qr3Date?: number | null;
  qr4Date?: number | null;
}

export interface UpcomingDatesInfo {
  isAnnualDue: boolean;
  isAnnualDueNextMonth: boolean;
  isQRDue: boolean;
  isQ4: boolean;
  annualDate: Date;
  qrDates: Date[];
  nextQRDate: Date | null;
  nextQRIndex: number;
}

/**
 * Calculate upcoming dates for a client (annual assessment, quarterly reviews)
 */
export function getUpcomingDates(client: ClientWithQRData): UpcomingDatesInfo {
  const today = new Date();
  const currentMonth = today.getMonth() + 1; // 1-12
  
  // Check if annual assessment is due this month
  const annualDate = new Date(client.nextAnnualAssessment);
  const annualMonth = annualDate.getMonth() + 1; // 1-12
  const isAnnualDue = annualMonth === currentMonth;
  
  // Simple logic: show red if annual assessment is next month
  const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
  const isAnnualDueNextMonth = annualMonth === nextMonth;

  // Get quarterly review dates
  const qrDates = getQuarterlyReviewDates(client.nextAnnualAssessment);
  
  // Find the next QR date based on completed QRs
  let nextQRIndex = 0;
  if (client.qr1Completed) nextQRIndex = 1;
  if (client.qr2Completed) nextQRIndex = 2;
  if (client.qr3Completed) nextQRIndex = 3;
  if (client.qr4Completed) nextQRIndex = 0; // Reset to Q1 if all are completed
  
  // Use custom date if it exists, otherwise use calculated date
  let nextQRDate: Date | null = null;
  const customDateKey = `qr${nextQRIndex + 1}Date` as keyof ClientWithQRData;
  const customDate = client[customDateKey];
  if (customDate && customDate !== null) {
    nextQRDate = new Date(customDate as number);
  } else {
    nextQRDate = qrDates[nextQRIndex];
  }

  // Only show red if the QR is due in the current month
  const isQRDue = nextQRDate !== null && nextQRDate.getMonth() + 1 === currentMonth;

  // If it's Q4, we need to show both QR and Annual Assessment
  const isQ4 = qrDates.some(qr => {
    const qrMonth = qr.getMonth() + 1;
    return qrMonth === currentMonth && annualMonth === currentMonth + 1;
  });

  return {
    isAnnualDue,
    isAnnualDueNextMonth,
    isQRDue,
    isQ4,
    annualDate,
    qrDates,
    nextQRDate,
    nextQRIndex,
  };
}

/**
 * Calculate days since a given date
 */
export function daysSince(date: number | Date): number {
  const today = new Date();
  const targetDate = new Date(date);
  return Math.floor((today.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Calculate days until a given date
 */
export function daysUntil(date: number | Date): number {
  const today = new Date();
  const targetDate = new Date(date);
  return Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}
