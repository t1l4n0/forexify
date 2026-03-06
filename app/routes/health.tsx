import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";

export async function loader({ request }: LoaderFunctionArgs) {
  return json({
    status: "ok",
    timestamp: new Date().toISOString(),
    url: request.url,
    env: {
      SHOPIFY_APP_URL: process.env.SHOPIFY_APP_URL ? "set" : "missing",
      SHOPIFY_API_KEY: process.env.SHOPIFY_API_KEY ? "set" : "missing",
    }
  });
}