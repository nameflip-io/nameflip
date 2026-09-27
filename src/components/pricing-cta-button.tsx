"use client";

import { Button } from "@/components/ui/button";
import { openUpgradeModal } from "@/components/upgrade-modal";

export function PricingCtaButton({
  label,
  highlighted,
}: {
  label: string;
  highlighted: boolean;
}) {
  return (
    <Button
      variant={highlighted ? "default" : "outline"}
      className="w-full"
      onClick={openUpgradeModal}
    >
      {label}
    </Button>
  );
}
