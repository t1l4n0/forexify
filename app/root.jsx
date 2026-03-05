import { Outlet, useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";
import { authenticate } from "./shopify.server";

export async function loader({ request }) {
  await authenticate.admin(request);
  return json({ apiKey: process.env.SHOPIFY_API_KEY });
}

export default function App() {
  const { apiKey } = useLoaderData();

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <title>Forexify</title>
      </head>
      <body>
        <Outlet />
      </body>
    </html>
  );
}
