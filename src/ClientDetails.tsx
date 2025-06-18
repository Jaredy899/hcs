import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useEffect } from "react";
import { toast } from "sonner";
import { Id } from "../convex/_generated/dataModel";
import { ContactInformationSection } from "./components/ContactInformationSection";
import { ImportantDatesSection } from "./components/ImportantDatesSection";
import { ContactStatusSection } from "./components/ContactStatusSection";
import { TodoSection } from "./components/TodoSection";
import { NotesSection } from "./components/NotesSection";
import { LastContactSection } from "./components/LastContactSection";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Archive } from "lucide-react";
import { usePendingChanges } from "./hooks/usePendingChanges";

export default function ClientDetails({
  clientId,
  onClose,
}: {
  clientId: Id<"clients">;
  onClose: () => void;
}) {
  const client = useQuery(api.clients.list)?.find((c) => c._id === clientId);
  const archiveClient = useMutation(api.clients.archive);
  const pendingChanges = usePendingChanges();

  const handleClose = async () => {
    if (pendingChanges.hasPendingChanges) {
      try {
        await pendingChanges.syncChanges();
        toast.success("Changes saved");
      } catch (error) {
        toast.error("Failed to save changes");
        return; // Don't close if sync failed
      }
    }
    onClose();
  };

  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        await handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleClose]);

  if (!client) return null;

  const handleArchive = async () => {
    if (confirm("Are you sure you want to archive this consumer?")) {
      // Sync any pending changes before archiving
      if (pendingChanges.hasPendingChanges) {
        try {
          await pendingChanges.syncChanges();
        } catch (error) {
          toast.error("Failed to save pending changes");
          return;
        }
      }
      await archiveClient({ id: clientId });
      toast.success("Consumer archived");
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-1 sm:p-2"
      onClick={handleClose}
    >
      <div 
        className="bg-background rounded-lg shadow-lg w-full max-w-7xl max-h-[98vh] sm:max-h-[95vh] flex flex-col border"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center sticky top-0 bg-background border-b z-10 px-3 sm:px-4 pt-3 pb-3 rounded-t-lg gap-3 sm:gap-4">
          <div className="flex flex-col w-full sm:w-auto">
            <div className="flex items-center gap-2 sm:gap-4">
              <Button
                onClick={handleClose}
                variant="ghost"
                size="sm"
                className="gap-1 sm:gap-2 h-8 px-2 sm:px-3"
              >
                <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm">Back</span>
              </Button>
              {pendingChanges.hasPendingChanges && (
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                  Unsaved changes
                </span>
              )}
            </div>
            {/* Mobile: Client name and phone side by side */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2 sm:mt-0">
              <h2 className="text-lg sm:text-xl font-bold leading-tight">{client.name}</h2>
              {client.phoneNumber && (
                <div className="flex items-center gap-1">
                  <span className="text-xs sm:text-sm text-muted-foreground">📞</span>
                  <span className="text-sm sm:text-base text-muted-foreground">{client.phoneNumber}</span>
                </div>
              )}
            </div>
          </div>
          <Button
            onClick={handleArchive}
            variant="destructive"
            size="sm"
            className="gap-1 sm:gap-2 h-8 px-2 sm:px-3 self-end sm:self-auto"
          >
            <Archive className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="text-xs sm:text-sm">Archive</span>
          </Button>
        </div>
        
        {/* Scrollable content */}
        <div className="overflow-y-auto p-3 sm:p-4 flex-1">
          <div className="space-y-3 sm:space-y-4">
            {/* Responsive grid: Mobile (1 col), Tablet (2 cols), Desktop (3 cols) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="space-y-3">
                <ContactInformationSection client={client} />
                <ContactStatusSection client={client} pendingChanges={pendingChanges} />
              </div>
              <LastContactSection client={client} pendingChanges={pendingChanges} />
              <ImportantDatesSection client={client} pendingChanges={pendingChanges} />
            </div>

            {/* Bottom row - Responsive todos and notes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <TodoSection clientId={clientId} pendingChanges={pendingChanges} />
              <NotesSection clientId={clientId} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
