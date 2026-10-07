// Render index.html ke PDF memakai Chrome/Edge yang sudah terpasang.
// Pakai: node build.mjs   (butuh: npm i puppeteer-core)
import puppeteer from 'puppeteer-core';
import { existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

const dir = dirname(fileURLToPath(import.meta.url));
const candidates = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
].filter(Boolean);
const executablePath = candidates.find((p) => existsSync(p));
if (!executablePath) throw new Error('Chrome/Edge tidak ditemukan. Set CHROME_PATH.');

const browser = await puppeteer.launch({ executablePath, headless: true });
const page = await browser.newPage();
await page.goto(pathToFileURL(join(dir, 'index.html')).href, { waitUntil: 'networkidle0' });
await page.evaluate(() => document.fonts.ready);
await page.pdf({
  path: join(dir, 'Panduan-Starter-Neela.pdf'),
  format: 'A4',
  printBackground: true,
  preferCSSPageSize: true,
});
await browser.close();
console.log('OK -> Panduan-Starter-Neela.pdf');
