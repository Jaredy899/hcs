import { SignInButton, UserButton, useClerk } from "@clerk/clerk-react";
import { Authenticated, Unauthenticated } from "convex/react";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "../ThemeSwitcher";
import { HotkeysButton } from "./HotkeysHelp";
import { CompactModeToggle } from "../CompactModeToggle";

interface HeaderProps {
  showStickyNotes: boolean;
  onToggleStickyNotes: () => void;
  onAddClient: () => void;
  onShowHelp: () => void;
  isCompactMode: boolean;
  onToggleCompactMode: () => void;
}

export function Header({
  showStickyNotes,
  onToggleStickyNotes,
  onAddClient,
  onShowHelp,
  isCompactMode,
  onToggleCompactMode,
}: HeaderProps) {
  const { signOut } = useClerk();

  return (
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
              onClick={onToggleStickyNotes}
              variant={showStickyNotes ? "default" : "outline"}
              size="sm"
              className="text-xs"
            >
              📝 Notes
            </Button>
            <Button
              onClick={onAddClient}
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
              onToggle={onToggleCompactMode}
            />
          </Authenticated>
          <HotkeysButton onClick={onShowHelp} />
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
              onToggle={onToggleCompactMode}
            />
          </Authenticated>
          <HotkeysButton onClick={onShowHelp} />
          <ThemeSwitcher />
          <Authenticated>
            <Button
              onClick={onToggleStickyNotes}
              variant={showStickyNotes ? "default" : "outline"}
            >
              📝 Notes
            </Button>
            <Button onClick={onAddClient}>
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
  );
}
