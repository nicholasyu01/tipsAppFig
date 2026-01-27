import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Alert, AlertDescription } from "./ui/alert";
import { supabase } from "../lib/supabaseClient";
import { useUser } from "@/app/lib/userContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "./ui/dialog";

export default function LeaveFeedbackPage() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [thanksOpen, setThanksOpen] = useState(false);

  const validate = () => {
    if (!user?.email) {
      setError("You must be signed in to leave feedback.");
      return false;
    }
    if (!comment.trim()) {
      setError("Feedback comment cannot be empty.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    setSuccess(null);

    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        email: user?.email ?? null,
        comment: comment.trim(),
        created_at: new Date().toISOString(),
      } as any;

      const { data, error: insertError } = await supabase
        .from("feedback")
        .insert([payload]);

      if (insertError) {
        console.error("Feedback insert error:", insertError);
        setError(insertError.message || "Failed to submit feedback.");
        return;
      }

      setSuccess("Thanks — your feedback was submitted.");
      setComment("");
      // show thanks modal instead of navigating away
      setThanksOpen(true);
    } catch (err: any) {
      console.error(err);
      setError((err?.message ?? String(err)) || "Unexpected error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <CardTitle>Leave Feedback</CardTitle>
        </CardHeader>

        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-4">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="feedback">Your feedback</Label>
              <Textarea
                id="feedback"
                placeholder="Tell us what you like or what we can improve..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={6}
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={submitting} className="flex-1">
                {submitting ? "Submitting..." : "Submit"}
              </Button>
              <Button
                variant="ghost"
                onClick={() => navigate(-1)}
                type="button"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      <Dialog open={thanksOpen} onOpenChange={setThanksOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thanks for your feedback</DialogTitle>
            <DialogDescription>
              We appreciate your input — it helps us improve the app.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              onClick={() => {
                setThanksOpen(false);
              }}
            >
              Close
            </Button>
          </DialogFooter>
          <DialogClose />
        </DialogContent>
      </Dialog>
    </div>
  );
}
