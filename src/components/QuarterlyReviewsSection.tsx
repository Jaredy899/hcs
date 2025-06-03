import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { getQuarterlyReviewDates } from "./utils";

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
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Quarterly Reviews</p>
        <button
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
          className="text-xs text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          Reset to Calculated Dates
        </button>
      </div>
      <div className="space-y-2 bg-white dark:bg-gray-800 rounded-md p-3">
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
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-20">{qr.label}:</span>
              <div className="flex items-center gap-1 flex-1">
                <select
                  value={month}
                  onChange={(e) => {
                    const newMonth = parseInt(e.target.value);
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
                  className="text-sm rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 flex-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="1">Jan</option>
                  <option value="2">Feb</option>
                  <option value="3">Mar</option>
                  <option value="4">Apr</option>
                  <option value="5">May</option>
                  <option value="6">Jun</option>
                  <option value="7">Jul</option>
                  <option value="8">Aug</option>
                  <option value="9">Sep</option>
                  <option value="10">Oct</option>
                  <option value="11">Nov</option>
                  <option value="12">Dec</option>
                </select>
                <select
                  value={day}
                  onChange={(e) => {
                    const newDay = parseInt(e.target.value);
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
                  className="text-sm rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 w-16 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  {Array.from({length: 31}, (_, i) => i + 1).map(dayOption => (
                    <option key={dayOption} value={dayOption}>{dayOption}</option>
                  ))}
                </select>
                <label className="flex items-center gap-1 ml-1">
                  <input
                    type="checkbox"
                    checked={client[qrField] || false}
                    onChange={(e) => handleQuarterlyReviewToggle(index, e.target.checked)}
                    className="rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500 dark:bg-gray-700"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Done</span>
                </label>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 