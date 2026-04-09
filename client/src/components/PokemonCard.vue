<script setup lang="ts">
import { computed, ref, onBeforeMount } from 'vue';
import axios from 'axios';
import MoveCard from './MoveCard.vue';
import { cap, formatGeneration } from '../utils/stringUtils';
import type { Pokemon, Move, PokemonType } from "../../../shared/types";
import { TYPE_COLORS } from "../../../shared/types";

const props = defineProps<{
  id: string,
}>();

const pokemon = ref<Pokemon | null>(null);
const moves = ref<Move[]>([]);
const error = ref<string | null>(null);
const isExpanded = ref(false);
const isLoadingCard = ref(false);
const isLoadingMoves = ref(false);
const isShiny = ref(false);
const movesFetched = ref(false);


// data fetch
onBeforeMount(async () => {
  isLoadingCard.value = true;
  try {
    const res = await axios.get(`http://127.0.0.1:3000/pokemon/${props.id}`);
    pokemon.value = res.data?.pokemon ?? null;
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Failed to load Pokémon.';
  } finally {
    isLoadingCard.value = false;
  }
});

// moves toggle
async function toggleMoves() {
  isExpanded.value = !isExpanded.value;

  if (!isExpanded.value || movesFetched.value) return;

  isLoadingMoves.value = true;
  try {
    const res = await axios.get(`http://127.0.0.1:3000/pokemon/${pokemon.value!.id}/moves`);
    // dedupe by name, keep first occurrence (highest-level learn entry)
    const seen = new Set<string>();
    for (const move of res.data.moves as Move[]) {
      if (!seen.has(move.name)) {
        moves.value.push(move);
        seen.add(move.name);
      }
    }
    movesFetched.value = true;
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : `Failed to load ${pokemon.value?.name || 'Pokémon'}'s moves.`;
  } finally {
    isLoadingMoves.value = false;
  }
}

// sprite URL
const SPRITE_BASE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon';
const spriteUrl = (id: number, shiny = false) => `${SPRITE_BASE}${shiny ? '/shiny' : ''}/${id}.png`;

const mainSprite = computed(() => pokemon.value ? spriteUrl(pokemon.value.id, isShiny.value) : '');

// type badge style
function typeBadgeStyle(type: PokemonType | null | undefined) {
  if (!type) return {};
  const colors = TYPE_COLORS[type as PokemonType];
  return colors ? { backgroundColor: colors.bg, color: colors.text } : {};
}

// stat helpers
const STAT_MAX = 255;
const STAT_COLORS: Record<string, string> = {
  health: '#7ac74c',
  attack: '#ee8130',
  defense: '#6390f0',
  special_attack: '#f95587',
  special_defense: '#735797',
  speed: '#f7d02c'
};

interface StatEntry { key: keyof Pokemon; label: string }

const STAT_ROWS: StatEntry[] = [
  { key: 'health', label: 'HP' },
  { key: 'attack', label: 'Attack' },
  { key: 'defense', label: 'Defense' },
  { key: 'special_attack', label: 'Sp. Atk' },
  { key: 'special_defense', label: 'Sp. Def' },
  { key: 'speed', label: 'Speed' },
];
const EV_ROWS: StatEntry[] = [
  { key: 'ev_health', label: 'HP' },
  { key: 'ev_attack', label: 'Attack' },
  { key: 'ev_defense', label: 'Defense' },
  { key: 'ev_special_attack', label: 'Sp. Atk' },
  { key: 'ev_special_defense', label: 'Sp. Def' },
  { key: 'ev_speed', label: 'Speed' },
];

const totalStats = computed(() => pokemon.value ? STAT_ROWS.reduce((sum, s) => sum + ((pokemon.value![s.key] as number) || 0), 0) : 0);
const activeEvRows = computed(() => EV_ROWS.filter((r) => (pokemon.value?.[r.key] as number | null) ?? 0));
const totalEvYield = computed(() => pokemon.value ? activeEvRows.value.reduce((sum, s) => sum + ((pokemon.value![s.key] as number) || 0), 0) : 0);

