import { Client } from "pg";
import axios, { AxiosError } from "axios";
import "dotenv/config";

const client = new Client({
  host: "localhost",
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT),
});

const POKEMON_COUNT = 1025; // full list now
const BASE_URL = "https://pokeapi.co/api/v2";

// retry with exponential backoff
async function backoffFetch<T>(
  url: string,
  retries = 5,
  baseDelay = 300,
): Promise<T> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const { data } = await axios.get<T>(url, { timeout: 10_000 });
      return data;
    } catch (err) {
      const status = (err as AxiosError)?.response?.status;
      const isRetryable = !status || status === 429 || status >= 500;
      if (!isRetryable || attempt === retries - 1) throw err;
      const wait = baseDelay * 2 ** attempt + Math.random() * 200;
      console.warn(
        `   Retry ${attempt + 1} for ${url} (${status ?? "network"}) - waiting ${Math.round(wait)}ms`,
      );
      await new Promise((r) => setTimeout(r, wait));
    }
  }
  throw new Error(`All retries exhausted for ${url}`);
}

// ability cache
const abilityCache = new Map<string, string>();

async function fetchAbilityDescription(
  abilityObj:
    | {
        ability: { name: string; url: string };
        is_hidden: boolean;
        slot: number;
      }
    | undefined,
): Promise<[string | null, string | null]> {
  if (!abilityObj) return [null, null];
  const { name, url } = abilityObj.ability;
  if (!abilityCache.has(name)) {
    try {
      const data = await backoffFetch<any>(url);
      const entry =
        data.effect_entries?.find((e: any) => e.language.name === "en") ??
        data.flavor_text_entries?.find((e: any) => e.language.name === "en");
      abilityCache.set(
        name,
        entry?.short_effect ?? entry?.effect ?? "No description available.",
      );
    } catch {
      abilityCache.set(name, "Data unavailable.");
    }
  }
  return [name, abilityCache.get(name)!];
}

// evo helpers
function getIdFromUrl(url: string | undefined): number | null {
  if (!url) return null;
  const match = url.match(/\/(\d+)\/?$/);
  return match ? parseInt(match[1]) : null;
}
interface EvoLink {
  from_id: number;
  to_id: number;
  requirement: string;
}

function formatRequirement(d: any): string {
  if (!d) return "Unknown";
  const parts: string[] = [];
  if (d.min_level) parts.push(`at level ${d.min_level}`);
  if (d.item) parts.push(`with ${d.item.name.replace(/-/g, " ")}`);
  if (d.min_happiness) parts.push(`with high happiness`);
  if (d.min_affection) parts.push(`with high affection`);
  if (d.min_damage_taken) parts.push(`after taking ${d.min_damage_taken} damage`);
  if (d.min_beauty) parts.push(`with min beauty ${d.min_beauty}`);
  if (d.min_move_count) parts.push(`knowing ${d.min_move_count} moves`);
  if (d.min_steps) parts.push(`having walked ${d.min_steps}`);
  if (d.held_item) parts.push(`holding ${d.held_item.name.replace(/-/g, " ")}`);
  if (d.known_move)
    parts.push(`knowing ${d.known_move.name.replace(/-/g, " ")}`);
  if (d.known_move_type)
    parts.push(`knowing a ${d.known_move_type.name}-type move`);
  if (d.location) parts.push(`at ${d.location.name.replace(/-/g, " ")}`);
  if (d.time_of_day) parts.push(`during ${d.time_of_day}`);
  if (d.needs_multiplayer) parts.push(`in multiplayer`);
  if (d.needs_overworld_rain) parts.push(`during rain`);
  if (d.party_species) parts.push(`with a ${d.party_species} in party`);
  if (d.party_type) parts.push(`with ${d.party_type} type in party`);
  if (d.region_id) parts.push(`in ${d.region_id}`);
  if (d.trade_species) parts.push(`via trade`);
  if (d.turn_upside_down) parts.push(`when held upside-down`);
  if (d.used_move) parts.push(`after using move ${d.used_move}`);
  if (d.gender !== null && d.gender !== undefined)
    parts.push(`as ${d.gender === 1 ? "female" : "male"}`);
  return parts.join(", ").trim();
}

function extractEvoLinks(chain: any, links: EvoLink[] = []): EvoLink[] {
  for (const evo of chain.evolves_to ?? []) {
    links.push({
      from_id: getIdFromUrl(chain.species.url)!,
      to_id: getIdFromUrl(evo.species.url)!,
      requirement: formatRequirement(evo.evolution_details[0]),
    });
    extractEvoLinks(evo, links);
  }
  return links;
}

// schema
async function createSchema() {
  await client.query(`
    DROP TABLE IF EXISTS pokemon_moves, moves, evolutions, pokemon CASCADE;

    CREATE TABLE pokemon (
      id INTEGER PRIMARY KEY,
      pokedex_number INTEGER,
      name VARCHAR(255),
      form VARCHAR(255),
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
      experience_total INTEGER,
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

      -- indexes for common query patterns
      CREATE INDEX idx_pokemon_primary_type ON pokemon(primary_type);
      CREATE INDEX idx_pokemon_secondary_type ON pokemon(secondary_type);
      CREATE INDEX idx_pokemon_name ON pokemon(name);
      CREATE INDEX idx_evolutions_from ON evolutions(from_pokemon_id);
      CREATE INDEX idx_evolutions_to ON evolutions(to_pokemon_id);
      CREATE INDEX idx_pokemon_moves_pokemon ON pokemon_moves(pokemon_id);
    `);
}

