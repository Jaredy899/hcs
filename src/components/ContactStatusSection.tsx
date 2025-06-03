import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface ContactStatusSectionProps {
  client: {
    _id: Id<"clients">;
    firstContactCompleted?: boolean;
    secondContactCompleted?: boolean;
  };
}

export function ContactStatusSection({ client }: ContactStatusSectionProps) {
  const updateContact = useMutation(api.clients.updateContact);

  return (
    <Card>
      <CardHeader className="px-3 pt-3 pb-0">
        <CardTitle className="text-sm font-semibold">Contact Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 px-3 py-9">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="first-contact"
            checked={client.firstContactCompleted || false}
            onCheckedChange={() =>
              updateContact({
                id: client._id,
                field: "firstContactCompleted",
                value: !client.firstContactCompleted,
              })
            }
          />
          <Label htmlFor="first-contact" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            First Contact
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="second-contact"
            checked={client.secondContactCompleted || false}
            onCheckedChange={() =>
              updateContact({
                id: client._id,
                field: "secondContactCompleted",
                value: !client.secondContactCompleted,
              })
            }
          />
          <Label htmlFor="second-contact" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Second Contact
          </Label>
        </div>
      </CardContent>
    </Card>
  );
} 