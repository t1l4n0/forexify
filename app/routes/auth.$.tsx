import type { LoaderFunctionArgs } from "@remix-run/node";
import { login, authenticate } from "../shopify.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const path = url.pathname;

  // Handle OAuth callback
  if (path.includes("/callback")) {
    const { session } = await authenticate.admin(request);
    // Redirect to app after successful auth
    return new Response(null, {
      status: 302,
      headers: {
        Location: "/app",
      },
    });
  }

  // Handle exit-iframe (for embedded apps breaking out of iframe)
  if (path.includes("/exit-iframe")) {
    const exitIframe = url.searchParams.get("exitIframe");
    if (exitIframe) {
      return new Response(null, {
        status: 302,
        headers: {
          Location: exitIframe,
        },
      });
    }
    return new Response(null, {
      status: 302,
      headers: {
        Location: "/app",
      },
    });
  }

  // Default: initiate login/OAuth flow
  return login(request);
}
