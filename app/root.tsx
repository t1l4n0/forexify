import type { LoaderFunctionArgs } from "@remix-run/node";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import { AppProvider as PolarisAppProvider } from "@shopify/polaris";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";
import { AppProvider as AppBridgeAppProvider } from "@shopify/app-bridge-react";
import { authenticate } from "./shopify.server";

export const links = () => [
  { rel: "stylesheet", href: polarisStyles },
];

export async function loader({ request }: LoaderFunctionArgs) {
  await authenticate.admin(request);
 
  return {
    apiKey: process.env.SHOPIFY_API_KEY,
    shop: new URL(request.url).searchParams.get("shop"),
  };
}

export default function App() {
  const { apiKey, shop } = useLoaderData<typeof loader>();

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <AppBridgeAppProvider
          config={{
            apiKey: apiKey || "",
            host: shop || "",
            forceRedirect: true,
          }}
        >
          <PolarisAppProvider i18n={{}} >
            <Outlet />
          </PolarisAppProvider>
        </AppBridgeAppProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
