import express from "express";
import morgan from "morgan";
import cors from "cors";
import bodyParser from "body-parser";
import { Pool } from "pg";
import 'dotenv/config';
import type { Request, Response } from "@types/express";

const app = express();

app.use(morgan('dev'));
app.use(cors({ origin: "*" }));
app.use(bodyParser.json());

const port = 3000;

const pool = new Pool({
  host: 'localhost',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT)
});

app.get("/pokemon", (req, res) => {
  res.json({ status: "success!", pokemon: [] });
});

app.listen(port, () => {
  console.log(`Pokemon server listening on port ${port}! Pika-pi!`);
});
