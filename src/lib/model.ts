/**
 * World History of Value - Computational Model
 *
 * This model computes total world value using:
 * - Population estimates through history
 * - GDP per capita (2011 international $) converted to 2025 USD
 * - A modeled wealth-to-income (capital/output) ratio
 *
 * For prehistory, it anchors on the first stone tool ($99) and interpolates
 * up to early agriculture. This keeps the earliest point grounded in a
 * concrete artifact while allowing later values to scale with production.
 */

// =============================================================================
// CONSTANTS
// =============================================================================

/** Model currency year */
export const MODEL_DOLLAR_YEAR = 2025;

/** Shadow wage rate in 2025 USD - used for labor-equivalent values */
export const SHADOW_WAGE_RATE = 10; // $/hour

/** GDP per-capita base year from Maddison Project Database (2011 international $) */
export const GDP_PER_CAPITA_BASE_YEAR = 2011;

/**
 * CPI conversion from 2011 USD to Dec 2025 USD (CPI-U, seasonally adjusted).
 * 2011 annual avg: 224.939, Dec 2025: 326.030 => 1.449×
 */
export const USD_2011_TO_2025 = 326.030 / 224.939;

/** First known manufactured object (Lomekwi tools) */
export const FIRST_TOOL_YEAR = -3_300_000;
export const FIRST_TOOL_VALUE = 20; // in MODEL_DOLLAR_YEAR USD (≈2 hours of labor @ $10/hr)

/** Early agriculture boundary for switching to GDP-based model */
export const AGRICULTURE_START_YEAR = -10_000;

/** Start year for GDP-based prehistory model */
export const PREHISTORY_MODEL_START_YEAR = -1_760_000;

/** Homo sapiens emergence - before this, we say "hominid" */
export const HOMO_SAPIENS_EMERGENCE = -300_000;

// =============================================================================
// POPULATION MODEL
// =============================================================================

interface PopulationDataPoint {
  year: number;
  population: number;
  source?: string;
  note?: string;
}

/**
 * Historical population estimates from archaeological and demographic research.
 * Sources: UN Population Division, Kremer (1993), McEvedy & Jones (1978)
 */
export const POPULATION_DATA: PopulationDataPoint[] = [
  { year: -3_300_000, population: 300_000, source: "Hominin estimates for Pliocene East Africa" },
  {
    year: -1_760_000,
    population: 400_000,
    note: "Assumed census population around early Acheulean expansion",
  },
  { year: -1_000_000, population: 500_000, source: "Homo erectus global spread (highly uncertain)" },
  {
    year: -930_000,
    population: 10_000,
    source: "FitCoal bottleneck estimate (Science 2023)",
    note: "Modeled census proxy for ~1,280 breeding individuals; effective size != census size",
  },
  {
    year: -813_000,
    population: 10_000,
    note: "End of FitCoal bottleneck window (population remains extremely low)",
  },
  { year: -800_000, population: 20_000, note: "Modeled early recovery after bottleneck" },
  { year: -700_000, population: 50_000, note: "Modeled post-bottleneck expansion" },
  { year: -300_000, population: 800_000, source: "Early Homo sapiens emergence" },
  { year: -50_000, population: 500_000, source: "Pre-Out of Africa migration" },
  { year: -20_000, population: 1_000_000, source: "Last Glacial Maximum" },
  { year: -10_000, population: 5_000_000, source: "End of last ice age" },
  { year: -5_000, population: 20_000_000, source: "Early agriculture spreading" },
  { year: -3_000, population: 50_000_000, source: "Bronze Age civilizations" },
  { year: -1_000, population: 100_000_000, source: "Iron Age" },
  { year: -500, population: 120_000_000, source: "Classical antiquity" },
  { year: 1, population: 200_000_000, source: "Roman Empire / Han Dynasty peak" },
  { year: 200, population: 220_000_000, source: "Post-Antonine Plague" },
  { year: 500, population: 210_000_000, source: "Post-Roman decline" },
  { year: 1000, population: 310_000_000, source: "Medieval warm period" },
  { year: 1200, population: 400_000_000, source: "Pre-Mongol expansion" },
  { year: 1350, population: 370_000_000, source: "Post-Black Death" },
  { year: 1500, population: 500_000_000, source: "Age of Exploration" },
  { year: 1600, population: 580_000_000, source: "Early modern period" },
  { year: 1700, population: 680_000_000, source: "Pre-Industrial" },
  { year: 1800, population: 1_000_000_000, source: "Industrial Revolution begins" },
  { year: 1850, population: 1_200_000_000, source: "Mid-Victorian era" },
  { year: 1900, population: 1_650_000_000, source: "Turn of century" },
  { year: 1950, population: 2_500_000_000, source: "Post-WWII" },
  { year: 1970, population: 3_700_000_000, source: "Green Revolution" },
  { year: 1990, population: 5_300_000_000, source: "End of Cold War" },
  { year: 2000, population: 6_100_000_000, source: "Millennium" },
  { year: 2010, population: 6_900_000_000, source: "Smartphone era" },
  { year: 2026, population: 8_200_000_000, source: "Present day" },
];

