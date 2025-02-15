import { useState, useEffect } from "react";
import "./App.css";

function App() {
	// Track API status: null = checking, true = online, false = offline
	const [isApiOnline, setIsApiOnline] = useState<boolean | null>(null);
	const [latestVersion, setLatestVersion] = useState<string | null>(null);
	const currentVersion = "v1.2.2";

	useEffect(() => {
		checkApiStatus();
		checkLatestVersion();
	}, []);

	// Quick ping to API to check if it's up and running
	const checkApiStatus = () => {
		fetch("https://pin.krnl.my.id/pin/791859547022537413")
			.then(async (response) => {
				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}
				const data = await response.json();
				// Check status in the response JSON
				if (data && typeof data === "object" && data.status === 200) {
					setIsApiOnline(true);
				} else {
					setIsApiOnline(false);
				}
			})
			.catch((error) => {
				console.error("API check failed:", error);
				setIsApiOnline(false);
			});
	};

	const checkLatestVersion = () => {
		fetch(
			"https://api.github.com/repos/NTC-Department/pinterest-downloader/releases/latest",
		)
			.then(async (response) => {
				if (!response.ok) throw new Error("Failed to fetch version");
				const data = await response.json();
				setLatestVersion(data.tag_name);
			})
			.catch((error) => {
				console.error("Version check failed:", error);
				setLatestVersion(null);
			});
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
			{/* Header with status */}
			<div className="header-section">
				<div className="flex items-center justify-between gap-3">
					<h1 className="text-xl font-medium text-left">
						Pinterest Downloader
					</h1>
					<div className="flex items-center flex-shrink-0">
						<div
							className={`status-badge-small ${isApiOnline === null ? "" : isApiOnline ? "online" : "offline"}`}
						>
							<StatusIndicator />
							<span className="status-text">
								{isApiOnline === null
									? "Checking"
									: isApiOnline
										? "Online"
										: "Offline"}
							</span>
						</div>
					</div>
				</div>
			</div>

			{/* Step by step guide */}
			<div className="guide-section">
				<div className="space-y-3">
					<div className="guide-step">
						<span className="step-number">1</span>
						<p className="text-left">
							Head over to any Pinterest pin you'd like to save
						</p>
					</div>

					<div className="guide-step">
						<span className="step-number">2</span>
						<p className="text-left">
							Spot our handy download panel in the corner
						</p>
					</div>

					<div className="guide-step">
						<span className="step-number">3</span>
						<p className="text-left">Pick your size and download away!</p>
					</div>
				</div>

				{/* Tips and footer section */}
				<div className="tips-section">
					{/* Tips and notes */}
					<div className="space-y-2 mb-4">
						<p className="text-xs text-zinc-400">
							<span className="font-medium">Tip:</span> Keep things tidy by
							minimizing the panel when you're done!
						</p>
						<div className="tip-item">
							<p className="text-[11px] text-zinc-500">
								<span className="font-medium">Note:</span> Currently works for
								image pins only
							</p>
						</div>
					</div>

					{/* Version information */}
					<div className="version-info border-t border-zinc-800/50 pt-3">
						<div className="flex items-center justify-center text-[11px] text-zinc-500">
							<span>{currentVersion}</span>
							{latestVersion && latestVersion !== currentVersion && (
								<>
									<span className="mx-2">→</span>
									<a
										href="https://github.com/NTC-Department/pinterest-downloader/releases/latest"
										target="_blank"
										rel="noopener noreferrer"
										className="version-update-link group"
									>
										<span className="text-blue-400 group-hover:text-blue-300 transition-colors">
											{latestVersion}
										</span>
										<span className="text-zinc-600 group-hover:text-zinc-500 ml-1 transition-colors">
											(click to update)
										</span>
									</a>
								</>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default App;
