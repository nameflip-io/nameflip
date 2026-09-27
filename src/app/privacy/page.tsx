import type { Metadata } from "next";
import { LegalPageLayout, LegalSection } from "@/components/legal-page-layout";

export const metadata: Metadata = {
  title: "Privacy Policy — NameFlip",
  description: "How NameFlip collects, uses, and protects your data.",
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPageLayout title="Privacy Policy">
      <LegalSection heading="Information We Collect">
        <p>
          When you create a NameFlip account, we collect your email address
          and, if you provide one, your name. We also collect usage data —
          the searches you run, domains you save or analyze, and how you
          interact with the dashboard — so we can operate and improve the
          service.
        </p>
      </LegalSection>

      <LegalSection heading="How We Use Your Data">
        <p>
          We use your information to provide and improve NameFlip, process
          payments, send account-related emails (such as billing receipts or
          product updates), and provide customer support.
        </p>
        <p>
          We do not sell your personal data to third parties, ever.
        </p>
      </LegalSection>

      <LegalSection heading="Third-Party Services">
        <p>
          NameFlip relies on trusted third-party providers to operate:
        </p>
        <ul className="list-disc pl-5">
          <li>
            <span className="font-medium text-gray-800">Supabase</span> —
            authentication and database storage for your account and saved
            domains.
          </li>
          <li>
            <span className="font-medium text-gray-800">Stripe</span> —
            payment processing for Pro and Pro+ subscriptions. NameFlip never
            stores your card details directly.
          </li>
        </ul>
      </LegalSection>

      <LegalSection heading="Cookies">
        <p>
          We use cookies to keep you signed in and maintain your session.
          See our{" "}
          <a href="/cookies" className="text-blue-600 underline">
            Cookie Policy
          </a>{" "}
          for details.
        </p>
      </LegalSection>

      <LegalSection heading="Data Security">
        <p>
          We take reasonable technical and organizational measures to
          protect your data. No method of transmission or storage is
          completely secure, so we can&apos;t guarantee absolute security.
        </p>
      </LegalSection>

      <LegalSection heading="Your Rights">
        <p>
          You can access, update, or delete your account data at any time
          from your account settings, or by contacting us directly.
        </p>
      </LegalSection>

      <LegalSection heading="Contact Us">
        <p>
          Questions about this policy? Email us at{" "}
          <a
            href="mailto:nameflip.io@gmail.com"
            className="text-blue-600 underline"
          >
            nameflip.io@gmail.com
          </a>
          .
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
