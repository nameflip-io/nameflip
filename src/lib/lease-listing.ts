function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export interface LeaseListingData {
  domain: string;
  monthlyPrice: number;
  minTermMonths: number;
  depositAmount: number;
  buyPrice: number;
}

const MIN_TERMS = [1, 3, 6, 12];

export function getLeaseListingData(rawDomain: string): LeaseListingData {
  const domain = rawDomain.toLowerCase();
  const hash = hashString(domain);

  const monthlyPrice = 50 + (hash % 30) * 10;
  const minTermMonths = MIN_TERMS[hash % MIN_TERMS.length];
  const depositAmount = monthlyPrice * 2;
  const buyPrice = monthlyPrice * (14 + (hash % 12));

  return { domain, monthlyPrice, minTermMonths, depositAmount, buyPrice };
}
