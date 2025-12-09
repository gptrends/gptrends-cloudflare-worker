/**
 * Cloudflare Worker for GPTrends Bot Tracking
 *
 * Automatically tracks AI bot visits (ChatGPT, Claude, etc.) by forwarding
 * request data to GPTrends API. Runs as middleware with zero impact on response time.
 */

export interface Env {
	GPTRENDS_WEBSITE_KEY: string;
	GPTRENDS_API_URL: string;
}

const SKIP_EXTENSIONS = [
	'.css', '.js', '.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp',
	'.ico', '.woff', '.woff2', '.ttf', '.mp4', '.webm'
];

export default {
	async fetch(request, env, ctx): Promise<Response> {
		const response = await fetch(request);

		ctx.waitUntil(track(request, env));

		return response;
	}
} satisfies ExportedHandler<Env>;


async function track(req: Request, env: Env): Promise<void> {
	try {
		const url = new URL(req.url);

		if (SKIP_EXTENSIONS.some(ext => url.pathname.toLowerCase().endsWith(ext))) {
			return;
		}

		const params = new URLSearchParams({
			url: req.url,
			userAgent: req.headers.get('user-agent') || '',
			ref: req.headers.get('referer') || '',
			ip: req.headers.get('cf-connecting-ip') || '',
			websiteKey: env.GPTRENDS_WEBSITE_KEY
		});

		await fetch(`${env.GPTRENDS_API_URL}?${params}`)
			.catch(() => {});

	} catch {}
}
