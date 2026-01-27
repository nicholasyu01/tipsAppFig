import React, { useEffect, useState } from "react";

export default function CookieBanner() {
  const [accepted, setAccepted] = useState<boolean>(() => {
    try {
      return localStorage.getItem("cashout_cookie_accepted") === "1";
    } catch (e) {
      return false;
    }
  });

  useEffect(() => {
    try {
      if (accepted) localStorage.setItem("cashout_cookie_accepted", "1");
    } catch (e) {
      // ignore storage errors
    }
  }, [accepted]);

  if (accepted) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50">
      <div className="bg-gray-900 text-white rounded-lg shadow-lg p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="text-sm">
          We use cookies and similar technologies to improve your experience and
          analyze site usage. See our{" "}
          <a href="/privacy" className="underline text-white">
            Privacy Policy
          </a>
          .
        </div>
        <div className="flex items-center gap-2">
          <button
            className="bg-gray-700 text-white px-3 py-1 rounded-md"
            onClick={() => setAccepted(true)}
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
