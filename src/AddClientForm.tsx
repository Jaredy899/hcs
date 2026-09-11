import { useState, lazy, Suspense } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { ModalOverlay } from "./components/ModalOverlay";

// Lazy load the import form
const ImportClientsForm = lazy(() => import("./ImportClientsForm"));

const LOOKUP_FIELDS = [
  { key: "name", label: "Name", type: "text", required: true },
  { key: "phoneNumber", label: "Phone Number", type: "tel", required: true },
  { key: "insurance", label: "Insurance", type: "text", required: false },
] as const;

type LookupField = (typeof LOOKUP_FIELDS)[number]["key"];

export default function AddClientForm({ onClose }: { onClose: () => void }) {
  const addClient = useMutation(api.clients.add);
  const [showImportForm, setShowImportForm] = useState(false);
  const [clientId, setClientId] = useState("");
  // Only fields the user has typed into; anything else falls back to the looked-up
  // consumer, which lets an autofilled field be cleared again.
  const [edited, setEdited] = useState<Partial<Record<LookupField, string>>>({});

  const existingClient = useQuery(
    api.clients.getByClientId,
    clientId.length > 0 ? { clientId } : "skip"
  );

  const valueOf = (field: LookupField) => edited[field] ?? existingClient?.[field] ?? "";

  const handleClientIdChange = (next: string) => {
    setClientId(next);
    setEdited({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const today = new Date();

    await addClient({
      name: valueOf("name"),
      phoneNumber: valueOf("phoneNumber"),
      insurance: valueOf("insurance"),
      clientId,
      nextQuarterlyReview: today.getTime(),
      // Annual assessments are tracked by month, always stored as the 1st
      nextAnnualAssessment: new Date(today.getFullYear(), today.getMonth(), 1).getTime(),
    });

    onClose();
  };

  const lookupStatus = () => {
    if (clientId.length === 0) return "Enter Consumer ID to check for existing record";
    if (existingClient === undefined) return "Looking up consumer...";
    if (existingClient === null) return "No existing consumer found. Continue entering details.";
    return "Found existing consumer. Details auto-filled.";
  };

  if (showImportForm) {
    return (
      <Suspense
        fallback={
          <ModalOverlay onDismiss={() => setShowImportForm(false)} className="p-4">
            <div className="bg-background rounded-lg shadow-xl p-8 flex items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2">Loading...</span>
            </div>
          </ModalOverlay>
        }
      >
        <ImportClientsForm onClose={() => setShowImportForm(false)} />
      </Suspense>
    );
  }

  return (
    <ModalOverlay onDismiss={onClose} className="p-4">
      <div className="bg-background rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Add New Consumer</h2>
            <div className="flex gap-2">
              <Button onClick={() => setShowImportForm(true)} variant="secondary">
                Import CSV
              </Button>
              <Button onClick={onClose} variant="ghost" size="sm" className="h-8 w-8 p-0">
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </div>
          </div>

          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="clientId">Consumer ID</Label>
              <Input
                type="text"
                id="clientId"
                autoFocus
                value={clientId}
                onChange={(e) => handleClientIdChange(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">{lookupStatus()}</p>
            </div>

            {LOOKUP_FIELDS.map((field) => (
              <div key={field.key} className="space-y-2">
                <Label htmlFor={field.key}>{field.label}</Label>
                <Input
                  type={field.type}
                  id={field.key}
                  value={valueOf(field.key)}
                  onChange={(e) => setEdited((prev) => ({ ...prev, [field.key]: e.target.value }))}
                  required={field.required}
                />
              </div>
            ))}

            <Button
              type="submit"
              className="w-full"
              disabled={!valueOf("name") || !valueOf("phoneNumber") || !clientId}
            >
              Add Consumer
            </Button>
          </form>
        </div>
      </div>
    </ModalOverlay>
  );
}
