/**
 * RobustCountdown Class
 * ----------------------------------------------------------------------
 * A flexible, zero-dependency class for creating countdown timers.
 * Supports both fixed-date targets (e.g., "New Year 2030") and relative
 * timers (e.g., "5 minutes from now") with pause/resume functionality.
 * * @param {string} selector - CSS selector for the wrapper element(s).
 * @param {Object} options - Configuration object.
 * * Configuration Options:
 * ----------------------
 * 1. Fixed Date (Granular):
 * @param {number} year - Full year (e.g., 2026).
 * @param {number} month - Month (1-12).
 * @param {number} day - Day of month (1-31).
 * @param {number} hours - Hour (0-23).
 * @param {number} minutes - Minute (0-59).
 * @param {number} seconds - Second (0-59).
 * @param {boolean} enableUTC - If true, treats the date as UTC.
 * * 2. Fixed Date (String):
 * @param {string} targetTime - Date string parsable by Date() (e.g., "2026-01-01T00:00:00").
 * * 3. Relative Timer:
 * @param {Object} timer - Object containing relative timer settings.
 * @param {number} timer.duration - Duration in milliseconds (e.g., 60000 for 1 min).
 * @param {boolean} timer.disableOnPause - If true (default), pausing the timer "freezes" time.
 * If false, time continues to elapse in background.
 * * DOM Selectors (Customizable):
 * -----------------------------
 * @param {string} daysSelector - Selector for days display.
 * @param {string} hoursSelector - Selector for hours display.
 * @param {string} minutesSelector - Selector for minutes display.
 * @param {string} secondsSelector - Selector for seconds display.
 * @param {boolean} zeroPad - Whether to pad numbers with '0' (default: true).
 * * Callbacks:
 * ----------
 * @param {Object} on - Callback functions.
 * @param {Function} on.update - Called every second. Args: (instance, progress[0-1], timeLeft[ms]).
 * @param {Function} on.finish - Called when countdown hits zero. Args: (instance).
 */
class RobustCountdown {
	constructor(selector, options = {}) {
		// Select elements (Support 1-to-many: one instance controlling multiple DOM nodes)
		this.elements = document.querySelectorAll(selector);

		if (this.elements.length === 0) {
			console.error(`RobustCountdown: No elements found for selector "${selector}"`);
			return;
		}

		// Default configuration
		const defaults = {
			// Option Set A: Granular Date
			year: new Date().getFullYear(),
			month: 1, // 1-12
			day: 1,
			hours: 0,
			minutes: 0,
			seconds: 0,
			enableUTC: false,

			// Option Set B: Single Date String (legacy support)
			targetTime: null,

			// Option Set C: Relative Duration (ms) with Control Options
			timer: {
				duration: null,
				disableOnPause: true, // If true, pauses "freeze" the countdown time. If false, time keeps passing.
			},

			// Settings
			zeroPad: true,
			daysSelector: '[data-countdown-type="days"]',
			hoursSelector: '[data-countdown-type="hours"]',
			minutesSelector: '[data-countdown-type="minutes"]',
			secondsSelector: '[data-countdown-type="seconds"]',

			// Callbacks
			on: {
				update: null, // (instance, progress, timeLeft, individualTimeData) => {}
				finish: null, // (instance) => {}
			},
		};

		// Deep merge options
		this.options = {
			...defaults,
			...options,
			timer: {
				...defaults.timer,
				...(options.timer || {}),
			},
			on: {
				...defaults.on,
				...(options.on || {}),
			},
		};

		// State
		this.intervalId = null;
		this.isPaused = false;
		this.pauseStart = 0;
		this.targetTimestamp = 0;
		this.startTimestamp = 0;
		this.totalDuration = 0;

		// Initialize
		this.init();
	}

	init() {
		this.calculateTarget();
		this.start();
	}

