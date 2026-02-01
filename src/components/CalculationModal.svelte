<script lang="ts">
  import type { Calculation } from "../lib/types";

  interface Props {
    calculation: Calculation;
    title: string;
    year: string;
    onClose: () => void;
  }

  let { calculation, title, year, onClose }: Props = $props();
</script>

<div
  class="fixed inset-0 z-[100] flex items-center justify-center p-4"
  style="background-color: rgba(61, 46, 31, 0.9);"
  onclick={onClose}
  onkeydown={(e) => e.key === 'Escape' && onClose()}
  role="button"
  tabindex="-1"
>
  <div
    class="w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-lg shadow-2xl"
    style="background-color: var(--color-cream); border: 2px solid var(--color-sepia);"
    onclick={(e) => e.stopPropagation()}
    onkeydown={(e) => e.stopPropagation()}
    role="dialog"
    tabindex="-1"
  >
    <!-- Header -->
    <div class="sticky top-0 px-8 py-6" style="background-color: var(--color-cream); border-bottom: 1px solid var(--color-sepia);">
      <div class="flex items-start justify-between">
        <div>
          <div class="text-sm uppercase tracking-widest mb-2" style="color: var(--color-brown); opacity: 0.7;">
            {year}
          </div>
          <h2 class="text-2xl font-semibold" style="color: var(--color-dark-brown);">
            {title}
          </h2>
          <p class="mt-2 text-sm italic" style="color: var(--color-brown);">
            Full calculation breakdown
          </p>
        </div>
        <button
          onclick={onClose}
          class="text-2xl leading-none hover:opacity-70 transition-opacity cursor-pointer"
          style="color: var(--color-brown);"
        >
          ×
        </button>
      </div>
    </div>

    <!-- Content -->
    <div class="px-8 py-6">
      <!-- Summary formula -->
      <div class="mb-8 p-4 rounded-lg font-mono text-center" style="background-color: var(--color-sepia); color: var(--color-dark-brown);">
        {calculation.summary}
      </div>

      <!-- Detailed breakdown -->
      <div class="space-y-1">
        {#each calculation.lines as line}
          {#if line.isSectionHeader}
            <div class="pt-6 pb-2 text-sm font-semibold uppercase tracking-wider" style="color: var(--color-dark-brown);">
              {line.label}
            </div>
          {:else}
            <div
              class="flex justify-between py-1 text-sm"
              style="padding-left: {(line.indent ?? 0) * 24}px; color: var(--color-brown); {line.isTotal ? 'font-weight: 600; border-top: 1px solid var(--color-sepia); padding-top: 8px; margin-top: 8px;' : ''}"
            >
              <span>{line.label}</span>
              <span class="font-mono" style="color: var(--color-dark-brown);">
                {#if line.formula}
                  <span class="opacity-60 mr-2">{line.formula}</span>
                {/if}
                {line.value ?? ""}
              </span>
            </div>
          {/if}
        {/each}
      </div>

      <!-- Disclaimer -->
      <div class="mt-8 pt-6 text-xs italic text-center" style="border-top: 1px solid var(--color-sepia); color: var(--color-brown); opacity: 0.7;">
        Note: This is a simplified model. Values are expressed in 2025 USD (CPI-adjusted to Dec 2025 CPI-U).
        <br />
        Prehistory uses a first-tool anchor; later eras use GDP per capita × wealth-income ratios.
      </div>
    </div>
  </div>
</div>