// main seeder
async function resetAndSeed() {
  await client.connect();

  try {
    console.log("Dropping and recreating schema...");
    await createSchema();

    const seenMoves = new Set<number>();
    const processedChains = new Set<number>();
    const allEvoLinks: EvoLink[] = [];
    const failed: number[] = [];

    for (let i = 1; i <= POKEMON_COUNT; i++) {
      try {
        process.stdout.write(`[${i}/${POKEMON_COUNT}] Fetching ${i}...`);

        const [p, s] = await Promise.all([
          backoffFetch<any>(`${BASE_URL}/pokemon/${i}`),
          backoffFetch<any>(`${BASE_URL}/pokemon-species/${i}`),
        ]);

        // abilities - fetch concurrently
        const [[a1n, a1d], [a2n, a2d], [han, had]] = await Promise.all([
          fetchAbilityDescription(p.abilities.find((a: any) => a.slot === 1)),
          fetchAbilityDescription(p.abilities.find((a: any) => a.slot === 2)),
          fetchAbilityDescription(p.abilities.find((a: any) => a.is_hidden)),
        ]);

        const stats = p.stats.map((s: any) => s.base_stat); // hp, attack, defense, sp.attack, sp.defense, speed
        const evs = p.stats.map((s: any) => s.effort); //hp, attack, defense, sp.attack, sp.defense, speed
        const femaleRatio = s.gender_rate === -1 ? null : (s.gender_rate / 8) * 100;
        const formName = p.forms?.[0]?.name !== p.name ? p.forms?.[0]?.name : null;

        // insert pokemon
        await client.query(
          `INSERT INTO pokemon (
            id, pokedex_number, name, form, class, legendary, height, weight, primary_type, secondary_type,
            ability_i, ability_i_description, ability_ii, ability_ii_description, hidden_ability, hidden_ability_description,
            ratio_male, ratio_female, happiness_base, first_game, health, attack, defense, special_attack, special_defense, speed,
            ev_health, ev_attack, ev_defense, ev_special_attack, ev_special_defense, ev_speed, catch_rate, experience_rate,
            experience_total, egg_group_i, egg_group_ii, egg_cycle_count, previous_evolution_pokedex_id
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27,
            $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39
          )`,
          [
            p.id, p.id, p.name, formName, s.genera.find((g: any) => g.language.name === "en")?.genus ?? null,
            s.is_legendary ? "Legendary" : s.is_mythical ? "Mythical" : "Standard", p.height / 10, p.weight / 10,
            p.types[0].type.name, p.types[1]?.type.name ?? null, a1n, a1d, a2n, a2d, han, had, femaleRatio !== null ? 100 - femaleRatio : null,
            femaleRatio, s.base_happiness, s.generation.name, stats[0], stats[1], stats[2], stats[3], stats[4], stats[5], evs[0],
            evs[1], evs[2], evs[3], evs[4], evs[5], s.capture_rate, s.growth_rate.name, p.base_experience ?? null, s.egg_groups[0]?.name ?? null,
            s.egg_groups[1]?.name ?? null, s.hatch_counter, getIdFromUrl(s.evolves_from_species?.url),
          ]
        );

        // evolution chain (once per chain)
        const chainId = getIdFromUrl(s.evolution_chain.url);
        if (chainId && !processedChains.has(chainId)) {
          const evoData = await backoffFetch<any>(s.evolution_chain.url);
          allEvoLinks.push(...extractEvoLinks(evoData.chain));
          processedChains.add(chainId);
        }

        // moves
        for (const m of p.moves) {
          const mId = getIdFromUrl(m.move.url);
          if (!mId) continue;

          if (!seenMoves.has(mId)) {
            const md = await backoffFetch<any>(m.move.url);
            const effectEntry = md.effect_entries?.find((e: any) => e.language.name === "en");
            await client.query(
              `INSERT INTO moves (id, name, type, category, power, pp, accuracy, effect)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT DO NOTHING;`,
              [mId, md.name, md.type.name, md.damage_class.name, md.power ?? 0, md.pp, md.accuracy ?? 0, effectEntry?.short_effect ?? effectEntry?.effect ?? "No description available"]
            );
            seenMoves.add(mId);
          }

          // batch junction inserts per version_group detail
          for (const vd of m.version_group_details) {
            await client.query(`INSERT INTO pokemon_moves VALUES ($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING;`,
              [p.id, mId, vd.version_group.name, vd.move_learn_method.name, vd.level_learned ?? 0]
            );
          }
        }

        process.stdout.write("✓\n");
      } catch (err) {
        console.error(`\n    x Failed on ${i}:`, (err as Error).message);
        failed.push(i);
      }

      // polite rate limit pause
      await new Promise((r) => setTimeout(r, 120));
    }

    // write evolutions after all pokemon exist to prevent insert errors
    console.log(`\nInserting ${allEvoLinks.length} evolution links...`);
    for (const link of allEvoLinks) {
      await client.query("INSERT INTO evolutions (from_pokemon_id, to_pokemon_id,requirement) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING",
        [link.from_id, link.to_id, link.requirement]);
    }

    if (failed.length) {
      console.warn(`\n${failed.length} Pokemon failed to seed: [${failed.join(", ")}]`);
      console.warn("Re-run with RETRY_IDS env var or handle manually.");
    } else {
      console.log("\n✓ Database fully seeded.");
    }
  } catch (e) {
    console.error("Fatal seed error:", e);
    process.exit(1);
  } finally {
    await client.end();
  }
}

resetAndSeed();