	calculateTarget() {
		this.startTimestamp = new Date().getTime();
		const opts = this.options;

		// Priority 1: Relative Duration (for loops/restarts)
		if (opts.timer && opts.timer.duration) {
			this.targetTimestamp = this.startTimestamp + opts.timer.duration;
			this.totalDuration = opts.timer.duration;
			return;
		}

		// Priority 2: Granular Date OR targetTime
		let targetDate;

		if (opts.targetTime) {
			targetDate = new Date(opts.targetTime);
		} else {
			const y = opts.year;
			const m = (opts.month || 1) - 1;
			const d = opts.day || 1;
			const h = opts.hours || 0;
			const min = opts.minutes || 0;
			const s = opts.seconds || 0;

			if (opts.enableUTC) {
				targetDate = new Date(Date.UTC(y, m, d, h, min, s));
			} else {
				targetDate = new Date(y, m, d, h, min, s);
			}
		}

		this.targetTimestamp = targetDate.getTime();
		this.totalDuration = Math.max(0, this.targetTimestamp - this.startTimestamp);
	}

	format(n) {
		return this.options.zeroPad === false ? n.toString() : n.toString().padStart(2, "0");
	}

	tick() {
		if (this.isPaused) return;

		const now = new Date().getTime();
		const timeLeft = Math.max(0, this.targetTimestamp - now);

		// --- Time Calculations ---
		const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
		const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
		const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
		const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

		// --- Global Progress Calculation (0.0 to 1.0) ---
		let globalProgress = 0;
		if (this.totalDuration > 0) {
			const elapsed = now - this.startTimestamp;
			globalProgress = Math.min(1, Math.max(0, elapsed / this.totalDuration));
		} else {
			globalProgress = 1;
		}

		// --- Individual Unit Progress Calculation ---
		// Constructs the progress object (0.0 to 1.0 for each unit)
		const progressObject = {
			total: globalProgress,
			days: this.totalDuration > 0 ? days / (this.totalDuration / (1000 * 60 * 60 * 24)) : 0,
			hours: hours / 24,
			minutes: minutes / 60,
			seconds: seconds / 60,
		};

		// --- DOM Updates ---
		this.elements.forEach((el) => {
			const elDays = el.querySelector(this.options.daysSelector);
			const elHours = el.querySelector(this.options.hoursSelector);
			const elMin = el.querySelector(this.options.minutesSelector);
			const elSec = el.querySelector(this.options.secondsSelector);

			if (elDays) elDays.innerText = this.format(days);
			if (elHours) elHours.innerText = this.format(hours);
			if (elMin) elMin.innerText = this.format(minutes);
			if (elSec) elSec.innerText = this.format(seconds);
		});

		// --- Callback: Update ---
		if (typeof this.options.on.update === "function") {
			// Send progressObject as 2nd arg, individual values as 4th arg
			const individualTimeData = { days, hours, minutes, seconds };

			this.options.on.update(this, progressObject, timeLeft, individualTimeData);
		}

		// --- Finish Check ---
		if (timeLeft <= 0) {
			this.stop();
			if (typeof this.options.on.finish === "function") {
				this.options.on.finish(this);
			}
		}
	}

	// --- API Control Methods ---

	start() {
		this.isPaused = false;
		this.tick();
		if (this.intervalId) clearInterval(this.intervalId);
		this.intervalId = setInterval(() => this.tick(), 1000);
	}

	pause() {
		this.isPaused = true;
		this.pauseStart = new Date().getTime();
	}

	resume() {
		if (!this.isPaused) return;

		if (this.options.timer && this.options.timer.duration && this.options.timer.disableOnPause) {
			const now = new Date().getTime();
			const pauseDuration = now - this.pauseStart;
			this.targetTimestamp += pauseDuration;
			this.startTimestamp += pauseDuration;
		}

		this.start();
	}

	stop() {
		if (this.intervalId) {
			clearInterval(this.intervalId);
			this.intervalId = null;
		}
		this.isPaused = true;
	}

	restart() {
		this.stop();
		this.calculateTarget();
		this.start();
	}

	update(newOptions) {
		this.options = {
			...this.options,
			...newOptions,
			timer: {
				...this.options.timer,
				...(newOptions.timer || {}),
			},
			on: {
				...this.options.on,
				...(newOptions.on || {}),
			},
		};
		this.restart();
	}
}