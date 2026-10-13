import fs from 'fs';

async function findIo() {
  const jsRes = await fetch('https://stats.tcgmatchmaking.com/assets/index-B3ue8fbf.js');
  const js = await jsRes.text();

  const match = js.match(/.{0,50}io\(\).{0,50}/);
  console.log('Match io():', match ? match[0] : 'not found');

  const defMatch = js.match(/(?:function\s+io|const\s+io\s*=|let\s+io\s*=)[^\{]+[^\}]+/);
  console.log('Definition of io:', defMatch ? defMatch[0].slice(0, 150) : 'not found');
}

findIo();
