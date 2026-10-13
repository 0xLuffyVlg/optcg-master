import fs from 'fs';

function inspectRows(filename) {
  const html = fs.readFileSync(`scripts/${filename}.html`, 'utf8');
  const rows = [...html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)];
  console.log(`\n=== Inspecting ${filename} (Total TRs: ${rows.length}) ===`);
  
  for (let i = 0; i < Math.min(5, rows.length); i++) {
    const rowHtml = rows[i][1];
    const cells = [...rowHtml.matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)].map(m => m[1]);
    console.log(`\nRow ${i} (${cells.length} cells):`);
    cells.forEach((c, idx) => {
      // clean preview
      const clean = c.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      const hrefMatch = c.match(/href="([^"]+)"/i);
      const imgMatch = c.match(/src="([^"]+)"/i);
      console.log(`  Cell ${idx}: text="${clean.slice(0, 50)}" | link=${hrefMatch ? hrefMatch[1] : 'none'} | img=${imgMatch ? imgMatch[1].slice(0, 50) : 'none'}`);
    });
  }
}

inspectRows('japan_op17');
inspectRows('english_op17');
