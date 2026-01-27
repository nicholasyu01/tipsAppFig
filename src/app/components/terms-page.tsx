import React from "react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Last updated: January 26, 2026
        </p>

        <p className="mb-4">
          Welcome to Cashout ("we", "our", "us"). By using our website or
          services, you agree to these Terms of Service.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">1. Eligibility</h2>
        <p className="mb-4">
          You must be at least 18 years old to use Cashout.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">
          2. Account Responsibility
        </h2>
        <p className="mb-4">
          You are responsible for keeping your account information secure and
          accurate.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">3. Data Submission</h2>
        <p className="mb-4">
          You may submit tip or shift data. You agree to provide accurate
          information. Cashout is not liable for incorrect data submitted by
          users.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">
          4. Prohibited Conduct
        </h2>
        <ul className="list-disc pl-6 mb-4">
          <li>Use the site for illegal activities</li>
          <li>Submit false or fraudulent data</li>
          <li>Attempt to hack or interfere with our services</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-2">
          5. Limitation of Liability
        </h2>
        <p className="mb-4">
          Cashout is provided "as is". We are not responsible for financial
          loss, errors, or omissions in user-submitted data.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">6. Changes to Terms</h2>
        <p className="mb-4">
          We may update these Terms. Changes take effect when posted on the
          site.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">7. Governing Law</h2>
        <p className="mb-4">
          These Terms are governed by the laws of British Columbia, Canada.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">
          8. Financial Disclaimer
        </h2>
        <p className="mb-4">
          Cashout is a tip tracking tool and does not provide financial advice.
          Users are responsible for any financial decisions they make based on
          information from the Service.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">9. Contact</h2>
        <p className="mb-6">
          Email us at{" "}
          <a
            href="mailto:email.cashout.app@gmail.com"
            className="text-blue-600"
          >
            email.cashout.app@gmail.com
          </a>{" "}
          for questions.
        </p>
      </div>
    </div>
  );
}
