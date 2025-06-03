import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { QuarterlyReviewsSection } from "./QuarterlyReviewsSection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface ImportantDatesSectionProps {
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
  pendingChanges: {
    addContactChange: (clientId: Id<"clients">, field: "qr1Completed" | "qr2Completed" | "qr3Completed" | "qr4Completed", value: boolean) => void;
    getContactState: (clientId: Id<"clients">, field: "qr1Completed" | "qr2Completed" | "qr3Completed" | "qr4Completed", originalValue: boolean) => boolean;
    addDateChange: (clientId: Id<"clients">, field: "nextAnnualAssessment" | "qr1Date" | "qr2Date" | "qr3Date" | "qr4Date", value: number) => void;
    getDateState: (clientId: Id<"clients">, field: "nextAnnualAssessment" | "qr1Date" | "qr2Date" | "qr3Date" | "qr4Date", originalValue: number | undefined) => number | undefined;
  };
}

export function ImportantDatesSection({ client, pendingChanges }: ImportantDatesSectionProps) {
  const updateContact = useMutation(api.clients.updateContact);

  const annualAssessmentValue = pendingChanges.getDateState(client._id, "nextAnnualAssessment", client.nextAnnualAssessment) || client.nextAnnualAssessment;

  const [annualMonth, setAnnualMonth] = useState(() => {
    return new Date(annualAssessmentValue).getMonth() + 1;
  });
  const [annualDay, setAnnualDay] = useState(() => {
    return new Date(annualAssessmentValue).getDate();
  });

  // Update local state when the pending value changes
  useEffect(() => {
    const currentValue = annualAssessmentValue;
    if (currentValue) {
      const date = new Date(currentValue);
      setAnnualMonth(date.getMonth() + 1);
      setAnnualDay(date.getDate());
    }
  }, [annualAssessmentValue]);

  const handleAnnualDateChange = (month?: number, day?: number) => {
    const newMonth = month !== undefined ? month : annualMonth;
    const newDay = day !== undefined ? day : annualDay;
    
    const annualDate = new Date(new Date().getFullYear(), newMonth - 1, newDay);
    pendingChanges.addDateChange(client._id, "nextAnnualAssessment", annualDate.getTime());
    
    if (month !== undefined) setAnnualMonth(month);
    if (day !== undefined) setAnnualDay(day);
  };

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  return (
    <Card>
      <CardHeader className="px-4 pt-3 pb-2">
        <CardTitle className="text-sm font-semibold">Important Dates</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 px-4 pb-3">
        <div className="space-y-2">
          <Label className="text-sm">Annual Assessment Date</Label>
          <div className="flex gap-2">
            <Select
              value={annualMonth.toString()}
              onValueChange={(value) => {
                const newMonth = parseInt(value);
                handleAnnualDateChange(newMonth, undefined);
              }}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                {months.map((month, index) => (
                  <SelectItem key={month} value={(index + 1).toString()}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={annualDay.toString()}
              onValueChange={(value) => {
                const newDay = parseInt(value);
                handleAnnualDateChange(undefined, newDay);
              }}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Day" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                  <SelectItem key={day} value={day.toString()}>
                    {day}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <QuarterlyReviewsSection client={client} pendingChanges={pendingChanges} />
      </CardContent>
    </Card>
  );
} 