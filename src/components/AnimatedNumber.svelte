<script lang="ts">
  import { formatCurrency } from "../lib/formatters";

  interface Props {
    value: number;
    format?: "currency" | "plain";
  }

  let { value, format = "currency" }: Props = $props();

  const formatted = $derived(
    format === "currency" ? formatCurrency(value) : value.toFixed(0)
  );
</script>

<span class="tabular-nums">{formatted}</span>
