const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const inputPath = 'C:/Users/LuffyVlg/.gemini/antigravity/brain/ff955f3e-d11e-4b2f-87d2-4508fd6675a1/.user_uploaded/media_1790949034614.png';

async function processImages() {
  const imgBuffer = fs.readFileSync(inputPath);
  const metadata = await sharp(imgBuffer).metadata();
  console.log('Original input:', metadata.width, 'x', metadata.height);

  const targets = [
    { dir: path.join(__dirname, '../src/assets'), prefix: 'stats-banner' },
    { dir: path.join(__dirname, '../public/images'), prefix: 'stats-banner' }
  ];

  for (const t of targets) {
    if (!fs.existsSync(t.dir)) fs.mkdirSync(t.dir, { recursive: true });

    // 1x PNG (1024w)
    await sharp(imgBuffer)
      .resize(1024)
      .png({ quality: 95, compressionLevel: 8 })
      .toFile(path.join(t.dir, `${t.prefix}.png`));

    // 1x WebP (1024w)
    await sharp(imgBuffer)
      .resize(1024)
      .webp({ quality: 90 })
      .toFile(path.join(t.dir, `${t.prefix}.webp`));

    // 2x PNG (2048w lanczos3)
    await sharp(imgBuffer)
      .resize(2048, null, { kernel: sharp.kernel.lanczos3 })
      .png({ quality: 95, compressionLevel: 8 })
      .toFile(path.join(t.dir, `${t.prefix}-2x.png`));

    // 2x WebP (2048w lanczos3)
    await sharp(imgBuffer)
      .resize(2048, null, { kernel: sharp.kernel.lanczos3 })
      .webp({ quality: 92 })
      .toFile(path.join(t.dir, `${t.prefix}-2x.webp`));

    console.log(`Generated banners in ${t.dir}`);
  }
  console.log('Banner generation completed successfully!');
}

processImages().catch(console.error);
