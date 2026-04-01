import axios from "axios";
import fs from "fs";

const POKEMON_COUNT = 151; //national dex count (original 151 to start, 1025 total later)
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));
const abilityCache = {}; // avoid redundant api calls

async function seedUniversal() {
  const pokemonStream = fs.createWriteStream("pokemon_final.csv");
  const movesStream = fs.createWriteStream("moves_final.csv");
  const junctionStream = fs.createWriteStream("pokemon_moves_final.csv");

  const getId = (url: string | null) => url ? url.split('/').slice(-2, -1)[0] : null;

  // recursive evolution helper (returns next and requirement)
  function getEvoInfo(chain: any, targetId: string | number) {
    let current = chain;
    while (current) {
      if (getId(current.species.url) == targetId) {
        const next = current.evolves_to[0];
        let req = "None";
        if (next && next.evolution_details[0]) {
          const d = next.evolution_details[0];
          const trigger = d.trigger.name.replace(/-/g, ' ');
          const item = d.item ? ` with ${d.item.name.replace(/-/g, ' ')}` : '';
          const lv = d.min_level ? ` at Level ${d.min_level}` : '';
          const happy = d.min_happiness ? ` with high Happiness` : '';
          req = `${trigger}${lv}${item}${happy}`.trim();
        }
        return { nextId: next ? getId(next.species.url) : null, req };
      }
      current = current.evolves_to[0];
    }
    return { nextId: null, req: null };
  }

  // ability fetcher (cached)
  async function getAbility(abilityObj) {
    if (!abilityObj) return { name: null, desc: null };
    const name = abilityObj.ability?.name;
    if (!name) {
      console.log(abilityObj);
      throw new Error("Ability undefined?");
    }
    if (!abilityCache[name]) {
      const { data } = await axios.get(abilityObj.ability.url);
      const entry = data.effect_entries.find((e) => e.language.name === 'en') || data.flavor_text_entries.find((e) => e.language.name === 'en');
      abilityCache[name] = entry ? (entry.effect || entry.flavor_text).replace(/,/g, ';').replace(/\n/g, ' ') : 'N/A';
    }
    return { name, desc: abilityCache[name] };
  }

  // headers
  const headers = [
    "id",
    "pokedex_number",
    "name",
    "class",
    "form",
    "legendary",
    "height",
    "weight",
    "primary_type",
    "secondary_type",
    "ability_i",
    "ability_i_description",
    "ability_ii",
    "ability_ii_description",
    "hidden_ability",
    "hidden_ability_description",
    "special_event_ability",
    "special_event_ability_description",
    "ratio_male",
    "ratio_female",
    "happiness_base",
    "first_game",
    "health",
    "attack",
    "defense",
    "special_attack",
    "special_defense",
    "speed",
    "ev_health",
    "ev_attack",
    "ev_defense",
    "ev_special_attack",
    "ev_special_defense",
    "ev_speed",
    "catch_rate",
    "experience_rate",
    "experience_total",
    "egg_group_i",
    "egg_group_ii",
    "egg_cycle_count",
    "previous_evolution_pokedex_id",
    "next_evolution_pokedex_id",
    "evolution_requirement",
  ];

  pokemonStream.write(headers.join(",") + "\n");
  movesStream.write("id,name,type,category,power,pp,accuracy,effect\n");
  junctionStream.write(
    "pokemon_id,move_id,version_group,learn_method,level_learned\n",
  );

  const seenMoves = new Set();

  for (let i = 1; i <= POKEMON_COUNT; i++) {
    try {
      console.log(`Fetching data for #${i}`);
      const p = (await axios.get(`https://pokeapi.co/api/v2/pokemon/${i}`)).data;
      const s = (await axios.get(`https://pokeapi.co/api/v2/pokemon-species/${i}`)).data;
      const e = (await axios.get(s.evolution_chain.url)).data;

      const { nextId, req } = getEvoInfo(e.chain, i);

      // abilities
      const normalAbs = p.abilities.filter((a) => !a.is_hidden);
      const hiddenAb = p.abilities.filter((a) => a.is_hidden);
      const ab1 = await getAbility(normalAbs[0]);
      const ab2 = await getAbility(normalAbs[1]);
      const hab = await getAbility(hiddenAb);

      // gender and stats
      const female = s.gender_rate === -1 ? null : (s.gender_rate / 8) * 100;
      const stats = p.stats.reduce((acc, c) => ({ ...acc, [c.stat.name]: c.base_stat }), {});
      const evs = p.stats.reduce((acc, c) => ({ ...acc, [c.stat.name]: c.effort }), {});

      const row = [
        p.id, p.id, `"${p.name}"`, `"${s.genera.find((g) => g.language.name === 'en')?.genus}"`,
        null, s.is_legendary ? 'Legendary' : (s.is_mythical ? 'Mythical' : 'Standard'),
        p.height / 10, p.weight / 10, p.types[0].type.name, p.types[1]?.type.name || null, ab1.name,
        `"${ab1.desc}"`, ab2.name, `"${ab2.desc}"`, hab.name, `"${hab.desc}"`, female !== null ? 100 - female : null,
        female, s.base_happiness, `"${s.generation_name}"`, stats.hp, stats.attack, stats.defense, stats['special-attack'],
        stats['special-defense'], stats.speed, evs.hp, evs.attack, evs.defense, evs['special-attack'], evs['special-defense'],
        evs.speed, s.capture_rate, s.growth_rate.name, s.egg_groups[0]?.name || null, s.egg_groups[1]?.name || null,
        s.hatch_counter, getId(s.evolves_from_species?.url), nextId, `"${req}`
      ];
      pokemonStream.write(row.join(',') + '\n');

      //moves and junction (all versions)
      for (const m of p.moves) {
        const moveId = getId(m.move.url);
        m.version_group_details.forEach((vd) => {
          junctionStream.write(`${p.id},${moveId},${vd.version_group_name},${vd.move_learn_method.name},${vd.level_learned}\n`);
        });
        if (!seenMoves.has(moveId)) {
          const md = (await axios.get(m.move.url)).data;
          const eff = md.effect_entries.find((e) => e.language.name === 'en')?.short_effect.replace(/,/g, ';') || 'No effect';
          movesStream.write(`${moveId},"${m.name}",${md.type.name},${md.damage_class.name},${md.power || 0},${md.pp},${md.accuracy || 0},"${eff}"`)
          seenMoves.add(moveId);
        }
      }
      await delay(150);
    } catch (err) {
      console.error(`Error at ID ${i}:`, err.message);
    }
  }
  console.log("Seeding complete!");
}

seedUniversal();
