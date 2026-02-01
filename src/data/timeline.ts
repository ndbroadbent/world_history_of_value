import type { TimePoint, TimelineEvent, TimelineData, Entity } from "../lib/types";
import {
  computeTimePoint,
  generateCalculationLines,
  MODEL_DOLLAR_YEAR,
  FIRST_TOOL_VALUE,
  SHADOW_WAGE_RATE,
} from "../lib/model";


const IMAGE_BASE = import.meta.env.DEV
  ? "/images/"
  : "/2026/02/01/world-history-of-value/images/";

const img = (name: string) => `${IMAGE_BASE}${name}.jpg`;

// =============================================================================
// GENERATE TIME POINTS FROM MODEL
// =============================================================================

interface EntityConfig {
  name: string;
  title?: string;
  value?: number;
  shareOfWorld?: number;
  capShareOfWorld?: number;
}

interface TimePointConfig {
  year: number;
  wealthiestPerson: EntityConfig | null;
  wealthiestEmpire: EntityConfig | null;
  mostValuableCompany: EntityConfig | null;
}

function resolveEntity(
  config: EntityConfig | null,
  totalWorldValue: number
): Entity | null {
  if (!config) return null;

  let value = 0;
  if (config.shareOfWorld !== undefined) {
    value = totalWorldValue * config.shareOfWorld;
  } else if (config.value !== undefined) {
    value = config.value;
  }

  if (config.capShareOfWorld !== undefined) {
    value = Math.min(value, totalWorldValue * config.capShareOfWorld);
  }

  return {
    name: config.name,
    title: config.title,
    value,
  };
}

/**
 * Configuration for each era - the model computes population, total value,
 * and average net worth. We specify the entities (people, empires, companies).
 */
