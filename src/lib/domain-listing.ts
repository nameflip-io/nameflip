export interface DomainListingData {
  domain: string;
  name: string;
  tld: string;
  tags: string[];
  hasFixedPrice: boolean;
  price: string | null;
  age: string;
  monthlySearches: string;
  backlinks: number;
  trend: string;
  estimatedValue: string;
  category: string;
  reasons: string[];
}

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

const CATEGORY_KEYWORDS: { keywords: string[]; category: string }[] = [
  { keywords: ["ai", "bot", "ml"], category: "AI / SaaS" },
  { keywords: ["health", "med", "wellness", "care"], category: "Health / Wellness" },
  { keywords: ["shop", "store", "market", "buy"], category: "E-commerce" },
  { keywords: ["pay", "fin", "bank", "cash", "invoice"], category: "Fintech" },
  { keywords: ["app", "tech", "dev", "cloud"], category: "Technology" },
];

function detectCategory(name: string): string {
  const lower = name.toLowerCase();
  for (const entry of CATEGORY_KEYWORDS) {
    if (entry.keywords.some((keyword) => lower.includes(keyword))) {
      return entry.category;
    }
  }
  return "Business / Brand";
}

const TAG_POOL = ["Brandable", "Short & Memorable", "High Growth Niche"];
const TREND_OPTIONS = ["↑ Growing", "↑ Surging", "→ Stable"];
const PRICE_OPTIONS = [1500, 2500, 3200, 4800, 6500, 9900];

export function getListingData(rawDomain: string): DomainListingData {
  const domain = rawDomain.toLowerCase();
  const dotIndex = domain.lastIndexOf(".");
  const name = dotIndex > 0 ? domain.slice(0, dotIndex) : domain;
  const tld = dotIndex > 0 ? domain.slice(dotIndex + 1) : "com";
  const hash = hashString(domain);
  const category = detectCategory(name);

  const tags = [`Premium .${tld}`];
  if (category !== "Business / Brand") {
    tags.push(`${category.split(" / ")[0]} Niche`);
  }
  tags.push(TAG_POOL[hash % TAG_POOL.length]);

  const hasFixedPrice = hash % 2 === 0;
  const price = hasFixedPrice
    ? `$${PRICE_OPTIONS[hash % PRICE_OPTIONS.length].toLocaleString()}`
    : null;

  const age = `${2 + (hash % 11)} years`;
  const monthlySearches = `${(200 + (hash % 48) * 50).toLocaleString()}/mo`;
  const backlinks = 20 + (hash % 28) * 10;
  const trend = TREND_OPTIONS[hash % TREND_OPTIONS.length];

  const low = 800 + (hash % 20) * 100;
  const high = low + 1200 + (hash % 15) * 200;
  const estimatedValue = `$${low.toLocaleString()}–$${high.toLocaleString()}`;

  const reasonPool: string[] = [];
  if (name.length <= 10) {
    reasonPool.push(
      "Short, memorable domain name that's easy to type and recall"
    );
  }
  if (tld === "com") {
    reasonPool.push(
      "Premium .com extension — the most trusted and recognized TLD worldwide"
    );
  }
  if (!/[-0-9]/.test(name)) {
    reasonPool.push("Clean spelling with no hyphens or numbers");
  }
  if (trend !== "→ Stable") {
    reasonPool.push(
      `${trend.replace("↑ ", "")} search trend signals rising buyer interest`
    );
  }
  if (category !== "Business / Brand") {
    reasonPool.push(`Strong fit for the fast-growing ${category} space`);
  }
  reasonPool.push(
    `${monthlySearches} searches per month show consistent buyer demand`
  );
  reasonPool.push(
    "Versatile branding potential across products, apps, or content sites"
  );
  reasonPool.push(
    "Clear, keyword-relevant name that supports strong SEO from day one"
  );

  return {
    domain,
    name,
    tld,
    tags: tags.slice(0, 3),
    hasFixedPrice,
    price,
    age,
    monthlySearches,
    backlinks,
    trend,
    estimatedValue,
    category,
    reasons: reasonPool.slice(0, 4),
  };
}
