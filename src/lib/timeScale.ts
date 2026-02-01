/**
 * Time scale utilities for mapping between years and scroll positions.
 *
 * Uses a hybrid log/linear scale:
 * - Deep history (3.3M BCE to 20,000 BCE): logarithmic compression
 * - Recent history (20,000 BCE to present): increasingly linear
 */

const EARLIEST_YEAR = -3_300_000; // 3.3 million years ago
const TRANSITION_YEAR = -20_000; // 20,000 BCE - transition point
const CURRENT_YEAR = 2026;

// What fraction of the scroll should deep history take?
const DEEP_HISTORY_FRACTION = 0.15; // 15% for 3.3M to 20K BCE

/**
 * Convert a year to a scroll position (0 to 1)
 * 0 = earliest (3.3M BCE), 1 = present (2026)
 */
export function yearToScroll(year: number): number {
  if (year <= TRANSITION_YEAR) {
    // Deep history: logarithmic scale
    // Map 3.3M BCE → 20K BCE to 0 → DEEP_HISTORY_FRACTION
    const logEarliest = Math.log(-EARLIEST_YEAR);
    const logTransition = Math.log(-TRANSITION_YEAR);
    const logYear = Math.log(-year);

    const t = (logEarliest - logYear) / (logEarliest - logTransition);
    return t * DEEP_HISTORY_FRACTION;
  } else {
    // Recent history: linear scale
    // Map 20K BCE → 2026 CE to DEEP_HISTORY_FRACTION → 1
    const t =
      (year - TRANSITION_YEAR) / (CURRENT_YEAR - TRANSITION_YEAR);
    return DEEP_HISTORY_FRACTION + t * (1 - DEEP_HISTORY_FRACTION);
  }
}

/**
 * Convert a scroll position (0 to 1) to a year
 */
export function scrollToYear(scroll: number): number {
  if (scroll <= DEEP_HISTORY_FRACTION) {
    // Deep history: inverse logarithmic
    const t = scroll / DEEP_HISTORY_FRACTION;
    const logEarliest = Math.log(-EARLIEST_YEAR);
    const logTransition = Math.log(-TRANSITION_YEAR);
    const logYear = logEarliest - t * (logEarliest - logTransition);
    return -Math.exp(logYear);
  } else {
    // Recent history: inverse linear
    const t = (scroll - DEEP_HISTORY_FRACTION) / (1 - DEEP_HISTORY_FRACTION);
    return TRANSITION_YEAR + t * (CURRENT_YEAR - TRANSITION_YEAR);
  }
}

/**
 * Get the earliest year in our timeline
 */
export function getEarliestYear(): number {
  return EARLIEST_YEAR;
}

/**
 * Get the current year
 */
export function getCurrentYear(): number {
  return CURRENT_YEAR;
}
