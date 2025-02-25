import { useState, useEffect } from "react";
import "./App.css";

function App() {
	// Track API status: null = checking, true = online, false = offline
	const [isApiOnline, setIsApiOnline] = useState<boolean | null>(null);
	const [latestVersion, setLatestVersion] = useState<string | null>(null);
	const currentVersion = "v1.2.3";
	const [isLimitationsExpanded, setIsLimitationsExpanded] = useState(false);

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
					<div className="space-y-3 mb-4">
						<p className="text-xs text-zinc-400">
							<span className="font-medium">Tip:</span> Keep things tidy by
							minimizing the panel when you're done!
						</p>

						{/* Limitations section */}
						<div className="space-y-4">
							<div className="tip-item">
								<button 
									type="button"
									onClick={() => setIsLimitationsExpanded(!isLimitationsExpanded)}
									className="w-full"
								>
									<div className="flex items-center justify-between">
										<p className="text-[11px] font-medium text-zinc-400">
											Limitations
										</p>
										<span className={`transform transition-transform duration-200 ${isLimitationsExpanded ? 'rotate-180' : ''}`}>
											<svg 
												className="w-3 h-3 text-zinc-500" 
												fill="none" 
												viewBox="0 0 24 24" 
												stroke="currentColor"
												aria-hidden="true"
												role="img"
												aria-label="Toggle limitations section"
											>
												<path 
													strokeLinecap="round" 
													strokeLinejoin="round" 
													strokeWidth={2} 
													d="M19 9l-7 7-7-7" 
												/>
											</svg>
										</span>
									</div>
								</button>
								<div className={`overflow-hidden transition-all duration-200 ease-in-out ${isLimitationsExpanded ? 'max-h-40 mt-2' : 'max-h-0'}`}>
									<ul className="text-[11px] text-zinc-500 space-y-1.5 ml-1">
										<li className="flex items-center gap-2">
											<span className="w-1 h-1 rounded-full bg-zinc-600 flex-shrink-0" />
											Only works with public image pins
										</li>
										<li className="flex items-center gap-2">
											<span className="w-1 h-1 rounded-full bg-zinc-600 flex-shrink-0" />
											Private pins are not supported
										</li>
										<li className="flex items-center gap-2">
											<span className="w-1 h-1 rounded-full bg-zinc-600 flex-shrink-0" />
											Image quality depends on source quality
										</li>
									</ul>
								</div>
							</div>

							{/* Test links section */}
							<div className="tip-item">
								<div className="space-y-2">
									<p className="text-[11px] font-medium text-zinc-400">
										Try it out
									</p>
									<div className="space-y-2 ml-1">
										<a
											href="https://id.pinterest.com/pin/791859547022537413/"
											target="_blank"
											rel="noopener noreferrer"
											className="flex items-center gap-2 text-[11px] text-blue-400 hover:text-blue-300 transition-colors"
										>
											<span className="w-1 h-1 rounded-full bg-blue-500 flex-shrink-0" />
											Business Card Mockups
										</a>
										<a
											href="https://id.pinterest.com/pin/1074178948624472086/"
											target="_blank"
											rel="noopener noreferrer"
											className="flex items-center gap-2 text-[11px] text-blue-400 hover:text-blue-300 transition-colors"
										>
											<span className="w-1 h-1 rounded-full bg-blue-500 flex-shrink-0" />
											Self & Others — Jot Press
										</a>
									</div>
								</div>
							</div>
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
