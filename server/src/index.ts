import express from "express";
import morgan from "morgan";
import cors from "cors";
import bodyParser from "body-parser";
import { pool } from "../database/db";
import "dotenv/config";
import type { Request, Response } from "@types/express";

const app = express();

app.use(morgan("dev"));
app.use(cors({ origin: "*" }));
app.use(bodyParser.json());

const port = 3000;

app.get("/pokemon/:id/moves", async (req: Request, res: Response) => {
  try {
    const query = `SELECT m.*, pm.level_learned, pm.learn_method, pm.version_group
    FROM Moves m
    JOIN pokemon_moves pm ON m.id = pm.move_id
    WHERE pm.pokemon_id = $1
    ORDER BY pm.level_learned ASC;`;
    const result = await pool.query(query, [req.params.id]);
    if (result.rows.length === 0) {
      res.status(404).json({ status: "failure", error: "No moves found for this Pokémon." });
      return;
    }
    res.json({status: "success", moves: result.rows})
  } catch (err) {
    res.status(500).json({status: "failure", error: "Failed to fetch Pokémon moves."})
  }
})

app.get("/pokemon/:id", async (req: Request, res: Response) => {
  try {
    const query = `SELECT p.*, (
    SELECT json_agg(json_build_object(
    'to_id', e.to_pokemon_id,
    'name', p_to.name,
    'requirement', e.requirement
    ))
    FROM evolutions e
    JOIN pokemon p_to ON e.to_pokemon_id = p_to.id
    WHERE e.from_pokemon_id = p.id
    ) AS next_evolutions,
    (
    SELECT json_build_object('id', p_prev.id, 'name', p_prev.name)
    FROM pokemon p_prev
    WHERE p_prev.id = p.previous_evolution_pokedex_id
    ) AS previous_evolution
    FROM pokemon p
    WHERE p.id = $1;`;
    const result = await pool.query(query, [req.params.id]);
    if (result.rows.length === 0) {
      res.status(404).json({ status: "failure", error: "Pokémon not found" });
      return;
    }
    res.json({ status: "success", pokemon: result.rows[0] });
  } catch (error) {
    console.error("Database error:", error);
    res
      .status(500)
      .json({ status: "failure", error: "Failed to fetch Pokémon" });
  }
});

app.get("/pokemon", async (req: Request, res: Response) => {
  try {
    const query = `SELECT *
    FROM Pokemon
    ORDER BY pokedex_number ASC;`;
    const result = await pool.query(query);
    res.json({ status: "success", pokemon: result.rows });
  } catch (error) {
    console.error("Database error:", error);
    res
      .status(500)
      .json({ status: "failure", error: "Failed to fetch Pokémon" });
  }
});

app.get("/moves/:id", async (req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT * FROM Moves WHERE id = $1", [
      req.params.id,
    ]);
    if (result.rows.length === 0) {
      res.status(404).json({ status: "failure", error: "Move not found" });
      return;
    }
    res.json({ status: "success", move: result.rows[0] });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ status: "failure", error: "Failed to fetch Move" });
  }
});

app.get("/moves", async (req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT * FROM Moves");
    res.json({ status: "success", moves: result.rows });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ status: "failure", error: "Failed to fetch Moves" });
  }
});

app.listen(port, () => {
  console.log(`Pokémon server listening on port ${port}! Pika-pi!`);
});