const TIME_POINT_CONFIGS: TimePointConfig[] = [
  {
    year: -3_300_001,
    wealthiestPerson: null,
    wealthiestEmpire: null,
    mostValuableCompany: null,
  },
  {
    year: -3_300_000,
    wealthiestPerson: { name: "Unknown Hominin", shareOfWorld: 1.0 },
    wealthiestEmpire: null,
    mostValuableCompany: null,
  },
  {
    year: -2_227_000,
    wealthiestPerson: { name: "Clan Leader", shareOfWorld: 0.02 },
    wealthiestEmpire: null,
    mostValuableCompany: null,
  },
  {
    year: -1_760_000,
    wealthiestPerson: { name: "Homo erectus toolmaker", shareOfWorld: 0.02 },
    wealthiestEmpire: null,
    mostValuableCompany: null,
  },
  {
    year: -1_000_000,
    wealthiestPerson: { name: "Firekeeper", shareOfWorld: 0.02 },
    wealthiestEmpire: null,
    mostValuableCompany: null,
  },
  {
    year: -900_000,
    wealthiestPerson: { name: "Survivor Lineage", shareOfWorld: 0.02 },
    wealthiestEmpire: null,
    mostValuableCompany: null,
  },
  {
    year: -50_000,
    wealthiestPerson: { name: "Band Elder", shareOfWorld: 0.015 },
    wealthiestEmpire: null,
    mostValuableCompany: null,
  },
  {
    year: -20_000,
    wealthiestPerson: { name: "Tribal Chief", shareOfWorld: 0.02 },
    wealthiestEmpire: null,
    mostValuableCompany: null,
  },
  {
    year: -10_000,
    wealthiestPerson: { name: "Village Elder", shareOfWorld: 0.02 },
    wealthiestEmpire: null,
    mostValuableCompany: null,
  },
  {
    year: -3_300,
    wealthiestPerson: { name: "City Ruler", shareOfWorld: 0.01 },
    wealthiestEmpire: { name: "Early City-States", shareOfWorld: 0.05 },
    mostValuableCompany: null,
  },
  {
    year: -1_200,
    wealthiestPerson: { name: "Warrior-King", shareOfWorld: 0.006 },
    wealthiestEmpire: { name: "Iron Age Kingdoms", shareOfWorld: 0.08 },
    mostValuableCompany: null,
  },
  {
    year: -3_000,
    wealthiestPerson: { name: "Khufu", title: "Pharaoh of Egypt", shareOfWorld: 0.01 },
    wealthiestEmpire: { name: "Egypt", shareOfWorld: 0.08 },
    mostValuableCompany: null,
  },
  {
    year: -600,
    wealthiestPerson: { name: "Croesus", title: "King of Lydia", shareOfWorld: 0.005 },
    wealthiestEmpire: { name: "Lydia", shareOfWorld: 0.01 },
    mostValuableCompany: null,
  },
  {
    year: 117,
    wealthiestPerson: { name: "Augustus Caesar", shareOfWorld: 0.005 },
    wealthiestEmpire: { name: "Roman Empire", shareOfWorld: 0.25 },
    mostValuableCompany: null,
  },
  {
    year: 1324,
    wealthiestPerson: { name: "Mansa Musa", title: "King of Mali", shareOfWorld: 0.008 },
    wealthiestEmpire: { name: "Mali Empire", shareOfWorld: 0.015 },
    mostValuableCompany: null,
  },
  {
    year: 1602,
    wealthiestPerson: { name: "Jakob Fugger", title: "Banker", shareOfWorld: 0.003 },
    wealthiestEmpire: { name: "Ming Dynasty", shareOfWorld: 0.3 },
    mostValuableCompany: { name: "Dutch East India Company", shareOfWorld: 0.004 },
  },
  {
    year: 1859,
    wealthiestPerson: { name: "Cornelius Vanderbilt", shareOfWorld: 0.002 },
    wealthiestEmpire: { name: "British Empire", shareOfWorld: 0.24 },
    mostValuableCompany: { name: "British East India Company", shareOfWorld: 0.01 },
  },
  {
    year: 1913,
    wealthiestPerson: { name: "John D. Rockefeller", shareOfWorld: 0.002 },
    wealthiestEmpire: { name: "British Empire", shareOfWorld: 0.23 },
    mostValuableCompany: { name: "Standard Oil", shareOfWorld: 0.008 },
  },
  {
    year: 1966,
    wealthiestPerson: { name: "J. Paul Getty", title: "Oil Magnate", shareOfWorld: 0.0006 },
    wealthiestEmpire: { name: "United States", shareOfWorld: 0.3 },
    mostValuableCompany: { name: "IBM", shareOfWorld: 0.003 },
  },
  {
    year: 2000,
    wealthiestPerson: { name: "Bill Gates", shareOfWorld: 0.0008 },
    wealthiestEmpire: { name: "United States", shareOfWorld: 0.25 },
    mostValuableCompany: { name: "Microsoft", shareOfWorld: 0.006 },
  },
  {
    year: 2026,
    wealthiestPerson: { name: "Elon Musk", shareOfWorld: 0.0009 },
    wealthiestEmpire: { name: "United States", shareOfWorld: 0.24 },
    mostValuableCompany: { name: "Apple", shareOfWorld: 0.006 },
  },
];

/**
 * Generate TimePoints by computing values from the model
 * and merging with entity configurations
 */
function generateTimePoints(): TimePoint[] {
  return TIME_POINT_CONFIGS.map((config) => {
    const computed = computeTimePoint(config.year);
    return {
      year: config.year,
      population: computed.population,
      totalWorldValue: computed.totalWorldValue,
      averageNetWorth: computed.averageNetWorth,
      medianNetWorth: computed.medianNetWorth,
      wealthiestPerson: resolveEntity(
        config.wealthiestPerson,
        computed.totalWorldValue
      ),
      wealthiestEmpire: resolveEntity(
        config.wealthiestEmpire,
        computed.totalWorldValue
      ),
      mostValuableCompany: resolveEntity(
        config.mostValuableCompany,
        computed.totalWorldValue
      ),
    };
  });
}

export const timePoints: TimePoint[] = generateTimePoints();

const timePointMap = new Map(timePoints.map((point) => [point.year, point]));
function tp(year: number): TimePoint {
  const point = timePointMap.get(year);
  if (!point) {
    throw new Error(`Missing time point for year ${year}`);
  }
  return point;
}

// =============================================================================
// HELPER FUNCTIONS FOR DYNAMIC VALUES
// =============================================================================

