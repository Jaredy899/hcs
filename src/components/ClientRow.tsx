import { Id } from "../../convex/_generated/dataModel";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ClipboardList } from "lucide-react";
import { getTimeBasedColor } from "@/lib/dateColors";
import { formatShortDate, getUpcomingDates, UpcomingDatesInfo } from "@/lib/dateUtils";

interface ClientData {
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
  isSelected: boolean;
  onSelect: () => void;
  todoCount?: number;
  isCompact: boolean;
  variant: 'table' | 'card';
}

// Shared contact status indicators
function ContactIndicators({ 
  firstComplete, 
  secondComplete, 
  isCompact 
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
  if (!upcomingDates.nextQRDate) {
    return <span className={`text-gray-400 ${isCompact ? "text-[10px]" : ""}`}>{isCompact ? "-" : "Not set"}</span>;
  }

  return (
    <div className="flex items-center justify-center gap-0.5">
      <span className={`${upcomingDates.isQRDue ? "text-red-600 font-bold" : "text-green-600 font-medium"}`}>
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

// Table row component (desktop)
function ClientTableRow({ 
  client, 
  isSelected, 
  onSelect, 
  todoCount, 
  isCompact,
  upcomingDates,
}: Omit<ClientRowProps, 'variant'> & { upcomingDates: UpcomingDatesInfo }) {
  const rowClass = isCompact ? "h-6" : "";
  const cellPadding = isCompact ? "py-0.5 px-1" : "";
  const textSize = isCompact ? "text-xs" : "text-sm";

  return (
    <TableRow
      className={`cursor-pointer transition-colors ${rowClass} ${
        isSelected ? "bg-muted/50" : "hover:bg-muted/25"
      }`}
      onClick={onSelect}
    >
      <TableCell className={`text-center ${cellPadding}`}>
        {isCompact ? (
          <div className="flex items-center justify-center gap-1">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs font-medium truncate">{client.name}</span>
              {client.phoneNumber && (
                <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                  {client.phoneNumber}
                </span>
              )}
            </div>
            {todoCount !== undefined && todoCount > 0 && (
              <ClipboardList className="w-2.5 h-2.5 text-blue-500 shrink-0" />
            )}
            <div className="ml-1">
              <ContactIndicators 
                firstComplete={client.firstContactCompleted || false}
                secondComplete={client.secondContactCompleted || false}
                isCompact={true}
              />
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-center gap-1">
              <h3 className={`${textSize} font-medium`}>{client.name}</h3>
              {todoCount !== undefined && todoCount > 0 && (
                <div title={`${todoCount} incomplete todo${todoCount !== 1 ? 's' : ''}`}>
                  <ClipboardList className="w-3 h-3 text-blue-500" />
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{client.phoneNumber}</p>
            <ContactIndicators 
              firstComplete={client.firstContactCompleted || false}
              secondComplete={client.secondContactCompleted || false}
              isCompact={false}
            />
          </div>
        )}
      </TableCell>
      <TableCell className={`text-center ${textSize} ${cellPadding}`}>
        <NextQRDisplay upcomingDates={upcomingDates} isCompact={isCompact} />
      </TableCell>
      <TableCell className={`text-center ${textSize} ${cellPadding}`}>
        <DateDisplay 
          date={client.lastContactDate} 
          maxDays={30} 
          emptyText="No contact recorded" 
          isCompact={isCompact}
        />
      </TableCell>
      <TableCell className={`text-center ${textSize} ${cellPadding}`}>
        <DateDisplay 
          date={client.lastFaceToFaceDate} 
          maxDays={90} 
          emptyText="No face to face recorded" 
          isCompact={isCompact}
        />
      </TableCell>
    </TableRow>
  );
}

// Card component (mobile)
function ClientCardRow({ 
  client, 
  isSelected, 
  onSelect, 
  todoCount, 
  isCompact,
}: Omit<ClientRowProps, 'variant' | 'upcomingDates'>) {
  if (isCompact) {
    return (
      <Card
        className={`cursor-pointer transition-colors ${isSelected ? "ring-2 ring-primary" : ""}`}
        onClick={onSelect}
      >
        <CardContent className="p-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="text-sm font-medium truncate">{client.name}</span>
              {client.phoneNumber && (
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {client.phoneNumber}
                </span>
              )}
              {todoCount !== undefined && todoCount > 0 && (
                <ClipboardList className="w-3 h-3 text-blue-500 shrink-0" />
              )}
              <div className="flex gap-1 shrink-0">
                <div className={`w-2 h-2 rounded-full ${client.firstContactCompleted ? "bg-green-500" : "bg-red-500"}`} />
                <div className={`w-2 h-2 rounded-full ${client.secondContactCompleted ? "bg-green-500" : "bg-red-500"}`} />
              </div>
            </div>
            <div className="text-xs text-right">
              {client.lastContactDate && (
                <div className={getTimeBasedColor(client.lastContactDate, 30, "text-green-600")}>
                  Contact: {formatShortDate(client.lastContactDate)}
                </div>
              )}
              {client.lastFaceToFaceDate && (
                <div className={getTimeBasedColor(client.lastFaceToFaceDate, 90, "text-green-600")}>
                  F2F: {formatShortDate(client.lastFaceToFaceDate)}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={`cursor-pointer transition-colors ${isSelected ? "ring-2 ring-primary" : ""}`}
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base font-medium">{client.name}</h3>
            {client.phoneNumber && (
              <a 
                href={`tel:${client.phoneNumber}`}
                onClick={(e) => e.stopPropagation()}
                className="text-sm text-primary hover:underline"
              >
                {client.phoneNumber}
              </a>
            )}
            {todoCount !== undefined && todoCount > 0 && (
              <div title={`${todoCount} incomplete todo${todoCount !== 1 ? 's' : ''}`}>
                <ClipboardList className="w-3 h-3 text-blue-500" />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Main exported component
export function ClientRow(props: ClientRowProps) {
  const upcomingDates = getUpcomingDates(props.client);

  if (props.variant === 'table') {
    return <ClientTableRow {...props} upcomingDates={upcomingDates} />;
  }
  
  return <ClientCardRow {...props} />;
}
