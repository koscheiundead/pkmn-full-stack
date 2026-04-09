import { createRouter, createWebHistory } from "vue-router";
import PokemonList from "../components/PokemonList.vue";
import PokemonCard from "../components/PokemonCard.vue";

const routes = [
  {
    path: '/',
    name: 'home',
    component: PokemonList,
  },
  {
    path: '/pokemon/:id',
    name: 'pokemon-detail',
    component: PokemonCard,
    props: true, // allows :id to be passed as a prop to component
  }
];

const router = createRouter({ history: createWebHistory(), routes });

export default router;
