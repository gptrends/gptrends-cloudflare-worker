# Siteline Cloudflare Worker

Automatically track AI bot visits (ChatGPT, Claude, Perplexity, etc.) on your website with zero performance impact.

## Quick Setup (5 minutes)

### Prerequisites
- Cloudflare account
- Node.js installed
- Your Siteline website key

### Installation Steps

1. **Clone and install dependencies**
   ```bash
   npm install
   ```

2. **Login to Cloudflare**
   ```bash
   npx wrangler login
   ```

3. **Set your Siteline website key** (secure, never committed to code)
   ```bash
   npx wrangler secret put SITELINE_WEBSITE_KEY
   ```
   When prompted, paste your website key and press Enter.

4. **Deploy the worker**
   ```bash
   npm run deploy
   ```

5. **Configure routes in Cloudflare Dashboard**
	- Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
	- Navigate to: **Workers & Pages** > **siteline-tracker** > **Settings** > **Triggers**
	- Click **Add route**
	- Add your domain pattern, for example:
		- `example.com/*` (tracks all pages for domain)
		- `*example.com/*` (tracks all subdomains)
	- Select your zone and save

## What Gets Tracked

The worker automatically detects and tracks visits from:
- ChatGPT (OpenAI)
- Claude (Anthropic)
- Perplexity
- Google Gemini
- Other AI search agents

Static assets (images, CSS, JS, fonts) are automatically excluded.

## Configuration

### Default API URL
The worker uses `https://api.siteline.ai/track` by default. To change it:
```bash
npx wrangler secret put SITELINE_API_URL
```

### Update the worker
After making changes to the code:
```bash
npm run deploy
```

### View logs
```bash
npx wrangler tail
```

## How It Works

The worker runs as middleware on your domain:
1. Receives incoming request
2. Forwards request immediately (zero latency impact)
3. Sends tracking data to Siteline in the background
4. Returns response to visitor

## Troubleshooting

**Worker not tracking visits?**
- Verify routes are configured in Cloudflare Dashboard
- Check your website key is set: `npx wrangler secret list`
- View real-time logs: `npx wrangler tail`

**Need to change your website key?**
```bash
npx wrangler secret put SITELINE_WEBSITE_KEY
```

## Support

For issues or questions about Siteline, visit [siteline.ai](https://siteline.ai)

For Cloudflare Workers issues, see the [official documentation](https://developers.cloudflare.com/workers/)
