export interface Pokemon {
  id: number;
  pokedex_number: number;
  name: string;
  class: string | null;
  form: string | null;
  legendary: string | null;
  height: number | null;
  weight: number | null;
  primary_type: string;
  secondary_type: string | null;
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
  previous_evolution?: { id: number, name: string };
  next_evolutions: EvolutionPath[] | null;
  moves?: Move[];
  version_group?: string;
}

export interface EvolutionPath {
  to_id: number;
  name: string;
  requirement: string;
}

export interface Move {
  id: number;
  name: string;
  type: string;
  category: "physical" | "special" | "status";
  pp: number;
  power: number | null;
  accuracy: number | null;
  range: string | null;
  effect: string;
  level_learned: number;
  learn_method: string;
}
