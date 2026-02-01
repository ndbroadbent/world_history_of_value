<script lang="ts">
  import type { TimePoint } from "../lib/types";
  import { yearToScroll } from "../lib/timeScale";

  interface Props {
    timePoints: TimePoint[];
    currentScroll: number;
    onExpand?: () => void;
  }

  let { timePoints, currentScroll, onExpand }: Props = $props();

  // SVG dimensions
  const width = 120;
  const height = 60;
  const padding = 4;

  // Generate path for the value line
  function generatePath(): string {
    if (timePoints.length === 0) return "";

    const maxValue = Math.max(...timePoints.map((p) => p.totalWorldValue));
    const minValue = 0;

    const points = timePoints
      .sort((a, b) => a.year - b.year)
      .map((point) => {
        const x =
          padding + yearToScroll(point.year) * (width - padding * 2);
        // Log scale for y-axis
        const logValue = point.totalWorldValue > 0 ? Math.log10(point.totalWorldValue) : 0;
        const logMax = Math.log10(maxValue);
        const y = height - padding - (logValue / logMax) * (height - padding * 2);
        return `${x},${y}`;
      });

    return `M ${points.join(" L ")}`;
  }

  // Current position marker
  function getCurrentX(): number {
    return padding + currentScroll * (width - padding * 2);
  }
</script>

<button
  onclick={onExpand}
  class="fixed top-2 left-2 sm:top-4 sm:left-4 z-50 bg-stone-900/95 backdrop-blur-sm rounded-lg p-1.5 sm:p-2 shadow-xl border border-stone-700 hover:border-stone-500 transition-colors cursor-pointer"
  title="Click to expand chart"
>
  <svg {width} {height} class="block">
    <!-- Background grid -->
    <rect
      x={padding}
      y={padding}
      width={width - padding * 2}
      height={height - padding * 2}
      fill="none"
      stroke="rgb(68 64 60 / 0.5)"
      stroke-width="0.5"
    />

    <!-- Value line -->
    <path
      d={generatePath()}
      fill="none"
      stroke="rgb(52 211 153)"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />

    <!-- Current position marker -->
    <line
      x1={getCurrentX()}
      y1={padding}
      x2={getCurrentX()}
      y2={height - padding}
      stroke="rgb(251 191 36)"
      stroke-width="1"
      stroke-dasharray="2,2"
    />

    <!-- Current position dot -->
    <circle
      cx={getCurrentX()}
      cy={height / 2}
      r="3"
      fill="rgb(251 191 36)"
    />
  </svg>

  <div class="text-xs text-stone-500 text-center mt-1">Click to expand</div>
</button>
