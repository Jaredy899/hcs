import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
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
}

export function LastContactSection({ client }: LastContactSectionProps) {
  const updateContact = useMutation(api.clients.updateContact);

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
              onClick={() => {
                const today = new Date();
                updateContact({
                  id: client._id,
                  field: "lastContactDate",
                  value: today.getTime(),
                });
              }}
              size="sm"
              className="h-6 px-2 gap-1 text-xs"
            >
              <Calendar className="h-3 w-3" />
              Today
            </Button>
          </div>
          <div className="flex gap-1">
            <Select
              value={client.lastContactDate ? (new Date(client.lastContactDate).getMonth() + 1).toString() : ""}
              onValueChange={(value) => {
                const month = parseInt(value);
                const day = client.lastContactDate ? new Date(client.lastContactDate).getDate() : 1;
                const date = new Date(new Date().getFullYear(), month - 1, day);
                updateContact({
                  id: client._id,
                  field: "lastContactDate",
                  value: date.getTime(),
                });
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
              value={client.lastContactDate ? new Date(client.lastContactDate).getDate().toString() : ""}
              onValueChange={(value) => {
                const month = client.lastContactDate ? new Date(client.lastContactDate).getMonth() + 1 : 1;
                const day = parseInt(value);
                const date = new Date(new Date().getFullYear(), month - 1, day);
                updateContact({
                  id: client._id,
                  field: "lastContactDate",
                  value: date.getTime(),
                });
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
            {client.lastContactDate
              ? new Date(client.lastContactDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
              : "No contact recorded"}
          </p>
        </div>

        {/* Last Face to Face Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Last Face to Face</span>
            <Button
              onClick={() => {
                const today = new Date();
                updateContact({
                  id: client._id,
                  field: "lastFaceToFaceDate",
                  value: today.getTime(),
                });
              }}
              size="sm"
              className="h-6 px-2 gap-1 text-xs"
            >
              <Calendar className="h-3 w-3" />
              Today
            </Button>
          </div>
          <div className="flex gap-1">
            <Select
              value={client.lastFaceToFaceDate ? (new Date(client.lastFaceToFaceDate).getMonth() + 1).toString() : ""}
              onValueChange={(value) => {
                const month = parseInt(value);
                const day = client.lastFaceToFaceDate ? new Date(client.lastFaceToFaceDate).getDate() : 1;
                const date = new Date(new Date().getFullYear(), month - 1, day);
                updateContact({
                  id: client._id,
                  field: "lastFaceToFaceDate",
                  value: date.getTime(),
                });
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
              value={client.lastFaceToFaceDate ? new Date(client.lastFaceToFaceDate).getDate().toString() : ""}
              onValueChange={(value) => {
                const month = client.lastFaceToFaceDate ? new Date(client.lastFaceToFaceDate).getMonth() + 1 : 1;
                const day = parseInt(value);
                const date = new Date(new Date().getFullYear(), month - 1, day);
                updateContact({
                  id: client._id,
                  field: "lastFaceToFaceDate",
                  value: date.getTime(),
                });
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
              {client.lastFaceToFaceDate
                ? new Date(client.lastFaceToFaceDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                : "No face to face recorded"}
            </p>
            {client.lastFaceToFaceDate && (
              <p className="text-sm font-medium">
                Next due: {new Date(client.lastFaceToFaceDate + (90 * 24 * 60 * 60 * 1000)).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 