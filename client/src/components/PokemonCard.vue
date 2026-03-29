<script setup lang="ts">
import { computed } from 'vue';
import MoveCard from './MoveCard.vue';
import type { Pokemon } from "../../../shared/types";

const props = defineProps<{
  pokemon: Pokemon
}>();

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
</script>

<template>
  <div v-if="pokemon">
    <h1>#{{pokemon.pokedex_number}}: {{ pokemon.name }}</h1>
    <h2>{{ pokemon.class }} {{ pokemon.form ?? "" }}</h2>
    <h3 v-if="pokemon.legendary">{{ pokemon.legendary }}</h3>
    <div class="types">
      <p>{{ pokemon.primary_type }}{{ pokemon.secondary_type ? `/${pokemon.secondary_type}` : '' }}</p>
    </div>
    <div class="origin">
      <h4>First Game: {{ pokemon.first_game }}</h4>
    </div>
    <div class="size">
      <p>Height: {{  pokemon.height }}</p>
      <p>Weight: {{ pokemon.weight }}</p>
    </div>
    <div class="gender">
      <p>{{ pokemon.ratio_male }}% male</p>
      <p>{{ pokemon.ratio_female }}% female</p>
    </div>
    <div class="catch-grow-hatch">
      <p><span class="stat-name">Catch rate</span>: <span class="stat-value">{{ pokemon.catch_rate }}</span></p>
      <p><span class="stat-name">Experience rate</span>: <span class="stat-value">{{ pokemon.experience_rate }}</span></p>
      <p><span class="stat-name">Experience total</span>: <span class="stat-value">{{ pokemon.experience_total }}</span></p>
      <p v-if="pokemon.previous_evolution_pokedex_id"><span class="stat-name">Previous evolution</span>: <span class="stat-value">{{ pokemon.previous_evolution_pokedex_id }}</span></p>
      <p v-if="pokemon.evolution_requirement"><span class="stat-name">Evolution requirement</span>: <span class="stat-value">{{ pokemon.evolution_requirement }}</span></p>
      <p><span class="stat-name">Egg Group I</span>: <span class="stat-value">{{ pokemon.egg_group_i }}</span></p>
      <p v-if="pokemon.egg_group_ii"><span class="stat-name">Egg Group II</span>: <span class="stat-value">{{ pokemon.egg_group_ii }}</span></p>
      <p><span class="stat-name">Egg Cycle Count</span>: <span class="stat-value">{{ pokemon.egg_cycle_count }}</span></p>
    </div>
    <div class="abilities">
      <ul>
        <li>{{ pokemon.ability_i }}: {{ pokemon.ability_i_description }}</li>
        <li v-if="pokemon.ability_ii">{{ pokemon.ability_ii }}: {{ pokemon.ability_ii_description }}</li>
        <li v-if="pokemon.hidden_ability">{{ pokemon.hidden_ability }}: {{ pokemon.hidden_ability_description }}</li>
        <li v-if="pokemon.special_event_ability">{{ pokemon.special_event_ability }}: {{ pokemon.special_event_ability_description }}</li>
      </ul>
    </div>
    <div class="stats">
      <h4>Stats</h4>
      <p><span class="stat-name">Base Happiness</span>: <span class="stat-value">{{ pokemon.happiness_base }}</span></p>
      <p><span class="stat-name">Health</span>: <span class="stat-value">{{ pokemon.health }}</span></p>
      <p><span class="stat-name">Attack</span>: <span class="stat-value">{{ pokemon.attack }}</span></p>
      <p><span class="stat-name">Defense</span>: <span class="stat-value">{{ pokemon.defense }}</span></p>
      <p><span class="stat-name">Special Attack</span>: <span class="stat-value">{{ pokemon.special_attack }}</span></p>
      <p><span class="stat-name">Special Defense</span>: <span class="stat-value">{{ pokemon.special_defense }}</span></p>
      <p><span class="stat-name">Speed</span>: <span class="stat-value">{{ pokemon.speed }}</span></p>
      <p><span class="stat-total-name">Total</span>: <span class="stat-total-value">{{ totalStats }}</span></p>
    </div>
    <div class="ev-yield">
      <h4>EV Yield</h4>
      <p><span class="ev-name">Health</span>: <span class="ev-value">{{ pokemon.ev_health || 0 }}</span></p>
      <p><span class="ev-name">Attack</span>: <span class="ev-value">{{ pokemon.ev_attack || 0 }}</span></p>
      <p><span class="ev-name">Defense</span>: <span class="ev-value">{{ pokemon.ev_defense || 0 }}</span></p>
      <p><span class="ev-name">Special Attack</span>: <span class="ev-value">{{ pokemon.ev_special_attack || 0 }}</span></p>
      <p><span class="ev-name">Special Defense</span>: <span class="ev-value">{{ pokemon.ev_special_defense || 0 }}</span></p>
      <p><span class="ev-name">Speed</span>: <span class="ev-value">{{ pokemon.ev_speed || 0 }}</span></p>
      <p><span class="ev-total-name">Speed</span>: <span class="ev-total-value">{{ totalEvYield }}</span></p>
    </div>
    <div class="moveset">
      <div v-for="move in pokemon.moves">
        <MoveCard :move="move" />
      </div>
    </div>
  </div>
</template>

<style scoped></style>
