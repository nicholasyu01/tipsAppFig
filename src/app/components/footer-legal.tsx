import React, { use } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/app/components/ui/button";
import { MessageSquareHeart } from "lucide-react";

export default function FooterLegal() {
  const navigate = useNavigate();
  return (
    <footer className="border-t bg-white">
      <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between">
        <div className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Cashout
        </div>
        <div className="flex items-center gap-4 mt-2 md:mt-0">
          <Link
            to="/privacy"
            className="text-sm text-muted-foreground hover:underline"
          >
            Privacy
          </Link>
          <Link
            to="/terms"
            className="text-sm text-muted-foreground hover:underline"
          >
            Terms
          </Link>
          <Button
            variant={"ghost"}
            onClick={() => navigate("/feedback")}
            className="gap-2"
          >
            <MessageSquareHeart className="size-4" />
          </Button>
        </div>
      </div>
    </footer>
  );
}
