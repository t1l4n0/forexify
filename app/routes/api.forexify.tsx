import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";

const ECB_URL = "https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml";

// Cache
let cachedRates: Record<string, number> | null = null;
let cacheTimestamp: number | null = null;
const CACHE_DURATION = 3600000; // 1 hour

const ALL_CURRENCIES = [
  "USD", "JPY", "BGN", "CZK", "DKK", "GBP", "HUF", "PLN", "RON", 
  "SEK", "CHF", "ISK", "NOK", "HRK", "RUB", "TRY", "AUD", "BRL", 
  "CAD", "CNY", "HKD", "IDR", "ILS", "INR", "KRW", "MXN", "MYR", 
  "NZD", "PHP", "SGD", "THB", "ZAR"
];

async function fetchECBRates(): Promise<Record<string, number> | null> {
  try {
    const response = await fetch(ECB_URL, {
      headers: { "Accept": "application/xml" }
    });
    
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const xmlText = await response.text();
    const rates: Record<string, number> = {};
    
    // Parse all Cube entries
    const cubeRegex = /<Cube currency="([^"]+)" rate="([^"]+)"\/>/gi;
    let match;
    
    while ((match = cubeRegex.exec(xmlText)) !== null) {
      rates[match[1]] = parseFloat(match[2]);
    }
    
    // Validate we got some rates
    if (Object.keys(rates).length === 0) {
      throw new Error("No rates found in ECB response");
    }
    
    return rates;
  } catch (error) {
    console.error("Forexify: Failed to fetch ECB rates:", error);
    return null;
  }
}

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const requestedCurrencies = url.searchParams.get("currencies")?.split(",") || [];
  
  const now = Date.now();
  
  // Return cached if fresh
  if (cachedRates && cacheTimestamp && (now - cacheTimestamp) < CACHE_DURATION) {
    const filteredRates = requestedCurrencies.length > 0
      ? Object.fromEntries(
          requestedCurrencies
            .filter(c => c in cachedRates!)
            .map(c => [c, cachedRates![c]])
        )
      : cachedRates;
    
    return json({
      rates: filteredRates,
      cached: true,
      timestamp: new Date(cacheTimestamp).toISOString(),
      source: "ECB"
    });
  }
  
  // Fetch fresh rates
  const rates = await fetchECBRates();
  
  if (rates) {
    cachedRates = rates;
    cacheTimestamp = now;
    
    const filteredRates = requestedCurrencies.length > 0
      ? Object.fromEntries(
          requestedCurrencies
            .filter(c => c in rates)
            .map(c => [c, rates[c]])
        )
      : rates;
    
    return json({
      rates: filteredRates,
      cached: false,
      timestamp: new Date().toISOString(),
      source: "ECB"
    });
  }
  
  // Fallback to stale cache
  if (cachedRates) {
    const filteredRates = requestedCurrencies.length > 0
      ? Object.fromEntries(
          requestedCurrencies
            .filter(c => c in cachedRates!)
            .map(c => [c, cachedRates![c]])
        )
      : cachedRates;
    
    return json({
      rates: filteredRates,
      cached: true,
      stale: true,
      timestamp: new Date(cacheTimestamp!).toISOString(),
      source: "ECB (stale)"
    });
  }
  
  return json(
    { error: "Unable to fetch exchange rates" },
    { status: 503 }
  );
}
