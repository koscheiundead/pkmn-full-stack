import fs from "fs";
import { parse } from "csv-parse";
import { from as copyFrom } from "pg-copy-streams";
import { pool } from "./db";

const pkmnSeed = `CREATE TABLE IF NOT EXISTS Pokemon (id SERIAL PRIMARY KEY,
pokedex_number INTEGER NOT NULL,
name TEXT NOT NULL,
class TEXT,
form TEXT,
legendary TEXT,
height REAL,
weight REAL,
primary_type TEXT NOT NULL,
secondary_type TEXT,
ability_i TEXT,
ability_i_description TEXT,
ability_ii TEXT,
ability_ii_description TEXT,
hidden_ability TEXT,
hidden_ability_description TEXT,
special_event_ability TEXT,
special_event_ability_description TEXT,
ratio_male REAL,
ratio_female REAL,
happiness_base INTEGER,
first_game TEXT NOT NULL,
health INTEGER,
attack INTEGER,
defense INTEGER,
special_attack INTEGER,
special_defense INTEGER,
speed INTEGER,
ev_health INTEGER,
ev_attack INTEGER,
ev_defense INTEGER,
ev_special_attack INTEGER,
ev_special_defense INTEGER,
ev_speed INTEGER,
catch_rate INTEGER,
experience_rate TEXT,
experience_total INTEGER,
egg_group_i TEXT,
egg_group_ii TEXT,
egg_cycle_count INTEGER,
previous_evolution_pokedex_id INTEGER,
evolution_requirement TEXT);`;

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

async function seedMoves() {
  const client = await pool.connect(); //single connection from the pool
  try {
    const stream = client.query(
      copyFrom(`
      COPY Moves(id, name, type, category, power, accuracy, pp, effect, probability)
      FROM STDIN WITH (FORMAT CSV, HEADER)`),
    );

    const fileStream = fs.createReadStream("./moves.csv");

    // pipe file directly into DB stream
    fileStream.pipe(stream);

    return new Promise((resolve, reject) => {
      stream.on("finish", resolve);
      stream.on("error", reject);
    });
  } finally {
    client.release(); //always return the client to the pool when we're done!
  }
}

async function runSeeds() {
  try {
    console.log("Checking tables...");
    await pool.query(pkmnSeed);
    await pool.query(moveSeed);
    await pool.query(pkmnMovesSeed);

    console.log("Seeding Pokemon...");
    await seedPokemon(); //stream/loop logic

    console.log("Seeding moves...");
    await seedMoves();

    console.log("Database is ready! Pika-pi!");
  } catch (err) {
    console.error("Seeding failed:", err);
  } finally {
    await pool.end(); //close the pool so the script can exit
  }
}

async function seedPokemon() {
  const pkmnCsv = fs.createReadStream("./pokemon.csv");

  const pokemonList = [];

  pkmnCsv
    .pipe(
      parse({
        columns: true,
      }),
    )
    .on("data", (data) => {
      pokemonList.push(data);
    })
    .on("end", async () => {
      await pool.query(pkmnSeed);
      for (const pokemon of pokemonList) {
        let values = [
          pokemon.pokedex_number,
          pokemon.name,
          pokemon.class,
          pokemon.form,
          pokemon.legendary,
          pokemon.height,
          pokemon.weight,
          pokemon.primary_type,
          pokemon.secondary_type,
          pokemon.ability_i,
          pokemon.ability_i_description,
          pokemon.ability_ii,
          pokemon.ability_ii_description,
          pokemon.hidden_ability,
          pokemon.hidden_ability_description,
          pokemon.special_event_ability,
          pokemon.special_event_ability_description,
          pokemon.ratio_male,
          pokemon.ratio_female,
          pokemon.happiness_base,
          pokemon.first_game,
          pokemon.health,
          pokemon.attack,
          pokemon.defense,
          pokemon.special_attack,
          pokemon.special_defense,
          pokemon.speed,
          pokemon.ev_health,
          pokemon.ev_attack,
          pokemon.ev_defense,
          pokemon.ev_special_attack,
          pokemon.ev_special_defense,
          pokemon.ev_speed,
          pokemon.catch_rate,
          pokemon.experience_rate,
          pokemon.experience_total,
          pokemon.egg_group_i,
          pokemon.egg_group_ii,
          pokemon.egg_cycle_count,
          pokemon.previous_evolution_pokedex_id,
          pokemon.evolution_requirement,
        ];
        await pool.query(
          `INSERT INTO Pokemon(pokedex_number, name, class, form, legendary, height, weight,
          primary_type, secondary_type, ability_i, ability_i_description, ability_ii, ability_ii_description,
          hidden_ability, hidden_ability_description, special_event_ability, special_event_ability_description,
          ratio_male, ratio_female, happiness_base, first_game, health, attack, defense, special_attack,
          special_defense, speed, ev_health, ev_attack, ev_defense, ev_special_attack, ev_special_defense,
          ev_speed, catch_rate, experience_rate, experience_total, egg_group_i, egg_group_ii, egg_cycle_count,
          previous_evolution_pokedex_id, evolution_requirement) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9,
          $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29,
          $30, $31, $32, $33, $34, $35, $36, $37, $38, $39, $40)`,
          vals,
        );
      }
    });
}

async function seedMoves() {
  await pool.query(`COPY Moves(id, name, type, category, power, accuracy, pp, effect, probability)
    FROM './moves.csv'
    DELIMITER ','
    CSV HEADER;`);
}

runSeeds();