// =============================================================================
// LABOR HOURS MODEL
// =============================================================================

interface GdpPerCapitaDataPoint {
  year: number;
  gdpPerCapita2011: number; // 2011 international $
  source?: string;
  note?: string;
}

/**
 * World GDP per capita (2011 international $).
 * 1820+ values are from Maddison Project Database 2020.
 * Pre-1820 values are conservative assumptions reflecting near-subsistence output.
 */
export const GDP_PER_CAPITA_DATA: GdpPerCapitaDataPoint[] = [
  { year: PREHISTORY_MODEL_START_YEAR, gdpPerCapita2011: 400, note: "Assumed early Homo subsistence" },
  { year: -1_000_000, gdpPerCapita2011: 450, note: "Assumed Acheulean efficiency gains" },
  { year: -300_000, gdpPerCapita2011: 500, note: "Assumed Middle Pleistocene gains" },
  { year: -100_000, gdpPerCapita2011: 550, note: "Assumed late Pleistocene gains" },
  { year: -50_000, gdpPerCapita2011: 600, note: "Assumed hunter-gatherer subsistence" },
  { year: -20_000, gdpPerCapita2011: 650, note: "Assumed late Ice Age subsistence" },
  { year: AGRICULTURE_START_YEAR, gdpPerCapita2011: 700, note: "Assumed subsistence baseline" },
  { year: -5_000, gdpPerCapita2011: 800, note: "Assumed early agriculture gains" },
  { year: -3_000, gdpPerCapita2011: 900, note: "Assumed Bronze Age productivity" },
  { year: -1_000, gdpPerCapita2011: 950, note: "Assumed Iron Age plateau" },
  { year: 1, gdpPerCapita2011: 1_000, note: "Assumed pre-industrial plateau" },
  { year: 1000, gdpPerCapita2011: 900, note: "Assumed stagnation with regional shocks" },
  { year: 1500, gdpPerCapita2011: 1_000, note: "Assumed modest recovery" },
  { year: 1600, gdpPerCapita2011: 1_050, note: "Assumed early modern gains" },
  { year: 1700, gdpPerCapita2011: 1_100, note: "Assumed pre-industrial plateau" },
  { year: 1820, gdpPerCapita2011: 1_101.57, source: "Maddison Project Database 2020" },
  { year: 1850, gdpPerCapita2011: 1_225.08, source: "Maddison Project Database 2020" },
  { year: 1870, gdpPerCapita2011: 1_497.98, source: "Maddison Project Database 2020" },
  { year: 1900, gdpPerCapita2011: 2_212.04, source: "Maddison Project Database 2020" },
  { year: 1920, gdpPerCapita2011: 2_241.17, source: "Maddison Project Database 2020" },
  { year: 1940, gdpPerCapita2011: 3_133.20, source: "Maddison Project Database 2020" },
  { year: 1950, gdpPerCapita2011: 3_350.57, source: "Maddison Project Database 2020" },
  { year: 1960, gdpPerCapita2011: 4_385.79, source: "Maddison Project Database 2020" },
  { year: 1970, gdpPerCapita2011: 5_951.55, source: "Maddison Project Database 2020" },
  { year: 1980, gdpPerCapita2011: 7_232.97, source: "Maddison Project Database 2020" },
  { year: 1990, gdpPerCapita2011: 8_222.48, source: "Maddison Project Database 2020" },
  { year: 2000, gdpPerCapita2011: 9_914.57, source: "Maddison Project Database 2020" },
  { year: 2010, gdpPerCapita2011: 13_179.50, source: "Maddison Project Database 2020" },
  { year: 2016, gdpPerCapita2011: 14_700.37, source: "Maddison Project Database 2020" },
  { year: 2018, gdpPerCapita2011: 15_212.42, source: "Maddison Project Database 2020" },
  { year: 2026, gdpPerCapita2011: 17_558.91, note: "Projection using 2010-2018 CAGR" },
];

