import type { TimePoint, Entity } from "./types";
import { computeTimePoint } from "./model";

/**
 * Find the two time points that bracket a given year
 */
function findBracketingPoints(
  timePoints: TimePoint[],
  year: number
): [TimePoint, TimePoint] | null {
  // Sort by year ascending
  const sorted = [...timePoints].sort((a, b) => a.year - b.year);

  // Find the bracketing points
  for (let i = 0; i < sorted.length - 1; i++) {
    if (year >= sorted[i].year && year <= sorted[i + 1].year) {
      return [sorted[i], sorted[i + 1]];
    }
  }

  // If before first point, clamp to first
  if (year < sorted[0].year) {
    return [sorted[0], sorted[0]];
  }

  // If after last point, clamp to last
  if (year > sorted[sorted.length - 1].year) {
    const last = sorted[sorted.length - 1];
    return [last, last];
  }

  return null;
}

/**
 * Interpolate an entity (person, empire, company)
 * Returns the closer one based on t
 */
function interpolateEntity(
  a: Entity | null,
  b: Entity | null,
  t: number
): Entity | null {
  // If both null, return null
  if (!a && !b) return null;

  // Use the closer one - if closer one is null, return null
  if (t < 0.5) {
    return a;
  } else {
    return b;
  }
}

/**
 * Interpolate time point data for a given year
 */
export function interpolateTimePoint(
  timePoints: TimePoint[],
  year: number
): TimePoint {
  const bracket = findBracketingPoints(timePoints, year);

  if (!bracket) {
    // Fallback - return zeros
    return {
      year,
      totalWorldValue: 0,
      population: 0,
      averageNetWorth: 0,
      medianNetWorth: 0,
      wealthiestPerson: null,
      wealthiestEmpire: null,
      mostValuableCompany: null,
    };
  }

  const [before, after] = bracket;

  // If same point, return it directly
  if (before.year === after.year) {
    return { ...before, year };
  }

  // Calculate interpolation factor
  const t = (year - before.year) / (after.year - before.year);

  const computed = computeTimePoint(year);

  return {
    year,
    totalWorldValue: computed.totalWorldValue,
    population: computed.population,
    averageNetWorth: computed.averageNetWorth,
    medianNetWorth: computed.medianNetWorth,
    wealthiestPerson: interpolateEntity(
      before.wealthiestPerson,
      after.wealthiestPerson,
      t
    ),
    wealthiestEmpire: interpolateEntity(
      before.wealthiestEmpire,
      after.wealthiestEmpire,
      t
    ),
    mostValuableCompany: interpolateEntity(
      before.mostValuableCompany,
      after.mostValuableCompany,
      t
    ),
  };
}
