import React, { use, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/app/components/ui/button";
import { MessageSquareHeart, Share } from "lucide-react";

export default function FooterLegal() {
  const navigate = useNavigate();
  const [copied, setCopied] = useState<boolean>(false);

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
          <Button variant={"ghost"} onClick={() => navigate("/feedback")}>
            <MessageSquareHeart className="size-4" />
            Feedback
          </Button>
          <Button
            variant="ghost"
            onClick={async () => {
              const url = "https://cashouttips.ca";
              const message = `Ever wonder what servers/bartender actually make? ${url}`;
              const msg = `I’ve been using CashOut to track my tips and see what people actually make in hospitality 👀 Check it out: ${url}`;
              const msg1 = `Hey! Checkout CashOut — track your tips and see real hospitality earnings data. ${url}`;
              try {
                await navigator.clipboard.writeText(msg);
                setCopied(true);
                window.setTimeout(() => setCopied(false), 3000);
              } catch (err) {
                // fallback: create temporary textarea
                const ta = document.createElement("textarea");
                ta.value = msg;
                document.body.appendChild(ta);
                ta.select();
                try {
                  document.execCommand("copy");
                  setCopied(true);
                  window.setTimeout(() => setCopied(false), 3000);
                } catch (e) {
                  console.error("Copy failed", e);
                }
                document.body.removeChild(ta);
              }
            }}
          >
            <Share className="size-4" />
            {copied ? "Copied!" : " Share"}
          </Button>
        </div>
      </div>
    </footer>
  );
}
