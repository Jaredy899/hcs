import { Id } from "../../convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import { getTimeBasedColor, getUpcomingDateColor } from "@/lib/dateColors";
import {
  CONTACT_MAX_DAYS,
  FACE_TO_FACE_MAX_DAYS,
  formatShortDate,
  nextFaceToFaceDate,
} from "@/lib/dateUtils";
import { HotkeyHint } from "./HotkeyHint";
import { PendingChanges } from "../hooks/usePendingChanges";

type ContactDateField = "lastContactDate" | "lastFaceToFaceDate";

interface LastContactSectionProps {
  client: {
    _id: Id<"clients">;
    lastContactDate?: number;
    lastFaceToFaceDate?: number;
  };
  pendingChanges: PendingChanges;
  isEditing?: boolean;
  showHotkeyHints?: boolean;
}

export function LastContactSection({
  client,
  pendingChanges,
  isEditing = false,
  showHotkeyHints = false,
}: LastContactSectionProps) {
  const setDate = (field: ContactDateField, date: Date | undefined) => {
    if (!date) return;
    pendingChanges.addDateChange(client._id, field, date.getTime());
  };

  const lastContactValue = pendingChanges.getDateState(client._id, "lastContactDate", client.lastContactDate);
  const lastFaceToFaceValue = pendingChanges.getDateState(client._id, "lastFaceToFaceDate", client.lastFaceToFaceDate);

  const renderDateRow = (
    field: ContactDateField,
    label: string,
    hotkey: string,
    hotkeyTitle: string,
    value: number | undefined,
    maxDays: number,
    emptyText: string,
  ) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <Button
          onClick={() => setDate(field, new Date())}
          size="sm"
          className="h-6 px-2 gap-1 text-xs"
          title={hotkeyTitle}
        >
          <Calendar className="h-3 w-3" />
          Today
          <HotkeyHint hotkey={hotkey} show={!isEditing && showHotkeyHints} />
        </Button>
      </div>

      <DatePicker
        date={value ? new Date(value) : undefined}
        onDateChange={(date) => setDate(field, date)}
        placeholder="Select date"
        className="h-7 text-xs"
      />

      <p className="text-sm text-muted-foreground">
        {value ? (
          <span className={getTimeBasedColor(value, maxDays, "text-green-600")}>{formatShortDate(value)}</span>
        ) : (
          emptyText
        )}
      </p>
    </div>
  );

  return (
    <Card>
      <CardHeader className="px-4 pt-3 pb-2">
        <CardTitle className="text-sm font-semibold">Contact Dates</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 px-4 pb-3">
        {renderDateRow(
          "lastContactDate",
          "Last Contact",
          "Ctrl+T",
          "Set Last Contact to Today (Ctrl+T)",
          lastContactValue,
          CONTACT_MAX_DAYS,
          "No contact recorded",
        )}

        <div className="space-y-1">
          {renderDateRow(
            "lastFaceToFaceDate",
            "Last Face to Face",
            "Ctrl+F",
            "Set Last Face-to-Face to Today (Ctrl+F)",
            lastFaceToFaceValue,
            FACE_TO_FACE_MAX_DAYS,
            "No face to face recorded",
          )}

          {lastFaceToFaceValue && (
            <p className="text-sm font-medium">
              <span className="text-muted-foreground">Next due: </span>
              <span className={getUpcomingDateColor(nextFaceToFaceDate(lastFaceToFaceValue), 15, "text-indigo-600")}>
                {formatShortDate(nextFaceToFaceDate(lastFaceToFaceValue))}
              </span>
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
