import { SignInButton, UserButton, useClerk } from "@clerk/clerk-react";
import { Authenticated, Unauthenticated, useQuery, useMutation, useConvexAuth } from "convex/react";
import { api } from "../convex/_generated/api";
import { Toaster } from "sonner";
import { ClientList } from "./ClientList";
import { useState, useEffect, lazy, Suspense } from "react";
import { Id } from "../convex/_generated/dataModel";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { Button } from "@/components/ui/button";
import { SearchProvider } from "./hooks/useSearchContext";
import { useGlobalHotkeys } from "./hooks/useGlobalHotkeys";
import { HotkeysButton, HotkeysHelp } from "./components/HotkeysHelp";
import { StickyNotes } from "./components/StickyNotes";
import { CompactModeToggle } from "./CompactModeToggle";

// Lazy load heavy components
const ClientDetails = lazy(() => import("./ClientDetails"));
const AddClientForm = lazy(() => import("./AddClientForm"));

// Loading component for lazy-loaded components
const ComponentLoader = () => (
  <div className="flex justify-center items-center py-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    <span className="ml-2">Loading...</span>
  </div>
);

export default function App() {
  return (
    <SearchProvider>
      <AppContent />
    </SearchProvider>
  );
}

function AppContent() {
  const [selectedClientId, setSelectedClientId] = useState<Id<"clients"> | null>(null);
  const [showAddClient, setShowAddClient] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showStickyNotes, setShowStickyNotes] = useState(false);
  const [isCompactMode, setIsCompactMode] = useState(false);
  const { signOut } = useClerk();
  
  const createStickyNote = useMutation(api.stickyNotes.create);
  const stickyNotes = useQuery(api.stickyNotes.list) || [];

  const handleCreateNote = async () => {
    // Position new note near the last note, or center if no notes exist
    let x, y;
    if (stickyNotes.length > 0) {
      const lastNote = stickyNotes[0]; // Most recent note
      x = lastNote.position.x + 100;
      y = lastNote.position.y + 100;
      // Keep within bounds
      if (x > window.innerWidth - 300) x = lastNote.position.x - 100;
      if (y > window.innerHeight - 200) y = lastNote.position.y - 100;
    } else {
      x = Math.max(50, (window.innerWidth - 300) / 2);
      y = Math.max(100, (window.innerHeight - 200) / 2);
    }
    
    await createStickyNote({
      text: "",
      position: { x, y },
    });
  };

  const toggleStickyNotes = async () => {
    if (!showStickyNotes) {
      setShowStickyNotes(true);
      // If no notes exist, create one automatically
      if (stickyNotes.length === 0) {
        await handleCreateNote();
      }
    } else {
      setShowStickyNotes(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm p-4 border-b">
        {/* Mobile layout */}
        <div className="flex flex-col gap-4 sm:hidden">
          {/* Title row */}
          <div className="flex items-center justify-center gap-2">
            <img 
              src="https://highlandscsb.org/wp-content/uploads/2012/10/favicon.png" 
              alt="HCS Logo" 
              className="w-6 h-6"
            />
            <h2 className="text-lg font-semibold">HCS Case Management System</h2>
          </div>
          
          {/* Main action buttons row */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Authenticated>
              <Button
                onClick={toggleStickyNotes}
                variant={showStickyNotes ? "default" : "outline"}
                size="sm"
                className="text-xs"
              >
                📝 Notes
              </Button>
              <Button
                onClick={() => setShowAddClient(true)}
                size="sm"
                className="text-xs"
              >
                Add Consumer
              </Button>
              <Button
                onClick={() => signOut()}
                variant="destructive"
                size="sm"
                className="text-xs"
              >
                Sign Out
              </Button>
              <UserButton />
            </Authenticated>
            <Unauthenticated>
              <SignInButton mode="modal">
                <Button size="sm">
                  Sign In
                </Button>
              </SignInButton>
            </Unauthenticated>
          </div>
          
          {/* Utility buttons row */}
          <div className="flex items-center justify-center gap-2">
            <Authenticated>
              <CompactModeToggle 
                isCompact={isCompactMode}
                onToggle={() => setIsCompactMode(!isCompactMode)}
              />
            </Authenticated>
            <HotkeysButton onClick={() => setShowHelp(true)} />
            <ThemeSwitcher />
          </div>
        </div>

        {/* Desktop layout */}
        <div className="hidden sm:flex justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <img 
              src="https://highlandscsb.org/wp-content/uploads/2012/10/favicon.png" 
              alt="HCS Logo" 
              className="w-6 h-6"
            />
            <h2 className="text-xl font-semibold">HCS Case Management System</h2>
          </div>
          <div className="flex items-center gap-4">
            <Authenticated>
              <CompactModeToggle 
                isCompact={isCompactMode}
                onToggle={() => setIsCompactMode(!isCompactMode)}
              />
            </Authenticated>
            <HotkeysButton onClick={() => setShowHelp(true)} />
            <ThemeSwitcher />
            <Authenticated>
              <Button
                onClick={toggleStickyNotes}
                variant={showStickyNotes ? "default" : "outline"}
              >
                📝 Notes
              </Button>
              <Button
                onClick={() => setShowAddClient(true)}
              >
                Add Consumer
              </Button>
              <Button
                onClick={() => signOut()}
                variant="destructive"
              >
                Sign Out
              </Button>
              <UserButton />
            </Authenticated>
            <Unauthenticated>
              <SignInButton mode="modal">
                <Button>
                  Sign In
                </Button>
              </SignInButton>
            </Unauthenticated>
          </div>
        </div>
      </header>
      <main className="flex-1 p-4">
        <div className="max-w-7xl mx-auto">
          <Content
            selectedClientId={selectedClientId}
            setSelectedClientId={setSelectedClientId}
            showAddClient={showAddClient}
            setShowAddClient={setShowAddClient}
            showHelp={showHelp}
            setShowHelp={setShowHelp}
            showStickyNotes={showStickyNotes}
            toggleStickyNotes={toggleStickyNotes}
            handleCreateNote={handleCreateNote}
            isCompactMode={isCompactMode}
            setIsCompactMode={setIsCompactMode}
          />
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

function Content({
  selectedClientId,
  setSelectedClientId,
  showAddClient,
  setShowAddClient,
  showHelp,
  setShowHelp,
  showStickyNotes,
  toggleStickyNotes,
  handleCreateNote,
  isCompactMode,
  setIsCompactMode,
}: {
  selectedClientId: Id<"clients"> | null;
  setSelectedClientId: (id: Id<"clients"> | null) => void;
  showAddClient: boolean;
  setShowAddClient: (show: boolean) => void;
  showHelp: boolean;
  setShowHelp: (show: boolean) => void;
  showStickyNotes: boolean;
  toggleStickyNotes: () => void;
  handleCreateNote: () => void;
  isCompactMode: boolean;
  setIsCompactMode: (compact: boolean) => void;
}) {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const createOrGetUser = useMutation(api.auth.createOrGetUser);
  const currentUser = useQuery(api.auth.getCurrentUser);
  const clients = useQuery(api.clients.list) || [];
  const [userCreated, setUserCreated] = useState(false);

  // Create or get user when authenticated - only if currentUser query has loaded and returned null
  useEffect(() => {
    if (isAuthenticated && currentUser === null && !userCreated) {
      setUserCreated(true);
      createOrGetUser().catch(console.error);
    }
  }, [isAuthenticated, currentUser, createOrGetUser, userCreated]);

  const handleCloseClient = () => {
    setSelectedClientId(null);
  };

  // Global hotkeys implementation
  useGlobalHotkeys({
    onFocusSearch: () => {
      // Focus search - for /
      if (!selectedClientId && !showAddClient && isAuthenticated) {
        const searchInput = document.getElementById('search') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      }
    },
    onEscape: () => {
      if (showHelp) {
        setShowHelp(false);
      } else if (showAddClient) {
        setShowAddClient(false);
      } else if (selectedClientId) {
        handleCloseClient();
      } else if (showStickyNotes) {
        toggleStickyNotes();
      }
    },
    onAddClient: () => {
      if (isAuthenticated && !selectedClientId && !showAddClient) {
        setShowAddClient(true);
      }
    },
    onShowHelp: () => {
      setShowHelp(true);
    },
    onToggleStickyNotes: () => {
      if (isAuthenticated) {
        toggleStickyNotes();
      }
    },
    onNewStickyNote: () => {
      if (isAuthenticated) {
        // Ensure sticky notes are shown first
        if (!showStickyNotes) {
          toggleStickyNotes();
        } else {
          handleCreateNote();
        }
      }
    },
    onToggleCompactMode: () => {
      if (isAuthenticated) {
        setIsCompactMode(!isCompactMode);
      }
    },
    enabled: isAuthenticated,
  });

  // Show loading if auth is still loading or if currentUser is undefined (query is loading)
  if (isLoading || (isAuthenticated && currentUser === undefined)) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <Unauthenticated>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <h1 className="text-3xl sm:text-5xl font-bold mb-4">HCS Case Management System</h1>
          {/* <p className="text-lg sm:text-xl text-muted-foreground mb-2">Sign in with your HCS credentials</p>
          <p className="text-sm text-muted-foreground">Use your standard HCS username and password</p> */}
          <div className="mt-8">
            <SignInButton mode="modal">
              <Button size="lg">
                Sign In to Continue
              </Button>
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
              onClose={handleCloseClient}
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

            <ClientList
              selectedClientId={selectedClientId}
              onSelectClient={setSelectedClientId}
              onCloseClient={handleCloseClient}
              isCompactMode={isCompactMode}
            />
          </div>
        )}
      </Authenticated>
    </div>
  );
}
