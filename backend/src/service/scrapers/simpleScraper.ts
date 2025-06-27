// src/scrapers/simpleScraper.ts
import axios from 'axios';
import * as cheerio from 'cheerio';

export async function scrapeWithCheerio(url: string) {
  const res = await axios.get(url, { responseType: 'text' });
  const $ = cheerio.load(res.data as string);

  const title = $('title').text();
  const links = $('a')
    .map((i, el) => $(el).attr('href'))
    .get();

  return {
    title,
    links,
  };
}
