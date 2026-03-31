<script setup lang="ts">
import type { Move } from "../../../shared/types";

const props = defineProps<{ move: Move }>();
</script>

<template>
  <div :class="['move-card', `type-${move.type.toLowerCase()}`]">
    <div class="move-header">
      <span class="move-id">#{{ move.id }}</span>
      <h3 class="move-name">{{ move.name }}</h3>
      <span class="move-category">{{ move.category }}</span>
    </div>

    <div class="move-stats">
      <div class="stat-item">
        <span class="label">Power</span>
        <span class="value">{{ move.power || '-' }}</span>
      </div>
      <div class="stat-item">
        <span class="label">Accuracy</span>
        <span class="value">{{ move.accuracy ? move.accuracy + "%" : '-' }}</span>
      </div>
      <div class="stat-item">
        <span class="label">PP</span>
        <span class="value">{{ move.pp }}</span>
      </div>
    </div>

    <div class="move-details">
      <p class="move-range"><strong>Range:</strong> {{ move.range }}</p>
      <p class="move-effect">{{ move.effect }}</p>
    </div>
  </div>
</template>

<style scoped>
.move-card.type-normal {
  --move-color: #a8a878;
}

.move-card.type-fire {
  --move-color: #f08030;
}

.move-card.type-water {
  --move-color: #6890f0;
}

.move-card.type-grass {
  --move-color: #78c850;
}

.move-card.type-electric {
  --move-color: #f8d030;
}

.move-card.type-ice {
  --move-color: #98d8d8;
}

.move-card.type-fighting {
  --move-color: #c03028;
}

.move-card.type-poison {
  --move-color: #a040a0;
}

.move-card.type-ground {
  --move-color: #e0c068;
}

.move-card.type-flying {
  --move-color: #a890f0;
}

.move-card.type-psychic {
  --move-color: #f85888;
}

.move-card.type-bug {
  --move-color: #a8b820;
}

.move-card.type-rock {
  --move-color: #b8a038;
}

.move-card.type-ghost {
  --move-color: #705898;
}

.move-card.type-dragon {
  --move-color: #7038f8;
}

.move-card.type-steel {
  --move-color: #b8b8d0;
}

.move-card.type-dark {
  --move-color: #705848;
}

.move-card.type-fairy {
  --move-color: #ee99ac;
}
.move-card {
  --move-color: #777; /* default fallback */
  border-left: 5px solid var(--move-color);
  background: white;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.move-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.move-id {
  font-size: 0.7rem;
  color: #999;
  font-weight: bold;
}

.move-name {
  margin: 0;
  font-size: 1rem;
  flex-grow: 1;
  color: #333;
}

.move-category {
  font-size: 0.65rem;
  text-transform: uppercase;
  padding: 2px 6px;
  background: #eee;
  border-radius: 4px;
  font-weight: bold;
}

.move-stats {
  display: flex;
  background: #f9f9f9;
  border-radius: 6px;
  padding: 5px;
  justify-content: space-around;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-item .label {
  font-size: 0.6rem;
  color: #888;
  font-weight: bold;
}

.stat-item .value {
  font-size: 0.85rem;
  font-weight: bold;
  color: #333;
}

.move-details {
  font-size: 0.8rem;
  line-height: 1.4;
  color: #444;
}

.move-range {
  font-size: 0.7rem;
  color: #666;
  margin-bottom: 4px;
}

.move-effect {
  margin: 0;
  font-style: italic;
}
</style>
