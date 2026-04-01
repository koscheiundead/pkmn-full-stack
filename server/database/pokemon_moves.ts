import axios from "axios";
import fs from "fs";

//config
const TOTAL_POKEMON = 1025;
const FILE_NAME = "pokemon_moves.csv";
const VERSION_TARGET = "scarlet-violet";

//helper to format strings
const clean = (str) => {
  let noHyphen = str.replace(/-/g, ' ');
  let words = noHyphen.split(' ');
  let capWords = [];
  for (let word of words) {
    const firstChar = word.charAt(0).toUpperCase();
    const rest = word.slice(1).toLowerCase();
    capWords.push(firstChar + rest);
  }

  return capWords.join(' ');
};

async function fetchMoveData() {
  const stream = fs.createWriteStream(FILE_NAME);
  stream.write("pokemon_id,move_id,move_name,learn_method,level_learned\n");

  for (let id = 1; id <= TOTAL_POKEMON; id++) {
    try {
      const { data } = await axios.get(
        `https://pokeapi.co/api/v2/pokemon/${id}`,
      );

      //filter to only latest game ('scarlet-violet')
      const svMoves = data.moves.flatMap((moveEntry) => {
        return moveEntry.version_group_details
          .filter((details) => details.version_group.name === VERSION_TARGET)
          .map((details) => ({
            pokemon_id: id,
            move_id: moveEntry.move.url.split("/").slice(-2, -1)[0], //extract ID from url eg "https://pokeapi.co/api/v2/move/15/"
            name: clean(moveEntry.move.name),
            learn_method: details.move_learn_method.name,
            level_learned: details.level_learned_at,
          }));
      });

      svMoves.forEach((row) => {
        stream.write(
          `${row.pokemon_id},${row.move_id},${row.name},${row.learn_method},${row.level_learned}\n`,
        );
      });

      console.log(`ID ${id}: ${data.name} - found ${svMoves.length} moves.`);
    } catch (err) {
      console.error(`Error fetching ID ${id}:`, err.message);
    }
  }
  stream.end();
  console.log("CSV generation complete!");
}

fetchMoveData();
