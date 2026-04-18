import puppeteer, { Browser } from 'puppeteer';
import cron from 'node-cron';

export interface RateEntry {
  date: string; // "YYYY-MM-DD"
  rate: number; // annual rate as decimal, e.g. 0.085
}

// In-memory cache populated on startup
let rateCache: RateEntry[] | null = null;

// Guards against overlapping scrape runs
let isScraping = false;

/**
 * Scrapes the FRED PRIME rate series page using a headless browser:
 *   1. Lands on the series page and finds the "View All" data link
 *   2. Navigates to the full data page (rendered HTML table)
 *   3. Parses all date/value rows from the DOM table
 *
 * Called once during server initialization and on each cron tick.
 * Protected by isScraping flag and a configurable timeout.
 */
export async function scrapeAndSaveRates(): Promise<void> {
  if (!process.env.FRED_URL) {
    throw new Error('FRED_URL is not configured in environment variables');
  }

  const timeout = parseInt(process.env.SCRAPE_TIMEOUT || '120000', 10);

  isScraping = true;
  let browser: Browser | null = null;
  let cancelled = false;

  const scrapeWork = async (): Promise<void> => {
    console.log('Launching headless browser to scrape FRED prime rate data...');

    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    // Step 1: Load the series page and find the "View All" data link
    await page.goto(process.env.FRED_URL as string, { waitUntil: 'networkidle2', timeout: 60_000 });

    const dataPageUrl = await page.evaluate(() => {
      const anchors: HTMLAnchorElement[] = Array.from(
        (globalThis as any).document.querySelectorAll('table a')
      );
      // Find the link whose href points to the raw data page (e.g. /data/PRIME.txt)
      const link = anchors.find((a: HTMLAnchorElement) => /\/data\/[A-Z]+/.test(a.href));
      return link ? link.href : null;
    });

    if (!dataPageUrl) {
      throw new Error('Could not find the "View All" data link on the FRED series page');
    }

    // Step 2: Navigate to the full data page
    await page.goto(dataPageUrl, { waitUntil: 'networkidle2', timeout: 60_000 });

    // Step 3: Extract all table rows from the DOM
    const allRows: string[] = await page.evaluate(() => {
      return Array.from((globalThis as any).document.querySelectorAll('table tr')).map(
        (row: any) => row.innerText.trim()
      );
    });

    // Step 4: Parse data rows — find the header row containing "DATE" and "VALUE" columns,
    // then parse every row after it as tab-separated DATE\tVALUE pairs.
    const headerIndex = allRows.findIndex((r) => /\bDATE\b/.test(r) && /\bVALUE\b/.test(r));
    if (headerIndex === -1) {
      throw new Error('Could not find DATE/VALUE header row on the FRED data page');
    }

    const entries: RateEntry[] = [];

    for (const row of allRows.slice(headerIndex + 1)) {
      const [date, value] = row.split('\t');
      if (!date || !value || value === '.') continue;

      const rate = parseFloat(value);
      if (isNaN(rate)) continue;

      entries.push({ date: date.trim(), rate: rate / 100 });
    }

    if (entries.length === 0) {
      throw new Error('Scraped the FRED data page but found no valid rate rows');
    }

    // Ensure sorted by date ascending
    entries.sort((a, b) => a.date.localeCompare(b.date));

    // Only write to cache if the scrape wasn't cancelled by a timeout
    if (!cancelled) {
      rateCache = entries;
      console.log(
        `Scraped ${entries.length} prime rate entries from FRED DOM. ` +
          `Range: ${entries[0].date} → ${entries[entries.length - 1].date}. ` +
          `Latest rate: ${(entries[entries.length - 1].rate * 100).toFixed(2)}%`
      );
    }
  };

  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => {
      cancelled = true;
      reject(new Error(`Scrape timed out after ${timeout}ms`));
    }, timeout)
  );

  try {
    await Promise.race([scrapeWork(), timeoutPromise]);
  } finally {
    // Always close the browser here — covers normal completion, timeout, and errors.
    // Closing on timeout kills the browser process, stopping scrapeWork() mid-flight
    // and preventing a second browser from being launched on the next cron tick.
    isScraping = false;
    if (browser) {
      await (browser as Browser).close().catch((err) =>
        console.error('Failed to close browser:', err)
      );
    }
  }
}

/**
 * Schedules periodic re-scraping of FRED rate data using a cron expression.
 * Reads SCRAPE_CRON from env (defaults to midnight daily: "0 0 * * *").
 * Skips a tick if a scrape is already in progress.
 * Failures are logged but do not crash the server.
 */
export function startScrapeCron(): void {
  const expression = process.env.SCRAPE_CRON || '0 0 * * *';

  if (!cron.validate(expression)) {
    throw new Error(`Invalid SCRAPE_CRON expression: "${expression}"`);
  }

  cron.schedule(expression, async () => {
    if (isScraping) {
      console.log('Skipping scheduled scrape — previous scrape still in progress');
      return;
    }
    try {
      console.log('Cron: starting scheduled FRED rate scrape...');
      await scrapeAndSaveRates();
      console.log('Cron: scheduled scrape completed successfully');
    } catch (err) {
      console.error('Cron: scheduled scrape failed (using cached data):', err);
    }
  });

  console.log(`FRED rate scrape cron scheduled: ${expression}`);
}

/**
 * Returns the in-memory rate history. Must be called after scrapeAndSaveRates().
 */
export function getRateHistory(): RateEntry[] {
  if (!rateCache) {
    throw new Error('Rate data not yet available — server is still fetching rates. Please retry in a moment.');
  }
  return rateCache;
}

/** Returns the most recent prime rate (current rate at time of scraping). */
export function getCurrentRate(history: RateEntry[]): number {
  return history[history.length - 1].rate;
}

/**
 * Returns the rate in effect on a given date.
 * Uses the most recent entry on or before the given date.
 */
export function rateOnDate(history: RateEntry[], date: string): number {
  if (!history.length) throw new Error('Rate history is empty');
  let rate = history[0].rate;
  for (const entry of history) {
    if (entry.date <= date) {
      rate = entry.rate;
    } else {
      break;
    }
  }
  return rate;
}

/**
 * Returns all rate change entries that fall strictly within (periodStart, periodEnd].
 * These are the split points for sub-interval interest calculation.
 */
export function rateChangesInPeriod(
  history: RateEntry[],
  periodStart: string,
  periodEnd: string
): RateEntry[] {
  return history.filter((entry) => entry.date > periodStart && entry.date <= periodEnd);
}
