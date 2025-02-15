// Pin Data
export interface PinData {
	id: string;
	image?: string;
	isVideo: boolean;
}

// Popup State
export interface PopupState {
	isMinimized: boolean;
	lastPinId: string | null;
	lastImage: string | null;
}

// Content Check Result
export interface ContentCheckResult {
	success: boolean;
	isVideo?: boolean;
	image?: string;
	error?: string;
}
