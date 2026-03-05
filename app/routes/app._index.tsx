import { useEffect, useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import {
  BlockStack,
  Box,
  Button,
  Card,
  Checkbox,
  Layout,
  Page,
  Text,
  Banner,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

// ECB verfügbare Währungen
const AVAILABLE_CURRENCIES = [
  { value: "DKK", label: "🇩🇰 Danish Krone (DKK/EUR)" },
  { value: "SEK", label: "🇸🇪 Swedish Krona (SEK/EUR)" },
  { value: "USD", label: "🇺🇸 US Dollar (USD/EUR)" },
  { value: "GBP", label: "🇬🇧 British Pound (GBP/EUR)" },
  { value: "CHF", label: "🇨🇭 Swiss Franc (CHF/EUR)" },
  { value: "JPY", label: "🇯🇵 Japanese Yen (JPY/EUR)" },
  { value: "NOK", label: "🇳🇴 Norwegian Krone (NOK/EUR)" },
  { value: "PLN", label: "🇵🇱 Polish Zloty (PLN/EUR)" },
  { value: "CZK", label: "🇨🇿 Czech Koruna (CZK/EUR)" },
  { value: "HUF", label: "🇭🇺 Hungarian Forint (HUF/EUR)" },
  { value: "AUD", label: "🇦🇺 Australian Dollar (AUD/EUR)" },
  { value: "CAD", label: "🇨🇦 Canadian Dollar (CAD/EUR)" },
  { value: "NZD", label: "🇳🇿 New Zealand Dollar (NZD/EUR)" },
  { value: "CNY", label: "🇨🇳 Chinese Yuan (CNY/EUR)" },
  { value: "SGD", label: "🇸🇬 Singapore Dollar (SGD/EUR)" },
];

interface LoaderData {
  shop: string;
  settings: {
    currencies: string[];
  };
}

export async function loader({ request }: LoaderFunctionArgs) {
  const { session } = await authenticate.admin(request);
  
  let settings = await prisma.forexifySettings.findUnique({
    where: { shop: session.shop },
  });

  if (!settings) {
    settings = await prisma.forexifySettings.create({
      data: {
        shop: session.shop,
        currencies: JSON.stringify(["DKK", "SEK"]),
      },
    });
  }

  return json({
    shop: session.shop,
    settings: {
      currencies: JSON.parse(settings.currencies),
    },
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();

  const currencies = formData.get("currencies") as string;

  await prisma.forexifySettings.upsert({
    where: { shop: session.shop },
    update: { currencies },
    create: {
      shop: session.shop,
      currencies,
    },
  });

  return json({ success: true });
}

export default function ForexifySettings() {
  const { settings } = useLoaderData<LoaderData>();
  const fetcher = useFetcher();
  const isSaving = fetcher.state !== "idle";
  const [showSuccess, setShowSuccess] = useState(false);

  const [selectedCurrencies, setSelectedCurrencies] = useState<string[]>(
    settings.currencies
  );

  useEffect(() => {
    if (fetcher.data?.success) {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [fetcher.data]);

  const handleSave = () => {
    const formData = new FormData();
    formData.append("currencies", JSON.stringify(selectedCurrencies));
    fetcher.submit(formData, { method: "POST" });
  };

  const toggleCurrency = (currency: string) => {
    setSelectedCurrencies((prev) =>
      prev.includes(currency)
        ? prev.filter((c) => c !== currency)
        : [...prev, currency]
    );
  };

  return (
    <Page
      title="Forexify"
      subtitle="Display live ECB exchange rates in your store"
      primaryAction={
        <Button
          variant="primary"
          onClick={handleSave}
          loading={isSaving}
          disabled={selectedCurrencies.length === 0}
        >
          Save
        </Button>
      }
    >
      <Layout>
        {showSuccess && (
          <Layout.Section>
            <Banner
              title="Settings saved"
              tone="success"
              onDismiss={() => setShowSuccess(false)}
            />
          </Layout.Section>
        )}

        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">
                Select Currencies
              </Text>
              
              <Text as="p" variant="bodyMd" tone="subdued">
                Choose which exchange rates to display. Rates are updated hourly from the European Central Bank.
                Layout settings (colors, fonts, alignment) are configured in the theme editor.
              </Text>

              <Box padding="200">
                <BlockStack gap="200">
                  {AVAILABLE_CURRENCIES.map((currency) => (
                    <Checkbox
                      key={currency.value}
                      label={currency.label}
                      checked={selectedCurrencies.includes(currency.value)}
                      onChange={() => toggleCurrency(currency.value)}
                    />
                  ))}
                </BlockStack>
              </Box>

              {selectedCurrencies.length === 0 && (
                <Banner
                  title="Select at least one currency"
                  tone="warning"
                />
              )}
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">
                Theme Setup
              </Text>
              
              <BlockStack gap="200">
                <Text as="p" variant="bodyMd">
                  1. Go to <strong>Online Store &gt; Themes &gt; Customize</strong>
                </Text>
                <Text as="p" variant="bodyMd">
                  2. Add the <strong>Forexify Rate Bar</strong> block to your header
                </Text>
                <Text as="p" variant="bodyMd">
                  3. Configure colors, font sizes, and alignment in the block settings
                </Text>
              </BlockStack>

              <Box padding="300" background="bg-surface" borderRadius="200">
                <Text as="p" variant="bodySm" tone="subdued">
                  Data source: European Central Bank (ECB) | Updated hourly
                </Text>
              </Box>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
