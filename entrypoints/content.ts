import type { ImageSize } from "../src/utils/pinterest";
import { browser } from "wxt/browser";
import type { DownloadPinMessage } from "../src/types/messages";
import { NTC_LOGO } from "../src/utils/logos";
import "../src/styles/main.css";

// This is the content script for the Pinterest Downloader extension
export default defineContentScript({
	matches: ["*://*.pinterest.com/*"],
  main() {
		// Function to get PIN ID from URL
		function getPinIdFromUrl(): string | null {
			const match = window.location.pathname.match(/\/pin\/(\d+)/);
			return match ? match[1] : null;
		}

		// We need multiple strategies to get the image because Pinterest's DOM structure
		// can be inconsistent. This ensures we always get the best quality image possible.
		function getPinImage(): string | null {
			// Helper to clean image URL and remove query params
			const cleanImageUrl = (url: string) => {
				if (!url) return null;
				return url.split("?")[0].replace(/\/\d+x\//, "/736x/");
			};

			// Helper to validate Pinterest image URLs
			const isValidPinImage = (url: string) => {
				return (url?.includes?.("pinimg.com") &&
					!url?.includes?.("/user/") &&
					!url?.includes?.("/avatars/") &&
					!url?.includes?.("/favicon/") &&
					!url?.includes?.("/default_")) || false;
			};

			try {
				// Strategy 1: Try getting image from pin container (most reliable)
				const mainContainer = document.querySelector('[data-test-id="pin-visual-container"]');
				if (mainContainer) {
					// Check all images in container for best quality
					const images = mainContainer.querySelectorAll("img");
					for (const img of Array.from(images)) {
						const src = (img as HTMLImageElement).src;
						const srcset = img.getAttribute("srcset");

						// Check srcset first for best quality
						if (srcset) {
							const sources = srcset
								.split(",")
								.map((s) => s.trim().split(" ")[0])
								.filter(isValidPinImage);
							if (sources.length) {
								return cleanImageUrl(sources[sources.length - 1]);
							}
						}

						// Fallback to src
						if (isValidPinImage(src)) {
							return cleanImageUrl(src);
						}
					}
				}

				// Strategy 2: Try meta tags as fallback
				const metaTags = [
					'meta[property="og:image"]',
					'meta[name="twitter:image"]',
					'meta[name="pinterest:image"]',
				];

				for (const selector of metaTags) {
					const meta = document.querySelector(selector) as HTMLMetaElement;
					const content = meta?.content;
					if (content && isValidPinImage(content)) {
						return cleanImageUrl(content);
					}
				}

				// Strategy 3: Search for images matching our criteria
				const allPossibleSelectors = [
					'img[src*="pinimg"][src*="originals"]',
					'img[src*="pinimg"][src*="736x"]',
					'img[src*="pinimg"][loading="eager"]',
					'div[class*="PinImage"] img[src*="pinimg"]',
					'img[src*="pinimg"][width]',
				];

				// Try all possible selectors
				for (const selector of allPossibleSelectors) {
					const images = document.querySelectorAll(selector);
					for (const img of Array.from(images)) {
						const src = (img as HTMLImageElement).src;
						if (isValidPinImage(src)) {
							return cleanImageUrl(src);
						}
					}
				}

				// Strategy 4: Last resort - scan all images on page
				const allImages = Array.from(document.querySelectorAll("img")).filter(
					(img) => {
						const imgElement = img as HTMLImageElement;
						return imgElement.width > 200 && isValidPinImage(imgElement.src);
					},
				);

				// If there is an image, return the first one
				if (allImages.length) {
					return cleanImageUrl((allImages[0] as HTMLImageElement).src);
				}
			} catch (error) {
				console.error("Error getting pin image:", error);
			}

			return null;
		}

		// Create download buttons with different size options
		function createDownloadButtons(pinId: string) {
			return `
		<div class="flex flex-col gap-2.5" data-buttons-container>
			<button class="pin-button flex items-center justify-center gap-2" data-size="original" data-pin-id="${pinId}">
				<span class="icon-[ph--image-fill] w-5 h-5"></span>
					Original Size
			</button>
			<button class="pin-button" data-size="x736" data-pin-id="${pinId}">
					Large (736px)
			</button>
			<button class="pin-button" data-size="x474" data-pin-id="${pinId}">
					Medium (474px)
			</button>
			<button class="pin-button" data-size="x236" data-pin-id="${pinId}">
					Small (236px)
			</button>
		</div>`;
		}

		// Check if current pin contains video/GIF content
		function isVideoPin(): boolean {
			const selectors = [
				'div[data-test-id="story-pin-video"]',
				'div[data-test-id="pin-video"]',
				"video",
				'div[class*="PinPlayButton"]',
				'[data-test-id="story-pin-controls"]',
				'img[src*=".gif"]',
			];

			return selectors.some(
				(selector) => document.querySelector(selector) !== null,
			);
		}

		// Create and setup the download popup UI
		function createDownloadPopup() {
			if (document.getElementById("pinterest-downloader-popup")) return;

			// Get the pin ID
			const pinId = getPinIdFromUrl();
			if (!pinId) return;

			// Check if the pin is a video
			const isVideo = isVideoPin();

			// Get the pin image
			const pinImage = !isVideo ? getPinImage() : null;

			// Create popup
			const popup = document.createElement("div");
			popup.id = "pinterest-downloader-popup";
			popup.className = "pinterest-downloader";
			popup.innerHTML = `
			<div class="pinterest-header text-center">
				<h3 class="text-lg font-medium">Pinterest Downloader</h3>
					<button class="minimize-button group" id="minimize-button" title="Minimize">
					<span class="icon-[ph--minus-bold] w-5 h-5"></span>
				</button>
			</div>
			
			<div class="pinterest-content">
			${isVideo? `
				<div class="preview-container">
					<div class="preview-content">
						<div class="preview-fallback video-notice">
							<span class="icon-[ph--video-camera-bold] w-8 h-8 opacity-40"></span>
							<p class="font-medium">Video/GIF Content</p>
							<p class="text-xs opacity-60">Sorry, we only support static images</p>
						</div>
					</div>
				</div>
			` : pinImage? `
				<div class="preview-container">
					<img src="${pinImage}" alt="Pin Preview" class="pin-preview"/>
				</div>` : ""}
				<div class="text-center">
					<span class="pin-id flex items-center justify-center gap-1.5">
					<span class="icon-[ph--hash-bold] w-3.5 h-3.5 opacity-50"></span>
					${pinId}
					</span>
				</div>
			${!isVideo? createDownloadButtons(pinId) : `
				<div class="text-center text-gray-500 text-sm mt-4">
					<p>Download not available for video/GIF content</p>
				</div>`}
			</div>

			<footer class="pinterest-footer">
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-2">
						<a href="https://github.com/NTC-Department" target="_blank" rel="noopener noreferrer" class="ntc-logo">
							${NTC_LOGO}
						</a>
						<span class="text-zinc-300 font-light" style="margin-top: -4px">|</span>
							<div class="flex items-center gap-1.5" style="margin-top: -2px">
								<span class="text-zinc-400">by</span> 
								<a href="https://fei.eterninety.com" target="_blank" rel="noopener noreferrer"class="hover:text-[#E60023] transition-colors duration-200">
								ifeiera</a>
							</div>
					</div>
					<span class="version-badge-small">v1.0.0</span>
				</div>
			</footer>`;

			// Handle minimize/maximize
			let isMinimized = false;
			const minimizeButton = popup.querySelector(
				"#minimize-button",
			) as HTMLButtonElement;

			// Function to toggle minimize/maximize
			function toggleMinimize() {
				isMinimized = !isMinimized;
				popup.classList.toggle("minimized");
				if (minimizeButton) {
					// Update button text and title
					minimizeButton.innerHTML = isMinimized
						? `<span class="icon-[ph--equals-bold] w-5 h-5 text-[#E60023]"></span>`
						: `<span class="icon-[ph--minus-bold] w-5 h-5"></span>`;
					minimizeButton.setAttribute(
						"title",
						isMinimized ? "Maximize" : "Minimize",
					);
				}
			}

			// Add event listener for minimize/maximize
			minimizeButton?.addEventListener("click", (e) => {
				e.stopPropagation();
				toggleMinimize();
			});

			// Add event listener for click on popup
			popup.addEventListener("click", () => {
				if (isMinimized) {
					toggleMinimize();
				}
			});

			// Add event listener for download click
			popup.addEventListener("click", handleDownloadClick);

			// Append popup to body
			document.body.appendChild(popup);
		}

		// We cache the last pin ID and image to avoid unnecessary updates
		// and prevent flickering when navigating between pins
		let lastPinId: string | null = null;
		let lastImage: string | null = null;

		// Update the preview image with loading states
		function updatePreview(container: HTMLElement) {
			const currentPinId = getPinIdFromUrl();

			// If the pin ID is the same as the last one, return
			if (currentPinId === lastPinId) return;

			// Get the pin image
			const currentImage = getPinImage();

			// Update last pin ID and image
			lastPinId = currentPinId;
			lastImage = currentImage;

			// Create preview container
			const previewContainer =
				container.querySelector(".preview-container") ||
				document.createElement("div");
			previewContainer.className = "preview-container";

			// If there is a current image
			if (currentImage) {
				const img = new Image();
				let loaded = false;

				// Function to show fallback
				const showFallback = () => {
					previewContainer.innerHTML = `
						<div class="preview-content">
							<div class="preview-fallback">
								<span class="icon-[ph--image-square-bold] w-8 h-8 opacity-40"></span>
								<p>Preview not available</p>
								<p class="text-xs opacity-60">You can still download the image</p>
							</div>
						</div>
					`;
				};

				// Show fallback if image fails to load
				const timeout = setTimeout(() => {
					if (!loaded) showFallback();
				}, 5000);

				// Update preview when image loads
				img.onload = () => {
					loaded = true;
					clearTimeout(timeout);

					// Update preview
					previewContainer.innerHTML = `
						<div class="preview-content">
							<img src="${img.src}" alt="Pin Preview" class="pin-preview" loading="eager"/>
						</div>
					`;
				};

				img.onerror = showFallback;

				// Set image source
				img.src = currentImage;
			} else {
				// Fallback if preview not available
				previewContainer.innerHTML = `
					<div class="preview-content">
						<div class="preview-fallback">
							<span class="icon-[ph--image-square-bold] w-8 h-8 opacity-40"></span>
							<p>Preview not available</p>
							<p class="text-xs opacity-60">You can still download the image</p>
						</div>
					</div>
				`;
			}

			// Insert preview container into content
			const content = container.querySelector(".pinterest-content");
			if (content && !content.contains(previewContainer)) {
				content.insertBefore(previewContainer, content.firstChild);
			}
		}

		// Pinterest uses client-side routing, so we need an observer
		// to detect when the user navigates to a different pin
		const observer = new MutationObserver(() => {
			const currentUrl = location.href;
			if (currentUrl !== lastUrl) {
				lastUrl = currentUrl;
				updatePopup();
			}
		});

		// Start observing page changes
		let lastUrl = location.href;
		observer.observe(document, {
			subtree: true,
			childList: true,
			attributes: true,
			characterData: true,
		});

		// Initial popup setup
		updatePopup();

		// Handle download clicks with proper loading states and error handling.
		// We show different UI for original size vs other sizes to make it clear
		// that original size might be larger/take longer to download.
		async function handleDownloadClick(e: MouseEvent) {
			const target = e.target as HTMLButtonElement;
			if (target.tagName !== "BUTTON") return;

			// Get pin ID and size
			const pinId = target.dataset.pinId;
			const size = target.dataset.size as ImageSize;

			if (!pinId) return;

			// Disable button
			target.disabled = true;
			const originalText = target.innerHTML;
			const isOriginalSize = target.dataset.size === "original";

			// Update button text
			target.innerHTML = isOriginalSize
				? `<span class="icon-[ph--circle-notch-bold] w-4 h-4 animate-spin"></span> Downloading...`
				: "Downloading...";

			try {
				// Create message
				const message: DownloadPinMessage = {
					type: "DOWNLOAD_PIN",
					pinId,
					size,
				};

				// Send message to background script
				await browser.runtime.sendMessage(message);

				// Reset button
				const resetButton = () => {
					target.disabled = false;
					target.innerHTML = originalText;
					window.removeEventListener("focus", resetButton);
				};

				// Reset button when window is focused
				window.addEventListener("focus", resetButton);

				// Reset button after 5 seconds
				setTimeout(() => {
					if (target.disabled) {
						resetButton();
					}
				}, 5000);
			} catch (error) {
				// Reset button
				target.disabled = false;
				target.innerHTML = originalText;
			}
		}

		// Pinterest loads content dynamically, so we need to watch for changes
		// and update our popup accordingly. This keeps everything in sync.
		function updatePopup() {
			const existingPopup = document.getElementById(
				"pinterest-downloader-popup",
			);
			const currentPinId = getPinIdFromUrl();

			// If there is a pin ID
			if (currentPinId) {
				// If popup already exists
				if (existingPopup) {
					const pinIdText = existingPopup.querySelector(".pin-id");
					if (pinIdText) {
						pinIdText.innerHTML = `
							<span class="icon-[ph--hash-bold] w-3.5 h-3.5 opacity-50"></span>
							${currentPinId}
						`;
					}

					// Update preview
					updatePreview(existingPopup);

					// Get buttons container
					const buttonsContainer = existingPopup.querySelector(
						"[data-buttons-container]",
					);
					// Update buttons
					if (buttonsContainer) {
						const newButtonsContainer = document.createElement("div");
						newButtonsContainer.innerHTML = createDownloadButtons(currentPinId);
						const newButtons = newButtonsContainer.firstElementChild;
						if (newButtons) {
							buttonsContainer.replaceWith(newButtons);
						}
					}
				} else {
					// Create new popup
					createDownloadPopup();
				}
			} else if (existingPopup) {
				// Remove popup if no pin ID
				existingPopup.remove();
			}
		}

		// Clean up when extension is disabled/unloaded
		return () => {
			observer.disconnect();
			const popup = document.getElementById("pinterest-downloader-popup");
			if (popup) popup.remove();
		};
  },
});
