<script setup lang="ts">
import axios from "axios";
import { ref, onMounted } from "vue";
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
  <div v-if="pokemon.length > 0">
    <ul>
      <li v-for="poke in pokemon">#{{ poke.id}}: {{ poke.name }} ({{ poke.primary_type }}{{poke.secondary_type ? `/${poke.secondary_type}` : ""}} Type)</li>
    </ul>
  </div>
</template>
