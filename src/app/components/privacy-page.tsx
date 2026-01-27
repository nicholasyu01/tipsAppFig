import React from "react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Last updated: January 26, 2026
        </p>

        <p className="mb-4">
          Cashout ("we", "our", "us") respects your privacy. This Privacy Policy
          explains how we collect, use, and protect your personal information
          when you use our website and services.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">
          1. Information We Collect
        </h2>
        <ul className="list-disc pl-6 mb-4">
          <li>
            <strong>Account info:</strong> Name, email, and other contact
            information you provide.
          </li>
          <li>
            <strong>Transactions & tips:</strong> Data you submit related to
            restaurant tips and shifts.
          </li>
          <li>
            <strong>Usage data:</strong> Analytics, IP address, browser info,
            and cookies.
          </li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-2">
          2. How We Use Your Data
        </h2>
        <ul className="list-disc pl-6 mb-4">
          <li>To provide and improve our services.</li>
          <li>To communicate important account or service information.</li>
          <li>To analyze trends and improve app features.</li>
          <li>To comply with legal obligations.</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-2">
          3. Sharing Your Information
        </h2>
        <p className="mb-4">
          We do not sell your personal data. We may share data with:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>
            Third-party service providers for analytics or payment processing.
          </li>
          <li>Authorities if required by law.</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-2">
          4. Cookies & Tracking
        </h2>
        <p className="mb-4">
          We use cookies and similar technologies to improve user experience and
          track analytics. You can control cookies via your browser settings or
          via our cookie preferences.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">5. Your Rights</h2>
        <ul className="list-disc pl-6 mb-4">
          <li>Access your data</li>
          <li>Request correction or deletion</li>
          <li>Withdraw consent where applicable</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-2">6. Contact</h2>
        <p className="mb-6">
          If you have questions or complaints, email us at{" "}
          <a
            href="mailto:email.cashout.app@gmail.com"
            className="text-blue-600"
          >
            email.cashout.app@gmail.com
          </a>
          .
        </p>

        <p className="text-sm text-muted-foreground">
          Business location: British Columbia, Canada
        </p>
      </div>
    </div>
  );
}