interface WealthIncomeRatioDataPoint {
  year: number;
  ratio: number; // wealth / income
  note?: string;
}

/**
 * Wealth-to-income (capital/output) ratio assumptions.
 * Global ratios are modeled conservatively and increase with capital deepening.
 */
export const WEALTH_INCOME_RATIO_DATA: WealthIncomeRatioDataPoint[] = [
  { year: PREHISTORY_MODEL_START_YEAR, ratio: 0.5, note: "Very low durable capital stock" },
  { year: -1_000_000, ratio: 0.6, note: "Sparse portable assets" },
  { year: -300_000, ratio: 0.65, note: "Slow capital accumulation" },
  { year: -100_000, ratio: 0.7, note: "Late Pleistocene assets" },
  { year: -50_000, ratio: 0.75, note: "Small-band portable assets" },
  { year: -20_000, ratio: 0.8, note: "Sparse portable assets" },
  { year: AGRICULTURE_START_YEAR, ratio: 1.0, note: "Minimal durable capital stock" },
  { year: -3_000, ratio: 1.3, note: "Early state infrastructure" },
  { year: -1_000, ratio: 1.6, note: "Iron Age assets and land improvements" },
  { year: 1, ratio: 1.8, note: "Classical era" },
  { year: 1000, ratio: 2.0, note: "Medieval plateau" },
  { year: 1500, ratio: 2.2, note: "Early modern capital accumulation" },
  { year: 1700, ratio: 2.4, note: "Pre-industrial capital deepening" },
  { year: 1820, ratio: 2.5, note: "Early industrial era" },
  { year: 1900, ratio: 2.8, note: "Industrial capital stock expansion" },
  { year: 1950, ratio: 2.5, note: "Post-war destruction and rebuilding" },
  { year: 1970, ratio: 2.8, note: "Re-accumulation of capital" },
  { year: 1990, ratio: 3.0, note: "Globalization and asset appreciation" },
  { year: 2000, ratio: 3.1, note: "Financialization accelerates" },
  { year: 2010, ratio: 3.2, note: "Rising asset prices" },
  { year: 2018, ratio: 3.2, note: "Modern capital/output ratios" },
  { year: 2026, ratio: 3.3, note: "Projection" },
];

interface MedianMeanRatioDataPoint {
  year: number;
  ratio: number; // median / mean
  note?: string;
  source?: string;
}

export const GLOBAL_MEAN_WEALTH_2022 = 84_718;
export const GLOBAL_MEDIAN_WEALTH_2022 = 8_654;
export const GLOBAL_MEDIAN_MEAN_RATIO_2022 =
  GLOBAL_MEDIAN_WEALTH_2022 / GLOBAL_MEAN_WEALTH_2022;

/**
 * Median-to-mean ratio assumptions for global wealth distribution.
 * Anchored on end-2022 Global Wealth Databook values, with a long-run
 * decline from relatively equal small-band societies to modern inequality.
 */
