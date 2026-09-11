import { Id } from "../../convex/_generated/dataModel";
import { QuarterlyReviewsSection } from "./QuarterlyReviewsSection";
import { MonthSelect } from "./MonthSelect";
import { getQuarterlyReviewDates } from "@/lib/dateUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { PendingChanges } from "../hooks/usePendingChanges";

export interface ClientDatesData {
  _id: Id<"clients">;
  nextAnnualAssessment: number;
  qr1Date?: number | null;
  qr2Date?: number | null;
  qr3Date?: number | null;
  qr4Date?: number | null;
  qr1Completed?: boolean;
  qr2Completed?: boolean;
  qr3Completed?: boolean;
  qr4Completed?: boolean;
}

interface ImportantDatesSectionProps {
  client: ClientDatesData;
  pendingChanges: PendingChanges;
}

export function ImportantDatesSection({ client, pendingChanges }: ImportantDatesSectionProps) {
  const annualAssessmentValue =
    pendingChanges.getDateState(client._id, "nextAnnualAssessment", client.nextAnnualAssessment) ??
    client.nextAnnualAssessment;
  const annualMonth = new Date(annualAssessmentValue).getMonth() + 1;

  const handleAnnualDateChange = (month: number) => {
    // Always set to the 1st of the month
    const annualDate = new Date(new Date().getFullYear(), month - 1, 1);
    pendingChanges.addDateChange(client._id, "nextAnnualAssessment", annualDate.getTime());

    // Automatically recalculate and update quarterly review dates
    getQuarterlyReviewDates(annualDate.getTime()).forEach((qr, index) => {
      const field = `qr${index + 1}Date` as "qr1Date" | "qr2Date" | "qr3Date" | "qr4Date";
      pendingChanges.addDateChange(client._id, field, qr.date.getTime());
    });
  };

  return (
    <Card>
      <CardHeader className="px-4 pt-3 pb-2">
        <CardTitle className="text-sm font-semibold">Important Dates</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 px-4 pb-3">
        <div className="space-y-2">
          <Label className="text-sm">Annual Assessment Date</Label>
          <MonthSelect
            value={annualMonth}
            onChange={handleAnnualDateChange}
            className="h-8 text-xs"
            placeholder="Month"
          />
        </div>

        <QuarterlyReviewsSection client={client} pendingChanges={pendingChanges} />
      </CardContent>
    </Card>
  );
}
