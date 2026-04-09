<script setup lang="ts">
import { cap } from '../utils/stringUtils';
import { computed, ref } from 'vue';
import type { Move, PokemonType } from "@shared/types";
import { TYPE_COLORS } from "@shared/types";

const props = defineProps<{ move: Move }>();

// learn method badge label
const methodLabel = computed(() => {
  switch (props.move.learn_method) {
    case 'level-up':
      return `Lvl ${props.move.level_learned}`;
    case 'machine':
      return `TM/HM`;
    case 'tutor':
      return `Tutor`;
    case 'egg':
      return `Egg`;
    default:
      return cap(props.move.learn_method);
  };
});

// category icon (img only)
const categoryMeta = computed<{ label: string; symbol: string }>(() => {
  switch (props.move.category) {
    case "physical":
      return { label: "Physical", symbol: "⚔" };
    case "special":
      return { label: "Special", symbol: "✦" };
    default:
      return { label: "Status", symbol: "●" };
  };
});

// type badge colors
const typeBadgeStyle = computed(() => {
  const colors = TYPE_COLORS[props.move.type as PokemonType];
  return colors ? { backgroundColor: colors.bg, color: colors.text } : {};
})
</script>

<template>
  <article class="move-card" :class="[`type-${move.type.toLowerCase()}`, `method-${move.learn_method}`]" :aria-label="`${cap(move.name)}, ${move.type} type, ${categoryMeta.label}`">
    <!-- header row -->
    <header class="move-header">
      <span class="method-badge" :class="`method-${move.learn_method}`" :aria-label="`Learned by: ${methodLabel}`">
        {{ methodLabel }}
      </span>

      <h3 class="move-name">{{ cap(move.name) }}</h3>

      <div class="move-tags">
        <span class="type-pill" :style="typeBadgeStyle" :aria-label="`${move.type} type`">{{ cap(move.type) }}</span>
        <span class="category-badge" :class="`cat-${move.category}`" :aria-label="`${categoryMeta.label} move`">
          <span aria-hidden="true">{{ categoryMeta.symbol }}</span> {{ categoryMeta.label }}
        </span>
      </div>
    </header>

    <!-- stat row -->
    <dl class="move-stats" aria-label="Move stats">
      <div class="stat-item">
        <dt class="stat-label">Power</dt>
        <dd class="stat-value">{{ move.power || '-' }}</dd>
      </div>
      <div class="stat-item">
        <dt class="stat-label">Accuracy</dt>
        <dd class="stat-value">{{ move.accuracy ? `${move.accuracy}%` : '-' }}</dd>
      </div>
      <div class="stat-item">
        <dt class="stat-label">PP</dt>
        <dd class="stat-value">{{ move.pp }}</dd>
      </div>
      <div v-if="move.range" class="stat-item">
        <dt class="stat-label">Range</dt>
        <dd class="stat-value">{{ cap(move.range) }}</dd>
      </div>
    </dl>

    <!-- effect text -->
    <p v-if="move.effect" class="move-effect">{{ move.effect }}</p>
  </article>
</template>

<style scoped>
.move-card {
  background: var(--color-background-primary);
  border: 0.5px solid var(--color-border-tertiary);
  border-radius: var(--border-radius-md);
  padding: 10px 14px;
  transition: border-color 0.15s;
}

.move-card:hover {
  border-color: var(--color-border-secondary);
}

/* header */
.move-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.move-name {
  font-size: 1.1rem;
  font-weight: 500;
  color: var(--color-text-primary);
  margin: 0;
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.move-tags {
  display: flex;
  gap: 5px;
  align-items: center;
  margin-left: auto;
}

/* method badge */
.method-badge {
  font-size: 0.6rem;
  font-weight: 500;
  letter-spacing: 0.5px;
  padding: 2px 7px;
  border-radius: var(--border-radius-md);
  white-space: nowrap;
  background: var(--color-background-secondary);
  color: var(--color-text-secondary);
  border: 0.5px solid var(--color-border-tertiary);
}

.method-badge.method-level-up {
  background: #eaf3de;
  color: #3b6d11;
  border-color: #c0dd97;
}

.method-badge.method-machine {
  background: #e6f1fb;
  color: #185fa5;
  border-color: #b5d4f4;
}

.method-badge.method-egg {
  background: #fbeaf0;
  color: #993556;
  border-color: #f4c0d1;
}

.method-badge.method-tutor {
  background: #eee8ff;
  color: #534ab7;
  border-color: #cecbf6;
}

/* type pill, matching pokemon card */
.type-pill {
  font-size: 0.8rem;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 20px;
  letter-spacing: 0.4px;
  white-space: nowrap;
}

/* category badge */
.category-badge {
  font-size: 0.8rem;
  font-weight: 500;
  padding: 2px 7px;
  border-radius: var(--border-radius-md);
  display: flex;
  align-items: center;
  gap: 3px;
  white-space: nowrap;
}

.cat-physical {
  background: #faeeda;
  color: #854f0b;
}

.cat-special {
  background: #e6f1fb;
  color: #185fa5;
}

.cat-status {
  background: var(--color-background-secondary);
  color: var(--color-text-secondary);
}

/* stats dl */
.move-stats {
  display: flex;
  gap: 16px;
  margin: 0 0 8px;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 0.7rem;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  margin: 0;
}

.stat-value {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--color-text-primary);
  margin: 0;
}

/* effect */
.move-effect {
  font-size: 0.95rem;
  color: var(--color-text-secondary);
  margin: 0;
  line-height: 1.5;
  border-top: 0.5px solid var(--color-border-tertiary);
  padding-top: 8px;
}
</style>
