import { drizzle } from 'drizzle-orm/connect';
async function main() {
    const db = await drizzle("neon-http", process.env.DATABASE_URL);
}
main();