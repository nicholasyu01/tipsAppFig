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
import { Toaster } from "@/app/components/ui/sonner";
import { supabase } from "@/app/lib/supabaseClient";
import { UserProvider, useUser } from "@/app/lib/userContext";
import { MySubmissionsPage } from "./components/my-submissions-page";
import { type ShiftSubmission, mockShiftSubmissions } from "@/data/mockData";

type View =
  | "home"
  | "restaurant"
  | "submit"
  | "compare"
  | "auth"
  | "leave-feedback"
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
    case "leave-feedback":
      return "/leave-feedack";
    case "my-submissions":
      return "/my-submissions";
    default:
      return "/";
  }
};
const protectedViews: View[] = ["submit", "my-submissions", "leave-feedback"];

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
  const [session, setSession] = useState<Session | null>(null);
  const [pendingView, setPendingView] = useState<View | null>(null);
  const [userSubmissions, setUserSubmissions] =
    useState<ShiftSubmission[]>(mockShiftSubmissions);
  const { setUser } = useUser();
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

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null);
      // synchronize global user context
      setUser(
        data.session && data.session.user
          ? {
              email: data.session.user.email ?? null,
              id: data.session.user.id ?? null,
            }
          : null,
      );
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event: any, authSession: any) => {
        setSession(authSession ?? null);
        setUser(
          authSession && authSession.user
            ? {
                email: authSession.user.email ?? null,
                id: authSession.user.id ?? null,
              }
            : null,
        );
      },
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const handleNavigate = (view: View) => {
    if (protectedViews.includes(view) && !session) {
      setPendingView(view);
      navigate("/auth");
      return;
    }

    navigate(viewToPath(view));
  };

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
    <div className="min-h-screen bg-gray-50">
      <Header
        currentView={"home"}
        onNavigate={handleNavigate}
        isAuthenticated={!!session}
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
          element={<SubmitPage onBack={() => navigate("/")} />}
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
        <Route path="/feedback" element={<LeaveFeedbackPage />} />
        <Route
          path="/my-submissions"
          element={
            <MySubmissionsPage
              onBack={() => navigate("/")}
              submissions={userSubmissions}
              onDeleteSubmission={handleDeleteSubmission}
            />
          }
        />
      </Routes>

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
