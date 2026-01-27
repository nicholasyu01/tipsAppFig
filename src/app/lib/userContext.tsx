import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { supabase } from "@/app/lib/supabaseClient";

export type UserModel = {
  email?: string | null;
  id?: string | null;
};

type UserContextValue = {
  user: UserModel | null;
  setUser: React.Dispatch<React.SetStateAction<UserModel | null>>;
  initializing: boolean;
};

const UserContext = createContext<UserContextValue | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserModel | null>(null);
  const [initializing, setInitializing] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;

    // Get current session on mount and set user
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      const sessionUser = data?.session?.user;
      setUser(
        sessionUser
          ? { email: sessionUser.email ?? null, id: sessionUser.id ?? null }
          : null,
      );
      setInitializing(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_, authSession) => {
        if (!mounted) return;
        const sessionUser = authSession?.user;
        setUser(
          sessionUser
            ? { email: sessionUser.email ?? null, id: sessionUser.id ?? null }
            : null,
        );
        setInitializing(false);
      },
    );

    return () => {
      mounted = false;
      listener?.subscription.unsubscribe();
    };
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, initializing }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return ctx;
}

export default UserContext;
