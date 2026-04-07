<script setup lang="ts">
import axios from "axios";
import { ref, onMounted, watch } from "vue";
import { useRoute } from 'vue-router';
import PokemonCard from "./components/PokemonCard.vue";
import PokemonList from "./components/PokemonList.vue";
import type { Pokemon } from "../../shared/types.ts";

const route = useRoute();
const error = ref(null);
const allPokemon = ref<Array<Pokemon>>([]);
const singlePokemon = ref<Pokemon | null>(null);

async function loadSinglePokemon(id: string | string[]) {
  if (!id) return;
  const res = await axios.get(`http://127.0.0.1:3000/pokemon/${id}`);
  if (res.status === 200) {
    singlePokemon.value = res.data.pokemon;
  } else {
    error.value = res.data.error;
  }
}

async function loadPokemon() {
  const res = await axios.get("http://127.0.0.1:3000/pokemon");
  if (res.status === 200) {
    allPokemon.value = res.data.pokemon;
  } else {
    error.value = res.data.error;
  }
}

onMounted(loadPokemon);

watch(() => route.params.id, (newId) => {
  loadSinglePokemon(newId);
})
</script>

<template>
  <div v-if="singlePokemon">
    <PokemonCard :pokemon="singlePokemon"/>
  </div>
  <div v-else-if="allPokemon">
    <PokemonList :pokemon="allPokemon"></PokemonList>
  </div>
</template>

<style scoped>
.wrapper {
  margin: 20px;
}
</style>
