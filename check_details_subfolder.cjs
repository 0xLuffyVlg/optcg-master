const fs = require('fs');

// Check sqlite or details directory
const dir = 'C:/Users/LuffyVlg/.gemini/antigravity/scratch/onepiece-database/data/';
if (fs.existsSync(dir + 'details')) {
  const detailFiles = fs.readdirSync(dir + 'details');
  console.log('details directory file count:', detailFiles.length);
  if (detailFiles.length > 0) {
    console.log('sample detail file:', detailFiles[0]);
    const sampleContent = JSON.parse(fs.readFileSync(dir + 'details/' + detailFiles[0], 'utf8'));
    console.log('keys in details/' + detailFiles[0], Object.keys(sampleContent));
    if (sampleContent.tcgplayer_url) console.log('tcgplayer_url in detail:', sampleContent.tcgplayer_url);
  }
}
