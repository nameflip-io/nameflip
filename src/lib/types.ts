export interface DomainAnalysis {
  opportunityScore: number;
  estimatedValue: { low: number; high: number };
  flipStrategy?: {
    buyPrice: number;
    listPrice: number;
    quickSalePrice: number;
    timeToSell: string;
    wherToSell: string;
  };
  comparableSales?: string;
  tags: string[];
  whyInteresting: string[];
  risks: string[];
  recommendedUse: "flip" | "build" | "seo" | "hold";
  searchTrend: "rising" | "stable" | "declining";
  niche: string;
  potentialBuyers?: string;
}

export interface DomainResult {
  domain: string;
  age: number;
  referringDomains: number;
  auctionPrice: number;
  tld: string;
  available?: boolean;
  registrationPrice?: number;
  analysis?: DomainAnalysis;
}

export type BudgetTier = "starter" | "growth" | "pro" | "expert";

export interface BudgetTierConfig {
  key: BudgetTier;
  label: string;
  emoji: string;
  buyRange: { low: number; high: number | null };
  sellRange: { low: number; high: number | null };
  description: string;
}

export const BUDGET_TIERS: BudgetTierConfig[] = [
  {
    key: "starter",
    label: "Starter",
    emoji: "🟢",
    buyRange: { low: 10, high: 50 },
    sellRange: { low: 100, high: 500 },
    description: "New to flipping — small bets, fast learning",
  },
  {
    key: "growth",
    label: "Growth",
    emoji: "🟡",
    buyRange: { low: 50, high: 500 },
    sellRange: { low: 500, high: 2000 },
    description: "Some experience — bigger swings, better margins",
  },
  {
    key: "pro",
    label: "Pro",
    emoji: "🔵",
    buyRange: { low: 500, high: 5000 },
    sellRange: { low: 2000, high: 20000 },
    description: "Serious investor — premium names, real capital",
  },
  {
    key: "expert",
    label: "Expert",
    emoji: "💎",
    buyRange: { low: 5000, high: null },
    sellRange: { low: 20000, high: null },
    description: "Deep pockets — ultra-premium and one-word domains",
  },
];

export interface SearchParams {
  query: string;
  category: "flip" | "build" | "seo" | "all";
  budget: BudgetTier;
  limit: number;
}
