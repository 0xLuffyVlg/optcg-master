function parseTournamentDateToTimestamp(dateStr) {
  if (!dateStr) return 0;
  const clean = String(dateStr).trim();

  // Pattern 1: M/D/YYYY or MM/DD/YYYY or M-D-YYYY
  const usMatch = clean.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (usMatch) {
    const month = parseInt(usMatch[1], 10) - 1;
    const day = parseInt(usMatch[2], 10);
    const year = parseInt(usMatch[3], 10);
    const d = new Date(year, month, day);
    if (!isNaN(d.getTime())) return d.getTime();
  }

  // Pattern 2: YYYY-MM-DD or YYYY/MM/DD
  const isoMatch = clean.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  if (isoMatch) {
    const year = parseInt(isoMatch[1], 10);
    const month = parseInt(isoMatch[2], 10) - 1;
    const day = parseInt(isoMatch[3], 10);
    const d = new Date(year, month, day);
    if (!isNaN(d.getTime())) return d.getTime();
  }

  const ts = Date.parse(clean);
  return isNaN(ts) ? 0 : ts;
}

function formatTournamentDate(dateStr) {
  if (!dateStr) return 'Date N/A';
  const ts = parseTournamentDateToTimestamp(dateStr);
  if (!ts) return dateStr;
  
  const d = new Date(ts);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

const testDates = ['8/27/2026', '8/9/2026', '2026-08-15', '8/1/2026', '8/20/2026'];
const sorted = [...testDates].sort((a, b) => parseTournamentDateToTimestamp(b) - parseTournamentDateToTimestamp(a));

console.log('Sorted dates (Newest to Oldest):');
sorted.forEach(d => console.log(`${d} -> formatted: ${formatTournamentDate(d)} (timestamp: ${parseTournamentDateToTimestamp(d)})`));
