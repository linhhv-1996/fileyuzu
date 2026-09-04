// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {}
		// interface PageData {}
		// interface PageState {}
		interface Platform {
			env?: Record<string, unknown>;
			// Cloudflare request metadata (geolocation, etc.) - loosely typed since
			// @cloudflare/workers-types ambient types aren't wired into this project.
			cf?: {
				country?: string;
				[key: string]: unknown;
			};
			ctx?: {
				waitUntil(promise: Promise<unknown>): void;
				passThroughOnException(): void;
			};
		}
	}
}

export { };
