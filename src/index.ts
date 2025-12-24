/**
 * Cloudflare Worker for Siteline Bot Tracking
 *
 * Automatically tracks AI bot visits (ChatGPT, Claude, etc.) by forwarding
 * request data to Siteline API. Runs as middleware with zero impact on response time.
 */

import { Siteline } from '@siteline/core';

export interface Env {
	SITELINE_WEBSITE_KEY: string;
}

const SKIP_PATTERN = /\.(css|js|jpe?g|png|gif|svg|webp|ico|woff2?|ttf|mp4|webm|pdf|zip|tar|gz)$/i;
const SKIP_PATHS = ['/favicon.ico', '/robots.txt', '/sitemap.xml'];

export default {
	async fetch(request, env, ctx): Promise<Response> {
		const startedAt = performance.now();

		const response = await fetch(request);

		if (shouldTrack(request)) {
			const duration = performance.now() - startedAt;
			ctx.waitUntil(
				track(request, response.status, duration, env)
			);
		}

		return response;
	}
} satisfies ExportedHandler<Env>;

function shouldTrack(req: Request): boolean {
	const { method, url } = req;
	if (method !== 'GET' && method !== 'POST') {
		return false;
	}

	const urlObj = new URL(url);
	return !SKIP_PATHS.includes(urlObj.pathname) && !SKIP_PATTERN.test(urlObj.pathname);
}

async function track(req: Request, status: number, duration: number, env: Env): Promise<void> {
	if (!env.SITELINE_WEBSITE_KEY) {
		console.error('Siteline: Missing SITELINE_WEBSITE_KEY environment variable');
		return;
	}

	try {
		const siteline = new Siteline({
			websiteKey: env.SITELINE_WEBSITE_KEY,
			sdk: '@siteline/cloudflare-worker',
			sdkVersion: '1.0.1',
			integrationType: 'cloudflare-worker',
		});

		siteline.track({
			url: req.url,
			method: req.method,
			status,
			duration: Math.round(duration),
			userAgent: req.headers.get('user-agent') || '',
			ref: req.headers.get('referer') || '',
			ip: req.headers.get('cf-connecting-ip') || '',
		});
	} catch (error) {
		console.error('Siteline tracking failed:', error);
	}
}
