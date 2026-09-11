import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit, Save, X } from "lucide-react";

interface ClientContactData {
  _id: Id<"clients">;
  name?: string;
  phoneNumber?: string;
  insurance?: string;
  clientId?: string;
}

interface ContactInformationSectionProps {
  client: ClientContactData;
}

const FIELDS = [
  { key: "name", label: "Name", type: "text", showWhenIdle: false },
  { key: "phoneNumber", label: "Phone", type: "tel", showWhenIdle: true },
  { key: "insurance", label: "Insurance", type: "text", showWhenIdle: true },
  { key: "clientId", label: "Client ID", type: "text", showWhenIdle: true },
] as const;

type EditableFields = Record<(typeof FIELDS)[number]["key"], string>;

function toEditableFields(client: ClientContactData): EditableFields {
  return {
    name: client.name ?? "",
    phoneNumber: client.phoneNumber ?? "",
    insurance: client.insurance ?? "",
    clientId: client.clientId ?? "",
  };
}

export function ContactInformationSection({ client }: ContactInformationSectionProps) {
  const updateInfo = useMutation(api.clients.updateInfo);

  // `null` while not editing, so the draft is seeded from the client on Edit
  // instead of being kept in sync by an effect.
  const [draft, setDraft] = useState<EditableFields | null>(null);

  const handleSave = async () => {
    if (!draft) return;
    try {
      await updateInfo({ id: client._id, ...draft });
      setDraft(null);
      toast.success("Contact information updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update contact information");
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 pt-3">
        <CardTitle className="text-sm font-semibold">Contact Information</CardTitle>
        {draft === null ? (
          <Button
            onClick={() => setDraft(toEditableFields(client))}
            variant="outline"
            size="sm"
            className="gap-1 h-6 px-2 text-xs"
          >
            <Edit className="h-3 w-3" />
            Edit
          </Button>
        ) : (
          <div className="flex gap-1">
            <Button onClick={() => void handleSave()} size="sm" className="gap-1 h-6 px-2 text-xs">
              <Save className="h-3 w-3" />
              Save
            </Button>
            <Button onClick={() => setDraft(null)} variant="outline" size="sm" className="gap-1 h-6 px-2 text-xs">
              <X className="h-3 w-3" />
              Cancel
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-2 px-3 pb-3">
        {draft !== null
          ? FIELDS.map((field) => (
              <div key={field.key} className="space-y-1">
                <Label htmlFor={`edit-${field.key}`} className="text-xs">{field.label}</Label>
                <Input
                  id={`edit-${field.key}`}
                  type={field.type}
                  value={draft[field.key]}
                  onChange={(e) => setDraft({ ...draft, [field.key]: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      e.preventDefault();
                      setDraft(null);
                    }
                  }}
                  className="h-7 text-xs"
                />
              </div>
            ))
          : FIELDS.filter((field) => field.showWhenIdle).map((field) => (
              <div key={field.key}>
                <p className="text-xs font-medium text-muted-foreground">{field.label}</p>
                <p className="text-sm text-foreground">{client[field.key] || "Not provided"}</p>
              </div>
            ))}
      </CardContent>
    </Card>
  );
}
