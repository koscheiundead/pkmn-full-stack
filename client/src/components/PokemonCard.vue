<script setup lang="ts">
import { computed, ref } from 'vue';
import axios from 'axios';
import MoveCard from './MoveCard.vue';
import type { Pokemon, Move } from "../../../shared/types";

const props = defineProps<{
  pokemon: Pokemon
}>();
const error = ref(null);
const moves = ref<Move[]>([]);
const isExpanded = ref(false);
const isLoading = ref(false);
const isShiny = ref(false);

const pokemonImg = computed(() => {
  const baseUrl = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/";
  const suffix = isShiny.value ? "shiny/" : "";
  return `${baseUrl}${suffix}${props.pokemon.id}.png`;
});

const name = computed(() => {
  const pkmn = props.pokemon.name;
  return pkmn.charAt(0).toUpperCase() + pkmn.slice(1);
})

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

async function toggleMoves() {
  isExpanded.value = !isExpanded.value;

  //if we are unexpanding, hide loading value regardless of how long moves is
  if (!isExpanded.value) isLoading.value = false;

  // if we haven't already fetched and are expanding, fetch
  if (isExpanded.value && moves.value.length === 0) {
    isLoading.value = true;
    try {
      const res = await axios.get(`http://127.0.0.1:3000/pokemon/${props.pokemon.id}/moves`);
      moves.value = res.data.moves;
    } catch (err) {
      console.error("Failed to load moves:", err);
      error.value = err?.message || "Error loading moves.";
    } finally {
      isLoading.value = false;
    }
  }
}

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

function cap(str: string) {
  let words = str.split('-');
  let result = []
  for (let word of words) {
    result.push(word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
  }
  return result.join(' ');
}
</script>

<template>
  <div v-if="error">
    <h1>Error</h1>
    <p>{{ error }}</p>
  </div>
  <div v-if="pokemon" :class="['pokemon-card', `type-${pokemon.primary_type.toLowerCase()}`]">
    <div class="card-header">
      <h1 class="pokemon-name">#{{ pokemon.pokedex_number }}: {{ name }}</h1>

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
    <div id="sprites">
      <img :src="pokemonImg" :alt="pokemon.name" class="main-sprite" />
      <button @click="isShiny = !isShiny" class="shiny-toggle" :class="{ active: isShiny }">✨</button>
    </div>
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

      <div class="evolution-section" v-if="pokemon.next_evolutions || pokemon.previous_evolution">
        <h3 class="section-title">Evolution Chain</h3>

        <div class="evo-wrapper">
          <div v-if="pokemon.previous_evolution" class="evo-stage">
            <router-link :to="`/pokemon/${pokemon.previous_evolution.id}`" class="evo-card">
              <img
                :src="`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.previous_evolution.id}.png`"
                @error="(e) => e.target.src = '/placeholder-pokeball.png'"
                :alt="`Prev: ${pokemon.previous_evolution.name}`" />
              <span class="evo-name">{{ pokemon.previous_evolution.name }}</span>
            </router-link>

            <div class="arrow">→</div>
          </div>

          <div class="evo-stage current">
            <div class="evo-card active">
              <img :src="`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`"
                @error="(e) => e.target.src = '/placeholder-pokeball.png'" :alt="`Current ${pokemon.name}`" />
              <span class="evo-name">{{ pokemon.name }}</span>
              <span class="current-badge">You are here</span>
            </div>
            <div class="arrow" v-if="pokemon.next_evolutions?.length">→</div>
          </div>


          <div v-if="pokemon.next_evolutions?.length" class="evo-branches">
            <router-link v-for="evo in pokemon.next_evolutions" :key="evo.to_id" :to="`/pokemon/${evo.to_id}`"
              class="evo-card branch">
              <div class="req-bubble">{{ evo.requirement }}</div>
              <img :src="`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${evo.to_id}.png`"
                @error="(e) => e.target.src = '/placeholder-pokeball.png'" />
              <span class="evo-name">{{ evo.name }}</span>
            </router-link>
          </div>

          <div v-else class="final-evolution">
            <span>Fully Evolved</span>
          </div>
        </div>

      </div>

    </div>
    <div class="abilities-section">
      <h3>Abilities</h3>
      <div class="ability-list">
        <div class="ability-slot">
          <div class="ability-header">
            <span class="ability-name">{{ cap(pokemon.ability_i) }}</span><span class="ability-tag">Primary</span>
          </div>
          <p class="ability-desc">{{ pokemon.ability_i_description }}</p>
        </div>

        <div v-if="pokemon.ability_ii" class="ability-slot">
          <div class="ability-header">
            <span class="ability-name">{{ cap(pokemon.ability_ii) }}</span><span class="ability-tag">Secondary</span>
          </div>
          <p class="ability-desc">{{ pokemon.ability_ii_description }}</p>
        </div>

        <div v-if="pokemon.hidden_ability" class="ability-slot hidden">
          <div class="ability-header">
            <span class="ability-name">{{ cap(pokemon.hidden_ability) }}</span><span class="ability-tag">Hidden</span>
          </div>
          <p class="ability-desc">{{ pokemon.hidden_ability_description }}</p>
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
      <button @click="toggleMoves" :class="['expand-btn', isExpanded ? 'is-open' : '']">{{ isExpanded ? "Hide Moves" :
        "Show Moves" }}</button>
      <div v-if="isLoading">Loading...</div>
      <div v-else-if="isExpanded && moves.length === 0">No moves found.</div>
      <div v-else-if="isExpanded && moves.length > 0" class="moves-list">
        <MoveCard v-for="move in moves" :key="move.id" :move="move" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.pokemon-card {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.pokemon-header {
  border-bottom: 2px solid #555;
  padding-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.main-image-container {
  background: #333;
  border: 2px solid #555;
  box-shadow: inset 0 0 10px #000;
  display: flex;
  justify-content: center;
  padding: 20px;
}

.pokemon-stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  font-size: 0.7rem;
  color: #00ff41; /* matrix green data vibes */
}
</style>
