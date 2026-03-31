<script setup lang="ts">
import { computed, ref, onBeforeMount } from 'vue';
import axios from 'axios';
import MoveCard from './MoveCard.vue';
import type { Pokemon } from "../../../shared/types";

const props = defineProps<{
  pokemon: Pokemon
}>();
const error = ref(null);
const prevEvolution = ref("");

const totalStats = computed(() => {
  const pokemon = props.pokemon;
  return (pokemon.health || 0) + (pokemon.attack || 0) + (pokemon.defense || 0) +
    (pokemon.special_attack || 0) + (pokemon.special_defense || 0) + (pokemon.speed || 0);
});

const totalEvYield = computed(() => {
  const pokemon = props.pokemon;
  return (pokemon.ev_health || 0) + (pokemon.ev_attack || 0) + (pokemon.ev_defense || 0) +
    (pokemon.ev_special_attack || 0) + (pokemon.ev_special_defense || 0) + (pokemon.ev_speed || 0);
});

onBeforeMount(async () => {
  if (props.pokemon.previous_evolution_pokedex_id) {
    try {
      const res = await axios.get(`http://127.0.0.1:3000/pokemon/${props.pokemon.previous_evolution_pokedex_id}`);
      if (res.status === 200) {
        prevEvolution.value = res.data.pokemon.name;
      }
    } catch (err) {
      console.error("Error fetching previous evolution:", err);
      error.value = err;
      prevEvolution.value = "";
    }
  } else {
    prevEvolution.value = "";
  }
});

const imgPrimary = computed(() => {
  if (!props.pokemon.primary_type?.trim()) return "";
  const type = props.pokemon.primary_type.replace(/[^a-zA-Z]/g, '').toLowerCase();
  const formattedType = type.charAt(0).toUpperCase() + type.slice(1);
  return `/icons/Pokemon_Type_Icon_${formattedType}.png`;
});

const imgSecondary = computed(() => {
  if (!props.pokemon.secondary_type?.trim()) return "";
  const type = props.pokemon.secondary_type.replace(/[^a-zA-Z]/g, '').toLowerCase();
  const formattedType = type.charAt(0).toUpperCase() + type.slice(1);
  return `/icons/Pokemon_Type_Icon_${formattedType}.png`;
});
</script>