export const MEDIAN_MEAN_RATIO_DATA: MedianMeanRatioDataPoint[] = [
  { year: FIRST_TOOL_YEAR, ratio: 0.001, note: "Single-tool monopoly (median ~0)" },
  { year: -1_000_000, ratio: 0.75, note: "Small bands, relatively equal shares" },
  { year: -50_000, ratio: 0.7, note: "Growing inequality with wider exchange" },
  { year: AGRICULTURE_START_YEAR, ratio: 0.6, note: "Agriculture introduces inequality" },
  { year: -3_000, ratio: 0.4, note: "Early states and elites" },
  { year: -1_000, ratio: 0.35, note: "Iron Age stratification" },
  { year: 1, ratio: 0.3, note: "Classical era inequality" },
  { year: 1000, ratio: 0.25, note: "Medieval hierarchy" },
  { year: 1500, ratio: 0.22, note: "Early modern accumulation" },
  { year: 1820, ratio: 0.2, note: "Industrial era begins" },
  { year: 1900, ratio: 0.18, note: "Industrial capitalism" },
  { year: 1950, ratio: 0.16, note: "Post-war inequality" },
  { year: 1970, ratio: 0.14, note: "Globalization accelerates" },
  { year: 1990, ratio: 0.12, note: "Financialization" },
  { year: 2000, ratio: 0.11, note: "Dot-com era inequality" },
  { year: 2010, ratio: 0.105, note: "Rising asset prices" },
  {
    year: 2022,
    ratio: GLOBAL_MEDIAN_MEAN_RATIO_2022,
    note: "Global mean vs median wealth per adult",
    source: "Global Wealth Databook 2023 (end-2022)",
  },
  { year: 2026, ratio: 0.1, note: "Projection" },
];

// =============================================================================
// INTERPOLATION UTILITIES
// =============================================================================

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function logLerp(a: number, b: number, t: number): number {
  if (a <= 0 || b <= 0) return lerp(a, b, t);
  return Math.exp(lerp(Math.log(a), Math.log(b), t));
}

function findBracket<T extends { year: number }>(
  data: T[],
  year: number
): [T, T, number] | null {
  const sorted = [...data].sort((a, b) => a.year - b.year);

  for (let i = 0; i < sorted.length - 1; i++) {
    if (year >= sorted[i].year && year <= sorted[i + 1].year) {
      const t = (year - sorted[i].year) / (sorted[i + 1].year - sorted[i].year);
      return [sorted[i], sorted[i + 1], t];
    }
  }

  if (year < sorted[0].year) return [sorted[0], sorted[0], 0];
  if (year > sorted[sorted.length - 1].year) {
    const last = sorted[sorted.length - 1];
    return [last, last, 0];
  }

  return null;
}

// =============================================================================
// COMPUTATION FUNCTIONS
// =============================================================================

/**
 * Get interpolated population for any year
 */
export function getPopulation(year: number): number {
  const bracket = findBracket(POPULATION_DATA, year);
  if (!bracket) return 0;

  const [before, after, t] = bracket;
  // Use log interpolation for population (exponential growth)
  return Math.round(logLerp(before.population, after.population, t));
}

/**
 * Get interpolated GDP per capita (2011 international $)
 */
export function getGdpPerCapita(year: number): number {
  const bracket = findBracket(GDP_PER_CAPITA_DATA, year);
  if (!bracket) return 0;

  const [before, after, t] = bracket;
  // Use log interpolation to reflect exponential growth
  return logLerp(before.gdpPerCapita2011, after.gdpPerCapita2011, t);
}

/**
 * Get interpolated wealth-to-income ratio for any year
 */
export function getWealthIncomeRatio(year: number): number {
  const bracket = findBracket(WEALTH_INCOME_RATIO_DATA, year);
  if (!bracket) return 0;

  const [before, after, t] = bracket;
  return logLerp(before.ratio, after.ratio, t);
}

/**
 * Get interpolated median-to-mean ratio for any year
 */
