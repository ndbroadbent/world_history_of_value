<script lang="ts">
  import { onMount } from "svelte";

  interface Props {
    count?: number;
  }

  let { count = 30 }: Props = $props();

  interface Particle {
    id: number;
    x: number;
    y: number;
    size: number;
    opacity: number;
    speed: number;
    delay: number;
  }

  let particles: Particle[] = $state([]);

  onMount(() => {
    particles = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1 + Math.random() * 3,
      opacity: 0.1 + Math.random() * 0.3,
      speed: 20 + Math.random() * 40,
      delay: Math.random() * 10,
    }));
  });
</script>

<div class="fixed inset-0 pointer-events-none overflow-hidden z-0">
  {#each particles as particle}
    <div
      class="absolute rounded-full bg-stone-400"
      style="
        left: {particle.x}%;
        width: {particle.size}px;
        height: {particle.size}px;
        opacity: {particle.opacity};
        animation: float {particle.speed}s ease-in-out infinite;
        animation-delay: -{particle.delay}s;
      "
    ></div>
  {/each}
</div>

<style>
  @keyframes float {
    0%,
    100% {
      transform: translateY(100vh);
    }
    50% {
      transform: translateY(-10vh);
    }
  }
</style>