// generation label
const generationLabel = computed(() => {
  if (!pokemon.value?.first_game) return '';
  return formatGeneration(pokemon.value.first_game);
});
</script>

<template>
  <!-- loading state -->
  <div v-if="isLoadingCard" class="dex-loading" role="status" aria-label="Loading Pokémon data">
    <span class="dex-loading-dot" />
    <span class="dex-loading-dot" />
    <span class="dex-loading-dot" />
  </div>

  <!-- error state -->
  <div v-else-if="error" class="dex-error" role="alert">
    <span class="dex-error-icon" aria-hidden="true">!</span>
    <p>{{ error }}</p>
  </div>

  <!-- main card -->
  <article v-else-if="pokemon" class="dex-card" :class="`type-${pokemon.primary_type}`" :aria-label="`Pokédex entry for ${cap(pokemon.name)}`">
    <!-- header -->
    <header class="dex-header">
      <div class="dex-identity">
        <span class="dex-num" aria-label="Pokédex number">No. {{ String(pokemon.pokedex_number).padStart(4, '0') }}</span>
        <h1 class="dex-name">{{ cap(pokemon.name) }}</h1>
        <p class="dex-class">{{ pokemon.class }} <span v-if="pokemon.form" class="form-tag" aria-label="Form">({{ pokemon.form }})</span></p>
      </div>

      <div class="dex-meta-right">
        <!-- type badge -->
        <div class="type-row" role="list" :aria-label="`Type${pokemon.secondary_type ? 's' : ''}`">
          <span class="type-pill" role="listitem" :style="typeBadgeStyle(pokemon.primary_type as PokemonType)">{{ cap(pokemon.primary_type) }}</span>
          <span v-if="pokemon.secondary_type" class="type-pill" role="listitem" :style="typeBadgeStyle(pokemon.secondary_type as PokemonType)">{{ cap(pokemon.secondary_type) }}</span>
        </div>

        <!-- legendary badge-->
        <span v-if="pokemon.legendary !== 'Standard'" class="legendary-badge" :class="pokemon.legendary?.toLowerCase()" :aria-label="pokemon.legendary + ' Pokémon'">{{ pokemon.legendary }}</span>
      </div>
    </header>

    <!-- sprite zone -->
    <section class="dex-sprite-zone" aria-label="Sprite">
      <img :src="mainSprite" :alt="`${cap(pokemon.name)}${isShiny ? ' shiny' : ''} sprite`" class="dex-sprite" width="96" height="96" />
      <button class="shiny-toggle" :class="{active: isShiny}" :aria-pressed="isShiny" :aria-label="isShiny ? 'Viewing shiny sprite, click to switch to normal' : 'Viewing normal sprite, click to switch to shiny'" @click="isShiny = !isShiny">✨</button>
    </section>

    <!-- evolution chain -->
    <section v-if="pokemon.previous_evolution || pokemon.next_evolutions?.length" class="dex-section" aria-label="Evolution chain">
      <h2 class="section-label">Evolution chain</h2>
      <div class="evo-chain" role="list">
        <!-- previous -->
        <div v-if="pokemon.previous_evolution" class="evo-stage" role="listitem">
          <router-link :to="`/pokemon/${pokemon.previous_evolution.id}`" class="evo-node" :aria-label="`Go to ${pokemon.previous_evolution.name}`">
            <img :src="spriteUrl(pokemon.previous_evolution.id)" :alt="cap(pokemon.previous_evolution.name)" width="48" height="48" @error="($event.target as HTMLImageElement).src = '/placeholder-pokeball.png'" />
            <span class="evo-name">{{cap(pokemon.previous_evolution.name)}}</span>
          </router-link>
          <span class="evo-arrow" aria-hidden="true">→</span>
        </div>

        <!-- current -->
        <div class="evo-stage current" role="listitem" aria-current="true">
          <div class="evo-node active">
            <img :src="spriteUrl(pokemon.id)" :alt="`${cap(pokemon.name)} (current)`" width="64" height="64" @error="($event.target as HTMLImageElement).src = '/placeholder-pokeball.png'" />
            <span class="evo-name">{{cap(pokemon.name)}}</span>
            <span class="current-badge" aria-hidden="true">▲ current</span>
          </div>
          <span v-if="pokemon.next_evolutions?.length" class="evo-arrow" aria-hidden="true">→</span>
        </div>

        <!-- next evolution(s) (may branch) -->
        <div v-if="pokemon.next_evolutions?.length" class="evo-branches" role="listitem">
          <router-link v-for="evo in pokemon.next_evolutions" :key="evo.to_id" :to="`/pokemon/${evo.to_id}`" class="evo-node branch" :aria-label="`Evolves to ${evo.name}: ${evo.requirement}`">
            <span class="req-bubble" aria-hidden="true">{{ evo.requirement }}</span>
            <img :src="spriteUrl(evo.to_id)" :alt="cap(evo.name)" width="48" height="48" @error="($event.target as HTMLImageElement).src = '/placeholder-pokeball.png'" />
            <span class="evo-name">{{cap(evo.name)}}</span>
          </router-link>
        </div>

        <div v-else-if="!pokemon.next_evolutions?.length" class="evo-final" role="listitem" aria-label="Fully evolved">
          <span>Fully evolved</span>
        </div>
      </div>
    </section>

    <!-- stats -->
    <section class="dex-section" aria-label="Base stats">
      <h2 class="section-label">Base stats</h2>
      <dl class="stat-grid">
        <div v-for="stat in STAT_ROWS" :key="stat.key" class="stat-row">
          <dt class="stat-label">{{ stat.label }}</dt>
          <dd class="stat-val">{{ pokemon[stat.key] ?? '-'}}</dd>
          <div class="stat-track" role="progressbar" :aria-valuenow="(pokemon[stat.key] as number) ?? 0" :aria-valuemin="0" :aria-valuemax="STAT_MAX" :aria-label="`${stat.label}: ${pokemon[stat.key] ?? 0} out of ${STAT_MAX}`">
            <div class="stat-fill" :style="{width: `${(((pokemon[stat.key] as number) ?? 0) / STAT_MAX) * 100}%`, backgroundColor: STAT_COLORS[stat.key]}" />
          </div>
        </div>

        <!-- total row -->
        <div class="stat-row total">
          <dt class="stat-label">Total</dt>
          <dd class="stat-val">{{totalStats}}</dd>
          <div class="stat-track" aria-hidden="true" />
        </div>
      </dl>
    </section>

    <!-- info chips grid -->
    <section class="dex-section" aria-label="Profile">
      <h2 class="section-label">Profile</h2>
      <dl class="info-grid">
        <div class="info-chip">
          <dt class="chip-label">Height</dt>
          <dd class="chip-val">{{ pokemon.height }} m</dd>
        </div>
        <div class="info-chip">
          <dt class="chip-label">Weight</dt>
          <dd class="chip-val">{{ pokemon.weight }} kg</dd>
        </div>
        <div class="info-chip">
          <dt class="chip-label">Generation</dt>
          <dd class="chip-val">{{ generationLabel }}</dd>
        </div>
        <div class="info-chip">
          <dt class="chip-label">Catch rate</dt>
          <dd class="chip-val">{{ pokemon.catch_rate }}</dd>
        </div>
        <div class="info-chip">
          <dt class="chip-label">Base happiness</dt>
          <dd class="chip-val">{{ pokemon.happiness_base }}</dd>
        </div>
        <div class="info-chip">
          <dt class="chip-label">Exp. rate</dt>
          <dd class="chip-val">{{ cap(pokemon.experience_rate ?? '') }}</dd>
        </div>
        <div class="info-chip">
          <dt class="chip-label">Base EXP</dt>
          <dd class="chip-val">{{ pokemon.experience_total ?? '-' }}</dd>
        </div>
        <div class="info-chip">
          <dt class="chip-label">Egg cycles</dt>
          <dd class="chip-val">{{ pokemon.egg_cycle_count ?? '-' }}</dd>
        </div>
        <div class="info-chip">
          <dt class="chip-label">Egg groups</dt>
          <dd class="chip-val">{{ cap(pokemon.egg_group_i) }}<span v-if="pokemon.egg_group_ii">, {{ pokemon.egg_group_ii }}</span></dd>
        </div>
        <div class="info-chip" v-if="pokemon.ratio_male !== null">
          <dt class="chip-label">Gender ratio</dt>
          <dd class="chip-val">{{ pokemon.ratio_male }}% male / {{ pokemon.ratio_female }}% female</dd>
        </div>
        <div class="info-chip" v-else>
          <dt class="chip-label">Gender</dt>
          <dd class="chip-val">Genderless</dd>
        </div>
      </dl>
    </section>

    <!-- abilities -->
    <section class="dex-section" aria-label="Abilities">
      <h2 class="section-label">Abilities</h2>
      <ul class="ability-list" role="list">
        <li v-if="pokemon.ability_i" class="ability-slot" role="listitem">
          <div class="ability-header">
            <span class="ability-name">{{ cap(pokemon.ability_i) }}</span>
            <span class="ability-tag">Primary</span>
          </div>
          <p class="ability-desc">{{ pokemon.ability_i_description }}</p>
        </li>
        <li v-if="pokemon.ability_ii" class="ability-slot" role="listitem">
          <div class="ability-header">
            <span class="ability-name">{{ cap(pokemon.ability_ii) }}</span>
            <span class="ability-tag">Secondary</span>
          </div>
          <p class="ability-desc">{{ pokemon.ability_ii_description }}</p>
        </li>
        <li v-if="pokemon.hidden_ability" class="ability-slot" role="listitem">
          <div class="ability-header">
            <span class="ability-name">{{ cap(pokemon.hidden_ability) }}</span>
            <span class="ability-tag">Hidden</span>
          </div>
          <p class="ability-desc">{{ pokemon.hidden_ability_description }}</p>
        </li>
      </ul>
    </section>

    <!-- ev yield -->
    <section v-if="activeEvRows.length" class="dex-section" aria-label="EV yield">
      <h2 class="section-label">EV yield</h2>
      <ul class="ev-chips" role="list">
        <li v-for="ev in activeEvRows" :key="ev.key" class="ev-chip" role="listitem">{{ ev.label }} +{{ pokemon[ev.key] }}</li>
        <li class="ev-chip total" role="listitem">Total +{{ totalEvYield }}</li>
      </ul>
    </section>

    <!-- moves -->
    <section class="dex-section moveset" aria-label="Learnset">
      <h2 class="section-label">Moveset</h2>
      <button class="expand-btn" :class="{'is-open': isExpanded}" :aria-expanded="isExpanded" aria-controls="moveset-list" @click="toggleMoves">
        {{ isExpanded ? 'Hide moves' : 'Show moves' }}
      </button>
      <span class="expand-chevron" aria-hidden="true">{{ isExpanded ? '▲' : '▼' }}</span>

      <div id="moveset-list" role="region" :aria-label="`Move list for ${cap(pokemon.name)}`">
        <div v-if="isLoadingMoves" class="moves-loading" role="status" aria-live="polite">Loading moves...</div>
        <p v-else-if="isExpanded && !isLoadingMoves && moves.length === 0" role="status">No moves found.</p>
        <ul v-else-if="isExpanded && moves.lenght > 0" class="moves-list" role="list">
          <li v-for="move in moves" :key="move.id" role="listitem">
            <MoveCard :move />
          </li>
        </ul>
      </div>
    </section>

  </article>
