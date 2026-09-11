import { StrictMode, useCallback, useMemo } from "react";
import { createRoot } from "react-dom/client";
import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import { ConvexReactClient, ConvexProviderWithAuth } from "convex/react";
import "./index.css";
import App from "./App";
import { ErrorBoundary } from "./components/ErrorBoundary";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key");
}

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

function useConvexAuthFromClerk() {
  const { isLoaded, isSignedIn, userId, sessionId, getToken } = useAuth();

  const fetchAccessToken = useCallback(
    async ({ forceRefreshToken }: { forceRefreshToken: boolean }) => {
      // Only fetch a token once Clerk has a complete session
      if (!isLoaded || !isSignedIn || !userId || !sessionId) {
        return null;
      }

      try {
        return await getToken({ template: "convex", skipCache: forceRefreshToken });
      } catch (error) {
        console.error("Error fetching access token:", error);
        return null;
      }
    },
    [isLoaded, isSignedIn, userId, sessionId, getToken]
  );

  return useMemo(
    () => ({
      isLoading: !isLoaded,
      isAuthenticated: isLoaded && !!isSignedIn && !!userId,
      fetchAccessToken,
    }),
    [isLoaded, isSignedIn, userId, fetchAccessToken]
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
        <ConvexProviderWithAuth client={convex} useAuth={useConvexAuthFromClerk}>
          <App />
        </ConvexProviderWithAuth>
      </ClerkProvider>
    </ErrorBoundary>
  </StrictMode>,
);
