import { SignInButton, UserButton, useClerk } from "@clerk/clerk-react";
import { Authenticated, Unauthenticated, AuthLoading, useQuery, useMutation, useConvexAuth } from "convex/react";
import { api } from "../convex/_generated/api";
import { Toaster } from "sonner";
import { ClientList } from "./ClientList";
import { useState, useEffect } from "react";
import { ClientDetails } from "./ClientDetails";
import { AddClientForm } from "./AddClientForm";
import { Id } from "../convex/_generated/dataModel";
import { ThemeSwitcher } from "./ThemeSwitcher";

export default function App() {
  const [selectedClientId, setSelectedClientId] = useState<Id<"clients"> | null>(null);
  const [showAddClient, setShowAddClient] = useState(false);
  const { signOut } = useClerk();

  return (
    <div className="min-h-screen flex flex-col bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark transition-colors">
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-4 flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <img 
            src="https://highlandscsb.org/wp-content/uploads/2012/10/favicon.png" 
            alt="HCS Logo" 
            className="w-6 h-6"
          />
          <h2 className="text-lg sm:text-xl font-semibold">HCS Case Management System</h2>
        </div>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <ThemeSwitcher />
          <Authenticated>
            <button
              onClick={() => setShowAddClient(true)}
              className="w-full sm:w-auto bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 transition-colors"
            >
              Add Consumer
            </button>
            <button
              onClick={() => signOut()}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
            >
              Sign Out
            </button>
            <UserButton />
          </Authenticated>
          <Unauthenticated>
            <SignInButton mode="modal">
              <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">
                Sign In
              </button>
            </SignInButton>
          </Unauthenticated>
        </div>
      </header>
      <main className="flex-1 p-4">
        <div className="max-w-7xl mx-auto">
          <Content
            selectedClientId={selectedClientId}
            setSelectedClientId={setSelectedClientId}
            showAddClient={showAddClient}
            setShowAddClient={setShowAddClient}
          />
        </div>
      </main>
      <Toaster />
    </div>
  );
}

function Content({
  selectedClientId,
  setSelectedClientId,
  showAddClient,
  setShowAddClient,
}: {
  selectedClientId: Id<"clients"> | null;
  setSelectedClientId: (id: Id<"clients"> | null) => void;
  showAddClient: boolean;
  setShowAddClient: (show: boolean) => void;
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

  // Show loading if auth is still loading or if currentUser is undefined (query is loading)
  if (isLoading || (isAuthenticated && currentUser === undefined)) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <Unauthenticated>
        <div className="text-center px-4">
          <h1 className="text-3xl sm:text-5xl font-bold mb-4">HCS Case Management System</h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-2">Sign in with your HCS credentials</p>
          <p className="text-sm text-gray-500 dark:text-gray-500">Use your standard HCS username and password</p>
          <div className="mt-8">
            <SignInButton mode="modal">
              <button className="bg-blue-500 text-white px-6 py-3 rounded-lg text-lg hover:bg-blue-600 transition-colors">
                Sign In to Continue
              </button>
            </SignInButton>
          </div>
        </div>
      </Unauthenticated>

      <Authenticated>
        {showAddClient && (
          <AddClientForm onClose={() => setShowAddClient(false)} />
        )}

        {selectedClientId ? (
          <ClientDetails
            clientId={selectedClientId}
            onClose={handleCloseClient}
          />
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">Your Caseload</h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {clients.length} consumer{clients.length !== 1 ? 's' : ''} assigned
                </p>
              </div>
            </div>

            <ClientList
              selectedClientId={selectedClientId}
              onSelectClient={setSelectedClientId}
              onCloseClient={handleCloseClient}
            />
          </div>
        )}
      </Authenticated>
    </div>
  );
}
