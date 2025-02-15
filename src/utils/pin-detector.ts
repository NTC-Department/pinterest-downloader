import { SELECTORS } from "./constants";

/**
 * Get PIN ID from current URL
 * @returns {string | null} PIN ID or null if not found
 */
export function getPinIdFromUrl(): string | null {
	const match = window.location.pathname.match(/\/pin\/(\d+)/);
	return match ? match[1] : null;
}

/**
 * Clean and validate Pinterest image URL
 * @param {string} url - Raw image URL
 * @returns {string | null} Cleaned URL or null if invalid
 */
function cleanImageUrl(url: string): string | null {
	if (!url) return null;
	// Remove query params and force https
	const cleanUrl = url.split("?")[0].replace(/^http:/, "https:");
	// Ensure we get high quality preview
	return cleanUrl.replace(/\/\d+x\//, "/736x/");
}

/**
 * Validate Pinterest image URL
 * @param {string} url - URL to validate
 * @returns {boolean} True if URL is valid Pinterest image
 */
function isValidPinImage(url: string): boolean {
	return (
		url?.includes?.("pinimg.com") &&
		/\/\d+x\/|\/originals\//.test(url) && // Must contain size or be original
		!url?.includes?.("/user/") &&
		!url?.includes?.("/avatars/") &&
		!url?.includes?.("/favicon/") &&
		!url?.includes?.("/default_") &&
		url.startsWith("https://")
	); // Must be https
}

/**
 * Get best quality image URL from current pin
 * @returns {string | null} Image URL or null if not found
 */
export function getPinImage(): string | null {
	try {
		// Strategy 1: Get from meta tags (fastest and most reliable)
		for (const selector of SELECTORS.META.IMAGE) {
			const meta = document.querySelector(selector) as HTMLMetaElement;
			const content = meta?.content;
			if (content && isValidPinImage(content)) {
				return cleanImageUrl(content);
			}
		}

		// Strategy 2: Get from pin container (backup)
		const mainContainer = document.querySelector(SELECTORS.PIN.VISUAL);
		if (mainContainer) {
			// First try to find image with srcset (usually highest quality)
			const imagesWithSrcset = Array.from(
				mainContainer.querySelectorAll("img[srcset]"),
			);
			for (const img of imagesWithSrcset) {
				const srcset = img.getAttribute("srcset");
				if (srcset) {
					// Get largest image from srcset
					const sources = srcset
						.split(",")
						.map((s) => s.trim().split(" ")[0])
						.filter(isValidPinImage);

					if (sources.length) {
						return cleanImageUrl(sources[sources.length - 1]);
					}
				}
			}

			// Then try regular images
			const images = mainContainer.querySelectorAll('img[src*="pinimg"]');
			for (const img of Array.from(images)) {
				const src = (img as HTMLImageElement).src;
				if (isValidPinImage(src)) {
					return cleanImageUrl(src);
				}
			}
		}

		// Strategy 3: Scan specific selectors
		const specificSelectors = [
			'img[src*="pinimg"][src*="originals"]',
			'img[src*="pinimg"][src*="736x"]',
			'div[class*="PinImage"] img[src*="pinimg"]',
			'img[src*="pinimg"][loading="eager"]',
			'img[src*="pinimg"][width]',
		];

		for (const selector of specificSelectors) {
			const images = document.querySelectorAll(selector);
			for (const img of Array.from(images)) {
				const src = (img as HTMLImageElement).src;
				if (isValidPinImage(src)) {
					return cleanImageUrl(src);
				}
			}
		}

		return null;
	} catch (error) {
		console.error("Error getting pin image:", error);
		return null;
	}
}

/**
 * Check if current pin contains video/GIF content
 * @returns {boolean} True if content is video/GIF
 */
export function isVideoPin(): boolean {
	try {
		// First check: Meta tags (most reliable and fastest)
		if (
			SELECTORS.META.VIDEO.some((selector) => document.querySelector(selector))
		) {
			return true;
		}

		// Second check: Pinterest's own data attributes
		const pinData = document.querySelector(SELECTORS.PIN.DATA);
		if (pinData?.getAttribute("data-pin-type")?.includes("video")) {
			return true;
		}

		// Third check: Video elements and controls
		const videoSelectors = [
			SELECTORS.PIN.VIDEO,
			'div[data-test-id="pin-video"]',
			'div[data-test-id="video-metadata"]',
			'div[data-test-id="VideoPlayer"]',
			"video",
			'div[class*="PinPlayButton"]',
			'[data-test-id="story-pin-controls"]',
		];

		// Fourth check: GIF indicators
		const gifSelectors = [
			'img[src*=".gif"]',
			'div[class*="GifContainer"]',
			'[data-test-id="PinTypeIdentifier"][title*="GIF"]',
		];

		// Combine all DOM checks and find elements
		const allSelectors = [...videoSelectors, ...gifSelectors];
		const elements = allSelectors.reduce((acc: Element[], selector) => {
			const found = Array.from(document.querySelectorAll(selector));
			for (const el of found) {
				acc.push(el);
			}
			return acc;
		}, []);

		// Check if any of the found elements are actually visible
		return elements.some((el) => {
			const rect = el.getBoundingClientRect();
			const style = window.getComputedStyle(el);
			return (
				rect.width > 0 &&
				rect.height > 0 &&
				style.display !== "none" &&
				style.visibility !== "hidden" &&
				style.opacity !== "0"
			);
		});
	} catch (error) {
		console.error("Error checking video pin:", error);
		return false;
	}
}
