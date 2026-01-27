import { FormEvent, useState } from "react";
import { Loader2, Mail, Lock, LogIn, UserPlus } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Alert, AlertDescription } from "./ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "./ui/dialog";

type AuthMode = "signin" | "signup";

interface AuthPageProps {
  onAuthSuccess?: () => void;
}

export function AuthPage({ onAuthSuccess }: AuthPageProps) {
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsLoading(true);

    let result;
    if (mode === "signin") {
      result = await supabase.auth.signInWithPassword({ email, password });
    } else {
      // pass name in user metadata when signing up
      result = await supabase.auth.signUp({
        email,
        password,
        options: { data: { display_name: name } },
      });
    }

    const { error: authError, data } = result;

    if (authError) {
      setError(authError.message);
    } else {
      if (mode === "signup" && !data.session) {
        setMessage("Check your email to confirm your account.");
      }

      if (data.session) {
        setMessage("You are signed in.");
        onAuthSuccess?.();
      }
    }

    setIsLoading(false);
  };

  const handleForgotPassword = async () => {
    setError(null);
    setMessage(null);
    if (!email) {
      setError(
        "Please enter your email above to receive a password reset link.",
      );
      return false;
    }

    // Separate loading state for forgot-password flow so it doesn't block sign-in UI
    setForgotLoading(true);
    try {
      // Supabase v2: send password reset email
      const { data: resetData, error: resetError } =
        await supabase.auth.resetPasswordForEmail(email, {
          // Optionally redirect back to the app after reset
          redirectTo: window.location.origin + "/reset-password",
        });

      if (resetError) {
        // 500 errors can indicate SMTP or project config problems. Surface code if available.
        const code = (resetError as any)?.status ?? (resetError as any)?.code;
        if (code === 500) {
          setError(
            "Server error sending reset email. Check your Supabase SMTP configuration and project logs.",
          );
        } else {
          setError(resetError.message || "Failed to send reset email.");
        }
        return false;
      }

      setMessage(
        "If an account exists for that email, a reset link has been sent.",
      );
      return true;
    } catch (err: any) {
      console.error("Unexpected error sending reset email:", err);
      setError(err?.message ?? String(err));
      return false;
    } finally {
      setForgotLoading(false);
    }
  };

  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  // helper to run reset and close the dialog on success
  const sendResetAndClose = async () => {
    const ok = await handleForgotPassword();
    if (ok) setForgotOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md shadow-md">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl font-bold">
            {mode === "signin" ? "Sign in" : "Create an account"}
          </CardTitle>
          {/* <CardDescription>
            Access TipTransparency to submit and compare earnings.
          </CardDescription> */}
        </CardHeader>

        <CardContent>
          <div className="flex gap-2 mb-6">
            <Button
              type="button"
              variant={mode === "signin" ? "default" : "outline"}
              className="w-1/2"
              onClick={() => setMode("signin")}
            >
              <LogIn className="size-4 mr-2" />
              Sign in
            </Button>
            <Button
              type="button"
              variant={mode === "signup" ? "default" : "outline"}
              className="w-1/2"
              onClick={() => setMode("signup")}
            >
              <UserPlus className="size-4 mr-2" />
              Sign up
            </Button>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {mode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <div className="relative">
                  <Mail className="size-4 absolute left-3 top-3 text-gray-400" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10"
                    required={mode === "signup"}
                  />
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="size-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="size-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {message && !error && (
              <Alert variant="positive" className="mb-4">
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            {mode === "signin" && (
              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-sm text-muted-foreground underline hover:text-gray-700"
                  onClick={() => setForgotOpen(true)}
                  disabled={isLoading}
                >
                  Forgot password?
                </button>

                <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Reset your password</DialogTitle>
                      <DialogDescription>
                        Enter your email to receive a password reset link.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="reset-email">Email</Label>
                        <Input
                          id="reset-email"
                          type="email"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full"
                        />
                      </div>
                    </div>

                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setForgotOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button onClick={sendResetAndClose} disabled={isLoading}>
                        Send reset link
                      </Button>
                    </DialogFooter>
                    <DialogClose />
                  </DialogContent>
                </Dialog>
              </div>
            )}

            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="size-4 mr-2 animate-spin" />}
              {mode === "signin" ? "Sign in" : "Create account"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="text-sm text-muted-foreground text-center justify-center">
          By continuing you agree to receive emails related to your account.
        </CardFooter>
      </Card>
    </div>
  );
}
