<script lang="ts">
  import type { TimePoint } from "../lib/types";
  import { formatCurrency, formatYear } from "../lib/formatters";
  import AnimatedNumber from "./AnimatedNumber.svelte";

  interface Props {
    currentData: TimePoint;
  }

  let { currentData }: Props = $props();
</script>

<div
  class="fixed top-2 right-2 sm:top-4 sm:right-4 z-50 bg-stone-900/95 backdrop-blur-sm rounded-lg p-3 sm:p-4 shadow-xl border border-stone-700 w-56 sm:min-w-64 sm:max-w-72 text-sm sm:text-base"
>
  <div class="text-xs text-stone-400 uppercase tracking-wider mb-3 font-medium">
    {formatYear(currentData.year)}
  </div>

  <div class="space-y-3">
    <!-- Total World Value -->
    <div class="border-b border-stone-700 pb-3">
      <div class="text-xs text-stone-500 uppercase tracking-wider">
        Total World Value
      </div>
      <div class="text-xl sm:text-2xl font-bold text-emerald-400 font-mono">
        <AnimatedNumber value={currentData.totalWorldValue} />
      </div>
    </div>

    <!-- Wealthiest Person -->
    <div>
      <div class="text-xs text-stone-500 uppercase tracking-wider">
        Wealthiest Person
      </div>
      {#if currentData.wealthiestPerson}
        <div class="text-lg font-semibold text-amber-300 truncate">
          {currentData.wealthiestPerson.name}
        </div>
        <div class="text-sm text-stone-400 flex justify-between gap-2">
          <span class="italic truncate"
            >{currentData.wealthiestPerson.title || ""}</span
          >
          <span class="font-mono text-amber-400/80 flex-shrink-0">
            <AnimatedNumber value={currentData.wealthiestPerson.value} />
          </span>
        </div>
      {:else}
        <div class="text-stone-600 italic">N/A</div>
      {/if}
    </div>

    <!-- Wealthiest Region/Empire/Nation -->
    <div>
      <div class="text-xs text-stone-500 uppercase tracking-wider">
        Wealthiest Region
      </div>
      {#if currentData.wealthiestEmpire}
        <div class="text-lg font-semibold text-rose-300 truncate">
          {currentData.wealthiestEmpire.name}
        </div>
        <div class="text-sm text-stone-400 font-mono text-right">
          <AnimatedNumber value={currentData.wealthiestEmpire.value} />
        </div>
      {:else}
        <div class="text-stone-600 italic">N/A</div>
      {/if}
    </div>

    <!-- Most Valuable Company -->
    <div>
      <div class="text-xs text-stone-500 uppercase tracking-wider">
        Most Valuable Company
      </div>
      {#if currentData.mostValuableCompany}
        <div class="text-lg font-semibold text-sky-300 truncate">
          {currentData.mostValuableCompany.name}
        </div>
        <div class="text-sm text-stone-400 font-mono text-right">
          <AnimatedNumber value={currentData.mostValuableCompany.value} />
        </div>
      {:else}
        <div class="text-stone-600 italic">N/A</div>
      {/if}
    </div>
  </div>
</div>
