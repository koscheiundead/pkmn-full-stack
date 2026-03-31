<script setup lang="ts">
import axios from "axios";
import { ref, onMounted } from "vue";
import PokemonCard from "./components/PokemonCard.vue";
import type { Pokemon } from "../../shared/types.ts";

const error = ref(null);
const pokemon = ref<Array<Pokemon>>([]);

async function loadPokemon() {
  const res = await axios.get("http://127.0.0.1:3000/pokemon");
  if (res.status === 200) {
    pokemon.value = res.data.pokemon;
  } else {
    error.value = res.data.error;
  }
}

onMounted(loadPokemon);
</script>

<template>
  <div v-if="pokemon.length > 0" class="wrapper">
    <PokemonCard v-for="poke in pokemon" :pokemon="poke"/>
  </div>
</template>

<style scoped>
.wrapper {
  margin: 20px;
}
</style>
