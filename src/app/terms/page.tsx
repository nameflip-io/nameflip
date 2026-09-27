import type { Metadata } from "next";
import { LegalPageLayout, LegalSection } from "@/components/legal-page-layout";

export const metadata: Metadata = {
  title: "Terms of Service — NameFlip",
  description: "The terms governing your use of NameFlip.",
};

export default function TermsOfServicePage() {
  return (
    <LegalPageLayout title="Terms of Service">
      <LegalSection heading="Acceptance of Terms">
        <p>
          By creating an account or using NameFlip, you agree to these Terms
          of Service. If you don&apos;t agree, please don&apos;t use the
          service.
        </p>
      </LegalSection>

      <LegalSection heading="Eligibility">
        <p>
          You must be at least 18 years old to use NameFlip. By using the
          service, you confirm that you meet this requirement.
        </p>
      </LegalSection>

      <LegalSection heading="Use of the Service">
        <p>
          NameFlip is provided &quot;as is&quot; and &quot;as
          available,&quot; without warranties of any kind. We provide domain
          research and AI analysis to help inform your decisions, but we
          don&apos;t guarantee the accuracy of any score, valuation, or
          resale outcome.
        </p>
        <p>
          You may not use NameFlip for any illegal purpose, including but
          not limited to trademark infringement, cybersquatting, fraud, or
          acquiring domains for illegal content or activity.
        </p>
      </LegalSection>

      <LegalSection heading="Subscriptions & Billing">
        <p>
          NameFlip offers Free, Pro, and Pro+ plans. Paid subscriptions are
          billed monthly through Stripe and renew automatically until
          cancelled.
        </p>
      </LegalSection>

      <LegalSection heading="Cancellation">
        <p>
          You can cancel your Pro or Pro+ subscription at any time from your
          account settings. Your access continues until the end of your
          current billing period, and you won&apos;t be charged again after
          cancelling.
        </p>
      </LegalSection>

      <LegalSection heading="Limitation of Liability">
        <p>
          To the maximum extent permitted by law, NameFlip is not liable for
          any indirect, incidental, or consequential damages arising from
          your use of the service, including losses related to domain
          purchases or sales.
        </p>
      </LegalSection>

      <LegalSection heading="Governing Law">
        <p>
          These terms are governed by the laws of Estonia, without regard to
          conflict-of-law principles.
        </p>
      </LegalSection>

      <LegalSection heading="Contact Us">
        <p>
          Questions about these terms? Email us at{" "}
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
