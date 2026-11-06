import { chromium } from 'playwright';
import QRCode from 'qrcode';
import fs from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
await fs.mkdir(path.join(root, 'assets'), { recursive: true });
await fs.mkdir(path.join(root, 'dist'), { recursive: true });
await fs.mkdir(path.join(root, 'rendered'), { recursive: true });
await QRCode.toFile(path.join(root, 'assets', 'qr-pismenny.png'), 'https://pismenny.ru/', {
  width: 900, margin: 2, color: { dark: '#17212b', light: '#ffffff' }
});
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1 });
await page.goto(`file://${path.join(root, 'slides.html')}`, { waitUntil: 'networkidle' });
await page.emulateMedia({ media: 'print' });
await page.pdf({
  path: path.join(root, 'dist', 'danil-pismenny-ai-landscape-it-park-2026.pdf'),
  width: '13.333in', height: '7.5in', printBackground: true, preferCSSPageSize: true,
  margin: { top: '0', right: '0', bottom: '0', left: '0' }
});
const slides = await page.locator('.slide').count();
await page.emulateMedia({ media: 'screen' });
for (let i = 0; i < slides; i++) {
  await page.locator('.slide').nth(i).screenshot({ path: path.join(root, 'rendered', `slide-${String(i+1).padStart(2,'0')}.png`) });
}
await browser.close();
console.log(JSON.stringify({slides, pdf:'dist/danil-pismenny-ai-landscape-it-park-2026.pdf'}));
