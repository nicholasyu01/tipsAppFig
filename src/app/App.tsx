import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  useParams,
} from "react-router-dom";
import type { Session } from "@supabase/supabase-js";
import { Header } from "@/app/components/header";
import { HomePage } from "@/app/components/home-page";
import { RestaurantDetailPage } from "@/app/components/restaurant-detail-page";
import { SubmitPage } from "@/app/components/submit-page";
import { ComparePage } from "@/app/components/compare-page";
import { AuthPage } from "@/app/components/auth-page";
import ResetPasswordPage from "@/app/components/reset-password-page";
import LeaveFeedbackPage from "@/app/components/leave-feedback-page";
import PrivacyPage from "@/app/components/privacy-page";
import TermsPage from "@/app/components/terms-page";
import CookieBanner from "@/app/components/cookie-banner";
import FooterLegal from "@/app/components/footer-legal";
import ProtectedRoute from "@/app/components/protected-route";
import { Toaster } from "@/app/components/ui/sonner";
import { supabase } from "@/app/lib/supabaseClient";
import { UserProvider, useUser } from "@/app/lib/userContext";
import { MySubmissionsPage } from "./components/my-submissions-page";
import { type ShiftSubmission, mockShiftSubmissions } from "@/data/mockData";
import { Analytics } from "@vercel/analytics/react";

type View =
  | "home"
  | "restaurant"
  | "submit"
  | "compare"
  | "auth"
  | "feedback"
  | "my-submissions";

const viewToPath = (view: View) => {
  switch (view) {
    case "home":
      return "/";
    case "restaurant":
      return "/restaurant";
    case "submit":
      return "/submit";
    case "compare":
      return "/compare";
    case "auth":
      return "/auth";
    case "feedback":
      return "/feedack";
    case "my-submissions":
      return "/my-submissions";
    default:
      return "/";
  }
};
const protectedViews: View[] = ["submit", "my-submissions"];

export default function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <InnerApp />
      </UserProvider>
    </BrowserRouter>
  );
}

function InnerApp() {
  const navigate = useNavigate();
  const [pendingView, setPendingView] = useState<View | null>(null);
  const [userSubmissions, setUserSubmissions] =
    useState<ShiftSubmission[]>(mockShiftSubmissions);
  const { user, initializing } = useUser();
  const [restaurantAddress, setRestaurantAddress] = useState<
    string | undefined
  >(undefined);

  // Load submissions from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("userSubmissions");
    if (saved) {
      try {
        setUserSubmissions(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load submissions:", e);
      }
    }
  }, []);

  // Save submissions to localStorage whenever they change
  useEffect(() => {
    if (userSubmissions.length > 0) {
      localStorage.setItem("userSubmissions", JSON.stringify(userSubmissions));
    }
  }, [userSubmissions]);

  const handleNavigate = (view: View) => {
    // If auth state is still initializing, defer navigation until it's known
    if (initializing) {
      setPendingView(view);
      return;
    }

    if (protectedViews.includes(view) && !user) {
      setPendingView(view);
      navigate("/auth");
      return;
    }

    navigate(viewToPath(view));
  };

  useEffect(() => {
    // If a navigation was deferred while auth initializing, perform it now
    if (!initializing && pendingView) {
      const v = pendingView;
      setPendingView(null);
      if (protectedViews.includes(v) && !user) {
        navigate("/auth");
      } else {
        navigate(viewToPath(v));
      }
    }
  }, [initializing, pendingView, user, navigate]);

  const handleSelectRestaurant = (id: string, address?: string) => {
    setRestaurantAddress(address ?? undefined);
    navigate(`/restaurant/${id}/${address}`);
  };

  const handleAuthSuccess = () => {
    const nextView = pendingView ?? "home";
    setPendingView(null);
    navigate(viewToPath(nextView));
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleDeleteSubmission = (id: string) => {
    setUserSubmissions((s) => s.filter((sub) => sub.id !== id));
    const updated = userSubmissions.filter((sub) => sub.id !== id);
    if (updated.length === 0) {
      localStorage.removeItem("userSubmissions");
    } else {
      localStorage.setItem("userSubmissions", JSON.stringify(updated));
    }
  };

  return (
    <div className="h-full bg-gray-50">
      <Header
        currentView={"home"}
        onNavigate={handleNavigate}
        isAuthenticated={!!user}
        onAuthClick={() => handleNavigate("auth")}
        onSignOut={handleSignOut}
      />

      <Routes>
        <Route
          path="/"
          element={<HomePage onSelectRestaurant={handleSelectRestaurant} />}
        />
        <Route
          path="/restaurant/:id/:address"
          element={
            <RestaurantWrapper
              restaurantAddress={restaurantAddress}
              onBack={() => navigate("/")}
            />
          }
        />
        <Route
          path="/submit"
          element={
            <ProtectedRoute>
              <SubmitPage onBack={() => navigate("/")} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/compare"
          element={<ComparePage onBack={() => navigate("/")} />}
        />
        <Route
          path="/auth"
          element={<AuthPage onAuthSuccess={handleAuthSuccess} />}
        />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route
          path="/feedback"
          element={
            <ProtectedRoute>
              <LeaveFeedbackPage onBack={() => navigate("/")} />
            </ProtectedRoute>
          }
        />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route
          path="/my-submissions"
          element={
            <ProtectedRoute>
              <MySubmissionsPage
                onBack={() => navigate("/")}
                submissions={userSubmissions}
                onDeleteSubmission={handleDeleteSubmission}
              />
            </ProtectedRoute>
          }
        />
        <Route path="/analytics" element={<Analytics />} />
      </Routes>
      <CookieBanner />
      <FooterLegal />
      <Toaster />
    </div>
  );
}

function RestaurantWrapper({
  restaurantAddress,
  onBack,
}: {
  restaurantAddress?: string | undefined;
  onBack: () => void;
}) {
  const { id, address } = useParams();
  if (!id && !address) return null;
  return (
    <RestaurantDetailPage
      restaurantId={id}
      restaurantAddress={address}
      onBack={onBack}
    />
  );
}
