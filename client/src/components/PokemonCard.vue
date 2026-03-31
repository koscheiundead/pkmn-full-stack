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
      <div class="type-pills">
        <p><img :src="imgPrimary" height="25" width="25">{{ pokemon.primary_type }}<span
            v-if="pokemon.secondary_type">/<img :src="imgSecondary" width="25" height="25">{{ pokemon.secondary_type
            }}</span></p>
      </div>
    </div>
    <h2>{{ pokemon.class }} <span v-if="pokemon.form">({{ pokemon.form }})</span></h2>
    <h3 v-if="pokemon.legendary">{{ pokemon.legendary }}</h3>
    <div class="origin">
      <h4>First Game: {{ pokemon.first_game }}</h4>
    </div>
    <div class="data-grid">
      <div class="data-section size">
        <p>Height: {{ pokemon.height }}</p>
        <p>Weight: {{ pokemon.weight }}</p>
      </div>
      <div class="data-section gender">
        <p>{{ pokemon.ratio_male }}% male</p>
        <p>{{ pokemon.ratio_female }}% female</p>
      </div>
      <div class="data-section catch-info">
        <p><span class="stat-name">Catch rate</span>: <span class="stat-value">{{ pokemon.catch_rate }}</span></p>
        <p><span class="stat-name">Experience rate</span>: <span class="stat-value">{{ pokemon.experience_rate }}</span>
        </p>
        <p><span class="stat-name">Experience total</span>: <span class="stat-value">{{ pokemon.experience_total
            }}</span>
        </p>
        <p v-if="pokemon.previous_evolution_pokedex_id && prevEvolution"><span class="stat-name">Previous
            evolution</span>: <span class="stat-value">#{{ pokemon.previous_evolution_pokedex_id }}: {{ prevEvolution }}</span></p>
        <p v-if="pokemon.evolution_requirement"><span class="stat-name">Evolution requirement</span>: <span
            class="stat-value">{{ pokemon.evolution_requirement }}</span></p>
        <p><span class="stat-name">Egg Group I</span>: <span class="stat-value">{{ pokemon.egg_group_i }}</span></p>
        <p v-if="pokemon.egg_group_ii"><span class="stat-name">Egg Group II</span>: <span class="stat-value">{{
          pokemon.egg_group_ii }}</span></p>
        <p><span class="stat-name">Egg Cycle Count</span>: <span class="stat-value">{{ pokemon.egg_cycle_count }}</span>
        </p>
      </div>
    </div>
    <div class="abilities">
      <ul>
        <li>{{ pokemon.ability_i }}: {{ pokemon.ability_i_description }}</li>
        <li v-if="pokemon.ability_ii">{{ pokemon.ability_ii }}: {{ pokemon.ability_ii_description }}</li>
        <li v-if="pokemon.hidden_ability">{{ pokemon.hidden_ability }}: {{ pokemon.hidden_ability_description }}</li>
        <li v-if="pokemon.special_event_ability">{{ pokemon.special_event_ability }}: {{
          pokemon.special_event_ability_description }}</li>
      </ul>
    </div>
    <div class="stats">
      <h4>Stats</h4>
      <p><span class="stat-name">Base Happiness</span>: <span class="stat-value">{{ pokemon.happiness_base }}</span></p>
      <p><span class="stat-name">Health</span>: <span class="stat-value">{{ pokemon.health }}</span></p>
      <p><span class="stat-name">Attack</span>: <span class="stat-value">{{ pokemon.attack }}</span></p>
      <p><span class="stat-name">Defense</span>: <span class="stat-value">{{ pokemon.defense }}</span></p>
      <p><span class="stat-name">Special Attack</span>: <span class="stat-value">{{ pokemon.special_attack }}</span></p>
      <p><span class="stat-name">Special Defense</span>: <span class="stat-value">{{ pokemon.special_defense }}</span>
      </p>
      <p><span class="stat-name">Speed</span>: <span class="stat-value">{{ pokemon.speed }}</span></p>
      <p><span class="stat-total-name">Total</span>: <span class="stat-total-value">{{ totalStats }}</span></p>
    </div>
    <div class="ev-yield">
      <h4>EV Yield</h4>
      <p><span class="ev-name">Health</span>: <span class="ev-value">{{ pokemon.ev_health || 0 }}</span></p>
      <p><span class="ev-name">Attack</span>: <span class="ev-value">{{ pokemon.ev_attack || 0 }}</span></p>
      <p><span class="ev-name">Defense</span>: <span class="ev-value">{{ pokemon.ev_defense || 0 }}</span></p>
      <p><span class="ev-name">Special Attack</span>: <span class="ev-value">{{ pokemon.ev_special_attack || 0 }}</span>
      </p>
      <p><span class="ev-name">Special Defense</span>: <span class="ev-value">{{ pokemon.ev_special_defense || 0
      }}</span></p>
      <p><span class="ev-name">Speed</span>: <span class="ev-value">{{ pokemon.ev_speed || 0 }}</span></p>
      <p><span class="ev-total-name">Total</span>: <span class="ev-total-value">{{ totalEvYield }}</span></p>
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
  border: 2px solid var(--type-color);
  background-color: var(--type-bg);
  color: var(--type-color);
  text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.5);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  border: 2px solid var(--type-color);
  border-radius: 50px;
  padding: 0.5rem 1.5rem;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.data-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  padding: 1rem;
  border-top: 1px solid var(--type-color);
  margin-top: 1rem;
}

.data-section h4 {
  color: var(--type-color);
  font-size: 0.9rem;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
}
</style>
