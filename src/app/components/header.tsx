import {
  DollarSign,
  Search,
  PlusCircle,
  GitCompare,
  LogOut,
  User,
  FileText,
  Menu,
  X,
  MessageSquareHeart,
  Image,
} from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useUser } from "@/app/lib/userContext";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";

interface HeaderProps {
  currentView:
    | "home"
    | "restaurant"
    | "submit"
    | "compare"
    | "auth"
    | "my-submissions"
    | "feedback";
  onNavigate: (
    view:
      | "home"
      | "restaurant"
      | "submit"
      | "compare"
      | "auth"
      | "my-submissions"
      | "feedback",
  ) => void;
  isAuthenticated: boolean;
  onAuthClick: () => void;
  onSignOut: () => Promise<void> | void;
  submissionCount?: number;
}

function MobileMenu({
  currentView,
  onNavigate,
  isAuthenticated,
  onAuthClick,
  onSignOut,
  onClose,
}: {
  currentView: HeaderProps["currentView"];
  onNavigate: HeaderProps["onNavigate"];
  isAuthenticated: boolean;
  onAuthClick: () => void;
  onSignOut: () => Promise<void> | void;
  onClose: () => void;
}) {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const getActiveView = (path: string) => {
    if (path === "/") return "home";
    if (path.startsWith("/restaurant")) return "restaurant";
    if (path === "/submit") return "submit";
    if (path === "/compare") return "compare";
    if (path === "/auth") return "auth";
    if (path === "/feedback") return "feedback";
    if (path === "/my-submissions") return "my-submissions";
    return "home";
  };

  const activeView = getActiveView(location.pathname);

  const handleNavigate = (view: any) => {
    onNavigate(view);
    setOpen(false);
    onClose();
  };

  return (
    <div className="relative">
      <button
        aria-label="Open menu"
        aria-expanded={open}
        onClick={() => setOpen((s) => !s)}
        className="p-2 rounded-md hover:bg-gray-100"
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-md z-50">
          <div className="flex flex-col py-1">
            <button
              className={`text-left px-4 py-2 hover:bg-gray-50 ${
                activeView === "home" ? "bg-gray-100 font-semibold" : ""
              }`}
              onClick={() => handleNavigate("home")}
            >
              <div className="flex items-center gap-2">
                <Search className="size-4" />
                <span>Browse</span>
              </div>
            </button>

            <button
              className={`text-left px-4 py-2 hover:bg-gray-50 ${
                activeView === "submit" ? "bg-gray-100 font-semibold" : ""
              }`}
              onClick={() => handleNavigate("submit")}
            >
              <div className="flex items-center gap-2">
                <PlusCircle className="size-4" />
                <span>Cashout</span>
              </div>
            </button>

            <button
              className={`text-left px-4 py-2 hover:bg-gray-50 ${
                activeView === "my-submissions"
                  ? "bg-gray-100 font-semibold"
                  : ""
              }`}
              onClick={() => handleNavigate("my-submissions")}
            >
              <div className="flex items-center gap-2">
                <FileText className="size-4" />
                <span>History</span>
              </div>
            </button>

            <div className="border-t mt-1" />

            {isAuthenticated ? (
              <button
                className={`text-left px-4 py-2 hover:bg-gray-50 ${
                  activeView === "auth" ? "bg-gray-100 font-semibold" : ""
                }`}
                onClick={() => {
                  setOpen(false);
                  onSignOut();
                  onClose();
                }}
              >
                <div className="flex items-center gap-2">
                  <LogOut className="size-4" />
                  <span>Log out</span>
                </div>
              </button>
            ) : (
              <button
                className={`text-left px-4 py-2 hover:bg-gray-50 ${
                  activeView === "auth" ? "bg-gray-100 font-semibold" : ""
                }`}
                onClick={() => {
                  setOpen(false);
                  onAuthClick();
                  onClose();
                }}
              >
                <div className="flex items-center gap-2">
                  <User className="size-4" />
                  <span>Sign in</span>
                </div>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function Header({
  currentView,
  onNavigate,
  isAuthenticated,
  onAuthClick,
  onSignOut,
  submissionCount = 0,
}: HeaderProps) {
  const { user } = useUser();
  const location = useLocation();
  const navigate = useNavigate();

  const getActiveView = (path: string) => {
    if (path === "/") return "home";
    if (path.startsWith("/restaurant")) return "restaurant";
    if (path === "/submit") return "submit";
    if (path === "/compare") return "compare";
    if (path === "/auth") return "auth";
    if (path === "/feedback") return "feedback";
    if (path === "/my-submissions") return "my-submissions";
    return "home";
  };

  const activeView = getActiveView(location.pathname);
  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => onNavigate("home")}
            className="flex items-center text-xl font-semibold hover:opacity-100 transition-opacity"
          >
            <img src="/cashout-logo2.png" alt="Ca$hOut" className="h-12 w-12" />
            <img src="/cashout-logo3.png" alt="Ca$hOut" className="" />

            {/* <DollarSign className="size-6 text-green-600" /> */}
            {/* <span>Ca$hOut</span> */}
          </button>

          <div className="flex items-center gap-3">
            {/* Desktop nav: hidden on small screens */}
            <nav className="hidden sm:flex items-end gap-2">
              <Button
                variant={activeView === "home" ? "default" : "ghost"}
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
                variant={activeView === "submit" ? "default" : "ghost"}
                onClick={() => onNavigate("submit")}
                className="gap-2"
              >
                <PlusCircle className="size-4" />
                <span className="hidden sm:inline">Submit</span>
              </Button>
              <Button
                variant={activeView === "my-submissions" ? "default" : "ghost"}
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
              <div>
                {isAuthenticated ? (
                  <Button
                    variant={activeView === "auth" ? "default" : "ghost"}
                    className="gap-2"
                    onClick={() => onSignOut()}
                  >
                    <LogOut className="size-4" />
                    <span className="hidden sm:inline">Log out</span>
                  </Button>
                ) : (
                  <Button
                    variant={activeView === "auth" ? "default" : "ghost"}
                    className="gap-2"
                    onClick={onAuthClick}
                  >
                    <User className="size-4" />
                    <span className="hidden sm:inline">Log in</span>
                  </Button>
                )}
              </div>
            </nav>
            {/* Mobile hamburger menu */}
            <div className="sm:hidden relative">
              <MobileMenu
                currentView={currentView}
                onNavigate={onNavigate}
                isAuthenticated={isAuthenticated}
                onAuthClick={onAuthClick}
                onSignOut={onSignOut}
                onClose={() => {}}
              />
            </div>
            {/* {isAuthenticated && user?.email && (
              <Badge variant="outline" className="hidden sm:inline-flex">
                {user.email}
              </Badge>
            )} */}
          </div>
        </div>
      </div>
    </header>
  );
}
