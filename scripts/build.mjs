import { chromium } from 'playwright';
import QRCode from 'qrcode';
import fs from 'node:fs/promises';
import path from 'node:path';

const variant = process.argv.includes('--business') ? 'business' : 'general';
const htmlName = variant === 'business' ? 'slides-business.html' : 'slides.html';
const pdfName = variant === 'business'
  ? 'danil-pismenny-ai-landscape-business-mba-it-park-2026.pdf'
  : 'danil-pismenny-ai-landscape-it-park-2026.pdf';
const renderDir = variant === 'business' ? 'rendered-business' : 'rendered';

const root = path.resolve(import.meta.dirname, '..');
await fs.mkdir(path.join(root, 'assets'), { recursive: true });
await fs.mkdir(path.join(root, 'dist'), { recursive: true });
await fs.mkdir(path.join(root, renderDir), { recursive: true });
await QRCode.toFile(path.join(root, 'assets', 'qr-pismenny.png'), 'https://pismenny.ru/', {
  width: 900, margin: 2, color: { dark: '#17212b', light: '#ffffff' }
});
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1 });
await page.goto(`file://${path.join(root, htmlName)}`, { waitUntil: 'networkidle' });
await page.emulateMedia({ media: 'print' });
await page.pdf({
  path: path.join(root, 'dist', pdfName),
  width: '13.333in', height: '7.5in', printBackground: true, preferCSSPageSize: true,
  margin: { top: '0', right: '0', bottom: '0', left: '0' }
});
const slides = await page.locator('.slide').count();
await page.emulateMedia({ media: 'screen' });
for (let i = 0; i < slides; i++) {
  await page.locator('.slide').nth(i).screenshot({ path: path.join(root, renderDir, `slide-${String(i+1).padStart(2,'0')}.png`) });
}
await browser.close();
console.log(JSON.stringify({variant, slides, pdf:`dist/${pdfName}`}));
