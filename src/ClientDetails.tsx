import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useEffect, useRef, useState } from "react";
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
import { useClientDetailsHotkeys, isMac } from "./hooks/useClientDetailsHotkeys";
import { HotkeyHint } from "./components/HotkeyHint";
import { SectionFocusProvider } from "./hooks/useSectionFocus";

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

  // Refs for hotkey focus targets
  const addTodoInputRef = useRef<HTMLInputElement>(null);
  const addNoteTextareaRef = useRef<HTMLTextAreaElement>(null);
  const contactSectionRef = useRef<HTMLDivElement>(null);
  const statusSectionRef = useRef<HTMLDivElement>(null);
  const todoSectionRef = useRef<HTMLDivElement>(null);
  const notesSectionRef = useRef<HTMLDivElement>(null);

  const [showForceCloseOption, setShowForceCloseOption] = useState(false);
  const [lastSaveError, setLastSaveError] = useState<string | null>(null);

  const handleClose = async () => {
    console.log('Attempting to close modal, hasPendingChanges:', pendingChanges.hasPendingChanges);
    if (pendingChanges.hasPendingChanges) {
      try {
        console.log('Syncing changes before closing...');
        await pendingChanges.syncChanges();
        toast.success("Changes saved");
        console.log('Changes synced successfully');
        setShowForceCloseOption(false);
        setLastSaveError(null);
      } catch (error) {
        console.error("Failed to save changes:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to save changes";
        toast.error(errorMessage);
        setLastSaveError(errorMessage);
        setShowForceCloseOption(true);
        return; // Don't close if sync failed
      }
    }
    onClose();
  };

  const handleForceClose = () => {
    console.log('Force closing modal, discarding changes...');
    toast.warning("Changes discarded");
    setShowForceCloseOption(false);
    setLastSaveError(null);
    onClose();
  };


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

  // Hotkey handlers
  const handleSetLastContactToday = () => {
    const today = new Date();
    pendingChanges.addDateChange(clientId, "lastContactDate", today.getTime());
    toast.success("Last contact set to today");
  };

  const handleSetFaceToFaceToday = () => {
    const today = new Date();
    pendingChanges.addDateChange(clientId, "lastFaceToFaceDate", today.getTime());
    toast.success("Last face-to-face set to today");
  };

  const handleToggleFirstContact = () => {
    const currentValue = pendingChanges.getContactState(clientId, "firstContactCompleted", client?.firstContactCompleted || false);
    const newValue = !currentValue;
    pendingChanges.addContactChange(clientId, "firstContactCompleted", newValue);
    toast.success(`First contact ${newValue ? 'completed' : 'marked incomplete'}`);
  };

  const handleToggleSecondContact = () => {
    const currentValue = pendingChanges.getContactState(clientId, "secondContactCompleted", client?.secondContactCompleted || false);
    const newValue = !currentValue;
    pendingChanges.addContactChange(clientId, "secondContactCompleted", newValue);
    toast.success(`Second contact ${newValue ? 'completed' : 'marked incomplete'}`);
  };

  const handleFocusAddTodo = () => {
    addTodoInputRef.current?.focus();
  };

  const handleFocusAddNote = () => {
    addNoteTextareaRef.current?.focus();
  };

  const handleFocusContactSection = () => {
    contactSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleFocusStatusSection = () => {
    statusSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleFocusTodoSection = () => {
    todoSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleFocusNotesSection = () => {
    notesSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Initialize hotkeys
  const { isEditing } = useClientDetailsHotkeys({
    onSetLastContactToday: handleSetLastContactToday,
    onSetFaceToFaceToday: handleSetFaceToFaceToday,
    onToggleFirstContact: handleToggleFirstContact,
    onToggleSecondContact: handleToggleSecondContact,
    onFocusAddTodo: handleFocusAddTodo,
    onFocusAddNote: handleFocusAddNote,
    onCloseModal: handleClose,
    onArchiveClient: handleArchive,
    onFocusContactSection: handleFocusContactSection,
    onFocusStatusSection: handleFocusStatusSection,
    onFocusTodoSection: handleFocusTodoSection,
    onFocusNotesSection: handleFocusNotesSection,
    onEscape: handleClose,
  });

  return (
    <SectionFocusProvider>
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-1 sm:p-2"
        onClick={handleClose}
      onKeyDown={(e) => {
        // Handle hotkeys at component level to avoid global conflicts
        if (!isEditing) {
          // Simple hotkey detection for testing
          const modifierPressed = isMac ? e.ctrlKey : e.altKey;
          if (modifierPressed && e.key === 't') {
            e.preventDefault();
            e.stopPropagation();
            handleSetLastContactToday();
            console.log(`${isMac ? 'Control' : 'Alt'}+T triggered at component level`);
          } else if (modifierPressed && e.key === 'f') {
            e.preventDefault();
            e.stopPropagation();
            handleSetFaceToFaceToday();
            console.log(`${isMac ? 'Control' : 'Alt'}+F triggered at component level`);
          } else if (modifierPressed && e.key === '1') {
            e.preventDefault();
            e.stopPropagation();
            handleToggleFirstContact();
            console.log(`${isMac ? 'Control' : 'Alt'}+1 triggered at component level`);
          } else if (modifierPressed && e.key === '2') {
            e.preventDefault();
            e.stopPropagation();
            handleToggleSecondContact();
            console.log(`${isMac ? 'Control' : 'Alt'}+2 triggered at component level`);
          }
        }
      }}
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
                title="Go Back (Ctrl+B)"
              >
                <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm">Back</span>
                <HotkeyHint hotkey="Ctrl+B" show={!isEditing} />
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
                  <Button
                    onClick={handleClose}
                    variant="default"
                    size="sm"
                    className="h-6 px-2 text-xs"
                  >
                    Try Again
                  </Button>
                  <Button
                    onClick={handleForceClose}
                    variant="outline"
                    size="sm"
                    className="h-6 px-2 text-xs"
                  >
                    Discard Changes
                  </Button>
                </div>
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
            title="Archive Client (Ctrl+A)"
          >
            <Archive className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="text-xs sm:text-sm">Archive</span>
            <HotkeyHint hotkey="Ctrl+A" show={!isEditing} />
          </Button>
        </div>
        
        {/* Scrollable content */}
        <div className="overflow-y-auto p-3 sm:p-4 flex-1">
          <div className="space-y-3 sm:space-y-4">
            {/* Responsive grid: Mobile (1 col), Tablet (2 cols), Desktop (3 cols) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="space-y-3">
                <div ref={contactSectionRef}>
                  <ContactInformationSection client={client} />
                </div>
                <div ref={statusSectionRef}>
                  <ContactStatusSection client={client} pendingChanges={pendingChanges} isEditing={isEditing} />
                </div>
              </div>
              <LastContactSection client={client} pendingChanges={pendingChanges} isEditing={isEditing} />
              <ImportantDatesSection client={client} pendingChanges={pendingChanges} />
            </div>

            {/* Bottom row - Responsive todos and notes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div ref={todoSectionRef}>
                <TodoSection
                  clientId={clientId}
                  pendingChanges={pendingChanges}
                  isEditing={isEditing}
                  addTodoInputRef={addTodoInputRef as React.RefObject<HTMLInputElement>}
                />
              </div>
              <div ref={notesSectionRef}>
                <NotesSection
                  clientId={clientId}
                  isEditing={isEditing}
                  addNoteTextareaRef={addNoteTextareaRef as React.RefObject<HTMLTextAreaElement>}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </SectionFocusProvider>
  );
}
