# Forexify - Shopify Exchange Rate App

Display live ECB exchange rates (DKK/EUR, SEK/EUR) in your Shopify store.

## Features

- 🔄 Live exchange rates from European Central Bank
- 🇩🇰 DKK/EUR rate display
- 🇸🇪 SEK/EUR rate display
- 🎨 Customizable colors and position
- 📱 Mobile responsive
- ⚡ Auto-refresh every hour
- 🛡️ Fallback if ECB API is unavailable

## Installation

### 1. Clone the repository
```bash
git clone https://github.com/t1l4n0/forexify.git
cd forexify
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
```bash
cp .env.example .env
```
Edit `.env` and add your Shopify API credentials:
- `SHOPIFY_API_KEY`
- `SHOPIFY_API_SECRET`
- `SHOPIFY_APP_URL`

### 4. Register the app with Shopify
```bash
npx shopify app config link
```

### 5. Deploy the theme app extension
```bash
npx shopify app deploy
```

### 6. Install in your test shop
```bash
npx shopify app dev
```

## Usage

After installation:

1. Go to **Online Store > Themes > Customize**
2. Click **Add section** or **Add block**
3. Select **Forexify Exchange Rate Bar**
4. Configure:
   - Which currencies to display (DKK, SEK)
   - Bar position (top/bottom)
   - Colors
   - Custom title

## How It Works

The app fetches exchange rates from the ECB's public XML feed:
`https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml`

Rates are cached for 1 hour to minimize API calls and ensure fast loading.

## File Structure

```
forexify/
├── app/                          # Remix backend
│   ├── routes/
│   │   ├── app._index.jsx       # Admin settings page
│   │   ├── app.jsx              # App layout
│   │   └── api.forexify.jsx     # Exchange rate API
│   ├── root.jsx                 # Root layout
│   └── shopify.server.js        # Shopify config
├── extensions/
│   └── forexify-bar/            # Theme app extension
│       ├── assets/
│       │   └── forexify-bar.css # Styling
│       ├── blocks/
│       │   └── forexify-bar.liquid  # Storefront block
│       └── shopify.extension.toml
├── shopify.app.toml             # App config
└── package.json
```

## Customization

### Adding More Currencies

Edit `app/routes/api.forexify.jsx` and add more currencies to the parser.

### Styling

Edit `extensions/forexify-bar/assets/forexify-bar.css` to customize the appearance.

## Support

For issues or feature requests, please open an issue on GitHub.

## License

MIT
