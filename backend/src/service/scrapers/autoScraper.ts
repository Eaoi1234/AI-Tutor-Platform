// src/scrapers/autoScraper.ts
import { scrapeWithCheerio } from './simpleScraper';
import { scrapeWithPuppeteer } from './puppeteerScraper';

export async function autoScrape(url: string) {
    console.log(url)
  try {
    const result = await scrapeWithCheerio(url);

    // ถ้าเนื้อหาสั้นหรือว่าง อาจใช้ Puppeteer ดีกว่า
    if (!result.title || result.title.length < 5) {
      return await scrapeWithPuppeteer(url);
    }

    return result;
  } catch (err) {
    // ถ้า axios/cheerio เจ๊ง ใช้ puppeteer
    return await scrapeWithPuppeteer(url);
  }
}
