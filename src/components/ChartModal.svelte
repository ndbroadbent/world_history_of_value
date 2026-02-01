<script lang="ts">
  import type { TimePoint } from "../lib/types";
  import { yearToScroll } from "../lib/timeScale";
  import { formatCurrency, formatYear, formatYearPrecise } from "../lib/formatters";

  interface Props {
    timePoints: TimePoint[];
    currentScroll: number;
    onClose: () => void;
  }

  let { timePoints, currentScroll, onClose }: Props = $props();

  // SVG dimensions
  const width = 800;
  const height = 400;
  const padding = { top: 40, right: 40, bottom: 60, left: 80 };

  let hoveredPoint: TimePoint | null = $state(null);
  let mouseX = $state(0);
  let mouseY = $state(0);

  const sortedPoints = $derived(
    [...timePoints].sort((a, b) => a.year - b.year)
  );

  const maxValue = $derived(
    Math.max(...timePoints.map((p) => p.totalWorldValue))
  );

  const logMax = $derived(Math.log10(maxValue));

  function getX(year: number): number {
    return padding.left + yearToScroll(year) * (width - padding.left - padding.right);
  }

  function getY(value: number): number {
    if (value <= 0) return height - padding.bottom;
    const logValue = Math.log10(value);
    return (
      height -
      padding.bottom -
      (logValue / logMax) * (height - padding.top - padding.bottom)
    );
  }

  function generatePath(): string {
    if (sortedPoints.length === 0) return "";
    const points = sortedPoints.map(
      (point) => `${getX(point.year)},${getY(point.totalWorldValue)}`
    );
    return `M ${points.join(" L ")}`;
  }

  function handleMouseMove(e: MouseEvent) {
    const svg = e.currentTarget as SVGSVGElement;
    const rect = svg.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;

    // Find closest point
    let closest: TimePoint | null = null;
    let closestDist = Infinity;
    for (const point of sortedPoints) {
      const px = getX(point.year);
      const dist = Math.abs(px - mouseX);
      if (dist < closestDist && dist < 50) {
        closestDist = dist;
        closest = point;
      }
    }
    hoveredPoint = closest;
  }

  function handleMouseLeave() {
    hoveredPoint = null;
  }

  // Y-axis ticks (log scale)
  const yTicks = $derived(() => {
    const ticks: number[] = [];
    for (let i = 0; i <= logMax; i += 2) {
      ticks.push(Math.pow(10, i));
    }
    return ticks;
  });

  // X-axis labels
  const xLabels = [
    { year: -3_300_000, label: "3.3M BCE" },
    { year: -20_000, label: "20K BCE" },
    { year: -3_000, label: "3000 BCE" },
    { year: 0, label: "0" },
    { year: 1000, label: "1000" },
    { year: 2000, label: "2000" },
  ];
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
  onclick={onClose}
  onkeydown={(e) => e.key === "Escape" && onClose()}
>
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="bg-stone-900 rounded-xl p-6 shadow-2xl border border-stone-700 max-w-4xl w-full"
    onclick={(e) => e.stopPropagation()}
  >
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-bold text-stone-100">World Value Over Time</h2>
      <button
        onclick={onClose}
        class="text-stone-400 hover:text-stone-100 transition-colors text-2xl leading-none"
      >
        &times;
      </button>
    </div>

    <svg
      {width}
      {height}
      class="block w-full h-auto"
      viewBox="0 0 {width} {height}"
      onmousemove={handleMouseMove}
      onmouseleave={handleMouseLeave}
    >
      <!-- Grid lines -->
      {#each yTicks() as tick}
        <line
          x1={padding.left}
          y1={getY(tick)}
          x2={width - padding.right}
          y2={getY(tick)}
          stroke="rgb(68 64 60 / 0.3)"
          stroke-width="1"
        />
        <text
          x={padding.left - 8}
          y={getY(tick)}
          text-anchor="end"
          dominant-baseline="middle"
          class="fill-stone-500 text-xs"
        >
          {formatCurrency(tick)}
        </text>
      {/each}

      <!-- X-axis labels -->
      {#each xLabels as { year, label }}
        <text
          x={getX(year)}
          y={height - padding.bottom + 20}
          text-anchor="middle"
          class="fill-stone-500 text-xs"
        >
          {label}
        </text>
      {/each}

      <!-- Area fill -->
      <path
        d="{generatePath()} L {getX(sortedPoints[sortedPoints.length - 1]?.year ?? 0)},{height - padding.bottom} L {getX(sortedPoints[0]?.year ?? 0)},{height - padding.bottom} Z"
        fill="url(#areaGradient)"
      />

      <!-- Gradient definition -->
      <defs>
        <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="rgb(52 211 153 / 0.3)" />
          <stop offset="100%" stop-color="rgb(52 211 153 / 0.05)" />
        </linearGradient>
      </defs>

      <!-- Value line -->
      <path
        d={generatePath()}
        fill="none"
        stroke="rgb(52 211 153)"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />

      <!-- Data points -->
      {#each sortedPoints as point}
        <circle
          cx={getX(point.year)}
          cy={getY(point.totalWorldValue)}
          r={hoveredPoint === point ? 6 : 4}
          fill={hoveredPoint === point ? "rgb(251 191 36)" : "rgb(52 211 153)"}
          class="transition-all duration-150"
        />
      {/each}

      <!-- Current position marker -->
      <line
        x1={padding.left + currentScroll * (width - padding.left - padding.right)}
        y1={padding.top}
        x2={padding.left + currentScroll * (width - padding.left - padding.right)}
        y2={height - padding.bottom}
        stroke="rgb(251 191 36 / 0.5)"
        stroke-width="2"
        stroke-dasharray="4,4"
      />
    </svg>

    <!-- Tooltip -->
    {#if hoveredPoint}
      <div
        class="absolute bg-stone-800 rounded-lg p-3 shadow-xl border border-stone-600 pointer-events-none z-10"
        style="left: {getX(hoveredPoint.year) + 10}px; top: {getY(hoveredPoint.totalWorldValue) - 10}px"
      >
        <div class="text-xs text-stone-400 mb-1">
          {formatYearPrecise(hoveredPoint.year)}
        </div>
        <div class="text-lg font-bold text-emerald-400">
          {formatCurrency(hoveredPoint.totalWorldValue)}
        </div>
        {#if hoveredPoint.wealthiestPerson}
          <div class="text-xs text-amber-300 mt-1">
            Richest: {hoveredPoint.wealthiestPerson.name}
          </div>
        {/if}
        {#if hoveredPoint.wealthiestEmpire}
          <div class="text-xs text-rose-300">
            Empire: {hoveredPoint.wealthiestEmpire.name}
          </div>
        {/if}
        {#if hoveredPoint.mostValuableCompany}
          <div class="text-xs text-sky-300">
            Company: {hoveredPoint.mostValuableCompany.name}
          </div>
        {/if}
      </div>
    {/if}

    <div class="text-xs text-stone-500 mt-4 text-center">
      Hover over points for details. Y-axis uses logarithmic scale.
    </div>
  </div>
</div>
