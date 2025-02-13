import { useState, useEffect } from "react";
import "./App.css";

function App() {
	// Track API status: null = checking, true = online, false = offline
	const [isApiOnline, setIsApiOnline] = useState<boolean | null>(null);

	useEffect(() => {
		checkApiStatus();
	}, []);

	// Quick ping to API to check if it's up and running
	const checkApiStatus = () => {
		fetch("https://pin.krnl.my.id/pin/123")
			.then(() => setIsApiOnline(true))
			.catch(() => setIsApiOnline(false));
	};

	// Small dot indicator that shows API status with animation
	const StatusIndicator = () => (
		<span className="relative flex h-2 w-2">
			<span
				className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 
					${isApiOnline ? "bg-emerald-400" : "bg-red-400"}`}
			/>
			<span
				className={`relative inline-flex rounded-full h-2 w-2 
					${isApiOnline ? "bg-emerald-500" : "bg-red-500"}`}
			/>
		</span>
	);

	return (
		<div className="popup-container">
			{/* Header with status and version */}
			<div className="header-section">
				<div className="flex items-center justify-between gap-3">
					<h1 className="text-xl font-medium text-left">Pinterest Downloader</h1>
					<div className="flex items-center gap-2 flex-shrink-0">
						<div className={`status-badge-small ${isApiOnline === null ? "" : isApiOnline ? "online" : "offline"}`}>
							<StatusIndicator />
							<span className="status-text">
								{isApiOnline === null ? "..." : isApiOnline ? "Online" : "Offline"}
							</span>
						</div>
						<span className="version-badge">v1.0.0</span>
					</div>
				</div>
			</div>

			{/* Step by step guide */}
			<div className="guide-section">
				<div className="space-y-3">
					<div className="guide-step">
						<span className="step-number">1</span>
						<p className="text-left">Head over to any Pinterest pin you'd like to save</p>
					</div>

					<div className="guide-step">
						<span className="step-number">2</span>
						<p className="text-left">Spot our handy download panel in the corner</p>
					</div>

					<div className="guide-step">
						<span className="step-number">3</span>
						<p className="text-left">Pick your size and download away!</p>
					</div>
				</div>

				{/* Tips and notes */}
				<div className="tips-section">
					<p className="text-xs text-zinc-400">
						Tip: Keep things tidy by minimizing the panel when you're done!
					</p>
					<p className="text-[11px] text-zinc-500">
						Note: Currently works for image pins only
					</p>
				</div>
			</div>
		</div>
	);
}

export default App;
