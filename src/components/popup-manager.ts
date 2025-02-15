import { SELECTORS, TIMEOUTS, MAX_RETRIES } from "../utils/constants";
import {
	getPinIdFromUrl,
	getPinImage,
	isVideoPin,
} from "../utils/pin-detector";
import type { PopupState, ContentCheckResult } from "../types";
import { NTC_LOGO } from "../utils/logos";

export class PopupManager {
	private state: PopupState;
	private popup: HTMLElement | null = null;

	constructor() {
		this.state = {
			isMinimized: false,
			lastPinId: null,
			lastImage: null,
		};
	}

	/**
	 * Create and setup download popup UI
	 */
	public createPopup(): void {
		if (document.getElementById(SELECTORS.POPUP)) return;

		const pinId = getPinIdFromUrl();
		if (!pinId) return;

		// Create popup with loading state
		this.popup = document.createElement("div");
		this.popup.id = SELECTORS.POPUP;
		this.popup.className = "pinterest-downloader";
		this.popup.innerHTML = this.getInitialTemplate(pinId);

		// Setup event listeners
		this.setupEventListeners();

		// Append popup to body
		document.body.appendChild(this.popup);

		// Check content and update UI
		this.checkAndUpdateContent(pinId);
	}

	/**
	 * Update popup content based on current pin
	 */
	public async updatePopup(): Promise<void> {
		const currentPinId = getPinIdFromUrl();

		if (!currentPinId) {
			this.popup?.remove();
			this.popup = null;
			return;
		}

		if (this.popup) {
			// Reset cache
			this.state.lastPinId = null;
			this.state.lastImage = null;

			// Update pin ID display
			this.updatePinId(currentPinId);

			// Show loading state
			this.showLoadingState();

			// Wait for DOM and check content
			requestAnimationFrame(() => {
				this.checkAndUpdateContent(currentPinId);
			});
		} else {
			this.createPopup();
		}
	}

	/**
	 * Check content type and update UI accordingly
	 */
	private async checkAndUpdateContent(pinId: string): Promise<void> {
		if (!this.popup) return;

		let retryCount = 0;
		const check = async (): Promise<ContentCheckResult> => {
			const isVideo = isVideoPin();

			if (isVideo) {
				return { success: true, isVideo: true };
			}

			const image = getPinImage();
			if (image) {
				return { success: true, isVideo: false, image };
			}

			if (retryCount < MAX_RETRIES) {
				retryCount++;
				await new Promise((resolve) =>
					setTimeout(resolve, TIMEOUTS.RETRY_DELAY),
				);
				return check();
			}

			return { success: false, error: "Could not determine content type" };
		};

		const result = await check();

		if (result.isVideo) {
			this.showVideoState();
		} else if (result.image) {
			this.updatePreview(result.image);
			this.updateButtons(pinId);
		} else {
			this.showError(result.error || "Unknown error");
		}
	}

	/**
	 * Get initial HTML template for popup
	 */
	private getInitialTemplate(pinId: string): string {
		return `
		<div class="pinterest-header text-center">
			<h3 class="text-lg font-medium">Pinterest Downloader</h3>
			<button class="minimize-button group" id="minimize-button" title="Minimize">
				<span class="icon-[ph--minus-bold] w-5 h-5"></span>
			</button>
		</div>

		<div class="pinterest-content">
			<div class="preview-container">
				<div class="preview-content">
					<div class="preview-loading">
						<span class="icon-[ph--circle-notch-bold] w-8 h-8 opacity-40 animate-spin"></span>
						<p class="text-sm text-zinc-400">Checking content...</p>
					</div>
				</div>
			</div>
			<div class="text-center">
				<span class="pin-id flex items-center justify-center gap-1.5">
					<span class="icon-[ph--hash-bold] w-3.5 h-3.5 opacity-50"></span>
					${pinId}
				</span>
			</div>
			<div data-buttons-container></div>
			<div class="text-center mt-1">
				<span class="text-[10px] text-zinc-400 leading-tight block">
				As long as the Pin ID updates correctly, you can download the image even
				if the preview doesn't load
				</span>
			</div>
		</div>

		<footer class="pinterest-footer">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-2">
					<a
						href="https://github.com/NTC-Department"
						target="_blank"
						rel="noopener noreferrer"
						class="ntc-logo">
						${NTC_LOGO}
					</a>
					<span class="text-zinc-300 font-light" style="margin-top: -4px">|</span>
					<div class="flex items-center gap-1.5" style="margin-top: -2px">
					<span class="text-zinc-400">by</span>
						<a
						href="https://fei.eterninety.com"
						target="_blank"
						rel="noopener noreferrer"
						class="hover:text-[#E60023] transition-colors duration-200">
							ifeiera
						</a>
					</div>
				</div>
				<span class="version-badge-small">v1.2.1</span>
			</div>
		</footer>
`;
	}

