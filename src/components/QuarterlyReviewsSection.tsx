import { getQuarterlyReviewDates } from "@/lib/dateUtils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { MonthSelect } from "./MonthSelect";
import { ClientDatesData } from "./ImportantDatesSection";
import { PendingChanges } from "../hooks/usePendingChanges";

interface QuarterlyReviewsSectionProps {
  client: ClientDatesData;
  pendingChanges: PendingChanges;
}

type QRDateField = "qr1Date" | "qr2Date" | "qr3Date" | "qr4Date";
type QRCompletedField = "qr1Completed" | "qr2Completed" | "qr3Completed" | "qr4Completed";

const QR_DATE_FIELDS: QRDateField[] = ["qr1Date", "qr2Date", "qr3Date", "qr4Date"];
const QR_COMPLETED_FIELDS: QRCompletedField[] = ["qr1Completed", "qr2Completed", "qr3Completed", "qr4Completed"];

export function QuarterlyReviewsSection({ client, pendingChanges }: QuarterlyReviewsSectionProps) {
  // Use the pending annual assessment date so the calculated fallbacks follow edits.
  const annualAssessment =
    pendingChanges.getDateState(client._id, "nextAnnualAssessment", client.nextAnnualAssessment) ??
    client.nextAnnualAssessment;

  const quarters = getQuarterlyReviewDates(annualAssessment).map((qr, index) => {
    const dateField = QR_DATE_FIELDS[index];
    const storedDate = pendingChanges.getDateState(client._id, dateField, client[dateField] ?? undefined);
    const completedField = QR_COMPLETED_FIELDS[index];

    return {
      label: qr.label,
      month: new Date(storedDate ?? qr.date).getMonth() + 1,
      completed: pendingChanges.getContactState(client._id, completedField, client[completedField] ?? false),
    };
  });

  const handleToggle = (index: number, checked: boolean) => {
    // Completing Q4 closes out the year, so the cycle starts over at Q1.
    if (index === 3 && checked) {
      QR_COMPLETED_FIELDS.forEach((field) => pendingChanges.addContactChange(client._id, field, false));
      return;
    }
    pendingChanges.addContactChange(client._id, QR_COMPLETED_FIELDS[index], checked);
  };

  const handleMonthChange = (index: number, month: number) => {
    const year = new Date().getFullYear();
    // Q1-Q3 land on the 1st of the month, Q4 on the last day.
    const date = index === 3 ? new Date(year, month, 0) : new Date(year, month - 1, 1);
    pendingChanges.addDateChange(client._id, QR_DATE_FIELDS[index], date.getTime());
  };

  const handleResetToCalculatedDates = () => {
    getQuarterlyReviewDates(annualAssessment).forEach((qr, index) => {
      pendingChanges.addDateChange(client._id, QR_DATE_FIELDS[index], qr.date.getTime());
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <p className="text-sm font-medium">Quarterly Reviews</p>
        <Button
          onClick={handleResetToCalculatedDates}
          variant="ghost"
          size="sm"
          className="text-xs h-6 px-2"
        >
          Reset to Calculated Dates
        </Button>
      </div>
      <div className="space-y-2 bg-muted/50 rounded-md p-3">
        {quarters.map((quarter, index) => (
          <div key={quarter.label} className="flex flex-col sm:flex-row sm:items-center gap-1">
            <span className="text-sm font-medium text-muted-foreground w-20">{quarter.label}:</span>
            <div className="flex items-center gap-1 flex-1">
              <MonthSelect
                value={quarter.month}
                onChange={(month) => handleMonthChange(index, month)}
                className="h-7 text-xs flex-1"
              />
              <span className="text-xs text-muted-foreground w-12 text-center">
                {index === 3 ? "Last" : "1st"}
              </span>
              <div className="flex items-center space-x-1 ml-1">
                <Checkbox
                  id={`qr-${index}`}
                  checked={quarter.completed}
                  onCheckedChange={(checked) => handleToggle(index, checked === true)}
                />
                <Label htmlFor={`qr-${index}`} className="text-sm">Done</Label>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
