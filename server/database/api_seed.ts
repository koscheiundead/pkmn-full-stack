import { Client } from "pg";
import axios from "axios";
import "dotenv/config";

const client = new Client({
  host: "localhost",
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT),
});

const POKEMON_COUNT = 1025; // full list now
const delay = (ms) => new Promise((res) => setTimeout(res, ms));
const abilityCache = {};
const getId = (url) => (url ? url.split("/").slice(-2, -1)[0] : null);

async function resetAndSeed() {
  await client.connect();

  try {
    console.log("Dropping existing tables...");
    await client.query(`
      DROP TABLE IF EXISTS pokemon_moves;
      DROP TABLE IF EXISTS moves;
      DROP TABLE IF EXISTS evolutions;
      DROP TABLE IF EXISTS pokemon;
      `);

    console.log("Creating fresh schema...");
    await client.query(`
      CREATE TABLE pokemon (
      id INTEGER PRIMARY KEY,
      pokedex_number INTEGER,
      name VARCHAR(255),
      class VARCHAR(255),
      legendary VARCHAR(50),
      height DECIMAL,
      weight DECIMAL,
      primary_type VARCHAR(50),
      secondary_type VARCHAR(50),
      ability_i VARCHAR(255),
      ability_i_description TEXT,
      ability_ii VARCHAR(255),
      ability_ii_description TEXT,
      hidden_ability VARCHAR(255),
      hidden_ability_description TEXT,
      ratio_male DECIMAL,
      ratio_female DECIMAL,
      happiness_base INTEGER,
      first_game VARCHAR(100),
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
      experience_rate VARCHAR(100),
      egg_group_i VARCHAR(100),
      egg_group_ii VARCHAR(100),
      egg_cycle_count INTEGER,
      previous_evolution_pokedex_id INTEGER
      );

      CREATE TABLE moves (
      id INTEGER PRIMARY KEY,
      name VARCHAR(255),
      type VARCHAR(50),
      category VARCHAR(50),
      power INTEGER,
      pp INTEGER,
      accuracy INTEGER,
      effect TEXT
      );

      CREATE TABLE pokemon_moves (
      pokemon_id INTEGER REFERENCES pokemon(id),
      move_id INTEGER REFERENCES moves(id),
      version_group VARCHAR(100),
      learn_method VARCHAR(100),
      level_learned INTEGER,
      PRIMARY KEY (pokemon_id, move_id, version_group, learn_method, level_learned)
      );

      CREATE TABLE evolutions (
      id SERIAL PRIMARY KEY,
      from_pokemon_id INTEGER REFERENCES pokemon(id),
      to_pokemon_id INTEGER REFERENCES pokemon(id),
      requirement TEXT
      );
      `);

    const seenMoves = new Set();
    const processedChains = new Set();
    const allEvoLinks = []; // temp storage

    for (let i = 1; i <= POKEMON_COUNT; i++) {
      console.log(`Fetching ID ${i}`);
      const p = (await axios.get(`https://pokeapi.co/api/v2/pokemon/${i}`))
        .data;
      const s = (
        await axios.get(`https://pokeapi.co/api/v2/pokemon-species/${i}`)
      ).data;

      // ability logic
      const fetchAbility = async (abObj) => {
        if (!abObj) return [null, null];
        const name = abObj.ability.name;
        if (!abilityCache[name]) {
          try {
            const { data } = await axios.get(abObj.ability.url);
            // look for effect_entries first, fallback to flavor_text
            const entry =
              data.effect_entries.find((e) => e.language.name === "en") ||
              data.flavor_text_entries.find((e) => e.language.name === "en");
            abilityCache[name] = entry
              ? entry.short_effect || entry.effect || entry.flavor_text
              : "No description available.";
          } catch (e) {
            abilityCache[name] = "Data unavailable";
          }
        }
        return [name, abilityCache[name]];
      };

      const [a1n, a1d] = await fetchAbility(
        p.abilities.find((a) => a.slot === 1),
      );
      const [a2n, a2d] = await fetchAbility(
        p.abilities.find((a) => a.slot === 2),
      );
      const [han, had] = await fetchAbility(
        p.abilities.find((a) => a.is_hidden),
      );

      // recursive evolution helper (populating evolutions table)
      function getAllEvolutions(chain, results = []) {
        if (!chain || !chain.evolves_to.length) return results;

        // for each evolution path coming off this current position
        for (const evolution of chain.evolves_to) {
          results.push({
            from_id: getId(chain.species.url),
            to_id: getId(evolution.species.url),
            requirement: formatRequirement(evolution.evolution_details[0]),
          });
          // recursively check if the next pokemon also evolves
          getAllEvolutions(evolution, results);
        }
        return results;
      }

      function formatRequirement(d) {
        if (!d) return "Unknown";
        const trigger = d.trigger.name.replace(/-/g, " ");
        const item = d.item ? ` with ${d.item.name.replace(/-/g, " ")}` : "";
        const lv = d.min_level ? ` at level ${d.min_level}` : "";
        const happy = d.min_happiness ? ` with high Happiness` : "";
        const held = d.held_item ? ` holding ${d.held_item.name}` : "";
        const move = d.known_move ? ` knowing ${d.known_move.name}` : "";
        return `${trigger}${lv}${item}${happy}${held}${move}`.trim();
      }

      const stats = p.stats.map((s) => s.base_stat);
      const evs = p.stats.map((s) => s.effort);
      const female = s.gender_rate === -1 ? null : (s.gender_rate / 8) * 100;

      await client.query(
        `
        INSERT INTO pokemon (id, pokedex_number, name, class, legendary, height, weight, primary_type, secondary_type,
        ratio_male, ratio_female, happiness_base, first_game, health, attack, defense, special_attack, special_defense,
        speed, ev_health, ev_attack, ev_defense, ev_special_attack, ev_special_defense, ev_speed, catch_rate, experience_rate,
        egg_group_i, egg_group_ii, egg_cycle_count, previous_evolution_pokedex_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22,
        $23, $24, $25, $26, $27, $28, $29, $30, $31);
        `,
        [
          p.id,
          p.id,
          p.name,
          s.genera.find((g) => g.language.name === "en")?.genus,
          s.is_legendary ? "Legendary" : "Standard",
          p.height / 10,
          p.weight / 10,
          p.types[0].type.name,
          p.types[1]?.type.name || null,
          female !== null ? 100 - female : null,
          female,
          s.base_happiness,
          s.generation.name,
          stats[0],
          stats[1],
          stats[2],
          stats[3],
          stats[4],
          stats[5],
          evs[0],
          evs[1],
          evs[2],
          evs[3],
          evs[4],
          evs[5],
          s.capture_rate,
          s.growth_rate.name,
          s.egg_groups[0]?.name || null,
          s.egg_groups[1]?.name || null,
          s.hatch_counter,
          getId(s.evolves_from_species?.url),
        ],
      );

      // evo chain
      const chainId = getId(s.evolution_chain.url);
      // process evolutions if this is a new chain
      if (!processedChains.has(chainId)) {
        const e = (await axios.get(s.evolution_chain.url)).data;
        const links = getAllEvolutions(e.chain);
        allEvoLinks.push(...links);
        processedChains.add(chainId);
      }

      // process moves and junction
      for (const m of p.moves) {
        const mId = getId(m.move.url);
        if (!seenMoves.has(mId)) {
          const md = (await axios.get(m.move.url)).data;
          await client.query(
            `INSERT INTO moves (id, name, type, category, power, pp, accuracy) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
              mId,
              md.name,
              md.type.name,
              md.damage_class.name,
              md.power || 0,
              md.pp,
              md.accuracy || 0,
            ],
          );
          seenMoves.add(mId);
        }
        for (const vd of m.version_group_details) {
          await client.query(
            `INSERT INTO pokemon_moves VALUES ($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING`,
            [
              p.id,
              mId,
              vd.version_group.name,
              vd.move_learn_method.name,
              vd.level_learned || 0,
            ],
          );
        }
      }
      await delay(100);
    }

    console.log("Connecting evolution dots...");
    for (const link of allEvoLinks) {
      await client.query(
        `INSERT INTO evolutions (from_pokemon_id, to_pokemon_id, requirement) VALUES ($1, $2, $3)`,
        [link.from_id, link.to_id, link.requirement],
      );
    }
    console.log("Database fully reset and seeded!");
  } catch (e) {
    console.error("Seed failed:", e);
  } finally {
    await client.end();
  }
}

resetAndSeed();
