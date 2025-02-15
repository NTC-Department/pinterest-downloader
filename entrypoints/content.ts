import type { ImageSize } from "../src/utils/pinterest";
import { browser } from "wxt/browser";
import type { DownloadPinMessage } from "../src/types/messages";
import "../src/styles/main.css";
import { TIMEOUTS } from "../src/utils/constants";
import { PopupManager } from "../src/components/popup-manager";

// This is the content script for the Pinterest Downloader extension
export default defineContentScript({
	matches: ["*://*.pinterest.com/*"],
	main() {
		// Initialize popup manager
		const popupManager = new PopupManager();

		// Handle download clicks
		async function handleDownloadClick(e: MouseEvent) {
			const target = e.target as HTMLButtonElement;
			if (target.tagName !== "BUTTON") return;

			const pinId = target.dataset.pinId;
			const size = target.dataset.size as ImageSize;

			if (!pinId) return;

			// Disable button and show loading state
			target.disabled = true;
			const originalText = target.innerHTML;
			const isOriginalSize = target.dataset.size === "original";

			target.innerHTML = isOriginalSize
				? `<span class="icon-[ph--circle-notch-bold] w-4 h-4 animate-spin"></span> Downloading...`
				: "Downloading...";

			try {
				// Send download message to background script
				await browser.runtime.sendMessage({
					type: "DOWNLOAD_PIN",
					pinId,
					size,
				} as DownloadPinMessage);

				// Reset button when window is focused or after timeout
				const resetButton = () => {
					target.disabled = false;
					target.innerHTML = originalText;
					window.removeEventListener("focus", resetButton);
				};

				window.addEventListener("focus", resetButton);
				setTimeout(() => {
					if (target.disabled) {
						resetButton();
					}
				}, TIMEOUTS.BUTTON_RESET);
			} catch (error) {
				console.error("Error downloading pin:", error);
				target.disabled = false;
				target.innerHTML = originalText;
			}
		}

		// Setup observers for URL and content changes
		function setupObservers() {
			let lastUrl = location.href;
			let contentCheckTimeout: number;

			// Watch for URL changes
			const urlObserver = new MutationObserver(() => {
				const currentUrl = location.href;
				if (currentUrl !== lastUrl) {
					lastUrl = currentUrl;
					clearTimeout(contentCheckTimeout);

					// Update popup
					popupManager.updatePopup();

					// Additional check for late-loading content
					contentCheckTimeout = window.setTimeout(() => {
						popupManager.updatePopup();
					}, TIMEOUTS.CONTENT_CHECK);
				}
			});

			// Watch for specific Pinterest content changes
			const contentObserver = new MutationObserver((mutations) => {
				for (const mutation of mutations) {
					const target = mutation.target as Element;

					if (
						mutation.type === "childList" &&
						(target.matches('[data-test-id="pin-data"]') ||
							target.matches('[data-test-id="pin-visual-container"]') ||
							target.matches('[data-test-id="story-pin-video"]'))
					) {
						popupManager.updatePopup();
						break;
					}
				}
			});

			// Start observing
			urlObserver.observe(document, {
				subtree: true,
				childList: true,
			});

			contentObserver.observe(document.body, {
				subtree: true,
				childList: true,
				attributes: true,
				attributeFilter: ["data-test-id", "src", "srcset"],
			});

			// Add click handler for download buttons
			document.body.addEventListener("click", handleDownloadClick);

			// Return cleanup function
			return () => {
				urlObserver.disconnect();
				contentObserver.disconnect();
				clearTimeout(contentCheckTimeout);
				document.body.removeEventListener("click", handleDownloadClick);
			};
		}

		// Initial popup setup
		popupManager.createPopup();

		// Setup observers and return cleanup
		return setupObservers();
	},
});
