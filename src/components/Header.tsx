import { SignInButton, UserButton, useClerk } from "@clerk/clerk-react";
import { Authenticated, Unauthenticated } from "convex/react";
import { NotebookPen } from "lucide-react";
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="flex items-center justify-center gap-2 sm:justify-start">
          <img
            src="https://highlandscsb.org/wp-content/uploads/2012/10/favicon.png"
            alt="HCS Logo"
            className="w-6 h-6"
          />
          <h2 className="text-lg sm:text-xl font-semibold">HCS Case Management System</h2>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-end sm:gap-4">
          <Authenticated>
            <CompactModeToggle isCompact={isCompactMode} onToggle={onToggleCompactMode} />
          </Authenticated>
          <HotkeysButton onClick={onShowHelp} />
          <ThemeSwitcher />
          <Authenticated>
            <Button
              onClick={onToggleStickyNotes}
              variant={showStickyNotes ? "default" : "outline"}
              size="sm"
              className="gap-1"
            >
              <NotebookPen className="h-4 w-4" />
              Notes
            </Button>
            <Button onClick={onAddClient} size="sm">
              Add Consumer
            </Button>
            <Button onClick={() => void signOut()} variant="destructive" size="sm">
              Sign Out
            </Button>
            <UserButton />
          </Authenticated>
          <Unauthenticated>
            <SignInButton mode="modal">
              <Button size="sm">Sign In</Button>
            </SignInButton>
          </Unauthenticated>
        </div>
      </div>
    </header>
  );
}
