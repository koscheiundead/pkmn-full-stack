import express from "express";
import morgan from "morgan";
import cors from "cors";
import bodyParser from "body-parser";
import { pool } from "../../database/db";
import 'dotenv/config';
import type { Request, Response } from "@types/express";

const app = express();

app.use(morgan('dev'));
app.use(cors({ origin: "*" }));
app.use(bodyParser.json());

const port = 3000;

app.get("/pokemon/:id", async (req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT * FROM Pokemon WHERE id = $1", [req.params.id]);
    if (result.rows.length === 0) {
      res.status(404).json({ status: "failure", error: "Pokemon not found" });
      return;
    }
    res.json({ status: "success", pokemon: result.rows[0] });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ status: "failure", error: "Failed to fetch Pokemon" });
  }
});

app.get("/pokemon", async (req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT * FROM Pokemon");
    res.json({ status: "success", pokemon: result.rows });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ status: "failure", error: "Failed to fetch Pokemon" });
  }
});

app.get("/moves/:id", async (req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT * FROM Moves WHERE id = $1", [req.params.id]);
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
  console.log(`Pokemon server listening on port ${port}! Pika-pi!`);
});
