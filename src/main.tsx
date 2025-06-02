import { StrictMode, useMemo } from "react";
import { createRoot } from "react-dom/client";
import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithAuth } from "convex/react";
import "./index.css";
import App from "./App";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key");
}

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

function ConvexProviderWithClerk({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  
  const convexAuth = useMemo(() => ({
    isLoading: !auth.isLoaded,
    isAuthenticated: auth.isLoaded && !!auth.isSignedIn && !!auth.userId,
    fetchAccessToken: async ({ forceRefreshToken }: { forceRefreshToken: boolean }) => {
      try {
        // Only fetch token if fully authenticated
        if (!auth.isLoaded || !auth.isSignedIn || !auth.userId || !auth.sessionId) {
          return null;
        }
        
        const token = await auth.getToken({ template: "convex" });
        return token;
      } catch (error) {
        console.error("Error fetching access token:", error);
        return null;
      }
    },
  }), [auth.isLoaded, auth.isSignedIn, auth.userId, auth.sessionId, auth.getToken]);

  return (
    <ConvexProviderWithAuth client={convex} useAuth={() => convexAuth}>
      {children}
    </ConvexProviderWithAuth>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
      <ConvexProviderWithClerk>
        <App />
      </ConvexProviderWithClerk>
    </ClerkProvider>
  </StrictMode>,
);
