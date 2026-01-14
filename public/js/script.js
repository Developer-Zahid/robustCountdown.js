let fixedInstance;
let relativeInstance;

function addOneYear() {
	if (!fixedInstance) return;
	const currentYear = fixedInstance.options.year;
	fixedInstance.update({ year: currentYear + 1 });

	const status = document.getElementById("fixed-status");
	status.innerText = `Target updated to ${currentYear + 1}`;
	setTimeout(() => (status.innerText = "Running..."), 1500);
}

function addOneMinute() {
	if (!relativeInstance) return;
	const currentDuration = relativeInstance.options.timer.duration || 0;
	relativeInstance.update({ timer: { duration: currentDuration + 60 * 1000 } });

	const status = document.getElementById("relative-status");
	if (status) status.innerText = "Added 1 Minute!";
}

document.addEventListener("DOMContentLoaded", () => {
	// --- EXAMPLE 1: Fixed Date (Granular) ---
	fixedInstance = new RobustCountdown("#fixed-countdown", {
		year: 2099,
		month: 1,
		day: 1,
		hours: 0,
		enableUTC: true,
		on: {
			update: (instance, progress, timeLeft, individualTimeData) => {
				// 1. Label Pluralization (Using 4th arg)
				const { days, hours, minutes, seconds } = individualTimeData;
				document.getElementById("label-days").innerText = days <= 1 ? "Day" : "Days";
				document.getElementById("label-hours").innerText = hours <= 1 ? "Hour" : "Hours";
				document.getElementById("label-minutes").innerText = minutes <= 1 ? "Minute" : "Minutes";
				document.getElementById("label-seconds").innerText = seconds <= 1 ? "Second" : "Seconds";

				// 2. Individual Progress Animation (Using 2nd arg)
				// Destructure to get the progress ratios (0.0 - 1.0)
				// Using standard naming: days, hours, minutes, seconds, total

				document.getElementById("bar-days").style.width = `${progress.days * 100}%`;
				document.getElementById("bar-hours").style.width = `${progress.hours * 100}%`;
				document.getElementById("bar-minutes").style.width = `${progress.minutes * 100}%`;
				document.getElementById("bar-seconds").style.width = `${progress.seconds * 100}%`;
			},
			finish: (instance) => {
				document.getElementById("fixed-status").innerText = "Happy New Year!";
			},
		},
	});

	// --- EXAMPLE 2: Relative Timer ---
	relativeInstance = new RobustCountdown("#relative-countdown", {
		timer: {
			duration: 60 * 1000,
			disableOnPause: true,
		},
		minutesSelector: '[data-timer-type="minutes"]',
		secondsSelector: '[data-timer-type="seconds"]',
		on: {
			update: (instance, progress, timeLeft, individualTimeData) => {
				// Global Progress Bar
				// Uses progress.total
				const fill = document.getElementById("progress-fill");
				const wrapper = document.getElementById("progress-wrapper");
				const status = document.getElementById("relative-status");
				const container = document.getElementById("relative-countdown");
				const numbers = container.querySelectorAll(".number");

				// Robust Color Logic for Progress Bar: Remove all potential colors first
				fill.classList.remove("bg-emerald-500", "bg-yellow-500", "bg-rose-500");

				// Apply new color based on progress thresholds
				if (progress.total >= 0.8) {
					// 90% elapsed
					fill.classList.add("bg-rose-500");
				} else if (progress.total >= 0.4) {
					// 70% elapsed
					fill.classList.add("bg-yellow-500");
				} else {
					fill.classList.add("bg-emerald-500");
				}

				// NEW: timeLeft based URGENCY effect on text
				// If less than 20 seconds remaining (20000ms), turn text RED
				if (timeLeft <= 20000) {
					numbers.forEach((num) => {
						num.classList.remove("text-white");
						num.classList.add("text-rose-500");
					});
					status.classList.remove("text-emerald-500");
					status.classList.add("text-rose-500");
					status.innerText = `Hurry! Only ${(timeLeft / 1000).toFixed(0)}s left!`;
				} else {
					numbers.forEach((num) => {
						num.classList.add("text-white");
						num.classList.remove("text-rose-500");
					});
					status.classList.add("text-emerald-500");
					status.classList.remove("text-rose-500");
					status.innerText = `Global Progress: ${Math.round(progress.total * 100)}%`;
				}

				wrapper.style.display = "block";
				fill.style.width = `${progress.total * 100}%`;
			},
			finish: (instance) => {
				const container = document.getElementById("relative-countdown");
				const numbers = container.querySelectorAll(".number");

				// Reset colors on finish
				numbers.forEach((num) => {
					num.classList.add("text-white");
					num.classList.remove("text-rose-500");
				});

				document.getElementById("relative-status").innerText = "Done! Auto-restart in 2s...";
				setTimeout(() => {
					instance.restart();
				}, 2000);
			},
		},
	});
});
