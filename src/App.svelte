<script lang="ts">
  import TimelineEvent from "./components/TimelineEvent.svelte";
  import { timelineData } from "./data/timeline";
  import { interpolateTimePoint } from "./lib/interpolate";
  import { formatYear, formatCurrency, formatPopulation } from "./lib/formatters";

  const sortedEvents = timelineData.events.sort((a, b) => a.year - b.year);

  let eventElements: HTMLElement[] = [];
  let currentEventIndex = $state(-1); // -1 means no event in view yet (at title)

  // When no event in view, use year before first event to show $0
  const currentYear = $derived(
    currentEventIndex < 0
      ? -3_300_001
      : (sortedEvents[currentEventIndex]?.year ?? sortedEvents[0].year)
  );

  const currentData = $derived(
    interpolateTimePoint(timelineData.timePoints, currentYear)
  );

  function handleScroll() {
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    const scrollCenter = scrollY + windowHeight / 2;

    // If at the top (title section), show $0 state
    if (scrollY < windowHeight * 0.5) {
      currentEventIndex = -1;
      return;
    }

    // Find which event is closest to the center of the viewport
    let closestIndex = 0;
    let closestDistance = Infinity;

    for (let i = 0; i < eventElements.length; i++) {
      const el = eventElements[i];
      if (!el) continue;

      const rect = el.getBoundingClientRect();
      const elementCenter = scrollY + rect.top + rect.height / 2;
      const distance = Math.abs(scrollCenter - elementCenter);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = i;
      }
    }

    currentEventIndex = closestIndex;
  }
</script>

<svelte:window onscroll={handleScroll} />

<div class="min-h-screen" style="background-color: var(--color-cream);">
  <!-- Fixed header -->
  <div class="fixed top-0 left-0 right-0 z-50 hidden lg:block" style="background-color: rgba(245, 240, 230, 0.95); border-bottom: 1px solid var(--color-sepia);">
    <div class="flex items-center justify-between px-8 py-3 text-sm" style="color: var(--color-brown);">
      <div>
        <a
          href="https://madebynathan.com/"
          target="_blank"
          rel="noreferrer"
          class="hover:opacity-80 transition-opacity"
          style="color: var(--color-dark-brown);"
        >
          Made by Nathan
        </a>
      </div>
      <div class="flex items-center gap-8">
        <div>
          <span class="opacity-60">Year:</span> {formatYear(currentYear)}
        </div>
        <div>
          <span class="opacity-60">{currentYear < -300_000 ? "Hominid" : "Human"} Pop.:</span> {formatPopulation(currentData.population)}
        </div>
        <div>
          <span class="opacity-60">World Value:</span> {formatCurrency(currentData.totalWorldValue)}
        </div>
        <div>
          <span class="opacity-60">Avg. Net Worth:</span> {formatCurrency(currentData.averageNetWorth)}
        </div>
        <div>
          <span class="opacity-60">Median Net Worth:</span> {formatCurrency(currentData.medianNetWorth)}
        </div>
        {#if false}
          <div>
            <span class="opacity-60">Richest Person:</span>
            {currentData.wealthiestPerson?.name ?? "N/A"}
            {#if currentData.wealthiestPerson}
              ({formatCurrency(currentData.wealthiestPerson.value)})
            {/if}
          </div>
          <div>
            <span class="opacity-60">Richest Region:</span>
            {currentData.wealthiestEmpire?.name ?? "N/A"}
          </div>
          <div>
            <span class="opacity-60">Top Company:</span>
            {currentData.mostValuableCompany?.name ?? "N/A"}
          </div>
        {/if}
      </div>
    </div>
  </div>

  <!-- Title section -->
  <div class="min-h-screen flex items-center justify-center pt-16">
    <div class="text-center px-4">
      <h1 class="text-5xl sm:text-7xl font-semibold mb-6 tracking-tight" style="color: var(--color-dark-brown);">
        World History of Value
      </h1>
      <p class="text-xl sm:text-2xl max-w-3xl mx-auto mb-16" style="color: var(--color-brown);">
        A journey through 3.3 million years of hominid wealth creation.
      </p>
      <div style="color: var(--color-brown); opacity: 0.6;" class="animate-bounce">
        <div class="text-sm mb-2 italic">Scroll to begin</div>
        <svg
          class="w-5 h-5 mx-auto"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </div>
    </div>
  </div>

  <!-- Timeline events -->
  {#each sortedEvents as event, index}
    <div bind:this={eventElements[index]}>
      <TimelineEvent {event} {index} />
    </div>
  {/each}

  <!-- End section -->
   <!--<div class="min-h-[50vh] flex items-center justify-center">
    <div class="text-center max-w-lg px-4">
      <p class="text-lg italic" style="color: var(--color-brown);">
        From $20 to $700 trillion in 3.3 million years.
        <br /><br />
        Most of that created in the last 50 years.
      </p>
    </div>
  </div>-->

  <!-- Sources + GitHub -->
  <div class="pb-20 mt-40">
    <div class="mx-auto max-w-3xl px-6 text-sm" style="color: var(--color-brown);">
      <div class="text-xs uppercase tracking-widest mb-3" style="color: var(--color-dark-brown);">
        Sources (High-Level)
      </div>
      <div class="space-y-1">
        <div>GDP per capita: Maddison Project Database 2020 (2011 intl $)</div>
        <div>CPI conversion: FRED CPIAUCSL (BLS CPI-U)</div>
        <div>Wealth-income ratio: based on long-run capital/output ranges</div>
      </div>
      <div class="mt-6">
        All source code is available on GitHub:
        <a
          href="https://github.com/ndbroadbent/world_history_of_value"
          target="_blank"
          rel="noreferrer"
          class="underline"
          style="color: var(--color-dark-brown);"
        >
          github.com/ndbroadbent/world_history_of_value
        </a>
      </div>
      <div class="mt-4">
        View more blog posts at
        <a
          href="https://madebynathan.com/"
          target="_blank"
          rel="noreferrer"
          class="underline"
          style="color: var(--color-dark-brown);"
        >
          madebynathan.com
        </a>
      </div>
    </div>
  </div>
</div>