export function getMedianToMeanRatio(year: number): number {
  const bracket = findBracket(MEDIAN_MEAN_RATIO_DATA, year);
  if (!bracket) return 0;

  const [before, after, t] = bracket;
  const ratio = lerp(before.ratio, after.ratio, t);
  return clamp01(ratio);
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function computeWealthFromGdp(year: number): number {
  const population = getPopulation(year);
  const gdpPerCapita2011 = getGdpPerCapita(year);
  const gdpPerCapitaModel = gdpPerCapita2011 * USD_2011_TO_2025;
  const ratio = getWealthIncomeRatio(year);
  return population * gdpPerCapitaModel * ratio;
}

/**
 * Get total world value for any year using the wealth model
 */
export function computeWorldValue(year: number): number {
  if (year < FIRST_TOOL_YEAR) {
    return 0;
  }
  if (year < PREHISTORY_MODEL_START_YEAR) {
    const prehistoryWealth = computeWealthFromGdp(PREHISTORY_MODEL_START_YEAR);
    const t = clamp01(
      (year - FIRST_TOOL_YEAR) /
        (PREHISTORY_MODEL_START_YEAR - FIRST_TOOL_YEAR)
    );
    return logLerp(FIRST_TOOL_VALUE, prehistoryWealth, t);
  }

  const population = getPopulation(year);
  if (population === 0) return 0;
  return computeWealthFromGdp(year);
}

/**
 * Get labor hours per person for any year
 */
export function getLaborHoursPerPerson(year: number): number {
  const population = getPopulation(year);
  if (population === 0) return 0;
  const totalValue = computeWorldValue(year);
  return totalValue / (population * SHADOW_WAGE_RATE);
}

/**
 * Get average net worth for any year
 */
export function computeAverageNetWorth(year: number): number {
  const population = getPopulation(year);
  if (population === 0) return 0;

  const totalValue = computeWorldValue(year);
  return totalValue / population;
}

/**
 * Compute all values for a given year
 */
export interface ComputedTimePoint {
  year: number;
  population: number;
  totalWorldValue: number;
  averageNetWorth: number;
  medianNetWorth: number;
  medianToMeanRatio: number;
  laborHoursPerPerson: number;
}

export function computeTimePoint(year: number): ComputedTimePoint {
  const population = getPopulation(year);
  const laborHoursPerPerson = getLaborHoursPerPerson(year);
  const totalWorldValue = computeWorldValue(year);
  const averageNetWorth = population > 0 ? totalWorldValue / population : 0;
  const medianToMeanRatio = getMedianToMeanRatio(year);
  const medianNetWorth = averageNetWorth * medianToMeanRatio;

  return {
    year,
    population,
    totalWorldValue,
    averageNetWorth,
    medianNetWorth,
    medianToMeanRatio,
    laborHoursPerPerson,
  };
}

// =============================================================================
// GENERATE CALCULATION BREAKDOWN
// =============================================================================

import type { CalculationLine } from "./types";

export function generateCalculationLines(year: number): CalculationLine[] {
  const data = computeTimePoint(year);
  const lines: CalculationLine[] = [];
  const gdpPerCapita2011 = getGdpPerCapita(year);
  const gdpPerCapitaModel = gdpPerCapita2011 * USD_2011_TO_2025;
  const wealthIncomeRatio = getWealthIncomeRatio(year);

  // Population section
  lines.push({ label: "Population Model", isSectionHeader: true });
  lines.push({
    label: year < HOMO_SAPIENS_EMERGENCE ? "Hominid population" : "Human population",
    value: data.population.toLocaleString(),
    indent: 0
  });

  // Find population source
  const popBracket = findBracket(POPULATION_DATA, year);
  if (popBracket) {
    const [before, after] = popBracket;
    if (before.source) {
      lines.push({ label: `Source: ${before.source}`, indent: 1 });
    }
    if (before.note) {
      lines.push({ label: `Note: ${before.note}`, indent: 1 });
    }
  }

  const isPreTool = year < FIRST_TOOL_YEAR;

  // Wealth model section
  lines.push({ label: "Wealth Model", isSectionHeader: true });
  if (isPreTool) {
    lines.push({ label: "Method: Pre-tool baseline", indent: 0 });
    lines.push({
      label: "World value before manufactured tools",
      value: "$0",
      indent: 0
    });
  } else if (year < PREHISTORY_MODEL_START_YEAR) {
    const prehistoryWealth = computeWorldValue(PREHISTORY_MODEL_START_YEAR);
    lines.push({ label: "Method: Prehistoric anchor interpolation", indent: 0 });
    lines.push({
      label: `First tool value (${MODEL_DOLLAR_YEAR} USD)`,
      value: "$" + formatLargeNumber(FIRST_TOOL_VALUE),
      indent: 0
    });
    lines.push({
      label: `Prehistory wealth (${Math.abs(PREHISTORY_MODEL_START_YEAR)} BCE)`,
      value: "$" + formatLargeNumber(prehistoryWealth),
      indent: 0
    });
    lines.push({ label: "Interpolation", value: "log-scaled between anchors", indent: 0 });
  } else {
    lines.push({
      label: "Method: Population × GDP per capita × wealth-income ratio",
      indent: 0
    });
    lines.push({
      label: `GDP per capita (${GDP_PER_CAPITA_BASE_YEAR} intl $)`,
      value: "$" + formatLargeNumber(gdpPerCapita2011),
      indent: 0
    });
    const gdpBracket = findBracket(GDP_PER_CAPITA_DATA, year);
    if (gdpBracket) {
      const [before] = gdpBracket;
      if (before.source) {
        lines.push({ label: `GDP source: ${before.source}`, indent: 1 });
      }
      if (before.note) {
        lines.push({ label: `GDP assumption: ${before.note}`, indent: 1 });
      }
    }
    lines.push({
      label: `CPI conversion to ${MODEL_DOLLAR_YEAR} USD`,
      value: USD_2011_TO_2025.toFixed(3) + "×",
      indent: 1
    });
    lines.push({
      label: `GDP per capita (${MODEL_DOLLAR_YEAR} USD)`,
      value: "$" + formatLargeNumber(gdpPerCapitaModel),
      indent: 0
    });
    lines.push({
      label: "Wealth-income ratio",
      value: wealthIncomeRatio.toFixed(2) + "×",
      indent: 0
    });
    const ratioBracket = findBracket(WEALTH_INCOME_RATIO_DATA, year);
    if (ratioBracket) {
      const [before] = ratioBracket;
      if (before.note) {
        lines.push({ label: `Ratio assumption: ${before.note}`, indent: 1 });
      }
    }
  }

  // Computation
  lines.push({ label: "Computation", isSectionHeader: true });
  if (isPreTool) {
    lines.push({
      label: "Formula",
      value: "pre-tool baseline",
      indent: 0
    });
  } else if (year >= PREHISTORY_MODEL_START_YEAR) {
    lines.push({
      label: "Formula",
      value:
        formatLargeNumber(data.population) +
        " × $" +
        formatLargeNumber(gdpPerCapitaModel) +
        " × " +
        wealthIncomeRatio.toFixed(2) +
        "×",
      indent: 0
    });
  } else {
    lines.push({
      label: "Formula",
      value: "log interpolation between anchor points",
      indent: 0
    });
  }

  lines.push({
    label: "Total world value",
    value: "$" + formatLargeNumber(data.totalWorldValue),
    isTotal: true
  });

  // Per capita
  lines.push({ label: "Per Capita", isSectionHeader: true });
  lines.push({
    label: "Average net worth",
    value: "$" + formatLargeNumber(data.averageNetWorth),
    formula: "$" + formatLargeNumber(data.totalWorldValue) + " ÷ " + formatLargeNumber(data.population),
    isTotal: true
  });
  lines.push({
    label: "Median net worth (estimate)",
    value: "$" + formatLargeNumber(data.medianNetWorth),
    formula: `$${formatLargeNumber(data.averageNetWorth)} × ${data.medianToMeanRatio.toFixed(2)}`,
    indent: 0
  });
  lines.push({
    label: "Median/mean ratio",
    value: data.medianToMeanRatio.toFixed(2) + "×",
    indent: 0
  });
  lines.push({
    label: "Implied labor hours per person",
    value: data.laborHoursPerPerson.toFixed(1) + " hours",
    indent: 0
  });
  lines.push({
    label: `Shadow wage rate (${MODEL_DOLLAR_YEAR} USD)`,
    value: "$" + SHADOW_WAGE_RATE + "/hour",
    indent: 0
  });

  // Sources
  lines.push({ label: "Sources (High-Level)", isSectionHeader: true });
  lines.push({
    label: "GDP per capita: Maddison Project Database 2020 (2011 intl $)",
    indent: 0
  });
  lines.push({
    label: `CPI conversion: FRED CPIAUCSL (BLS CPI-U, Dec 2025)`,
    indent: 0
  });
  lines.push({
    label: "Wealth-income ratio: based on long-run capital/output ranges",
    indent: 0
  });
  lines.push({
    label: `Global median vs mean anchor (end-2022): $${GLOBAL_MEDIAN_WEALTH_2022.toLocaleString()} median, $${GLOBAL_MEAN_WEALTH_2022.toLocaleString()} mean`,
    indent: 0
  });

  return lines;
}

function formatLargeNumber(n: number): string {
  if (n >= 1e12) return (n / 1e12).toFixed(1) + "T";
  if (n >= 1e9) return (n / 1e9).toFixed(1) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  if (n < 0.01 && n > 0) return n.toExponential(2);
  return n.toFixed(2);
}
