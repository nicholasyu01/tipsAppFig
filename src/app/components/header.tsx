import {
  DollarSign,
  Search,
  PlusCircle,
  GitCompare,
  LogOut,
  User,
  FileText,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";

interface HeaderProps {
  currentView:
    | "home"
    | "restaurant"
    | "submit"
    | "compare"
    | "auth"
    | "my-submissions";
  onNavigate: (
    view:
      | "home"
      | "restaurant"
      | "submit"
      | "compare"
      | "auth"
      | "my-submissions",
  ) => void;
  isAuthenticated: boolean;
  userEmail?: string | null;
  onAuthClick: () => void;
  onSignOut: () => Promise<void> | void;
  submissionCount?: number;
}

export function Header({
  currentView,
  onNavigate,
  isAuthenticated,
  userEmail,
  onAuthClick,
  onSignOut,
  submissionCount = 0,
}: HeaderProps) {
  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => onNavigate("home")}
            className="flex items-center gap-2 text-xl font-semibold hover:opacity-80 transition-opacity"
          >
            <DollarSign className="size-6 text-green-600" />
            <span>Ca$hOut</span>
          </button>

          <nav className="flex items-center gap-2">
            <Button
              variant={currentView === "home" ? "default" : "ghost"}
              onClick={() => onNavigate("home")}
              className="gap-2"
            >
              <Search className="size-4" />
              <span className="hidden sm:inline">Browse</span>
            </Button>

            {/* <Button
              variant={currentView === "compare" ? "default" : "ghost"}
              onClick={() => onNavigate("compare")}
              className="gap-2"
            >
              <GitCompare className="size-4" />
              <span className="hidden sm:inline">Compare</span>
            </Button> */}

            <Button
              variant={currentView === "submit" ? "default" : "ghost"}
              onClick={() => onNavigate("submit")}
              className="gap-2"
            >
              <PlusCircle className="size-4" />
              <span className="hidden sm:inline">My Cashout</span>
            </Button>
            <Button
              variant={currentView === "my-submissions" ? "default" : "ghost"}
              onClick={() => onNavigate("my-submissions")}
              className="gap-2 relative"
            >
              <FileText className="size-4" />
              <span className="hidden sm:inline">History</span>
              {/* {submissionCount > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-1 px-1.5 py-0 text-xs h-5 min-w-5"
                >
                  {submissionCount}
                </Badge>
              )} */}
            </Button>
          </nav>

          <div className="flex items-center gap-3">
            {isAuthenticated && userEmail && (
              <Badge variant="outline" className="hidden sm:inline-flex">
                {userEmail}
              </Badge>
            )}

            {isAuthenticated ? (
              <Button
                variant="ghost"
                className="gap-2"
                onClick={() => onSignOut()}
              >
                <LogOut className="size-4" />
                <span className="hidden sm:inline">Sign out</span>
              </Button>
            ) : (
              <Button
                variant={currentView === "auth" ? "default" : "ghost"}
                className="gap-2"
                onClick={onAuthClick}
              >
                <User className="size-4" />
                <span className="hidden sm:inline">Sign in</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
