// Shared date formatting and case-load date math

/** Contact is considered overdue after this many days. */
export const CONTACT_MAX_DAYS = 30;
/** Face-to-face visits are due every this many days. */
export const FACE_TO_FACE_MAX_DAYS = 90;

const DAY_MS = 1000 * 60 * 60 * 24;

/**
 * Format a date as "MMM D" (e.g., "Jan 15")
 */
export function formatShortDate(date: Date | number): string {
  return new Date(date).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
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

/** Date the next face-to-face visit is due, based on the last one. */
export function nextFaceToFaceDate(lastFaceToFaceDate: number): Date {
  return new Date(lastFaceToFaceDate + FACE_TO_FACE_MAX_DAYS * DAY_MS);
}

export interface QuarterlyReviewDate {
  label: string;
  date: Date;
}

const QUARTER_LABELS = ['1st Quarter', '2nd Quarter', '3rd Quarter', '4th Quarter'];

/**
 * Quarterly review dates derived from the annual assessment date.
 * Q1-Q3 fall on the 1st of the month 3, 6 and 9 months out; Q4 is the last day
 * of the month before the annual assessment.
 */
export function getQuarterlyReviewDates(annualAssessmentDate: number): QuarterlyReviewDate[] {
  const annual = new Date(annualAssessmentDate);
  const year = annual.getFullYear();
  const month = annual.getMonth();

  // Out-of-range months roll into the neighbouring year automatically, and day 0
  // resolves to the last day of the previous month.
  return [
    new Date(year, month + 3, 1),
    new Date(year, month + 6, 1),
    new Date(year, month + 9, 1),
    new Date(year, month, 0),
  ].map((date, index) => ({ label: QUARTER_LABELS[index], date }));
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
  nextQRDate: Date;
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
  const qrDates = getQuarterlyReviewDates(client.nextAnnualAssessment).map((qr) => qr.date);

  // Find the next QR date based on completed QRs
  let nextQRIndex = 0;
  if (client.qr1Completed) nextQRIndex = 1;
  if (client.qr2Completed) nextQRIndex = 2;
  if (client.qr3Completed) nextQRIndex = 3;
  if (client.qr4Completed) nextQRIndex = 0; // Reset to Q1 if all are completed

  // Use custom date if it exists, otherwise use calculated date
  const customDates = [client.qr1Date, client.qr2Date, client.qr3Date, client.qr4Date];
  const customDate = customDates[nextQRIndex];
  const nextQRDate = customDate ? new Date(customDate) : qrDates[nextQRIndex];

  // Only show red if the QR is due in the current month
  const isQRDue = nextQRDate.getMonth() + 1 === currentMonth;

  // If it's Q4, we need to show both QR and Annual Assessment
  const isQ4 = qrDates.some((qr) => qr.getMonth() + 1 === currentMonth && annualMonth === currentMonth + 1);

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
  return Math.floor((Date.now() - new Date(date).getTime()) / DAY_MS);
}

/**
 * Calculate days until a given date
 */
export function daysUntil(date: number | Date): number {
  return Math.ceil((new Date(date).getTime() - Date.now()) / DAY_MS);
}

interface ClientWithDates extends ClientWithQRData {
  lastContactDate?: number;
  lastFaceToFaceDate?: number;
}

export interface CaseloadFlags {
  contactOverdue: boolean;
  faceToFaceDue: boolean;
  qrDueThisMonth: boolean;
  annualDueThisMonth: boolean;
}

/**
 * Attention flags used by the caseload filters. Kept here so the filters and the
 * list's date colours stay in agreement.
 */
export function getCaseloadFlags(client: ClientWithDates): CaseloadFlags {
  const { isAnnualDue, isQRDue } = getUpcomingDates(client);

  return {
    contactOverdue:
      client.lastContactDate === undefined || daysSince(client.lastContactDate) >= CONTACT_MAX_DAYS,
    faceToFaceDue:
      client.lastFaceToFaceDate === undefined ||
      daysSince(client.lastFaceToFaceDate) >= FACE_TO_FACE_MAX_DAYS,
    qrDueThisMonth: isQRDue,
    annualDueThisMonth: isAnnualDue,
  };
}
