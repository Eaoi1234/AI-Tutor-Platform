/// <reference lib="dom" />
// src/scrapers/puppeteerScraper.ts
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

export async function scrapeWithPuppeteer(url: string, timeout: number = 30000) {
  const browser = await puppeteer.launch({
    headless: false, // ต้องไม่เป็น headless เพื่อผ่าน Cloudflare
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/114.0.0.0 Safari/537.36'
  );

  try {
    await page.goto(url, { waitUntil: 'networkidle0', timeout });
    await new Promise(resolve => setTimeout(resolve, 5000)); // ให้เวลาโหลด CAPTCHA ถ้ามี

    const title = await page.title();
    const text = await page.evaluate(() => document.body.innerText);

    await browser.close();
    return { title, text };
  } catch (err) {
    await browser.close();
    throw new Error(`Error while loading page: ${(err as Error).message}`);
  }
}
