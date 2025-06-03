import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { getQuarterlyReviewDates } from "./utils";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface QuarterlyReviewsSectionProps {
  client: {
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
  };
}

export function QuarterlyReviewsSection({ client }: QuarterlyReviewsSectionProps) {
  const updateContact = useMutation(api.clients.updateContact);

  // Add local state for quarterly review dates (month and day for each quarter)
  const [qrDates, setQrDates] = useState(() =>
    [0, 1, 2, 3].map((i) => {
      const qrField = `qr${i + 1}Date` as "qr1Date" | "qr2Date" | "qr3Date" | "qr4Date";
      const date = client?.[qrField] && client[qrField] !== null
        ? new Date(client[qrField]!)
        : getQuarterlyReviewDates(client?.nextAnnualAssessment || Date.now())[i].date;
      return { month: date.getMonth() + 1, day: date.getDate() };
    })
  );

  // Sync local state with client changes
  useEffect(() => {
    if (client) {
      setQrDates(
        [0, 1, 2, 3].map((i) => {
          const qrField = `qr${i + 1}Date` as "qr1Date" | "qr2Date" | "qr3Date" | "qr4Date";
          const date = client?.[qrField] && client[qrField] !== null
            ? new Date(client[qrField]!)
            : getQuarterlyReviewDates(client?.nextAnnualAssessment || Date.now())[i].date;
          return { month: date.getMonth() + 1, day: date.getDate() };
        })
      );
    }
  }, [client]);

  const handleQuarterlyReviewToggle = async (index: number, checked: boolean) => {
    const qrField = `qr${index + 1}Completed` as "qr1Completed" | "qr2Completed" | "qr3Completed" | "qr4Completed";
    
    // If this is Q4 being completed, reset all quarterly reviews
    if (index === 3 && checked) {
      await Promise.all([
        updateContact({ id: client._id, field: "qr1Completed", value: false }),
        updateContact({ id: client._id, field: "qr2Completed", value: false }),
        updateContact({ id: client._id, field: "qr3Completed", value: false }),
        updateContact({ id: client._id, field: "qr4Completed", value: false })
      ]);
    } else {
      await updateContact({
        id: client._id,
        field: qrField,
        value: checked,
      });
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <p className="text-sm font-medium">Quarterly Reviews</p>
        <Button
          onClick={() => {
            // First, get the current annual assessment date
            const annualDate = new Date(client.nextAnnualAssessment);
            // Recalculate all quarterly review dates
            const qrDates = getQuarterlyReviewDates(annualDate.getTime());
            
            // Update each quarter's date to match the calculated date
            updateContact({
              id: client._id,
              field: "qr1Date",
              value: qrDates[0].date.getTime(),
            });
            updateContact({
              id: client._id,
              field: "qr2Date",
              value: qrDates[1].date.getTime(),
            });
            updateContact({
              id: client._id,
              field: "qr3Date",
              value: qrDates[2].date.getTime(),
            });
            updateContact({
              id: client._id,
              field: "qr4Date",
              value: qrDates[3].date.getTime(),
            });
            
            // Update the next quarterly review date to the first quarter's date
            updateContact({
              id: client._id,
              field: "nextQuarterlyReview",
              value: qrDates[0].date.getTime(),
            });
          }}
          variant="ghost"
          size="sm"
          className="text-xs h-6 px-2"
        >
          Reset to Calculated Dates
        </Button>
      </div>
      <div className="space-y-2 bg-muted/50 rounded-md p-3">
        {getQuarterlyReviewDates(client.nextAnnualAssessment).map((qr, index) => {
          const qrField = `qr${index + 1}Completed` as "qr1Completed" | "qr2Completed" | "qr3Completed" | "qr4Completed";
          const qrDateField = `qr${index + 1}Date` as "qr1Date" | "qr2Date" | "qr3Date" | "qr4Date";
          const { month, day } = qrDates[index];
          const year = (client[qrDateField] && client[qrDateField] !== null
            ? new Date(client[qrDateField]!)
            : qr.date
          ).getFullYear();

          return (
            <div key={index} className="flex flex-col sm:flex-row sm:items-center gap-1">
              <span className="text-sm font-medium text-muted-foreground w-20">{qr.label}:</span>
              <div className="flex items-center gap-1 flex-1">
                <Select
                  value={month.toString()}
                  onValueChange={(value) => {
                    const newMonth = parseInt(value);
                    setQrDates((prev) =>
                      prev.map((d, i) => i === index ? { ...d, month: newMonth } : d)
                    );
                    // Use the current day from local state
                    const newDate = new Date(year, newMonth - 1, day);
                    updateContact({
                      id: client._id,
                      field: qrDateField,
                      value: newDate.getTime(),
                    });
                  }}
                >
                  <SelectTrigger className="h-7 text-xs flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Jan</SelectItem>
                    <SelectItem value="2">Feb</SelectItem>
                    <SelectItem value="3">Mar</SelectItem>
                    <SelectItem value="4">Apr</SelectItem>
                    <SelectItem value="5">May</SelectItem>
                    <SelectItem value="6">Jun</SelectItem>
                    <SelectItem value="7">Jul</SelectItem>
                    <SelectItem value="8">Aug</SelectItem>
                    <SelectItem value="9">Sep</SelectItem>
                    <SelectItem value="10">Oct</SelectItem>
                    <SelectItem value="11">Nov</SelectItem>
                    <SelectItem value="12">Dec</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={day.toString()}
                  onValueChange={(value) => {
                    const newDay = parseInt(value);
                    setQrDates((prev) =>
                      prev.map((d, i) => i === index ? { ...d, day: newDay } : d)
                    );
                    // Use the current month from local state
                    const newDate = new Date(year, month - 1, newDay);
                    updateContact({
                      id: client._id,
                      field: qrDateField,
                      value: newDate.getTime(),
                    });
                  }}
                >
                  <SelectTrigger className="h-7 text-xs w-16">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({length: 31}, (_, i) => i + 1).map(dayOption => (
                      <SelectItem key={dayOption} value={dayOption.toString()}>{dayOption}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex items-center space-x-1 ml-1">
                  <Checkbox
                    id={`qr-${index}`}
                    checked={client[qrField] || false}
                    onCheckedChange={(checked) => handleQuarterlyReviewToggle(index, checked as boolean)}
                  />
                  <Label htmlFor={`qr-${index}`} className="text-sm">Done</Label>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 