import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";

const ECB_URL = "https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml";

let cachedRates: Record<string, number> | null = null;
let cacheTimestamp: number | null = null;
const CACHE_DURATION = 3600000;

async function fetchECBRates(): Promise<Record<string, number> | null> {
  try {
    const response = await fetch(ECB_URL);
    const xmlText = await response.text();
    const rates: Record<string, number> = {};
    const cubeRegex = /<Cube currency="([^"]+)" rate="([^"]+)"\/>/gi;
    let match;
    
    while ((match = cubeRegex.exec(xmlText)) !== null) {
      rates[match[1]] = parseFloat(match[2]);
    }
    
    return rates;
  } catch (error) {
    console.error("Forexify Proxy: Failed to fetch ECB rates:", error);
    return null;
  }
}

export async function loader({ request }: LoaderFunctionArgs) {
  // Verify request is from valid shop
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");
  
  if (!shop) {
    return json({ error: "Missing shop parameter" }, { status: 400 });
  }
  
  const currencies = url.searchParams.get("currencies")?.split(",") || [];
  const now = Date.now();
  
  // Check cache
  if (cachedRates && cacheTimestamp && (now - cacheTimestamp) < CACHE_DURATION) {
    const filtered = currencies.length > 0
      ? Object.fromEntries(currencies.filter(c => c in cachedRates!).map(c => [c, cachedRates![c]]))
      : cachedRates;
    
    return json({ rates: filtered, cached: true, source: "ECB" });
  }
  
  // Fetch fresh
  const rates = await fetchECBRates();
  
  if (rates) {
    cachedRates = rates;
    cacheTimestamp = now;
    
    const filtered = currencies.length > 0
      ? Object.fromEntries(currencies.filter(c => c in rates).map(c => [c, rates[c]]))
      : rates;
    
    return json({ rates: filtered, cached: false, source: "ECB" });
  }
  
  // Fallback
  if (cachedRates) {
    const filtered = currencies.length > 0
      ? Object.fromEntries(currencies.filter(c => c in cachedRates!).map(c => [c, cachedRates![c]]))
      : cachedRates;
    
    return json({ rates: filtered, cached: true, stale: true, source: "ECB" });
  }
  
  return json({ error: "Service unavailable" }, { status: 503 });
}
