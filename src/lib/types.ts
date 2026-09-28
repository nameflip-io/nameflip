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

export interface SearchParams {
  query: string;
  category: "flip" | "build" | "seo" | "all";
  limit: number;
}
