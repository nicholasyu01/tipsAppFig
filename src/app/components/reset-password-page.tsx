import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import { useNavigate } from "react-router-dom";

function parseTokensFromUrl() {
  try {
    // Look in hash (e.g., #access_token=...&refresh_token=...)
    const hash = window.location.hash;
    if (hash && hash.includes("access_token")) {
      const params = new URLSearchParams(hash.replace(/^#/, ""));
      return {
        access_token: params.get("access_token") ?? undefined,
        refresh_token: params.get("refresh_token") ?? undefined,
      };
    }

    // Look in query params as a fallback
    const q = new URLSearchParams(window.location.search);
    return {
      access_token: q.get("access_token") ?? undefined,
      refresh_token: q.get("refresh_token") ?? undefined,
    };
  } catch (err) {
    return { access_token: undefined, refresh_token: undefined };
  }
}

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tokensSet, setTokensSet] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Attempt to set session if tokens are in URL so updateUser will work
    const { access_token, refresh_token } = parseTokensFromUrl();
    if (access_token) {
      // supabase.auth.setSession exists in v2
      (async () => {
        try {
          // @ts-ignore - setSession may be present depending on supabase-js version
          const { error: setErr } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });
          if (setErr) {
            console.warn("Failed to set session from URL:", setErr);
            setError("Failed to initialize session from reset link.");
          } else {
            setTokensSet(true);
            setMessage("Session initialized. You can set a new password.");
          }
        } catch (err) {
          console.error(err);
          setError("Failed to process reset link.");
        }
      })();
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      // Attempt to update the user's password. This requires an active session.
      const { data, error: updateError } = await supabase.auth.updateUser({
        password,
      } as any);

      if (updateError) {
        console.error("updateUser error:", updateError);
        setError(
          updateError.message ||
            "Failed to update password. Try the reset link again.",
        );
      } else {
        setMessage("Password updated successfully. You can now sign in.");
        // Navigate to sign-in after a short delay
        setTimeout(() => navigate("/auth"), 1500);
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message ?? String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>Reset Password</CardTitle>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Enter a new password for your account. If you opened this page
              from the reset email link, the session will be initialized
              automatically.
            </p>
          </CardContent>
        </CardHeader>

        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {message && !error && (
            <Alert className="mb-4">
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="confirm">Confirm Password</Label>
              <Input
                id="confirm"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="flex-1" disabled={loading}>
                Save new password
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
