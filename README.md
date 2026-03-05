# Forexify - Built for Shopify

A production-ready Shopify app displaying live ECB exchange rates in your storefront. Built with official Shopify React template, Polaris UI, and TypeScript.

## Features

- ✅ **Built for Shopify** compliant
- 🎨 **Polaris UI** components throughout
- 🔄 **31 ECB currencies** available (DKK, SEK, USD, GBP, CHF, JPY, and more)
- 📱 **Responsive** storefront bar
- ⚡ **Hourly auto-refresh** with caching
- 🛡️ **Fallback** for ECB API outages
- 💾 **Prisma database** for settings
- 🎯 **Theme App Extension** for easy customization

## Tech Stack

- **Framework:** Remix + React + TypeScript
- **UI:** Shopify Polaris + App Bridge
- **Database:** Prisma + SQLite
- **API:** European Central Bank XML feed
- **Deployment:** Shopify CLI

## Installation

### 1. Clone and setup
```bash
git clone https://github.com/t1l4n0/forexify.git
cd forexify
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
```
Edit `.env`:
```
SHOPIFY_API_KEY=your_key
SHOPIFY_API_SECRET=your_secret
SHOPIFY_APP_URL=https://your-app.com
DATABASE_URL="file:./dev.sqlite"
```

### 3. Setup database
```bash
npx prisma generate
npx prisma db push
```

### 4. Connect to Shopify
```bash
npx shopify app config link
```

### 5. Deploy extension
```bash
npx shopify app deploy
```

### 6. Start dev server
```bash
npx shopify app dev
```

## Storefront Setup

1. Go to **Online Store > Themes > Customize**
2. Click **Add Section**
3. Select **Forexify Exchange Rate Bar**
4. Configure currencies, colors, position

## Available Currencies

DKK, SEK, USD, GBP, CHF, JPY, NOK, PLN, CZK, HUF, AUD, CAD, NZD, CNY, SGD, and 16 more from ECB.

## File Structure

```
forexify/
├── app/
│   ├── routes/
│   │   ├── app._index.tsx      # Admin settings (Polaris)
│   │   ├── api.forexify.tsx    # Exchange rate API
│   │   ├── api.proxy.tsx       # App proxy for storefront
│   │   └── webhooks.tsx        # Webhook handlers
│   ├── db.server.ts            # Prisma client
│   ├── root.tsx                # Root with Polaris + App Bridge
│   └── shopify.server.ts       # Shopify app config
├── extensions/
│   └── forexify-bar/           # Theme app extension
│       ├── blocks/
│       │   └── forexify-bar.liquid
│       └── assets/
│           └── forexify-bar.css
└── prisma/
    └── schema.prisma
```

## Built for Shopify Checklist

- ✅ Polaris React components
- ✅ App Bridge integration
- ✅ TypeScript
- ✅ Database for persistence
- ✅ Error handling
- ✅ Webhook handling
- ✅ Responsive design

## License

MIT
