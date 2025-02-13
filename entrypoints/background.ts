import { BASE_URL } from "../src/utils/pinterest";
import { browser } from "wxt/browser";
import type { Runtime } from "webextension-polyfill";
import type {
	DownloadPinMessage,
	MessageResponse,
} from "../src/types/messages";

export default defineBackground(() => {
	// Just a quick check to make sure our background script is running
	console.log("Hello background!", { id: browser.runtime.id });

	// Listen for messages from our content script
	browser.runtime.onMessage.addListener(
		(
			message: unknown,
			_sender: Runtime.MessageSender,
		): Promise<MessageResponse> => {
			const typedMessage = message as DownloadPinMessage;

			return new Promise((resolve, reject) => {
				// Handle pin download requests
				if (typedMessage.type === "DOWNLOAD_PIN") {
					const { pinId, size } = typedMessage;
					
					// Build the download URL based on size preference
					// If original size is selected, skip the size parameter
					const downloadUrl = size === 'original'
						? `${BASE_URL}/${pinId}/download`
						: `${BASE_URL}/${pinId}/download?size=${size}`;

					// Start the download and show the save dialog
					browser.downloads.download({
						url: downloadUrl,
						saveAs: true,
					})
						.then(() => {
							resolve({ success: true });
						})
						.catch((error) => {
							console.error("Error in DOWNLOAD_PIN:", error);
							reject({ success: false, error: "Failed to download image" });
						});
					return;
				}

				// Reject unknown message types
				reject({
					success: false,
					error: "Unknown message type",
				});
			});
		},
	);
});
