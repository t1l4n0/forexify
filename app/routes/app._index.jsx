import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { authenticate } from "../shopify.server";

// ECB Exchange Rates API
const ECB_URL = "https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml";

// Cache for exchange rates
let cachedRates = null;
let cacheTimestamp = null;
const CACHE_DURATION = 3600000; // 1 hour in milliseconds

export async function loader({ request }) {
  const { session } = await authenticate.admin(request);
  
  // Get shop-specific settings (you'd store these in the database)
  const shop = session.shop;
  
  return json({
    shop,
    message: "Forexify Admin Dashboard"
  });
}

export async function action({ request }) {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  
  // Save settings to database (simplified)
  const settings = {
    showDKK: formData.get("showDKK") === "on",
    showSEK: formData.get("showSEK") === "on",
    barPosition: formData.get("barPosition") || "top",
    barColor: formData.get("barColor") || "#1a1a1a",
    textColor: formData.get("textColor") || "#ffffff"
  };
  
  // Here you would save to your database
  console.log("Saving settings for", session.shop, settings);
  
  return json({ success: true, settings });
}

export default function Index() {
  const { shop } = useLoaderData();

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <h1>Forexify ⚡</h1>
      <p>Shop: {shop}</p>
      
      <h2>Exchange Rate Bar Settings</h2>
      <form method="post">
        <div style={{ marginBottom: "15px" }}>
          <label>
            <input type="checkbox" name="showDKK" defaultChecked /> Show DKK/EUR
          </label>
        </div>
        
        <div style={{ marginBottom: "15px" }}>
          <label>
            <input type="checkbox" name="showSEK" defaultChecked /> Show SEK/EUR
          </label>
        </div>
        
        <div style={{ marginBottom: "15px" }}>
          <label>Bar Position:</label>
          <select name="barPosition">
            <option value="top">Top</option>
            <option value="bottom">Bottom</option>
          </select>
        </div>
        
        <div style={{ marginBottom: "15px" }}>
          <label>Bar Color:</label>
          <input type="color" name="barColor" defaultValue="#1a1a1a" />
        </div>
        
        <div style={{ marginBottom: "15px" }}>
          <label>Text Color:</label>
          <input type="color" name="textColor" defaultValue="#ffffff" />
        </div>
        
        <button type="submit" style={{ padding: "10px 20px", cursor: "pointer" }}>
          Save Settings
        </button>
      </form>
      
      <hr style={{ margin: "30px 0" }} />
      
      <h3>Current Exchange Rates</h3>
      <p>DKK/EUR and SEK/EUR rates are fetched daily from the European Central Bank.</p>
    </div>
  );
}
