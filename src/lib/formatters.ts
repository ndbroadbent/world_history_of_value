/**
 * Format a number as currency with appropriate suffix
 * e.g., 1000 -> "$1K", 1000000 -> "$1M", 1000000000 -> "$1B"
 */
export function formatCurrency(value: number): string {
  if (value === 0) return "$0";

  const absValue = Math.abs(value);
  const sign = value < 0 ? "-" : "";

  if (absValue >= 1_000_000_000_000_000) {
    return `${sign}$${(absValue / 1_000_000_000_000_000).toFixed(1)}Q`;
  }
  if (absValue >= 1_000_000_000_000) {
    return `${sign}$${(absValue / 1_000_000_000_000).toFixed(1)}T`;
  }
  if (absValue >= 1_000_000_000) {
    return `${sign}$${(absValue / 1_000_000_000).toFixed(1)}B`;
  }
  if (absValue >= 1_000_000) {
    return `${sign}$${(absValue / 1_000_000).toFixed(1)}M`;
  }
  if (absValue >= 1_000) {
    return `${sign}$${(absValue / 1_000).toFixed(1)}K`;
  }
  return `${sign}$${absValue.toFixed(0)}`;
}

/**
 * Format a year for display
 * e.g., -3300000 -> "3.3M BCE", -2000 -> "2000 BCE", 2025 -> "2025 CE"
 */
export function formatYear(year: number): string {
  if (year < 0) {
    const absYear = Math.abs(year);
    if (absYear >= 1_000_000) {
      return `${(absYear / 1_000_000).toFixed(1)}M BCE`;
    }
    if (absYear >= 1_000) {
      return `${(absYear / 1_000).toFixed(0)}K BCE`;
    }
    return `${absYear} BCE`;
  }
  return `${year} CE`;
}

/**
 * Format a population number with appropriate suffix
 * e.g., 1000000 -> "1M", 8100000000 -> "8.1B"
 */
export function formatPopulation(value: number): string {
  if (value === 0) return "0";

  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)}B`;
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(0)}K`;
  }
  return value.toLocaleString();
}

/**
 * Format a year more precisely for tooltips
 */
export function formatYearPrecise(year: number): string {
  if (year < 0) {
    const absYear = Math.abs(year);
    if (absYear >= 1_000_000) {
      return `${(absYear / 1_000_000).toFixed(2)} million years ago`;
    }
    if (absYear >= 10_000) {
      return `${(absYear / 1_000).toFixed(1)}K BCE`;
    }
    return `${absYear} BCE`;
  }
  if (year === 0) return "1 BCE/1 CE";
  return `${year} CE`;
}