function fmt(n: number): string {
  if (n >= 1e14) return "$" + Math.round(n / 1e13) * 10 + " trillion"; // 100+ trillion: round to 10s
  if (n >= 1e13) return "$" + Math.round(n / 1e12) + " trillion"; // 10-99 trillion: whole numbers
  if (n >= 1e12) return "$" + (n / 1e12).toFixed(1) + " trillion";
  if (n >= 1e11) return "$" + Math.round(n / 1e10) * 10 + " billion"; // 100+ billion: round to 10s
  if (n >= 1e9) return "$" + (n / 1e9).toFixed(1) + " billion";
  if (n >= 1e6) return "$" + (n / 1e6).toFixed(1) + " million";
  if (n >= 1e3) return "$" + (n / 1e3).toFixed(0) + "K";
  if (n < 0.01 && n > 0) return "$" + n.toExponential(2);
  return "$" + n.toFixed(0);
}

function fmtPop(n: number): string {
  if (n >= 1e9) return (n / 1e9).toFixed(1) + " billion";
  if (n >= 1e6) return (n / 1e6).toFixed(1) + " million";
  if (n >= 1e3) return Math.round(n / 1e3) + ",000";
  return n.toLocaleString();
}

function fmtShort(n: number): string {
  if (n >= 1e14) return "$" + Math.round(n / 1e13) * 10 + "T"; // 100+ trillion: round to 10s
  if (n >= 1e13) return "$" + Math.round(n / 1e12) + "T"; // 10-99 trillion: whole numbers
  if (n >= 1e12) return "$" + (n / 1e12).toFixed(1) + "T";
  if (n >= 1e11) return "$" + Math.round(n / 1e10) * 10 + "B"; // 100+ billion: round to 10s
  if (n >= 1e9) return "$" + (n / 1e9).toFixed(1) + "B";
  if (n >= 1e6) return "$" + (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return "$" + (n / 1e3).toFixed(0) + "K";
  return "$" + n.toFixed(2);
}

function fmtPercent(value: number): string {
  if (!Number.isFinite(value)) return "0%";
  const percent = value * 100;
  if (percent < 0.01) return "<0.01%";
  return percent.toFixed(2) + "%";
}

/** Get computed values for a year */
function c(year: number) {
  return computeTimePoint(year);
}

// =============================================================================
// TIMELINE EVENTS
// =============================================================================

// Use IIFE to allow computed values in event definitions
const computed_3300000 = c(-3_300_000);
const computed_2227000 = c(-2_227_000);
const computed_1760000 = c(-1_760_000);
const computed_1000000 = c(-1_000_000);
const computed_900000 = c(-900_000);
const computed_50000 = c(-50_000);
const computed_20000 = c(-20_000);
const computed_10000 = c(-10_000);
const computed_3300 = c(-3_300);
const computed_1200 = c(-1_200);
const computed_3000 = c(-3_000);
const computed_600 = c(-600);
const computed_117 = c(117);
const computed_1324 = c(1324);
const computed_1602 = c(1602);
const computed_1859 = c(1859);
const computed_1913 = c(1913);
const computed_1966 = c(1966);
const computed_1995 = c(1995);
const computed_2007 = c(2007);
const computed_2026 = c(2026);

const tp_3300000 = tp(-3_300_000);
const tp_2227000 = tp(-2_227_000);
const tp_1760000 = tp(-1_760_000);
const tp_1000000 = tp(-1_000_000);
const tp_50000 = tp(-50_000);
const tp_10000 = tp(-10_000);
const tp_3300 = tp(-3_300);
const tp_1200 = tp(-1_200);
const tp_3000 = tp(-3_000);
const tp_600 = tp(-600);
const tp_117 = tp(117);
const tp_1324 = tp(1324);
const tp_1602 = tp(1602);
const tp_1913 = tp(1913);
const tp_1966 = tp(1966);
const tp_2026 = tp(2026);

export const events: TimelineEvent[] = [
  {
    year: -3_300_000,
    title: "First Stone Tools",
    image: img("first_stone_tools"),
    description:
      `Roughly 3.3 million years ago, an early hominin strikes one stone against another and creates the first manufactured object in history. These Lomekwi tools predate Homo sapiens by millions of years. Here, that single tool anchors world value at <strong>${fmtShort(FIRST_TOOL_VALUE)}</strong> (${MODEL_DOLLAR_YEAR} USD), based on ~2 hours of labor at $${SHADOW_WAGE_RATE}/hour. Total world value at this point: <strong>${fmtShort(computed_3300000.totalWorldValue)}</strong>. The wealthiest person holds essentially all value (~${fmtPercent((tp_3300000.wealthiestPerson?.value ?? 0) / computed_3300000.totalWorldValue)}).`,
    category: "tool",
    valueImpact: `World value: $0 → ${fmtShort(computed_3300000.totalWorldValue)}`,
    calculation: {
      summary: `Estimate: ${fmtShort(computed_3300000.totalWorldValue)} total world value`,
      lines: generateCalculationLines(-3_300_000),
    },
  },
  {
    year: -2_227_000,
    title: "First $1 Million",
    image: img("first_million"),
    description:
      `As hominins spread and tool use becomes more routine, total world value crosses the <strong>$1 million</strong> threshold (in ${MODEL_DOLLAR_YEAR} USD). The crossover lands around <strong>2.23 million years ago</strong>. Total world value: <strong>${fmt(computed_2227000.totalWorldValue)}</strong>.`,
    category: "event",
    valueImpact: `Total world value: ${fmtShort(computed_2227000.totalWorldValue)}`,
    calculation: {
      summary: `Estimate: ${fmtShort(computed_2227000.totalWorldValue)} total world value`,
      lines: generateCalculationLines(-2_227_000),
    },
  },
  {
    year: -1_760_000,
    title: "Acheulean Handaxes",
    image: img("acheulean_handaxes"),
    description:
      `Acheulean handaxes appear around 1.76 million years ago, representing the first widely standardized “designed” tools. Compared to earlier Oldowan flakes, handaxes require more planning, symmetry, and skill. Total world value: <strong>${fmt(computed_1760000.totalWorldValue)}</strong>.`,
    category: "tool",
    valueImpact: `Total world value: ${fmtShort(computed_1760000.totalWorldValue)}`,
    calculation: {
      summary: `Estimate: ${fmtShort(computed_1760000.totalWorldValue)} total world value`,
      lines: generateCalculationLines(-1_760_000),
    },
  },
  {
    year: -1_000_000,
    title: "Controlled Fire",
    image: img("controlled_fire"),
    description:
      `Evidence from Wonderwerk Cave suggests controlled fire deep inside a cave around 1.0 million years ago. Fire expands edible calories, improves safety, and enables new social and technological behaviors. Total world value: <strong>${fmt(computed_1000000.totalWorldValue)}</strong>.`,
    category: "technology",
    valueImpact: `Total world value: ${fmtShort(computed_1000000.totalWorldValue)}`,
    calculation: {
      summary: `Estimate: ${fmtShort(computed_1000000.totalWorldValue)} total world value`,
      lines: generateCalculationLines(-1_000_000),
    },
  },
  {
    year: -900_000,
    title: "Mid-Pleistocene Bottleneck",
    image: img("mid_pleistocene_bottleneck"),
    description:
      `A recent analysis using the FitCoal method proposes a severe human bottleneck between roughly <strong>930k and 813k years ago</strong>, estimating an <em>effective</em> breeding population of about <strong>1,280 individuals</strong> for ~117,000 years. “Effective population size” can be far smaller than the total census population, so the chart translates this into a conservative census proxy of about <strong>${fmtPop(computed_900000.population)}</strong>, yielding a visible dip in total world value to <strong>${fmt(computed_900000.totalWorldValue)}</strong>. This hypothesis is debated, so the dip is marked as a tentative but illustrative feature of the curve.`,
    category: "event",
    valueImpact: `Total world value: ${fmtShort(computed_900000.totalWorldValue)}`,
    calculation: {
      summary: `Estimate: ${fmtShort(computed_900000.totalWorldValue)} total world value`,
      lines: generateCalculationLines(-900_000),
    },
  },
  {
    year: -50_000,
    title: "Out of Africa Expansion",
    image: img("out_of_africa"),
    description:
      `Human populations expand across Eurasia and Australia. Cultural complexity accelerates: more specialized tools, symbolic art, and long-distance exchange. Total world value: <strong>${fmt(computed_50000.totalWorldValue)}</strong>.`,
    category: "event",
    valueImpact: `Total world value: ${fmtShort(computed_50000.totalWorldValue)}`,
    calculation: {
      summary: `Estimate: ${fmtShort(computed_50000.totalWorldValue)} total world value`,
      lines: generateCalculationLines(-50_000),
    },
  },
  {
    year: -20_000,
    title: "Last Glacial Maximum",
    image: img("last_glacial_maximum"),
    description:
      `At the height of the last ice age, approximately ${fmtPop(computed_20000.population)} Homo sapiens inhabit Earth. Material culture is sparse, portable, and largely shared. Using the GDP‑per‑capita and wealth‑to‑income assumptions above, total world value reaches approximately <strong>${fmt(computed_20000.totalWorldValue)}</strong> in ${MODEL_DOLLAR_YEAR} USD.`,
    category: "event",
    valueImpact: `Total world value: ${fmtShort(computed_20000.totalWorldValue)}`,
    calculation: {
      summary: `Estimate: ${fmtShort(computed_20000.totalWorldValue)} total world value`,
      lines: generateCalculationLines(-20_000),
    },
  },
  {
    year: -10_000,
    title: "Neolithic Age Begins",
    image: img("neolithic_age"),
    description:
      `The Neolithic age begins with the spread of agriculture, permanent settlements, and domesticated animals. Stored surplus, durable homes, and tools expand per‑person wealth. Total world value: <strong>${fmt(computed_10000.totalWorldValue)}</strong>.`,
    category: "technology",
    valueImpact: `Total world value: ${fmtShort(computed_10000.totalWorldValue)}`,
    calculation: {
      summary: `Estimate: ${fmtShort(computed_10000.totalWorldValue)} total world value`,
      lines: generateCalculationLines(-10_000),
    },
  },
  {
    year: -3_300,
    title: "Bronze Age Begins",
    image: img("bronze_age"),
    description:
      `Bronze metallurgy spreads across early civilizations. Metal tools, weapons, and large‑scale construction become common. Total world value: <strong>${fmt(computed_3300.totalWorldValue)}</strong>.`,
    category: "technology",
    valueImpact: `Total world value: ${fmtShort(computed_3300.totalWorldValue)}`,
    calculation: {
      summary: `Estimate: ${fmtShort(computed_3300.totalWorldValue)} total world value`,
      lines: generateCalculationLines(-3_300),
    },
  },
  {
    year: -1_200,
    title: "Iron Age Begins",
    image: img("iron_age"),
    description:
      `Ironworking spreads widely. Iron tools and weapons are stronger and cheaper than bronze, enabling broader agricultural and military expansion. Total world value: <strong>${fmt(computed_1200.totalWorldValue)}</strong>.`,
    category: "technology",
    valueImpact: `Total world value: ${fmtShort(computed_1200.totalWorldValue)}`,
    calculation: {
      summary: `Estimate: ${fmtShort(computed_1200.totalWorldValue)} total world value`,
      lines: generateCalculationLines(-1_200),
    },
  },
  {
    year: -600,
    title: "Invention of Coinage",
    image: img("invention_of_coinage"),
    description:
      `In Lydia (modern-day Turkey), King Alyattes mints the first standardized coins from electrum, a natural gold-silver alloy. For the first time, value becomes portable, divisible, and widely recognizable. His son Croesus becomes a byword for extreme wealth. Total world value: <strong>${fmt(computed_600.totalWorldValue)}</strong>. The wealthiest individual holds about <strong>${fmtShort(tp_600.wealthiestPerson?.value ?? 0)}</strong> (~${fmtPercent((tp_600.wealthiestPerson?.value ?? 0) / computed_600.totalWorldValue)} of world value).`,
    category: "technology",
    valueImpact: `Total world value: ${fmtShort(computed_600.totalWorldValue)}`,
    calculation: {
      summary: `Estimate: ${fmtShort(computed_600.totalWorldValue)} total world value`,
      lines: generateCalculationLines(-600),
    },
  },
  {
    year: -2560,
    title: "The Great Pyramid",
    image: img("great_pyramid"),
    description:
      `Pharaoh Khufu commands the construction of the Great Pyramid at Giza. The pyramid represents an enormous concentration of labor and resources for its era. Total world value: roughly <strong>${fmt(computed_3000.totalWorldValue)}</strong>. Khufu’s estimated wealth is about <strong>${fmtShort(tp_3000.wealthiestPerson?.value ?? 0)}</strong> (~${fmtPercent((tp_3000.wealthiestPerson?.value ?? 0) / computed_3000.totalWorldValue)} of world value).`,
    category: "person",
    valueImpact: `Total world value: ${fmtShort(computed_3000.totalWorldValue)}`,
    calculation: {
      summary: `Estimate: ${fmtShort(computed_3000.totalWorldValue)} total world value`,
      lines: generateCalculationLines(-3_000),
    },
  },
  {
    year: 117,
    title: "Peak Roman Empire",
    image: img("peak_roman_empire"),
    description:
      `Under Emperor Trajan, Rome reaches its maximum territorial extent and population. Historians often estimate the empire produced a substantial share of world output; this estimate assigns the Roman Empire about <strong>${fmtPercent((tp_117.wealthiestEmpire?.value ?? 0) / computed_117.totalWorldValue)}</strong> of world wealth (~${fmtShort(tp_117.wealthiestEmpire?.value ?? 0)}). Total world value: <strong>${fmt(computed_117.totalWorldValue)}</strong>. Augustus’s estimated personal wealth is about <strong>${fmtShort(tp_117.wealthiestPerson?.value ?? 0)}</strong> (~${fmtPercent((tp_117.wealthiestPerson?.value ?? 0) / computed_117.totalWorldValue)}).`,
    category: "empire",
    valueImpact: `Total world value: ${fmtShort(computed_117.totalWorldValue)}`,
    calculation: {
      summary: `Estimate: ${fmtShort(computed_117.totalWorldValue)} total world value`,
      lines: generateCalculationLines(117),
    },
  },
  {
    year: 1324,
    title: "Mansa Musa's Hajj",
    image: img("mansa_musa"),
    description:
      `Mansa Musa, ruler of the Mali Empire, undertakes his pilgrimage to Mecca. Contemporary accounts describe enormous quantities of gold and a dramatic local impact on Cairo’s economy. Total world value: <strong>${fmt(computed_1324.totalWorldValue)}</strong>. The estimate caps his personal wealth at about <strong>${fmtShort(tp_1324.wealthiestPerson?.value ?? 0)}</strong> (~${fmtPercent((tp_1324.wealthiestPerson?.value ?? 0) / computed_1324.totalWorldValue)} of world value).`,
    category: "person",
    valueImpact: `Estimated wealth: ${fmtShort(tp_1324.wealthiestPerson?.value ?? 0)}`,
    calculation: {
      summary: `Estimate: ${fmtShort(computed_1324.totalWorldValue)} total world value`,
      lines: generateCalculationLines(1324),
    },
  },
  {
    year: 1602,
    title: "The First Corporation",
    image: img("first_corporation"),
    description:
      `The Dutch East India Company (VOC) issues the first publicly traded stock on the Amsterdam Stock Exchange. Investors can now own fractional shares of an enterprise and trade them freely. The VOC will control much of the spice trade and operate as a quasi-sovereign firm. Total world value: <strong>${fmt(computed_1602.totalWorldValue)}</strong>. The estimate places the VOC at about <strong>${fmtShort(tp_1602.mostValuableCompany?.value ?? 0)}</strong> (~${fmtPercent((tp_1602.mostValuableCompany?.value ?? 0) / computed_1602.totalWorldValue)} of world wealth).`,
    category: "company",
    valueImpact: `Total world value: ${fmtShort(computed_1602.totalWorldValue)}`,
    calculation: {
      summary: `Estimate: ${fmtShort(computed_1602.totalWorldValue)} total world value`,
      lines: generateCalculationLines(1602),
    },
  },
  {
    year: 1859,
    title: "The First Oil Well",
    image: img("first_oil_well"),
    description:
      `Edwin Drake drills near Titusville, Pennsylvania, and strikes oil. Within years, petroleum transforms from a curiosity into a strategic commodity. Kerosene replaces whale oil, gasoline will power the automobile, and petrochemicals reshape manufacturing. Total world value: <strong>${fmt(computed_1859.totalWorldValue)}</strong>.`,
    category: "resource",
    valueImpact: `Total world value: ${fmtShort(computed_1859.totalWorldValue)}`,
    calculation: {
      summary: `Estimate: ${fmtShort(computed_1859.totalWorldValue)} total world value`,
      lines: generateCalculationLines(1859),
    },
  },
  {
    year: 1913,
    title: "Rockefeller's Fortune",
    image: img("rockefeller"),
    description:
      `John D. Rockefeller’s fortune remains one of the largest in modern history. Estimates vary widely depending on whether you adjust by inflation or by GDP share. The estimate caps the top individual’s wealth at about <strong>${fmtShort(tp_1913.wealthiestPerson?.value ?? 0)}</strong> (~${fmtPercent((tp_1913.wealthiestPerson?.value ?? 0) / computed_1913.totalWorldValue)} of world wealth). Total world value: <strong>${fmt(computed_1913.totalWorldValue)}</strong>.`,
    category: "person",
    valueImpact: `Total world value: ${fmtShort(computed_1913.totalWorldValue)}`,
    calculation: {
      summary: `Estimate: ${fmtShort(computed_1913.totalWorldValue)} total world value`,
      lines: generateCalculationLines(1913),
    },
  },
  {
    year: 1966,
    title: "Getty: World's Richest",
    image: img("getty"),
    description:
      `The Guinness Book of Records names J. Paul Getty the world's wealthiest private citizen. Total world value: <strong>${fmt(computed_1966.totalWorldValue)}</strong>. Getty’s estimated wealth is about <strong>${fmtShort(tp_1966.wealthiestPerson?.value ?? 0)}</strong> (~${fmtPercent((tp_1966.wealthiestPerson?.value ?? 0) / computed_1966.totalWorldValue)} of world wealth).`,
    category: "person",
    valueImpact: `Total world value: ${fmtShort(computed_1966.totalWorldValue)}`,
    calculation: {
      summary: `Estimate: ${fmtShort(computed_1966.totalWorldValue)} total world value`,
      lines: generateCalculationLines(1966),
    },
  },
  {
    year: 1995,
    title: "The Web Goes Commercial",
    image: img("web_commercial"),
    description:
      `The National Science Foundation lifts restrictions on commercial use of the Internet. Netscape’s IPO and a wave of new startups signal the shift to a commercial web. Total world value: <strong>${fmt(computed_1995.totalWorldValue)}</strong>. The internet begins a decades-long expansion of global enterprise value.`,
    category: "technology",
    valueImpact: `Total world value: ${fmtShort(computed_1995.totalWorldValue)}`,
    calculation: {
      summary: `Estimate: ${fmtShort(computed_1995.totalWorldValue)} total world value`,
      lines: generateCalculationLines(1995),
    },
  },
  {
    year: 2007,
    title: "iPhone",
    image: img("iphone"),
    description:
      `Steve Jobs unveils the iPhone: “An iPod, a phone, and an Internet communicator.” The smartphone creates new categories of economic value—apps, mobile commerce, and on-demand services. Total world value: <strong>${fmt(computed_2007.totalWorldValue)}</strong>.`,
    category: "company",
    valueImpact: `Total world value: ${fmtShort(computed_2007.totalWorldValue)}`,
    calculation: {
      summary: `Estimate: ${fmtShort(computed_2007.totalWorldValue)} total world value`,
      lines: generateCalculationLines(2007),
    },
  },
  {
    year: 2026,
    title: "Today",
    image: img("today"),
    description:
      `Global wealth is estimated at <strong>${fmt(computed_2026.totalWorldValue)}</strong> in ${MODEL_DOLLAR_YEAR} USD. The top individual (represented here by Elon Musk) is estimated at about <strong>${fmtShort(tp_2026.wealthiestPerson?.value ?? 0)}</strong> (~${fmtPercent((tp_2026.wealthiestPerson?.value ?? 0) / computed_2026.totalWorldValue)} of world wealth). The most valuable company is estimated at <strong>${fmtShort(tp_2026.mostValuableCompany?.value ?? 0)}</strong> (~${fmtPercent((tp_2026.mostValuableCompany?.value ?? 0) / computed_2026.totalWorldValue)}).`,
    category: "event",
    valueImpact: `Total world value: ${fmtShort(computed_2026.totalWorldValue)}`,
    calculation: {
      summary: `Estimate: ${fmtShort(computed_2026.totalWorldValue)} total world value`,
      lines: generateCalculationLines(2026),
    },
  },
];

export const timelineData: TimelineData = {
  timePoints,
  events,
};

export default timelineData;
