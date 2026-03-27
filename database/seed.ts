import fs from 'fs';
import { parse } from 'csv-parse';

const pkmnSeed = `CREATE TABLE IF NOT EXISTS Pokemon (id INTEGER PRIMARY KEY,
name TEXT NOT NULL,
generation TEXT NOT NULL,
hp INTEGER,
attack INTEGER,
defense INTEGER,
special_attack INTEGER,
special_defense INTEGER,
speed INTEGER,
primary_type TEXT NOT NULL,
secondary_type TEXT,
ability_i TEXT NOT NULL,
ability_ii TEXT,
hidden_ability TEXT,
ev_worth TEXT,
gender TEXT,
egg_group_i TEXT,
egg_group_ii TEXT,
catch INTEGER,
evolve TEXT);`;

const moveSeed = `CREATE TABLE IF NOT EXISTS Moves (id SERIAL PRIMARY KEY,
name TEXT NOT NULL,
type TEXT NOT NULL,
category TEXT,
power INTEGER,
accuracy INTEGER,
pp INTEGER,
effect TEXT,
probability INTEGER);`;

const pkmnMovesSeed = `CREATE TABLE IF NOT EXISTS Pokemon_Moves (pokemon_id INT NOT NULL REFERENCES Pokemon(id),
move_id INT NOT NULL REFERENCES Moves(id),
PRIMARY KEY (pokemon_id, move_id));`;

const pkmnCsv = fs.createReadStream("./pokemon.csv");

const pokemonList = [];

pkmnCsv.pipe(parse({
  columns: true
})).on('data', (data) => {
  pokemonList.push(data);
}).on('end', async () => {
  await pool.query(pkmnSeed);
  for (const pokemon of pokemonList) {
    const vals = [pokemon.id, pokemon.name, pokemon.generation, pokemon.hp, pokemon.attack, pokemon.defense,
      pokemon.special_attack, pokemon.special_defense, pokemon.speed, pokemon.primary_type, pokemon.secondary_type,
      pokemon.ability_i, pokemon.ability_ii, pokemon.hidden_ability, pokemon.ev_worth, pokemon.gender, pokemon.egg_group_i,
      pokemon.egg_group_ii, pokemon.catch, pokemon.evolve];
    await pool.query(`INSERT INTO Pokemon(id, name, generation, hp, attack, defense,
      special_attack, special_defense, speed, primary_type, secondary_type,
      ability_i, ability_ii, hidden_ability, ev_worth, gender, egg_group_i,
      egg_group_ii, catch, evolve) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9,
      $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)`, vals);
  }
});
