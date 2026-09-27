import type { Metadata } from "next";
import { Dashboard } from "@/components/dashboard";

export const metadata: Metadata = {
  title: "Dashboard — NameFlip",
  description:
    "Search, analyze, and track domain opportunities with NameFlip.",
};

export default function DashboardPage() {
  return <Dashboard />;
}
