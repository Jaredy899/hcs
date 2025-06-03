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
}

export function ImportantDatesSection({ client }: ImportantDatesSectionProps) {
  const updateContact = useMutation(api.clients.updateContact);

  const [annualMonth, setAnnualMonth] = useState(() => {
    if (client?.nextAnnualAssessment) {
      return new Date(client.nextAnnualAssessment).getMonth() + 1;
    }
    return new Date().getMonth() + 1;
  });
  const [annualDay, setAnnualDay] = useState(() => {
    if (client?.nextAnnualAssessment) {
      return new Date(client.nextAnnualAssessment).getDate();
    }
    return 1;
  });

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
                setAnnualMonth(newMonth);
                const annualDate = new Date(new Date().getFullYear(), newMonth - 1, annualDay);
                updateContact({
                  id: client._id,
                  field: "nextAnnualAssessment",
                  value: annualDate.getTime(),
                });
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
                setAnnualDay(newDay);
                const annualDate = new Date(new Date().getFullYear(), annualMonth - 1, newDay);
                updateContact({
                  id: client._id,
                  field: "nextAnnualAssessment",
                  value: annualDate.getTime(),
                });
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

        <QuarterlyReviewsSection client={client} />
      </CardContent>
    </Card>
  );
} 