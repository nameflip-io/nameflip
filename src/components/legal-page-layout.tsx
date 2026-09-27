import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/logo";
import type { ReactNode } from "react";

export function LegalPageLayout({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-gray-900"
          >
            <ArrowLeft className="size-4" />
            Back to home
          </Link>
          <Link href="/">
            <Logo size="sm" />
          </Link>
        </div>

        <h1 className="mt-10 text-4xl font-bold text-gray-900">{title}</h1>
        <p className="mt-2 text-sm text-gray-500">Last updated: September 2026</p>

        <div className="mt-10 flex flex-col gap-8">{children}</div>
      </div>
    </div>
  );
}

export function LegalSection({
  heading,
  children,
}: {
  heading: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 className="text-xl font-semibold text-gray-900">{heading}</h2>
      <div className="mt-3 flex flex-col gap-3 text-sm leading-relaxed text-gray-600">
        {children}
      </div>
    </section>
  );
}
