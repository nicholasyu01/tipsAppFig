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
import { Input } from "./ui/input";
import { ArrowLeft } from "lucide-react";

interface LeaveFeedbackPageProps {
  onBack: () => void;
}

export default function LeaveFeedbackPage({ onBack }: LeaveFeedbackPageProps) {
  const { user } = useUser();
  const navigate = useNavigate();
  const [comment, setComment] = useState("");
  const [email, setEmail] = useState(user?.email || "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [thanksOpen, setThanksOpen] = useState(false);

  const validate = () => {
    if (!user?.email) {
      setError("Email cannot be empty.");
      return false;
    }
    if (!comment.trim()) {
      setError("Feedback cannot be empty.");
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
        email: email,
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
    <div className="h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <Button onClick={onBack} variant="ghost" className="mb-4">
            <ArrowLeft className="size-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold mb-2">My Cashout</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>Leave Feedback</CardTitle>
              </div>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="feedback">Email</Label>
                  {(user?.email && (
                    <Input
                      id="email"
                      className="mt-2"
                      value={user?.email}
                      disabled
                    />
                  )) || (
                    <Input
                      id="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-2"
                    />
                  )}
                </div>
                <div>
                  <Label htmlFor="feedback">Feedback</Label>
                  <Textarea
                    id="feedback"
                    placeholder="Tell us what you like or what we can improve..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="mt-2"
                    rows={6}
                  />
                </div>

                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert variant={"positive"} className="mb-4">
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={submitting || comment.length === 0}
                    className="flex-1"
                  >
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
      </div>
    </div>
  );
}
