import React from "react";
import { Link } from "react-router-dom";

export default function FooterLegal() {
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
        </div>
      </div>
    </footer>
  );
}
