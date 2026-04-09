export type PokemonLegendaryStatus = "Legendary" | "Mythical" | "Standard";
export type MoveCategory = "physical" | "special" | "status";
export type StatName =
  | "health"
  | "attack"
  | "defense"
  | "special_attack"
  | "special_defense"
  | "speed";

// core DB row (1:1 with table `pokemon`)
export interface PokemonRow {
  id: number;
  pokedex_number: number;
  name: string;
  form: string | null;
  class: string | null;
  legendary: PokemonLegendaryStatus;
  height: number | null;
  weight: number | null;
  primary_type: PokemonType;
  secondary_type: PokemonType | null;
  ability_i: string | null;
  ability_i_description: string | null;
  ability_ii: string | null;
  ability_ii_description: string | null;
  hidden_ability: string | null;
  hidden_ability_description: string | null;
  special_event_ability: string | null;
  special_event_ability_description: string | null;
  ratio_male: number | null;
  ratio_female: number | null;
  happiness_base: number | null;
  first_game: string;
  health: number | null;
  attack: number | null;
  defense: number | null;
  special_attack: number | null;
  special_defense: number | null;
  speed: number | null;
  ev_health: number | null;
  ev_attack: number | null;
  ev_defense: number | null;
  ev_special_attack: number | null;
  ev_special_defense: number | null;
  ev_speed: number | null;
  catch_rate: number | null;
  experience_rate: string | null;
  experience_total: number | null;
  egg_group_i: string | null;
  egg_group_ii: string | null;
  egg_cycle_count: number | null;
  version_group?: string;
  previous_evolution?: { id: number; name: string };
}

// enriched view model for UI
export interface Pokemon extends PokemonRow {
  // joined / computed for UI
  previous_evolution?: PokemonStub;
  next_evolutions?: EvolutionPath[];
  moves?: Move[];
  // sprites fetched client-side from PokeAPI CDN
  sprite_default?: string;
  sprite_shiny?: string;
  sprite_official_artwork?: string;
}

export interface PokemonStub {
  id: number;
  name: string;
  primary_type: PokemonType;
  sprite_default?: string;
}

export interface EvolutionPath {
  to_id: number;
  name: string;
  primary_type: PokemonType;
  requirement: string;
  sprite_default?: string;
}

export interface Move {
  id: number;
  name: string;
  type: PokemonType;
  category: MoveCategory;
  pp: number;
  power: number | null;
  accuracy: number | null;
  effect: string;
  level_learned: number;
  learn_method: string;
  version_group: string;
}

// type system
export const POKEMON_TYPES = [
  "normal",
  "fire",
  "water",
  "electric",
  "grass",
  "ice",
  "fighting",
  "poison",
  "ground",
  "flying",
  "psychic",
  "bug",
  "rock",
  "ghost",
  "dragon",
  "dark",
  "steel",
  "fairy",
] as const;

export type PokemonType = (typeof POKEMON_TYPES)[number];

// classic Kanto pokedex color palette per type
export const TYPE_COLORS: Record<PokemonType, { bg: string; text: string }> = {
  normal: { bg: "#A8A77A", text: "#fff" },
  fire: { bg: "#EE8130", text: "#fff" },
  water: { bg: "#6390F0", text: "#fff" },
  electric: { bg: "#F7D02C", text: "#333" },
  grass: { bg: "#7AC74C", text: "#fff" },
  ice: { bg: "#96D9D6", text: "#333" },
  fighting: { bg: "#C22E28", text: "#fff" },
  poison: { bg: "#A33EA1", text: "#fff" },
  ground: { bg: "#E2BF65", text: "#333" },
  flying: { bg: "#A98FF3", text: "#fff" },
  psychic: { bg: "#F95587", text: "#fff" },
  bug: { bg: "#A6B91A", text: "#fff" },
  rock: { bg: "#B6A136", text: "#fff" },
  ghost: { bg: "#735797", text: "#fff" },
  dragon: { bg: "#6F35FC", text: "#fff" },
  dark: { bg: "#705746", text: "#fff" },
  steel: { bg: "#B7B7CE", text: "#333" },
  fairy: { bg: "#D685AD", text: "#fff" },
};

// api response shape
export interface PokemonListResponse {
  data: PokemonRow[];
  total: number;
  page: number;
  page_size: number;
}

export interface PokemonFilters {
  type?: PokemonType;
  generation?: number;
  legendary?: PokemonLegendaryStatus;
  search?: string;
  page?: number;
  page_size?: number;
}
