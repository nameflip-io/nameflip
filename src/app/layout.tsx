import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { UpgradeModal } from "@/components/upgrade-modal";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NameFlip — Find Domains Worth Buying, Before Everyone Else",
  description:
    "AI scans thousands of domains daily and tells you exactly which ones are worth buying, flipping, or building on.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", geistMono.variable, "font-sans", geist.variable)}
    >
      <body className="min-h-full flex flex-col bg-background">
        {children}
        <UpgradeModal />
      </body>
    </html>
  );
}
