import 'dotenv/config';
import 'reflect-metadata';
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { AppDataSource } from './db';
import { typeDefs } from './schema';
import { resolvers } from './resolvers/loanResolver';
import { scrapeAndSaveRates, startScrapeCron } from './services/rateService';
import { loggingPlugin } from './plugins/loggingPlugin';
import fs from 'fs';
import path from 'path';

if (!process.env.PORT) throw new Error('PORT is not configured in environment variables');
if (!process.env.DB_PATH) throw new Error('DB_PATH is not configured in environment variables');

const PORT = Number(process.env.PORT);

async function bootstrap() {
  // Ensure the directory for the SQLite file exists
  const dbPath = path.resolve(process.env.DB_PATH as string);
  const dataDir = path.dirname(dbPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Initialize database connection and run any pending migrations
  await AppDataSource.initialize();
  await AppDataSource.runMigrations();
  console.log('Database initialized');

  // Scrape FRED prime rate data in the background — don't block server startup.
  // If the initial scrape fails, createLoan will return a clear error until the
  // cron retries successfully.
  scrapeAndSaveRates()
    .then(() => console.log('Initial FRED rate scrape completed'))
    .catch((err) => console.error('Initial FRED rate scrape failed (createLoan unavailable until retry):', err));

  // Schedule periodic re-scraping via cron
  startScrapeCron();

  const server = new ApolloServer({ typeDefs, resolvers, plugins: [loggingPlugin] });

  const { url } = await startStandaloneServer(server, {
    listen: { port: PORT },
  });

  console.log(`GraphQL server ready at ${url}`);
}

bootstrap().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
