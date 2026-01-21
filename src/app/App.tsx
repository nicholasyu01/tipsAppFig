import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { Header } from "@/app/components/header";
import { HomePage } from "@/app/components/home-page";
import { RestaurantDetailPage } from "@/app/components/restaurant-detail-page";
import { SubmitPage } from "@/app/components/submit-page";
import { ComparePage } from "@/app/components/compare-page";
import { AuthPage } from "@/app/components/auth-page";
import { Toaster } from "@/app/components/ui/sonner";
import { supabase } from "@/app/lib/supabaseClient";
import { MySubmissionsPage } from "./components/my-submissions-page";
import { type ShiftSubmission, mockShiftSubmissions } from "@/data/mockData";

type View =
  | "home"
  | "restaurant"
  | "submit"
  | "compare"
  | "auth"
  | "my-submissions";
const protectedViews: View[] = ["submit", "my-submissions"];

export default function App() {
  const [currentView, setCurrentView] = useState<View>("home");
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<
    string | null
  >(null);
  const [session, setSession] = useState<Session | null>(null);
  const [pendingView, setPendingView] = useState<View | null>(null);
  const [userSubmissions, setUserSubmissions] =
    useState<ShiftSubmission[]>(mockShiftSubmissions);

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

  const handleDeleteSubmission = (id: string) => {
    setUserSubmissions(userSubmissions.filter((sub) => sub.id !== id));
    // Also update localStorage
    const updated = userSubmissions.filter((sub) => sub.id !== id);
    if (updated.length === 0) {
      localStorage.removeItem("userSubmissions");
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, authSession) => {
        setSession(authSession ?? null);
      },
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const handleNavigate = (view: View) => {
    if (protectedViews.includes(view) && !session) {
      setPendingView(view);
      setCurrentView("auth");
      return;
    }

    setCurrentView(view);
  };

  const handleSelectRestaurant = (restaurantId: string) => {
    setSelectedRestaurantId(restaurantId);
    setCurrentView("restaurant");
  };

  const handleBackToHome = () => {
    setCurrentView("home");
    setSelectedRestaurantId(null);
  };

  const handleAuthSuccess = () => {
    const nextView = pendingView ?? "home";
    setPendingView(null);
    setCurrentView(nextView);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setCurrentView("home");
    setSelectedRestaurantId(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        currentView={currentView}
        onNavigate={handleNavigate}
        isAuthenticated={!!session}
        userEmail={session?.user.email}
        onAuthClick={() => handleNavigate("auth")}
        onSignOut={handleSignOut}
      />

      {currentView === "auth" ? (
        <AuthPage onAuthSuccess={handleAuthSuccess} />
      ) : (
        <>
          {currentView === "home" && (
            <HomePage onSelectRestaurant={handleSelectRestaurant} />
          )}

          {currentView === "restaurant" && selectedRestaurantId && (
            <RestaurantDetailPage
              restaurantId={selectedRestaurantId}
              onBack={handleBackToHome}
            />
          )}

          {currentView === "submit" && <SubmitPage onBack={handleBackToHome} />}

          {currentView === "compare" && (
            <ComparePage onBack={handleBackToHome} />
          )}
          {currentView === "my-submissions" && (
            <MySubmissionsPage
              onBack={handleBackToHome}
              submissions={userSubmissions}
              onDeleteSubmission={handleDeleteSubmission}
            />
          )}
        </>
      )}

      <Toaster />
    </div>
  );
}
