import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { QuarterlyReviewsSection } from "./QuarterlyReviewsSection";

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
    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 lg:p-6">
      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Important Dates</h3>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Annual Assessment Date</label>
          <div className="mt-1 flex gap-2">
            <select
              value={annualMonth}
              onChange={(e) => {
                const newMonth = parseInt(e.target.value);
                setAnnualMonth(newMonth);
                const annualDate = new Date(new Date().getFullYear(), newMonth - 1, annualDay);
                updateContact({
                  id: client._id,
                  field: "nextAnnualAssessment",
                  value: annualDate.getTime(),
                });
              }}
              className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="">Select Month</option>
              {months.map((month, index) => (
                <option key={month} value={index + 1}>
                  {month}
                </option>
              ))}
            </select>
            <select
              value={annualDay}
              onChange={(e) => {
                const newDay = parseInt(e.target.value);
                setAnnualDay(newDay);
                const annualDate = new Date(new Date().getFullYear(), annualMonth - 1, newDay);
                updateContact({
                  id: client._id,
                  field: "nextAnnualAssessment",
                  value: annualDate.getTime(),
                });
              }}
              className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="">Select Day</option>
              {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
          </div>
        </div>

        <QuarterlyReviewsSection client={client} />
      </div>
    </div>
  );
} 