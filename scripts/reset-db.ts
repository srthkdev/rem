import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import * as schema from "../src/auth-schema";
import "dotenv/config";

async function main() {
    if (!process.env.DATABASE_URL) {
        throw new Error("DATABASE_URL is not set");
    }

    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
    });

    const db = drizzle(pool, { schema });

    // Drop all tables
    console.log("Dropping all tables...");
    await pool.query(`
        DROP TABLE IF EXISTS verifications CASCADE;
        DROP TABLE IF EXISTS accounts CASCADE;
        DROP TABLE IF EXISTS sessions CASCADE;
        DROP TABLE IF EXISTS users CASCADE;
    `);

    // Run migrations
    console.log("Running migrations...");
    await migrate(db, { migrationsFolder: "migrations" });

    console.log("Database reset complete!");
    await pool.end();
}

main().catch((err) => {
    console.error("Error resetting database:", err);
    process.exit(1);
}); 