import { Id } from "../../convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "lucide-react";

interface LastContactSectionProps {
  client: {
    _id: Id<"clients">;
    lastContactDate?: number;
    lastFaceToFaceDate?: number;
  };
  pendingChanges: {
    addDateChange: (clientId: Id<"clients">, field: "lastContactDate" | "lastFaceToFaceDate", value: number) => void;
    getDateState: (clientId: Id<"clients">, field: "lastContactDate" | "lastFaceToFaceDate", originalValue: number | undefined) => number | undefined;
  };
}

export function LastContactSection({ client, pendingChanges }: LastContactSectionProps) {
  const handleSetToday = (field: "lastContactDate" | "lastFaceToFaceDate") => {
    const today = new Date();
    pendingChanges.addDateChange(client._id, field, today.getTime());
  };

  const handleDateChange = (field: "lastContactDate" | "lastFaceToFaceDate", month?: number, day?: number) => {
    const currentValue = pendingChanges.getDateState(client._id, field, client[field]);
    const currentDate = currentValue ? new Date(currentValue) : new Date();
    
    const newMonth = month !== undefined ? month : currentDate.getMonth() + 1;
    const newDay = day !== undefined ? day : currentDate.getDate();
    
    const date = new Date(new Date().getFullYear(), newMonth - 1, newDay);
    pendingChanges.addDateChange(client._id, field, date.getTime());
  };

  const lastContactValue = pendingChanges.getDateState(client._id, "lastContactDate", client.lastContactDate);
  const lastFaceToFaceValue = pendingChanges.getDateState(client._id, "lastFaceToFaceDate", client.lastFaceToFaceDate);

  return (
    <Card>
      <CardHeader className="px-4 pt-3 pb-2">
        <CardTitle className="text-sm font-semibold">Contact Dates</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 px-4 pb-3">
        {/* Last Contact Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Last Contact</span>
            <Button
              onClick={() => handleSetToday("lastContactDate")}
              size="sm"
              className="h-6 px-2 gap-1 text-xs"
            >
              <Calendar className="h-3 w-3" />
              Today
            </Button>
          </div>
          <div className="flex gap-1">
            <Select
              value={lastContactValue ? (new Date(lastContactValue).getMonth() + 1).toString() : ""}
              onValueChange={(value) => {
                const month = parseInt(value);
                handleDateChange("lastContactDate", month, undefined);
              }}
            >
              <SelectTrigger className="h-7 text-xs">
                <SelectValue placeholder="Month" />
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
              value={lastContactValue ? new Date(lastContactValue).getDate().toString() : ""}
              onValueChange={(value) => {
                const day = parseInt(value);
                handleDateChange("lastContactDate", undefined, day);
              }}
            >
              <SelectTrigger className="h-7 text-xs">
                <SelectValue placeholder="Day" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({length: 31}, (_, i) => i + 1).map(day => (
                  <SelectItem key={day} value={day.toString()}>{day}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <p className="text-sm text-muted-foreground">
            {lastContactValue
              ? new Date(lastContactValue).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
              : "No contact recorded"}
          </p>
        </div>

        {/* Last Face to Face Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Last Face to Face</span>
            <Button
              onClick={() => handleSetToday("lastFaceToFaceDate")}
              size="sm"
              className="h-6 px-2 gap-1 text-xs"
            >
              <Calendar className="h-3 w-3" />
              Today
            </Button>
          </div>
          <div className="flex gap-1">
            <Select
              value={lastFaceToFaceValue ? (new Date(lastFaceToFaceValue).getMonth() + 1).toString() : ""}
              onValueChange={(value) => {
                const month = parseInt(value);
                handleDateChange("lastFaceToFaceDate", month, undefined);
              }}
            >
              <SelectTrigger className="h-7 text-xs">
                <SelectValue placeholder="Month" />
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
              value={lastFaceToFaceValue ? new Date(lastFaceToFaceValue).getDate().toString() : ""}
              onValueChange={(value) => {
                const day = parseInt(value);
                handleDateChange("lastFaceToFaceDate", undefined, day);
              }}
            >
              <SelectTrigger className="h-7 text-xs">
                <SelectValue placeholder="Day" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({length: 31}, (_, i) => i + 1).map(day => (
                  <SelectItem key={day} value={day.toString()}>{day}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              {lastFaceToFaceValue
                ? new Date(lastFaceToFaceValue).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                : "No face to face recorded"}
            </p>
            {lastFaceToFaceValue && (
              <p className="text-sm font-medium">
                Next due: {new Date(lastFaceToFaceValue + (90 * 24 * 60 * 60 * 1000)).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 