</template>

<style scoped>
/* base card */
.dex-card {
  font-family: 'Courier New', Courier, monospace;
  max-width: 540px;
  margin: 0 auto;
  padding: 0 0 2rem;
  color: var(--color-text-primary);
}

/* header */
.dex-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding-bottom: 12px;
  border-bottom: 2px solid var(--color-border-secondary);
  margin-bottom: 16px;
}

.dex-num {
  font-size: 11px;
  letter-spacing: 2px;
  color: var(--color-text-secondary);
  display: block;
}

.dex-name {
  font-size: 22px;
  font-weight: 500;
  margin: 2px 0;
  line-height: 1.2;
}

.dex-class {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin: 0;
  letter-spacing: 0.5px;
}

.form-tag {
  color: var(--color-text-secondary);
}

.dex-meta-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
}

/* type pills */
.type-row {
  display: flex;
  gap: 6px;
}

.type-pill {
  font-size: 11px;
  font-weight: 500;
  padding: 3px 10px;
  border-radius: 20px;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

/* legendary badge */
.legendary-badge {
  font-size: 10px;
  letter-spacing: 1.5px;
  padding: 2px 8px;
  border-radius: var(--border-radius-md);
  text-transform: uppercase;
}

.legendary-badge.ledgendary {
  background: #faeeda;
  color: #854f0b;
}
.legendary-badge.mythical {
  background: #eee8ff;
  color: #534ab7;
}

/* sprite zone */
.dex-sprite-zone {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 16px;
  background: var(--color-background-secondary);
  border-radius: var(--border-radius-lg);
  margin-bottom: 20px;
}

.dex-sprite {
  image-rendering: pixelated;
  display: block;
}
.shiny-toggle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1.5px solid var(--color-border-secondary);
  background: var(--color-background-primary);
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.15s, background 0.15s;
}