<template>
  <div v-if="error">
    <h1>Error</h1>
    <p>{{ error }}</p>
  </div>
  <div v-if="pokemon" :class="['pokemon-card', `type-${pokemon.primary_type.toLowerCase()}`]">
    <div class="card-header">
      <h1 class="pokemon-name">#{{ pokemon.pokedex_number }}: {{ pokemon.name }}</h1>

      <div class="pokemon-class">
        {{ pokemon.class }} <span v-if="pokemon.form" class="form-tag">({{ pokemon.form }})</span>
      </div>

      <div class="type-pills">
        <p><img :src="imgPrimary" height="10" width="10" :alt="pokemon.primary_type">{{ pokemon.primary_type }}<span
            v-if="pokemon.secondary_type">/<img :src="imgSecondary" width="10" height="10"
              :alt="pokemon.secondary_type">{{ pokemon.secondary_type
              }}</span></p>
      </div>
    </div>
    <h3 v-if="pokemon.legendary">{{ pokemon.legendary }}</h3>
    <div class="data-grid">
      <div class="data-section">
        <h4>Origin & Size</h4>
        <p>First Game: {{ pokemon.first_game }}</p>
        <p>Height: {{ pokemon.height }} m | Weight: {{ pokemon.weight }} kg</p>
      </div>
      <div class="data-section">
        <h4>Breeding</h4>
        <p>{{ pokemon.ratio_male }}% male</p>
        <p>{{ pokemon.ratio_female }}% female</p>
        <p>Egg groups: {{ pokemon.egg_group_i }}<span v-if="pokemon.egg_group_ii">, {{ pokemon.egg_group_ii }}</span>
        </p>
      </div>
      <div class="data-section">
        <h4>Training</h4>
        <p>Catch Rate: {{ pokemon.catch_rate }}</p>
        <p>Experience Rate: {{ pokemon.experience_rate }}</p>
        <p>Experience Total: {{ pokemon.experience_total }} EXP</p>
      </div>
      <div class="data-section">
        <h4>Evolution</h4>
        <p v-if="pokemon.previous_evolution_pokedex_id && prevEvolution">Evolves from #{{
          pokemon.previous_evolution_pokedex_id }} - {{ prevEvolution }}</p>
        <p v-else>This Pokémon is not known to evolve from another.</p>
        <p v-if="pokemon.evolution_requirement">Evolution condition(s): {{ pokemon.evolution_requirement }}</p>
        <p v-else>This Pokémon is not known to evolve into another.</p>
      </div>
    </div>
    <div class="abilities-section">
      <h3>Abilities</h3>
      <div class="ability-list">
        <div class="ability-slot">
          <div class="ability-header">
            <span class="ability-name">{{ pokemon.ability_i }}</span><span class="ability-tag">Primary</span>
          </div>
          <p class="ability-desc">{{ pokemon.ability_i_description }}</p>
        </div>

        <div v-if="pokemon.ability_ii" class="ability-slot">
          <div class="ability-header">
            <span class="ability-name">{{ pokemon.ability_ii }}</span><span class="ability-tag">Secondary</span>
          </div>
          <p class="ability-desc">{{ pokemon.ability_ii_description }}</p>
        </div>

        <div v-if="pokemon.hidden_ability" class="ability-slot hidden">
          <div class="ability-header">
            <span class="ability-name">{{ pokemon.hidden_ability }}</span><span class="ability-tag">Hidden</span>
          </div>
          <p class="ability-desc">{{ pokemon.hidden_ability_description }}</p>
        </div>

        <div v-if="pokemon.special_event_ability" class="ability-slot special">
          <div class="ability-header">
            <span class="ability-name">{{ pokemon.special_event_ability }}</span><span class="ability-tag">Event</span>
          </div>
          <p class="ability-desc">{{ pokemon.special_event_ability_description }}</p>
        </div>
      </div>
    </div>
    <div class="combat-info">
      <div class="stats-container">
        <h3>Base Stats</h3>
        <div class="stat-grid">
          <div class="stat-row"><span class="label">Base Happiness</span><span class="value">{{ pokemon.happiness_base
              }}</span></div>
          <div class="stat-row"><span class="label">Health</span><span class="value">{{ pokemon.health }}</span></div>
          <div class="stat-row"><span class="label">Attack</span><span class="value">{{ pokemon.attack }}</span></div>
          <div class="stat-row"><span class="label">Defense</span><span class="value">{{ pokemon.defense }}</span></div>
          <div class="stat-row"><span class="label">Special Attack</span><span class="value">{{ pokemon.special_attack
              }}</span></div>
          <div class="stat-row"><span class="label">Special Defense</span><span class="value">{{ pokemon.special_defense
              }}</span>
          </div>
          <div class="stat-row"><span class="label">Speed</span><span class="value">{{ pokemon.speed }}</span></div>
          <div class="stat-row total"><span class="label">Total</span><span class="value">{{ totalStats }}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="ev-container">
      <h3>EV Yield</h3>
      <div class="ev-grid">
        <div v-if="pokemon.ev_health" class="ev-badge">Health +{{ pokemon.ev_health }}</div>
        <div v-if="pokemon.ev_attack" class="ev-badge">Attack +{{ pokemon.ev_attack }}</div>
        <div v-if="pokemon.ev_defense" class="ev-badge">Defense +{{ pokemon.ev_defense }}</div>
        <div v-if="pokemon.ev_special_attack" class="ev-badge">Special Attack +{{ pokemon.ev_special_attack }}</div>
        <div v-if="pokemon.ev_special_defense" class="ev-badge">Special Defense +{{ pokemon.ev_special_defense }}
        </div>
        <div v-if="pokemon.ev_speed" class="ev-badge">Speed +{{ pokemon.ev_speed }}</div>
        <div v-if="totalEvYield" class="ev-badge">Total +{{ totalEvYield }}</div>
      </div>
    </div>
    <div class="moveset">
      <div v-for="move in pokemon.moves">
        <MoveCard :move="move" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.pokemon-card.type-normal {
  --type-color: #a8a878;
  --type-bg: #f5f5dc;
}

.pokemon-card.type-fire {
  --type-color: #f08030;
  --type-bg: #fdf1e6;
}

.pokemon-card.type-water {
  --type-color: #6890f0;
  --type-bg: #ebf1ff;
}

.pokemon-card.type-grass {
  --type-color: #78c850;
  --type-bg: #f1f9eb;
}

.pokemon-card.type-electric {
  --type-color: #f8d030;
  --type-bg: #fefbeb;
}

.pokemon-card.type-ice {
  --type-color: #98d8d8;
  --type-bg: #f1fbfb;
}

