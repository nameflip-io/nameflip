import type { Metadata } from "next";
import { LegalPageLayout, LegalSection } from "@/components/legal-page-layout";

export const metadata: Metadata = {
  title: "Cookie Policy — NameFlip",
  description: "How NameFlip uses cookies.",
};

export default function CookiePolicyPage() {
  return (
    <LegalPageLayout title="Cookie Policy">
      <LegalSection heading="What Are Cookies">
        <p>
          Cookies are small text files stored on your device that help
          websites remember information about your visit.
        </p>
      </LegalSection>

      <LegalSection heading="Essential Cookies">
        <p>
          NameFlip uses essential cookies from Supabase to keep you signed
          in and maintain your session across the dashboard. These cookies
          are required for the service to work and can&apos;t be disabled.
        </p>
      </LegalSection>

      <LegalSection heading="Analytics Cookies">
        <p>
          We may use analytics cookies to understand how people use
          NameFlip — such as which features are most popular — so we can
          improve the product. These are optional.
        </p>
      </LegalSection>

      <LegalSection heading="How to Disable Cookies">
        <p>
          You can disable cookies in your browser&apos;s settings. Note that
          disabling essential cookies will prevent you from logging in or
          using the dashboard.
        </p>
      </LegalSection>

      <LegalSection heading="Contact Us">
        <p>
          Questions about our use of cookies? Email us at{" "}
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
