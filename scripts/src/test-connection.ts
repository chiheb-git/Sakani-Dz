import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../artifacts/api-server/.env") });

const url = new URL(process.env.DATABASE_URL!);

console.log("Test avec paramètres explicites (sans parsing de connectionString)...");
const pool = new pg.Pool({
  host: url.hostname,
  port: Number(url.port) || 5432,
  user: decodeURIComponent(url.username),
  password: decodeURIComponent(url.password),
  database: url.pathname.replace(/^\//, ""),
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 8000,
});

const start = Date.now();
pool
  .query("SELECT 1")
  .then(() => {
    console.log(`Connecté en ${Date.now() - start}ms`);
    pool.end();
    process.exit(0);
  })
  .catch((err) => {
    console.error(`Échec après ${Date.now() - start}ms :`, err.message);
    pool.end();
    process.exit(1);
  });