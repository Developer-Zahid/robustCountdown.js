# [RobustCountdown.js ↗](https://developer-zahid.github.io/robustCountdown.js/)

A lightweight, zero-dependency JavaScript class for creating flexible, high-performance countdown timers. It supports both **fixed dates** (e.g., "New Year 2099") and **relative timers** (e.g., "5 minute challenge"), complete with pause/resume functionality, granular progress tracking, and extensive callbacks.

It is "headless," meaning it handles the logic and DOM updates while leaving the styling completely up to you (Tailwind, Bootstrap, or custom CSS).

## 🚀 Features

* **Zero Dependencies:** Pure vanilla JavaScript.
* **Two Modes:**
  * **Fixed Date:** Counts down to a specific date/time.
  * **Relative Timer:** Counts down a specific duration (e.g., 60 seconds) with support for looping.
* **Pause & Resume:** "Freeze" time or let it elapse in the background while paused.
* **Granular Progress:** Get calculated progress (0.0 - 1.0) for the total time, or individually for days, hours, minutes, and seconds.
* **Smart Pluralization:** easy access to raw time data to handle "Day" vs "Days".
* **Dynamic Updates:** Change target times or durations on the fly without reloading.

## 📦 Installation

Simply include the script via CDN before the closing `</body>` tag.

```html
<script src="https://cdn.jsdelivr.net/gh/Developer-Zahid/robustCountdown.js@latest/src/robustCountdown.min.js"></script>
```

## 📚 Usage

### 1. HTML Structure

Create your HTML container. You can use any class names you want; `RobustCountdown` uses data attributes (or custom selectors) to find the elements.

```html
<div id="my-countdown">
    <div>
        <span data-countdown-type="days">00</span>
        <small>Days</small>
    </div>
    <div>
        <span data-countdown-type="hours">00</span>
        <small>Hours</small>
    </div>
    <div>
        <span data-countdown-type="minutes">00</span>
        <small>Minutes</small>
    </div>
    <div>
        <span data-countdown-type="seconds">00</span>
        <small>Seconds</small>
    </div>
</div>
```

### 2. Basic Initialization (Fixed Date)

```javascript
const newYear = new RobustCountdown('#my-countdown', {
    year: 2027,
    month: 1, // January
    day: 1,
    hours: 0,
    on: {
        finish: (instance) => {
            alert("Happy New Year!");
        }
    }
});
```

### 3. Relative Timer (e.g., 60 Seconds)

```javascript
const timer = new RobustCountdown('#my-countdown', {
    timer: {
        duration: 60 * 1000, // 60 Seconds in milliseconds
        disableOnPause: true // Pausing stops the timer logic
    },
    on: {
        update: (instance, progress) => {
            console.log(`Progress: ${Math.round(progress.total * 100)}%`);
        }
    }
});
```

## ⚙️ Configuration Options

Pass these options as the second argument to `new RobustCountdown(selector, options)`.

| Option | Type | Default | Description | 
| :--- | :--- | :--- | :--- | 
| **Fixed Date Options** |  |  |  | 
| `year` | `Number` | `current` | Target year (e.g., `2099`). | 
| `month` | `Number` | `1` | Target month (**1-12**). Note: Not 0-indexed. | 
| `day` | `Number` | `1` | Target day of the month. | 
| `hours` | `Number` | `0` | Target hour (0-23). | 
| `minutes` | `Number` | `0` | Target minute (0-59). | 
| `seconds` | `Number` | `0` | Target second (0-59). | 
| `enableUTC` | `Boolean` | `false` | If `true`, treats the target inputs as UTC time. | 
| `targetTime` | `String` | `null` | *Legacy.* ISO date string (e.g., `"2025-12-31T23:59:59"`). | 
| **Relative Timer Options** |  |  |  | 
| `timer.duration` | `Number` | `null` | Duration in milliseconds. If set, overrides Fixed Date options. | 
| `timer.disableOnPause` | `Boolean` | `true` | If `true`, pausing "freezes" the countdown. If `false`, time continues to elapse in the background while paused. | 
| **DOM Selectors** |  |  |  | 
| `daysSelector` | `String` | `[data-countdown-type="days"]` | CSS selector for the days element. | 
| `hoursSelector` | `String` | `[data-countdown-type="hours"]` | CSS selector for the hours element. | 
| `minutesSelector` | `String` | `[data-countdown-type="minutes"]` | CSS selector for the minutes element. | 
| `secondsSelector` | `String` | `[data-countdown-type="seconds"]` | CSS selector for the seconds element. | 
| **Settings** |  |  |  | 
| `zeroPad` | `Boolean` | `true` | Adds a leading zero to numbers < 10 (e.g., `05` vs `5`). | 

## 📡 Events (Callbacks)

The `on` object allows you to hook into the countdown's lifecycle.

### `on.update(instance, progress, timeLeft, individualTimeData)`

Fires every second (tick).

* `instance`: The current RobustCountdown instance.
* `progress`: Object containing float values (0.0 to 1.0) representing completion.
  * `progress.total`: Total progress of the duration.
  * `progress.days`, `progress.hours`, etc.: Ratio of that specific unit (useful for circular progress bars).
* `timeLeft`: Number (milliseconds) remaining.
* `individualTimeData`: Object containing raw current values.
  * `{ days: 365, hours: 10, minutes: 5, seconds: 0 }`
  * *Tip:* Use this for pluralization logic (e.g., `days <= 1 ? "Day" : "Days"`).

### `on.finish(instance)`

Fires when the countdown reaches zero.

## 🎮 API Control Methods

Save your instance to a variable to control it programmatically.

```javascript
const myTimer = new RobustCountdown('#timer', { ... });

// 1. Pause
myTimer.pause();

// 2. Resume
myTimer.resume();

// 3. Restart (Recalculates target based on duration)
myTimer.restart();

// 4. Update Settings (e.g., Add 1 minute dynamically)
myTimer.update({
    timer: { duration: 60000 + 60000 } // Sets new duration to 2 mins
});
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.