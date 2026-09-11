import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useRef, useState } from "react";
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
import { useClientDetailsHotkeys } from "./hooks/useClientDetailsHotkeys";
import { HotkeyHint } from "./components/HotkeyHint";
import { ModalOverlay } from "./components/ModalOverlay";
import { SectionFocusProvider } from "./hooks/useSectionFocus";

interface ClientDetailsProps {
  clientId: Id<"clients">;
  onClose: () => void;
}

export default function ClientDetails({ clientId, onClose }: ClientDetailsProps) {
  const client = useQuery(api.clients.list)?.find((c) => c._id === clientId);
  const archiveClient = useMutation(api.clients.archive);
  const pendingChanges = usePendingChanges();

  // Refs for hotkey focus targets
  const addTodoInputRef = useRef<HTMLInputElement>(null);
  const addNoteTextareaRef = useRef<HTMLTextAreaElement>(null);
  const contactSectionRef = useRef<HTMLDivElement>(null);
  const statusSectionRef = useRef<HTMLDivElement>(null);
  const todoSectionRef = useRef<HTMLDivElement>(null);
  const notesSectionRef = useRef<HTMLDivElement>(null);

  const [showForceCloseOption, setShowForceCloseOption] = useState(false);

  const handleClose = async () => {
    if (pendingChanges.hasPendingChanges) {
      try {
        await pendingChanges.syncChanges();
        toast.success("Changes saved");
        setShowForceCloseOption(false);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to save changes";
        toast.error(errorMessage);
        setShowForceCloseOption(true);
        return;
      }
    }
    onClose();
  };

  const handleForceClose = () => {
    toast.warning("Changes discarded");
    setShowForceCloseOption(false);
    onClose();
  };

  const handleArchive = async () => {
    if (!confirm("Are you sure you want to archive this consumer?")) return;

    if (pendingChanges.hasPendingChanges) {
      try {
        await pendingChanges.syncChanges();
      } catch {
        toast.error("Failed to save pending changes");
        return;
      }
    }
    await archiveClient({ id: clientId });
    toast.success("Consumer archived");
    onClose();
  };

  const setDateToToday = (field: "lastContactDate" | "lastFaceToFaceDate", label: string) => {
    pendingChanges.addDateChange(clientId, field, Date.now());
    toast.success(`${label} set to today`);
  };

  const toggleContact = (field: "firstContactCompleted" | "secondContactCompleted", label: string) => {
    if (!client) return;
    const current = pendingChanges.getContactState(clientId, field, client[field] ?? false);
    pendingChanges.addContactChange(clientId, field, !current);
    toast.success(`${label} ${!current ? "completed" : "marked incomplete"}`);
  };

  const scrollToRef = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Must run before the `client` guard below so the hook order stays stable
  // while the client query is in flight.
  const { isEditing, showHotkeyHints } = useClientDetailsHotkeys({
    onSetLastContactToday: () => setDateToToday("lastContactDate", "Last contact"),
    onSetFaceToFaceToday: () => setDateToToday("lastFaceToFaceDate", "Last face-to-face"),
    onToggleFirstContact: () => toggleContact("firstContactCompleted", "First contact"),
    onToggleSecondContact: () => toggleContact("secondContactCompleted", "Second contact"),
    onFocusAddTodo: () => addTodoInputRef.current?.focus(),
    onFocusAddNote: () => addNoteTextareaRef.current?.focus(),
    onCloseModal: () => void handleClose(),
    onArchiveClient: () => void handleArchive(),
    onFocusContactSection: () => scrollToRef(contactSectionRef),
    onFocusStatusSection: () => scrollToRef(statusSectionRef),
    onFocusTodoSection: () => scrollToRef(todoSectionRef),
    onFocusNotesSection: () => scrollToRef(notesSectionRef),
    onEscape: () => void handleClose(),
  });

  if (!client) return null;

  return (
    <SectionFocusProvider>
      <ModalOverlay onDismiss={() => void handleClose()} className="p-1 sm:p-2">
        <div className="bg-background rounded-lg shadow-lg w-full max-w-7xl max-h-[98vh] sm:max-h-[95vh] flex flex-col border">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center sticky top-0 bg-background border-b z-10 px-3 sm:px-4 pt-3 pb-3 rounded-t-lg gap-3 sm:gap-4">
            <div className="flex flex-col w-full sm:w-auto">
              <div className="flex items-center gap-2 sm:gap-4">
                <Button
                  onClick={() => void handleClose()}
                  variant="ghost"
                  size="sm"
                  className="gap-1 sm:gap-2 h-8 px-2 sm:px-3"
                  title="Go Back (Ctrl+B)"
                >
                  <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="text-xs sm:text-sm">Back</span>
                  <HotkeyHint hotkey="Ctrl+B" show={!isEditing && showHotkeyHints} />
                </Button>
                {pendingChanges.hasPendingChanges && (
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                    Unsaved changes
                  </span>
                )}
                {showForceCloseOption && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-destructive bg-destructive/10 px-2 py-1 rounded">
                      Save failed
                    </span>
                    <Button onClick={() => void handleClose()} variant="default" size="sm" className="h-6 px-2 text-xs">
                      Try Again
                    </Button>
                    <Button onClick={handleForceClose} variant="outline" size="sm" className="h-6 px-2 text-xs">
                      Discard Changes
                    </Button>
                  </div>
                )}
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2 sm:mt-0">
                <h2 className="text-lg sm:text-xl font-bold leading-tight">{client.name}</h2>
                {client.phoneNumber && (
                  <div className="flex items-center gap-1">
                    <span className="text-xs sm:text-sm text-muted-foreground">📞</span>
                    <a
                      href={`tel:${client.phoneNumber}`}
                      className="text-sm sm:text-base text-muted-foreground hover:underline"
                    >
                      {client.phoneNumber}
                    </a>
                  </div>
                )}
              </div>
            </div>
            <Button
              onClick={() => void handleArchive()}
              variant="destructive"
              size="sm"
              className="gap-1 sm:gap-2 h-8 px-2 sm:px-3 self-end sm:self-auto"
              title="Archive Client (Ctrl+A)"
            >
              <Archive className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="text-xs sm:text-sm">Archive</span>
              <HotkeyHint hotkey="Ctrl+A" show={!isEditing && showHotkeyHints} />
            </Button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto p-3 sm:p-4 flex-1">
            <div className="space-y-3 sm:space-y-4">
              {/* Top grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="space-y-3">
                  <div ref={contactSectionRef}>
                    <ContactInformationSection client={client} />
                  </div>
                  <div ref={statusSectionRef}>
                    <ContactStatusSection
                      client={client}
                      pendingChanges={pendingChanges}
                      isEditing={isEditing}
                      showHotkeyHints={showHotkeyHints}
                    />
                  </div>
                </div>
                <LastContactSection
                  client={client}
                  pendingChanges={pendingChanges}
                  isEditing={isEditing}
                  showHotkeyHints={showHotkeyHints}
                />
                <ImportantDatesSection client={client} pendingChanges={pendingChanges} />
              </div>

              {/* Bottom grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div ref={todoSectionRef}>
                  <TodoSection
                    clientId={clientId}
                    pendingChanges={pendingChanges}
                    isEditing={isEditing}
                    showHotkeyHints={showHotkeyHints}
                    addTodoInputRef={addTodoInputRef}
                  />
                </div>
                <div ref={notesSectionRef}>
                  <NotesSection
                    clientId={clientId}
                    isEditing={isEditing}
                    showHotkeyHints={showHotkeyHints}
                    addNoteTextareaRef={addNoteTextareaRef}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </ModalOverlay>
    </SectionFocusProvider>
  );
}
