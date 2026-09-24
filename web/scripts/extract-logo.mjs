import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = path.join(__dirname, '../../shreeji_corporate_gift_website.html');
const outDir = path.join(__dirname, '../src/assets/images');
const s = fs.readFileSync(htmlPath, 'utf8');
const m = s.match(/class="logo"[\s\S]*?src="(data:image\/jpeg;base64,[^"]+)"/);
if (!m) {
  console.error('Logo not found');
  process.exit(1);
}
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(
  path.join(outDir, 'logo.jpg'),
  Buffer.from(m[1].split(',')[1], 'base64'),
);
console.log('Logo extracted');
