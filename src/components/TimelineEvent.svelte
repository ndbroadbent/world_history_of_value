<script lang="ts">
  import type { TimelineEvent } from "../lib/types";
  import { formatYear } from "../lib/formatters";
  import CalculationModal from "./CalculationModal.svelte";

  interface Props {
    event: TimelineEvent;
    index?: number;
  }

  let { event, index = 0 }: Props = $props();
  let showCalculation = $state(false);
</script>

<div class="w-full py-16 lg:py-24">
  <div class="w-full grid grid-cols-1 lg:grid-cols-2 items-center gap-8 lg:gap-0">
    <!-- Content (always left) -->
    <div class="px-8 lg:px-16">
      <!-- Year -->
      <div class="text-sm uppercase tracking-widest mb-6" style="color: var(--color-brown); opacity: 0.7;">
        {formatYear(event.year)}
      </div>

      <!-- Title -->
      <h2 class="text-3xl lg:text-5xl font-semibold mb-6" style="color: var(--color-dark-brown);">
        {event.title}
      </h2>

      <!-- Description -->
      <p class="text-lg lg:text-xl leading-relaxed mb-8" style="color: var(--color-brown);">
        {@html event.description}
      </p>

      <!-- Value impact -->
      {#if event.valueImpact}
        <p class="text-base italic" style="color: var(--color-brown); opacity: 0.8;">
          {event.valueImpact}
        </p>
      {/if}

      <!-- Calculation link -->
      {#if event.calculation}
        <button
          onclick={() => showCalculation = true}
          class="mt-4 text-sm underline cursor-pointer hover:opacity-70 transition-opacity"
          style="color: var(--color-brown);"
        >
          View full calculation →
        </button>
      {/if}
    </div>

    <!-- Image (always right) -->
    <div>
      {#if event.image}
        <img
          src={event.image}
          alt={event.title}
          class="w-full h-auto"
          style="filter: sepia(20%);"
        />
      {:else}
        <div
          class="w-full aspect-[4/3] flex items-center justify-center"
          style="background-color: var(--color-sepia); opacity: 0.5;"
        >
          <div class="text-lg italic" style="color: var(--color-brown);">
            [ Illustration ]
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>

{#if showCalculation && event.calculation}
  <CalculationModal
    calculation={event.calculation}
    title={event.title}
    year={formatYear(event.year)}
    onClose={() => showCalculation = false}
  />
{/if}
