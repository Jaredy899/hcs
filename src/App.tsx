import { SignInButton } from "@clerk/clerk-react";
import { Authenticated, Unauthenticated, useQuery, useMutation, useConvexAuth } from "convex/react";
import { api } from "../convex/_generated/api";
import { Toaster } from "sonner";
import { ClientList } from "./ClientList";
import { useState, useEffect, useRef, lazy, Suspense } from "react";
import { Id } from "../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { useGlobalHotkeys } from "./hooks/useGlobalHotkeys";
import { HotkeysHelp } from "./components/HotkeysHelp";
import { StickyNotes } from "./components/StickyNotes";
import { Header } from "./components/Header";

// Lazy load heavy components
const ClientDetails = lazy(() => import("./ClientDetails"));
const AddClientForm = lazy(() => import("./AddClientForm"));

function ComponentLoader() {
  return (
    <div className="flex justify-center items-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <span className="ml-2">Loading...</span>
    </div>
  );
}

export default function App() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const currentUser = useQuery(api.auth.getCurrentUser);
  const clients = useQuery(api.clients.list) || [];
  const stickyNotes = useQuery(api.stickyNotes.list) || [];
  const createOrGetUser = useMutation(api.auth.createOrGetUser);
  const createStickyNote = useMutation(api.stickyNotes.create);

  const [selectedClientId, setSelectedClientId] = useState<Id<"clients"> | null>(null);
  const [showAddClient, setShowAddClient] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showStickyNotes, setShowStickyNotes] = useState(false);
  const [isCompactMode, setIsCompactMode] = useState(false);

  // Create or get the Convex user record once per session when authenticated
  const hasRequestedUser = useRef(false);
  useEffect(() => {
    if (isAuthenticated && currentUser === null && !hasRequestedUser.current) {
      hasRequestedUser.current = true;
      createOrGetUser().catch(console.error);
    }
  }, [isAuthenticated, currentUser, createOrGetUser]);

  const handleCreateNote = async () => {
    // Offset each new note from the last one, wrapping back when it would land
    // outside the viewport.
    let x: number, y: number;
    if (stickyNotes.length > 0) {
      const lastNote = stickyNotes[0];
      x = lastNote.position.x + 100;
      y = lastNote.position.y + 100;
      if (x > window.innerWidth - 300) x = lastNote.position.x - 100;
      if (y > window.innerHeight - 200) y = lastNote.position.y - 100;
    } else {
      x = Math.max(50, (window.innerWidth - 300) / 2);
      y = Math.max(100, (window.innerHeight - 200) / 2);
    }

    await createStickyNote({ text: "", position: { x, y } });
  };

  const toggleStickyNotes = async () => {
    if (showStickyNotes) {
      setShowStickyNotes(false);
      return;
    }
    setShowStickyNotes(true);
    if (stickyNotes.length === 0) {
      await handleCreateNote();
    }
  };

  useGlobalHotkeys({
    enabled: isAuthenticated,
    onFocusSearch: () => {
      if (selectedClientId || showAddClient) return;
      const searchInput = document.getElementById('search') as HTMLInputElement | null;
      searchInput?.focus();
      searchInput?.select();
    },
    onEscape: () => {
      if (showHelp) {
        setShowHelp(false);
      } else if (showAddClient) {
        setShowAddClient(false);
      } else if (selectedClientId) {
        // ClientDetails owns Escape so pending changes get saved before closing.
      } else if (showStickyNotes) {
        setShowStickyNotes(false);
      }
    },
    onAddClient: () => {
      if (!selectedClientId) setShowAddClient(true);
    },
    onShowHelp: () => setShowHelp(!showHelp),
    onToggleStickyNotes: () => void toggleStickyNotes(),
    onNewStickyNote: () => {
      void (showStickyNotes ? handleCreateNote() : toggleStickyNotes());
    },
    onToggleCompactMode: () => setIsCompactMode(!isCompactMode),
  });

  const isBootstrapping = isLoading || (isAuthenticated && currentUser === undefined);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header
        showStickyNotes={showStickyNotes}
        onToggleStickyNotes={() => void toggleStickyNotes()}
        onAddClient={() => setShowAddClient(true)}
        onShowHelp={() => setShowHelp(true)}
        isCompactMode={isCompactMode}
        onToggleCompactMode={() => setIsCompactMode(!isCompactMode)}
      />
      <main className="flex-1 p-4">
        <div className="max-w-7xl mx-auto">
          {isBootstrapping ? (
            <ComponentLoader />
          ) : (
            <div className="flex flex-col gap-8">
              <Unauthenticated>
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                  <h1 className="text-3xl sm:text-5xl font-bold mb-4">HCS Case Management System</h1>
                  <div className="mt-8">
                    <SignInButton mode="modal">
                      <Button size="lg">Sign In to Continue</Button>
                    </SignInButton>
                  </div>
                </div>
              </Unauthenticated>

              <Authenticated>
                {showAddClient && (
                  <Suspense fallback={<ComponentLoader />}>
                    <AddClientForm onClose={() => setShowAddClient(false)} />
                  </Suspense>
                )}

                {selectedClientId ? (
                  <Suspense fallback={<ComponentLoader />}>
                    <ClientDetails
                      clientId={selectedClientId}
                      onClose={() => setSelectedClientId(null)}
                    />
                  </Suspense>
                ) : (
                  <div className="space-y-6">
                    <div className="flex flex-col items-center text-center sm:flex-row sm:justify-between sm:items-center sm:text-left gap-4">
                      <h1 className="text-2xl sm:text-3xl font-bold">Your Caseload</h1>
                      <p className="text-muted-foreground">
                        {clients.length} consumer{clients.length !== 1 ? 's' : ''} assigned
                      </p>
                    </div>
                    <ClientList onSelectClient={setSelectedClientId} isCompactMode={isCompactMode} />
                  </div>
                )}
              </Authenticated>
            </div>
          )}
        </div>
      </main>
      <HotkeysHelp isOpen={showHelp} onClose={() => setShowHelp(false)} />
      <Authenticated>
        <StickyNotes
          showStickyNotes={showStickyNotes}
          onCreateNote={handleCreateNote}
          onHideNotes={() => setShowStickyNotes(false)}
        />
      </Authenticated>
      <Toaster />
    </div>
  );
}
