import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { topic, shop, session } = await authenticate.webhook(request);
  
  console.log(`Received ${topic} webhook for ${shop}`);

  switch (topic) {
    case "APP_UNINSTALLED":
      if (session) {
        // Clean up shop data
        console.log(`App uninstalled for shop: ${shop}`);
      }
      break;
    default:
      console.log(`Unhandled webhook topic: ${topic}`);
  }

  return new Response("OK", { status: 200 });
};
