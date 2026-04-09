<script setup lang="ts">
import axios from "axios";
import { ref, onMounted, watch } from "vue";
import PokemonCard from "./PokemonCard.vue";
import type { Pokemon } from "../../shared/types.ts";

const error = ref(null);
const pokemon = ref<Array<Pokemon>>([]);
const currentPage = ref(1);
const pageLimit = ref(25);
const totalPages = ref(1);
const searchQuery = ref('');

async function loadPokemon() {
  const res = await axios.get("http://127.0.0.1:3000/pokemon", {
    params: {
      page: currentPage.value,
      limit: pageLimit.value,
      search: searchQuery.value
    }
  });
  if (res.status === 200) {
    pokemon.value = res.data.pokemon;
    totalPages.value = res.data.pagination.totalPages;
  } else {
    error.value = res.data.error;
  }
}

watch(searchQuery, () => {
  currentPage.value = 1;
  loadPokemon();
})

watch([currentPage, pageLimit], () => {
  loadPokemon();
  window.scrollTo({ top: 0, behavior: 'smooth' }); // reset scroll
});

onMounted(loadPokemon);
</script>

<template>
  <div class="pokedex-controls">
    <div class="search-bar">
      <span class="search-icon">🔍</span>
      <input v-model="searchQuery" type="text" placeholder="Search by name or ID...">
    </div>

    <div class="limit-selector">
      <label>Show: </label>
      <select v-model="pageLimit" @change="currentPage = 1">
        <option :value="10">10</option>
        <option :value="25">25</option>
        <option :value="50">50</option>
        <option :value="100">100</option>
      </select>
    </div>

    <div class="pagination-nav">
      <button :disabled="currentPage === 1" @click="currentPage--">Prev</button>
      <span>Page {{ currentPage }} of {{ totalPages }}</span>
      <button :disabled="currentPage === totalPages" @click="currentPage++">Next</button>
    </div>
  </div>

  <div v-if="pokemon.length > 0" class="wrapper">
    <PokemonCard v-for="poke in pokemon" :id="String(poke.id)" />
  </div>
</template>

<style scoped>
.wrapper {
  margin: 20px;
}

.pokedex-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 15px 25px;
  border-radius: 50px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  margin-bottom: 30px;
}

select {
  padding: 5px 10px;
  border-radius: 8px;
  border: 1px solid #ccc;
  font-weight: bold;
}

.pagination-nav button {
  background: var(--type-color, #ee1515);
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 20px;
  cursor: pointer;
  margin: 0 10px;
}

.pagination-nav button:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>