	/**
	 * Setup event listeners for popup
	 */
	private setupEventListeners(): void {
		if (!this.popup) return;

		const minimizeButton = this.popup.querySelector(
			"#minimize-button",
		) as HTMLButtonElement;

		// Toggle minimize/maximize
		const toggleMinimize = () => {
			this.state.isMinimized = !this.state.isMinimized;
			this.popup?.classList.toggle("minimized");

			if (minimizeButton) {
				minimizeButton.innerHTML = this.state.isMinimized
					? `<span class="icon-[ph--equals-bold] w-5 h-5 text-[#E60023]"></span>`
					: `<span class="icon-[ph--minus-bold] w-5 h-5"></span>`;
				minimizeButton.setAttribute(
					"title",
					this.state.isMinimized ? "Maximize" : "Minimize",
				);
			}
		};

		// Add event listeners
		minimizeButton?.addEventListener("click", (e) => {
			e.stopPropagation();
			toggleMinimize();
		});

		this.popup.addEventListener("click", () => {
			if (this.state.isMinimized) {
				toggleMinimize();
			}
		});
	}

	/**
	 * Update pin ID display
	 */
	private updatePinId(pinId: string): void {
		const pinIdElement = this.popup?.querySelector(".pin-id");
		if (pinIdElement) {
			pinIdElement.innerHTML = `
            <span class="icon-[ph--hash-bold] w-3.5 h-3.5 opacity-50"></span>
            ${pinId}`;
		}
	}

	/**
	 * Show loading state
	 */
	private showLoadingState(): void {
		const previewContainer = this.popup?.querySelector(".preview-container");
		if (previewContainer) {
			previewContainer.innerHTML = `
            <div class="preview-content">
                <div class="preview-loading">
                    <span class="icon-[ph--circle-notch-bold] w-8 h-8 opacity-40 animate-spin"></span>
                    <p class="text-sm text-zinc-400">Checking content...</p>
                </div>
            </div>`;
		}
	}

	/**
	 * Show video/GIF state
	 */
	private showVideoState(): void {
		if (!this.popup) return;

		const previewContainer = this.popup.querySelector(".preview-container");
		const buttonsContainer = this.popup.querySelector(
			"[data-buttons-container]",
		);

		if (previewContainer) {
			previewContainer.innerHTML = `
            <div class="preview-content">
                <div class="preview-fallback video-notice">
                    <span class="icon-[ph--video-camera-bold] w-8 h-8 opacity-40"></span>
                    <p class="font-medium">Video/GIF Content</p>
                    <p class="text-xs opacity-60">Sorry, we only support static images</p>
                </div>
            </div>`;
		}

		if (buttonsContainer) {
			buttonsContainer.innerHTML = `
            <div class="text-center text-gray-500 text-sm mt-4">
                <p>Download not available for video/GIF content</p>
            </div>`;
		}
	}

	/**
	 * Update preview with image
	 */
	private updatePreview(imageUrl: string): void {
		if (!this.popup) return;

		const previewContainer = this.popup.querySelector(".preview-container");
		if (!previewContainer) return;

		const img = new Image();
		let loaded = false;
		const timeout = window.setTimeout(() => {
			if (!loaded) {
				this.showError("Loading timeout");
			}
		}, TIMEOUTS.PREVIEW_LOAD);

		const cleanup = () => {
			loaded = true;
			clearTimeout(timeout);
			img.onload = null;
			img.onerror = null;
		};

		img.onload = () => {
			if (!this.popup?.isConnected) {
				cleanup();
				return;
			}

			cleanup();
			try {
				previewContainer.innerHTML = `
                <div class="preview-content">
                    <img src="${img.src}" 
                    alt="Pin Preview" 
                    class="pin-preview" 
                    loading="eager"
                    onerror="this.style.display='none'"/>
                </div>`;

			} catch (error) {
				console.error("Error updating preview:", error);
				this.showError("Error displaying preview");
			}
		};

		img.onerror = () => {
			cleanup();
			this.showError("Failed to load image");
		};

		try {
			img.src = imageUrl;
		} catch (error) {
			cleanup();
			this.showError("Invalid image source");
		}
	}

	/**
	 * Update download buttons
	 */
	private updateButtons(pinId: string): void {
		if (!this.popup) return;

		const buttonsContainer = this.popup.querySelector(
			"[data-buttons-container]",
		);
		if (!buttonsContainer) return;

		const newButtonsContainer = document.createElement("div");
		newButtonsContainer.innerHTML = `
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

		const newButtons = newButtonsContainer.firstElementChild;
		if (newButtons) {
			buttonsContainer.replaceWith(newButtons);
		}

		newButtonsContainer.innerHTML += `
        <div class="text-center mt-1">
            <span class="text-[10px] text-zinc-400 leading-tight block">
                As long as the Pin ID updates correctly, you can download the image even if the preview doesn't load
            </span>
        </div>`;
    }

	/**
	 * Show error state
	 */
	private showError(message: string): void {
		if (!this.popup) return;

		const previewContainer = this.popup.querySelector(".preview-container");
		if (previewContainer) {
			previewContainer.innerHTML = `
            <div class="preview-content">
                <div class="preview-fallback">
                    <span class="icon-[ph--image-square-bold] w-8 h-8 opacity-40"></span>
                    <p>${message}</p>
                    <p class="text-xs opacity-60">You can still try downloading the image</p>
                </div>
            </div>`;
		}
	}
}
