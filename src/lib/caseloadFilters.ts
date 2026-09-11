import { CaseloadFlags, CONTACT_MAX_DAYS, FACE_TO_FACE_MAX_DAYS } from "@/lib/dateUtils";

export type CaseloadFilter = keyof CaseloadFlags;

export const CASELOAD_FILTERS: { key: CaseloadFilter; label: string; title: string }[] = [
  {
    key: "contactOverdue",
    label: "Contact overdue",
    title: `No contact in ${CONTACT_MAX_DAYS}+ days`,
  },
  {
    key: "faceToFaceDue",
    label: "Face to face due",
    title: `No face-to-face visit in ${FACE_TO_FACE_MAX_DAYS}+ days`,
  },
  {
    key: "qrDueThisMonth",
    label: "QR due this month",
    title: "Next quarterly review falls in the current month",
  },
  {
    key: "annualDueThisMonth",
    label: "Annual due this month",
    title: "Annual assessment falls in the current month",
  },
];