.pokemon-card.type-fighting {
  --type-color: #c03028;
  --type-bg: #f8ebeb;
}

.pokemon-card.type-poison {
  --type-color: #a040a0;
  --type-bg: #f6ebf6;
}

.pokemon-card.type-ground {
  --type-color: #e0c068;
  --type-bg: #faf6eb;
}

.pokemon-card.type-flying {
  --type-color: #a890f0;
  --type-bg: #f4f1fe;
}

.pokemon-card.type-psychic {
  --type-color: #f85888;
  --type-bg: #fef1f5;
}

.pokemon-card.type-bug {
  --type-color: #a8b820;
  --type-bg: #f4f6e6;
}

.pokemon-card.type-rock {
  --type-color: #b8a038;
  --type-bg: #f6f4eb;
}

.pokemon-card.type-ghost {
  --type-color: #705898;
  --type-bg: #f0eef5;
}

.pokemon-card.type-dragon {
  --type-color: #7038f8;
  --type-bg: #efecfe;
}

.pokemon-card.type-steel {
  --type-color: #b8b8d0;
  --type-bg: #f6f6f9;
}

.pokemon-card.type-dark {
  --type-color: #705848;
  --type-bg: #f0eeed;
}

.pokemon-card.type-fairy {
  --type-color: #ee99ac;
  --type-bg: #fdf3f5;
}

.pokemon-card {
  position: relative;
  margin-top: 2rem;
  border: 3px solid var(--type-color);
  background-color: var(--type-bg);
  border-radius: 20px;
  padding: 2rem 1.5rem 1.5rem;
  color: #2c3e50;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.card-header {
  position: absolute;
  top: -1.5rem;
  left: 50%;
  transform: translateX(-50%);
  width: 85%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  border: 2px solid var(--type-color);
  border-radius: 50px;
  padding: 0.5rem 1.25rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 10;
  gap: 1rem;
}

.pokemon-name {
  margin: 0;
  font-size: 1.1rem;
  color: var(--type-color);
  text-shadow: none;
  white-space: nowrap;
}

.pokemon-class {
  font-style: italic;
  font-size: 0.85rem;
  color: #555;
  border-left: 1px solid #ddd;
  border-right: 1px solid #ddd;
  padding: 0 1rem;
  white-space: nowrap;
}

.form-tag {
  font-style: normal;
  font-weight: bold;
  font-size: 0.75rem;
  color: var(--type-color);
}

.data-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.data-section h4 {
  margin: 0 0 0.5rem 0;
  color: var(--type-color);
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.type-pills p {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 5px;
  font-weight: bold;
  font-size: 0.9rem;
}

.combat-info {
  display: flex;
  gap: 20px;
  margin-top: 20px;
  background: rgba(255, 255, 255, 0.3);
  padding: 15px;
  border-radius: 15px;
}

.abilities-section {
  margin-top: 20px;
}

.ability-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ability-slot {
  background: rgba(255, 255, 255, 0.5);
  border-left: 4px solid var(--type-color);
  border-radius: 4px 12px 12px 4px;
  padding: 10px 15px;
  transition: transform 0.2s ease;
}

.ability-slot:hover {
  background: white;
  transform: translateX(5px);
}

.ability-slot.hidden, .ability-slot.special {
  border-left-style: dashed;
  background: rgba(255, 255, 255, 0.3);
}

.ability-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.ability-name {
  font-weight: bold;
  color: #333;
  font-size: 1rem;
}

.ability-tag {
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  background: var(--type-color);
  color: white;
  padding: 2px 8px;
  border-radius: 10px;
}

.ability-desc {
  margin: 0;
  font-size: 0.85rem;
  line-height: 1.4;
  color: #555;
  font-style: italic;
}

.stats-container,
.ev-container {
  flex: 1;
}

h3 {
  font-size: 0.9rem;
  color: var(--type-color);
  text-transform: uppercase;
  margin-bottom: 10px;
  border-bottom: 2px solid var(--type-color);
}

.stat-grid {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  align-items: center;
  font-size: 0.85rem;
  background: white;
  padding: 4px 8px;
  border-radius: 4px;
}

.stat-row.total {
  background: var(--type-color);
  color: white;
  font-weight: bold;
  margin-top: 5px;
}

.stat-row.label {
  font-weight: bold;
  color: #666;
}

.stat-row.total .label {
  color: white;
}

.ev-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.ev-badge {
  background: var(--type-color);
  color: white;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: bold;
}
</style>
