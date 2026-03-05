import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";

const ECB_URL = "https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml";

// Simple in-memory cache
let cachedRates = null;
let cacheTimestamp = null;
const CACHE_DURATION = 3600000; // 1 hour

async function fetchECBRates() {
  try {
    const response = await fetch(ECB_URL);
    const xmlText = await response.text();
    
    // Parse XML manually (lightweight)
    const rates = {};
    const cubeRegex = /<cube currency="([^"]+)" rate="([^"]+)"/>/gi;
    let match;
    
    while ((match = cubeRegex.exec(xmlText)) !== null) {
      rates[match[1]] = parseFloat(match[2]);
    }
    
    return rates;
  } catch (error) {
    console.error("Failed to fetch ECB rates:", error);
    return null;
  }
}

export async function loader({ request }) {
  // Check cache
  const now = Date.now();
  if (cachedRates && cacheTimestamp && (now - cacheTimestamp) < CACHE_DURATION) {
    return json({
      rates: cachedRates,
      cached: true,
      timestamp: new Date(cacheTimestamp).toISOString()
    });
  }
  
  // Fetch fresh rates
  const rates = await fetchECBRates();
  
  if (rates) {
    cachedRates = rates;
    cacheTimestamp = now;
    
    return json({
      rates,
      cached: false,
      timestamp: new Date().toISOString()
    });
  }
  
  // Fallback to cached rates even if expired
  if (cachedRates) {
    return json({
      rates: cachedRates,
      cached: true,
      fallback: true,
      timestamp: new Date(cacheTimestamp).toISOString()
    });
  }
  
  return json({ error: "Unable to fetch exchange rates" }, { status: 500 });
}
