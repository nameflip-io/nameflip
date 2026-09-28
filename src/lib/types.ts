export interface DomainAnalysis {
  opportunityScore: number;
  estimatedValue: { low: number; high: number };
  tags: string[];
  whyInteresting: string[];
  risks: string[];
  recommendedUse: "flip" | "build" | "seo" | "hold";
  searchTrend: "rising" | "stable" | "declining";
  niche: string;
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

export type DomainCategory = "all" | "com" | "io" | "net" | "co" | "org";

export interface SearchParams {
  query: string;
  category: DomainCategory;
  limit: number;
}
