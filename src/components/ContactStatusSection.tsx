import { Id } from "../../convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { HotkeyHint } from "./HotkeyHint";
import { PendingChanges } from "../hooks/usePendingChanges";

interface ContactStatusSectionProps {
  client: {
    _id: Id<"clients">;
    firstContactCompleted?: boolean;
    secondContactCompleted?: boolean;
  };
  pendingChanges: PendingChanges;
  isEditing?: boolean;
  showHotkeyHints?: boolean;
}

export function ContactStatusSection({
  client,
  pendingChanges,
  isEditing = false,
  showHotkeyHints = false,
}: ContactStatusSectionProps) {
  const contacts = [
    {
      id: "first-contact",
      field: "firstContactCompleted" as const,
      label: "First Contact",
      hotkey: "Ctrl+1",
      checked: pendingChanges.getContactState(client._id, "firstContactCompleted", client.firstContactCompleted ?? false),
    },
    {
      id: "second-contact",
      field: "secondContactCompleted" as const,
      label: "Second Contact",
      hotkey: "Ctrl+2",
      checked: pendingChanges.getContactState(client._id, "secondContactCompleted", client.secondContactCompleted ?? false),
    },
  ];

  return (
    <Card>
      <CardHeader className="px-3 pt-3 pb-0">
        <CardTitle className="text-sm font-semibold">Contact Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 px-3 py-9">
        {contacts.map((contact) => (
          <div key={contact.id} className="flex items-center space-x-2">
            <Checkbox
              id={contact.id}
              checked={contact.checked}
              onCheckedChange={() => pendingChanges.addContactChange(client._id, contact.field, !contact.checked)}
            />
            <Label htmlFor={contact.id} className="text-sm font-medium leading-none">
              {contact.label}
              <HotkeyHint hotkey={contact.hotkey} show={!isEditing && showHotkeyHints} />
            </Label>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
