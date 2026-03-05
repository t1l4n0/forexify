import { ShopifyApp } from '@shopify/shopify-app-remix/server';
import { restResources } from '@shopify/shopify-api/rest/admin/2024-01';

const shopify = new ShopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,
  apiVersion: '2024-01',
  scopes: ['read_products', 'read_themes', 'write_themes'],
  appUrl: process.env.SHOPIFY_APP_URL,
  authPathPrefix: '/auth',
  restResources,
});

export default shopify;