.shiny-toggle.active {
  border-color: #f7d02c;
  background: #fff8dc;
}

.shiny-toggle.focus-visible {
  outline: 2px solid var(--color-border-info);
  outline-offset: 2px;
}

/* section label */
.section-label {
  font-size: 10px;
  letter-spacing: 2px;
  color: var(--color-text-secondary);
  font-weight: 500;
  margin: 0 0 10px;
  text-transform: uppercase;
}

.dex-section {
  margin-bottom: 24px;
}

/* stat bars (dl/dt/dd) */
.stat-grid {
  margin: 0;
}

.stat-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 5px 0;
}

.stat-label {
  font-size: 11px;
  color: var(--color-text-secondary);
  width: 80px;
  text-align: right;
  margin: 0;
}

.stat-val {
  font-size: 11px;
  font-weight: 500;
  width: 28px;
  margin: 0;
}

.stat-track {
  flex: 1;
  height: 6px;
  background: var(--color-border-tertiary);
  border-radius: 3px;
  overflow: hidden;
}

.stat-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.4s ease;
}

.stat-row.total .stat-label {
  color: var(--color-text-primary);
  font-weight: 500;
}

.stat-row.total .stat-val {
  color: var(--color-text-primary);
}

.stat-row.total {
  border-top: 0.5px solid var(--color-border-tertiary);
  margin-top: 6px;
  padding-top: 6px;
}

