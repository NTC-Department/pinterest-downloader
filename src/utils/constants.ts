// Selectors for DOM elements
export const SELECTORS = {
	POPUP: "pinterest-downloader-popup",
	PIN: {
		DATA: '[data-test-id="pin-data"]',
		VISUAL: '[data-test-id="pin-visual-container"]',
		VIDEO: '[data-test-id="story-pin-video"]',
	},
	META: {
		VIDEO: [
			'meta[property="og:video"]',
			'meta[name="twitter:card"][content="player"]',
			'meta[property="og:type"][content="video"]',
		],
		IMAGE: [
			'meta[property="og:image"]',
			'meta[name="twitter:image:src"]',
			'meta[property="pinterest:pinImage"]',
			'meta[name="pinterest:image"]',
		],
	},
} as const;

// Timeout constants
export const TIMEOUTS = {
	CONTENT_CHECK: 500,
	BUTTON_RESET: 5000,
	PREVIEW_LOAD: 5000,
	RETRY_DELAY: 300,
} as const;

// Maximum retries
export const MAX_RETRIES = 3;
