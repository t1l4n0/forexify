import { useEffect, useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import {
  Bleed,
  BlockStack,
  Box,
  Button,
  Card,
  Checkbox,
  ColorPicker,
  Divider,
  InlineGrid,
  Layout,
  Page,
  Select,
  Text,
  TextField,
  Banner,
  Badge,
  Spinner,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

// ECB verfügbare Währungen
const AVAILABLE_CURRENCIES = [
  { value: "DKK", label: "🇩🇰 Danish Krone (DKK/EUR)", flag: "🇩🇰" },
  { value: "SEK", label: "🇸🇪 Swedish Krona (SEK/EUR)", flag: "🇸🇪" },
  { value: "USD", label: "🇺🇸 US Dollar (USD/EUR)", flag: "🇺🇸" },
  { value: "GBP", label: "🇬🇧 British Pound (GBP/EUR)", flag: "🇬🇧" },
  { value: "CHF", label: "🇨🇭 Swiss Franc (CHF/EUR)", flag: "🇨🇭" },
  { value: "JPY", label: "🇯🇵 Japanese Yen (JPY/EUR)", flag: "🇯🇵" },
  { value: "NOK", label: "🇳🇴 Norwegian Krone (NOK/EUR)", flag: "🇳🇴" },
  { value: "PLN", label: "🇵🇱 Polish Zloty (PLN/EUR)", flag: "🇵🇱" },
  { value: "CZK", label: "🇨🇿 Czech Koruna (CZK/EUR)", flag: "🇨🇿" },
  { value: "HUF", label: "🇭🇺 Hungarian Forint (HUF/EUR)", flag: "🇭🇺" },
  { value: "AUD", label: "🇦🇺 Australian Dollar (AUD/EUR)", flag: "🇦🇺" },
  { value: "CAD", label: "🇨🇦 Canadian Dollar (CAD/EUR)", flag: "🇨🇦" },
  { value: "NZD", label: "🇳🇿 New Zealand Dollar (NZD/EUR)", flag: "🇳🇿" },
  { value: "CNY", label: "🇨🇳 Chinese Yuan (CNY/EUR)", flag: "🇨🇳" },
  { value: "SGD", label: "🇸🇬 Singapore Dollar (SGD/EUR)", flag: "🇸🇬" },
];

interface LoaderData {
  shop: string;
  settings: {
    currencies: string[];
    barColor: string;
    textColor: string;
    title: string;
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
        barColor: "#1a1a1a",
        textColor: "#ffffff",
        title: "Live Exchange Rates",
      },
    });
  }

  return json({
    shop: session.shop,
    settings: {
      currencies: JSON.parse(settings.currencies),
      barColor: settings.barColor,
      textColor: settings.textColor,
      title: settings.title,
    },
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();

  const currencies = formData.get("currencies") as string;
  const barColor = formData.get("barColor") as string;
  const textColor = formData.get("textColor") as string;
  const title = formData.get("title") as string;

  await prisma.forexifySettings.upsert({
    where: { shop: session.shop },
    update: {
      currencies,
      barColor,
      textColor,
      title,
    },
    create: {
      shop: session.shop,
      currencies,
      barColor,
      textColor,
      title,
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
  const [barColor, setBarColor] = useState({
    hue: 0,
    saturation: 0,
    brightness: 0.1,
    alpha: 1,
  });
  const [textColor, setTextColor] = useState({
    hue: 0,
    saturation: 0,
    brightness: 1,
    alpha: 1,
  });
  const [title, setTitle] = useState(settings.title);

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
    formData.append("barColor", settings.barColor);
    formData.append("textColor", settings.textColor);
    formData.append("title", title);

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
          Save Settings
        </Button>
      }
    >
      <Layout>
        {showSuccess && (
          <Layout.Section>
            <Banner
              title="Settings saved successfully"
              tone="success"
              onDismiss={() => setShowSuccess(false)}
            />
          </Layout.Section>
        )}

        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">
                Exchange Rate Bar Settings
              </Text>
              
              <TextField
                label="Bar Title"
                value={title}
                onChange={setTitle}
                autoComplete="off"
                helpText="Displayed before the exchange rates"
              />
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">
                Select Currencies
              </Text>
              
              <Text as="p" variant="bodyMd" tone="subdued">
                Choose which exchange rates to display. Rates are updated hourly from the European Central Bank.
              </Text>

              <Box padding="200">
                <InlineGrid columns={2} gap="200">
                  {AVAILABLE_CURRENCIES.map((currency) => (
                    <Checkbox
                      key={currency.value}
                      label={currency.label}
                      checked={selectedCurrencies.includes(currency.value)}
                      onChange={() => toggleCurrency(currency.value)}
                    />
                  ))}
                </InlineGrid>
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
                Appearance
              </Text>

              <InlineGrid columns={2} gap="400">
                <Box>
                  <Text as="p" variant="bodyMd" fontWeight="medium">
                    Bar Background Color
                  </Text>
                  <Box padding="200" background="bg-surface" borderRadius="100">
                    <ColorPicker
                      onChange={setBarColor}
                      color={barColor}
                    />
                  </Box>
                </Box>

                <Box>
                  <Text as="p" variant="bodyMd" fontWeight="medium">
                    Text Color
                  </Text>
                  <Box padding="200" background="bg-surface" borderRadius="100">
                    <ColorPicker
                      onChange={setTextColor}
                      color={textColor}
                    />
                  </Box>
                </Box>
              </InlineGrid>
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">
                Installation
              </Text>
              
              <Text as="p" variant="bodyMd">
                After saving, go to your theme editor to add the Forexify bar:
              </Text>

              <BlockStack gap="200">
                <Text as="p" variant="bodyMd">
                  1. Go to <strong>Online Store > Themes > Customize</strong>
                </Text>
                <Text as="p" variant="bodyMd">
                  2. Click <strong>Add Section</strong>
                </Text>
                <Text as="p" variant="bodyMd">
                  3. Select <strong>Forexify Exchange Rate Bar</strong>
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