/* info chips */
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 8px;
  margin: 0;
}
.info-chip {
  background: var(--color-background-secondary);
  border-radius: var(--border-radius-md);
  padding: 8px 10px;
}
.chip-label {
  font-size: 10px;
  color: var(--color-text-secondary);
  letter-spacing: 1px;
  margin: 0 0 2px;
  text-transform: uppercase;
}

.chip-val {
  font-size: 13px;
  color: var(--color-text-primary);
  font-weight: 500;
  margin: 0;
}

/* abilities */
.ability-list {
  list-style: none;
  padding: 0;
  margin: 0;
  border: 0.5px solid var(--color-border-tertiary);
  border-radius: var(--border-radius-md);
}

.ability-slot {
  padding: 10px 14px;
  border-bottom: 0.5px solid var(--color-border-tertiary);
}

.abilit-slot:last-child {
  border-bottom: none;
}

.ability-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.ability-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-primary);
}

.ability-tag {
  font-size: 10px;
  padding: 1px 7px;
  border-radius: 10px;
  background: var(--color-background-secondary);
  color: var(--color-text-secondary);
}

.ability-tag.hidden {
  background: #eee8ff;
  color: #534ab7;
}

.ability-desc {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin: 0;
  line-height: 1.5;
}

/* evolution chain */
.evo-chain {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.evo-stage {
  display: flex;
  align-items: center;
  gap: 8px;
}

.evo-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  color: var(--color-text-secondary);
  font-size: 11px;
  gap: 3px;
  padding: 4px;
  border-radius: var(--border-radius-md);
  transition: background 0.15s;
}

