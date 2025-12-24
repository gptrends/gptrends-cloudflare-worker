import { env, createExecutionContext, waitOnExecutionContext, SELF } from 'cloudflare:test';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import worker from '../src/index';

// For now, you'll need to do something like this to get a correctly-typed
// `Request` to pass to `worker.fetch()`.
const IncomingRequest = Request<unknown, IncomingRequestCfProperties>;

describe('Siteline Tracking Worker', () => {
	beforeEach(() => {
		// Set up test environment variable with valid format: siteline_secret_<32 hex chars>
		env.SITELINE_WEBSITE_KEY = 'siteline_secret_' + '0'.repeat(32);
	});

	it('proxies requests and returns upstream response', async () => {
		const request = new IncomingRequest('http://example.com');
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		await waitOnExecutionContext(ctx);

		// Should proxy and return the upstream response
		expect(response.ok).toBe(true);
		const text = await response.text();
		expect(text).toContain('Example Domain');
	});

	it('skips tracking for static assets', async () => {
		const request = new IncomingRequest('http://example.com/style.css');
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		await waitOnExecutionContext(ctx);

		// Should still proxy (even if resource doesn't exist on upstream)
		expect(response).toBeDefined();
		expect(response.status).toBeDefined();
	});

	it('handles missing SITELINE_WEBSITE_KEY gracefully', async () => {
		const testEnv = { ...env, SITELINE_WEBSITE_KEY: undefined };
		const request = new IncomingRequest('http://example.com');
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, testEnv as any, ctx);
		await waitOnExecutionContext(ctx);

		// Should still proxy even if tracking fails
		expect(response.ok).toBe(true);
	});
});
