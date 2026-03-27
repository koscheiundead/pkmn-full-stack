export interface Pokemon {
  id: number;
  name: string;
  generation: string;
  hp: number | null;
  attack: number | null;
  defense: number | null;
  special_attack: number | null;
  special_defense: number | null;
  speed: number | null;
  primary_type: string;
  secondary_type: string | null;
  ability_i: string;
  ability_ii: string | null;
  hidden_ability: string | null;
  ev_worth: string | null;
  gender: string | null;
  egg_group_i: string | null;
  egg_group_ii: string | null;
  catch: number | null;
  evolve: string | null;
  moves: Array<Move>;
}

export interface Move {
  id: number;
  name: string;
  type: string;
  category: "physical" | "special" | "status";
  power: number | null;
  accuracy: number | null;
  pp: number;
  effect: string;
  probability: number | null;
}