.evo-node:hover {
  background: var(--color-background-secondary);
}

.evo-node:focus-visible {
  outline: 2px solid var(--color-border-info);
  outline-offset: 2px;
}

.evo-node.active {
  color: var(--color-text-primary);
  font-weight: 500;
}

.evo-name {
  font-size: 11px;
}

.evo-arrow {
  color: var(--color-text-secondary);
  font-size: 14px;
}

.current-badge {
  font-size: 9px;
  color: #0f6e56;
}

.req-bubble {
  font-size: 9px;
  color: var(--color-text-secondary);
  max-width: 64px;
  text-align: center;
  line-height: 1.3;
}

.evo-branches {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.evo-final {
  font-size: 11px;
  color: var(--color-text-secondary);
  font-style: italic;
}

/* ev chips */
.ev-chips {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.ev-chip {
  font-size: 11px;
  padding: 3px 9px;
  background: var(--color-background-secondary);
  border: 0.5px solid var(--color-background-secondary);
  border-radius: var(--border-radius-md);
  color: var(--color-text-primary);
}

.ev-chip.total {
  font-weight: 500;
}

/* moves */
.expand-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  background: var(--color-background-secondary);
  border: 0.5px solid var(--color-border-secondary);
  border-radius: var(--border-radius-md);
  font-family: inherit;
  font-size: 12px;
  letter-spacing: 0.5px;
  cursor: pointer;
  color: var(--color-text-primary);
  transition: background 0.15s;
  margin-bottom: 12px;
}

.expand-btn:hover {
  background: var(--color-background-primary);
}

.expand-btn:focus-visible {
  outline: 2px solid var(--color-border-info);
  outline-offset: 2px;
}

.expand-chevron {
  font-size: 10px;
}

.moves-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.moves-loading {
  font-size: 12px;
  color: var(--color-text-secondary);
  padding: 8px 0;
}

/* error and loading states */
.dex-error {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: var(--color-background-danger);
  border-radius: var(--border-radius-md);
  color: var(--color-text-danger);
  font-size: 13px;
}

.dex-error-icon {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--color-text-danger);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  font-size: 12px;
  flex-shrink: 0;
}

.dex-loading {
  display: flex;
  gap: 6px;
  justify-content: center;
  align-items: center;
  padding: 32px;
}

.dex-loading-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-text-secondary);
  animation: dex-pulse 1s ease-in-out infinite;
}

.dex-loading-dot:nth-child(2) {
  animation-delay: 0.15s;
}

.dex-loading-dot:nth-child(3) {
  animation-delay: 0.3s;
}

@keyframes dex-pulse {
  0%, 80%, 100% {
    transform: scale(0.6);
    opacity: 0.4;
  }
  40% {
    transform: scale(1.0);
    opacity: 1;
  }
}
</style>
