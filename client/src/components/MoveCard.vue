<script setup lang="ts">
import type { Move } from "../../../shared/types";

const props = defineProps<{ move: Move }>();
</script>

<template>
  <div class="card">
    <h3>{{ move.id }}: {{ move.name }}</h3>
    <p>{{ move.type }} - {{ move.category }}</p>
    <p><span class="stat-name">PP</span>: <span class="stat-value">{{ move.pp }}</span></p>
    <p><span class="stat-name">Power</span>: <span class="stat-value">{{ move.power }}</span></p>
    <p><span class="stat-name">Accuracy</span>: <span class="stat-value">{{ move.accuracy }}</span></p>
    <p><span class="stat-name">Range</span>: <span class="stat-value">{{ move.range }}</span></p>
    <p><span class="stat-name">Effect</span>: <span class="stat-value">{{ move.effect }}</span></p>
  </div>
</template>

<style scoped>
</style>
