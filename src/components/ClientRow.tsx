import { Id } from "../../convex/_generated/dataModel";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClipboardList, RotateCcw } from "lucide-react";
import { getTimeBasedColor } from "@/lib/dateColors";
import {
  CONTACT_MAX_DAYS,
  FACE_TO_FACE_MAX_DAYS,
  formatShortDate,
  getUpcomingDates,
  UpcomingDatesInfo,
} from "@/lib/dateUtils";

export interface ClientData {
  _id: Id<"clients">;
  name: string;
  phoneNumber?: string;
  firstContactCompleted?: boolean;
  secondContactCompleted?: boolean;
  lastContactDate?: number;
  lastFaceToFaceDate?: number;
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

interface ClientRowProps {
  client: ClientData;
  onSelect: () => void;
  todoCount?: number;
  isCompact: boolean;
  variant: 'table' | 'card';
  /** When provided the row is archived: it is muted and offers an unarchive action. */
  onUnarchive?: () => void;
}

// Shared contact status indicators
function ContactIndicators({
  firstComplete,
  secondComplete,
  isCompact,
}: {
  firstComplete: boolean;
  secondComplete: boolean;
  isCompact: boolean;
}) {
  if (isCompact) {
    return (
      <div className="flex gap-0.5 shrink-0">
        <div
          className={`w-1.5 h-1.5 rounded-full ${firstComplete ? "bg-green-500" : "bg-red-500"}`}
          title={firstComplete ? "1st Contact Complete" : "1st Contact Incomplete"}
        />
        <div
          className={`w-1.5 h-1.5 rounded-full ${secondComplete ? "bg-green-500" : "bg-red-500"}`}
          title={secondComplete ? "2nd Contact Complete" : "2nd Contact Incomplete"}
        />
      </div>
    );
  }

  return (
    <div className="flex gap-1 mt-1 justify-center">
      <Badge
        variant={firstComplete ? "secondary" : "destructive"}
        className={`text-[10px] px-1.5 py-0.5 h-4 ${firstComplete ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}`}
      >
        {firstComplete ? "1st Contact ✓" : "1st Contact ✗"}
      </Badge>
      <Badge
        variant={secondComplete ? "secondary" : "destructive"}
        className={`text-[10px] px-1.5 py-0.5 h-4 ${secondComplete ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}`}
      >
        {secondComplete ? "2nd Contact ✓" : "2nd Contact ✗"}
      </Badge>
    </div>
  );
}

// Next QR display
function NextQRDisplay({ upcomingDates, isCompact }: { upcomingDates: UpcomingDatesInfo; isCompact: boolean }) {
  return (
    <div className="flex items-center justify-center gap-0.5">
      <span className={upcomingDates.isQRDue ? "text-red-600 font-bold" : "text-green-600 font-medium"}>
        {formatShortDate(upcomingDates.nextQRDate)}
      </span>
      <span className={`text-blue-500 ${isCompact ? "text-[10px]" : "text-xs"}`}>
        (Q{upcomingDates.nextQRIndex + 1})
      </span>
    </div>
  );
}

// Date display cell
function DateDisplay({ date, maxDays, emptyText, isCompact }: {
  date?: number;
  maxDays: number;
  emptyText: string;
  isCompact: boolean;
}) {
  if (!date) {
    return <span className={`text-gray-400 ${isCompact ? "text-[10px]" : ""}`}>{isCompact ? "-" : emptyText}</span>;
  }
  return (
    <span className={getTimeBasedColor(date, maxDays, "text-green-600")}>
      {formatShortDate(date)}
    </span>
  );
}

function UnarchiveButton({ onUnarchive }: { onUnarchive: () => void }) {
  return (
    <Button
      onClick={(e) => {
        e.stopPropagation();
        onUnarchive();
      }}
      variant="outline"
      size="sm"
      className="h-6 px-2 gap-1 text-xs"
      title="Restore this consumer to your caseload"
    >
      <RotateCcw className="h-3 w-3" />
      Unarchive
    </Button>
  );
}

function NameCell({ client, todoCount, isCompact }: {
  client: ClientData;
  todoCount?: number;
  isCompact: boolean;
}) {
  const hasTodos = todoCount !== undefined && todoCount > 0;
  const todoTitle = `${todoCount ?? 0} incomplete todo${todoCount === 1 ? '' : 's'}`;

  if (isCompact) {
    return (
      <div className="flex items-center justify-center gap-1">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-medium truncate">{client.name}</span>
          {client.phoneNumber && (
            <span className="text-[10px] text-muted-foreground whitespace-nowrap">{client.phoneNumber}</span>
          )}
        </div>
        {hasTodos && (
          <div title={todoTitle}>
            <ClipboardList className="w-2.5 h-2.5 text-blue-500 shrink-0" />
          </div>
        )}
        <div className="ml-1">
          <ContactIndicators
            firstComplete={client.firstContactCompleted ?? false}
            secondComplete={client.secondContactCompleted ?? false}
            isCompact
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-center gap-1">
        <h3 className="text-sm font-medium">{client.name}</h3>
        {hasTodos && (
          <div title={todoTitle}>
            <ClipboardList className="w-3 h-3 text-blue-500" />
          </div>
        )}
      </div>
      <p className="text-xs text-muted-foreground">{client.phoneNumber}</p>
      <ContactIndicators
        firstComplete={client.firstContactCompleted ?? false}
        secondComplete={client.secondContactCompleted ?? false}
        isCompact={false}
      />
    </div>
  );
}

export function ClientRow({ client, onSelect, todoCount, isCompact, variant, onUnarchive }: ClientRowProps) {
  const upcomingDates = getUpcomingDates(client);
  const isArchived = onUnarchive !== undefined;
  const handleSelect = isArchived ? undefined : onSelect;
  const interactive = isArchived ? "opacity-60" : "cursor-pointer";

  if (variant === 'table') {
    const cellPadding = isCompact ? "py-0.5 px-1" : "";
    const textSize = isCompact ? "text-xs" : "text-sm";

    return (
      <TableRow
        className={`transition-colors ${interactive} ${isCompact ? "h-6" : ""} ${isArchived ? "" : "hover:bg-muted/25"}`}
        onClick={handleSelect}
      >
        <TableCell className={`text-center ${cellPadding}`}>
          <div className="flex items-center justify-center gap-2">
            <NameCell client={client} todoCount={todoCount} isCompact={isCompact} />
            {onUnarchive && <UnarchiveButton onUnarchive={onUnarchive} />}
          </div>
        </TableCell>
        <TableCell className={`text-center ${textSize} ${cellPadding}`}>
          <NextQRDisplay upcomingDates={upcomingDates} isCompact={isCompact} />
        </TableCell>
        <TableCell className={`text-center ${textSize} ${cellPadding}`}>
          <DateDisplay
            date={client.lastContactDate}
            maxDays={CONTACT_MAX_DAYS}
            emptyText="No contact recorded"
            isCompact={isCompact}
          />
        </TableCell>
        <TableCell className={`text-center ${textSize} ${cellPadding}`}>
          <DateDisplay
            date={client.lastFaceToFaceDate}
            maxDays={FACE_TO_FACE_MAX_DAYS}
            emptyText="No face to face recorded"
            isCompact={isCompact}
          />
        </TableCell>
      </TableRow>
    );
  }

  return (
    <Card className={`transition-colors ${interactive}`} onClick={handleSelect}>
      <CardContent className={isCompact ? "p-2" : "p-4"}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className={`${isCompact ? "text-sm" : "text-base"} font-medium truncate`}>{client.name}</span>
            {client.phoneNumber && (
              <a
                href={`tel:${client.phoneNumber}`}
                onClick={(e) => e.stopPropagation()}
                className="text-xs text-primary hover:underline whitespace-nowrap"
              >
                {client.phoneNumber}
              </a>
            )}
            {todoCount !== undefined && todoCount > 0 && (
              <ClipboardList className="w-3 h-3 text-blue-500 shrink-0" />
            )}
            <ContactIndicators
              firstComplete={client.firstContactCompleted ?? false}
              secondComplete={client.secondContactCompleted ?? false}
              isCompact
            />
          </div>
          {onUnarchive ? (
            <UnarchiveButton onUnarchive={onUnarchive} />
          ) : (
            <div className="text-xs text-right shrink-0">
              {client.lastContactDate && (
                <div className={getTimeBasedColor(client.lastContactDate, CONTACT_MAX_DAYS, "text-green-600")}>
                  Contact: {formatShortDate(client.lastContactDate)}
                </div>
              )}
              {client.lastFaceToFaceDate && (
                <div className={getTimeBasedColor(client.lastFaceToFaceDate, FACE_TO_FACE_MAX_DAYS, "text-green-600")}>
                  F2F: {formatShortDate(client.lastFaceToFaceDate)}
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
