function testRegex(text) {
  const clean = text
    .replace(/[|]/g, 'I')
    .replace(/[^A-Za-z0-9\s\-]/g, ' ')
    .replace(/\s+/g, ' ');

  // Pattern with letters L, I, O, Q, D treated as digits
  const pattern = /(OP|0P|DP|CP|ST|5T|EB|FB|PRB)[\s\-_.:]*([0-9OQDLlI]{1,2})[\s\-_.:]*([0-9OQDLlI]{3})/i;
  const match = clean.match(pattern);

  if (match) {
    let prefix = match[1].toUpperCase();
    if (prefix === '0P' || prefix === 'DP' || prefix === 'CP') prefix = 'OP';
    if (prefix === '5T') prefix = 'ST';
    if (prefix === 'FB') prefix = 'EB';

    const setNum = match[2].toUpperCase().replace(/[OQD]/g, '0').replace(/[LI]/g, '1').padStart(2, '0');
    const cardNum = match[3].toUpperCase().replace(/[OQD]/g, '0').replace(/[LI]/g, '1');
    return `${prefix}${setNum}-${cardNum}`;
  }
  return null;
}

console.log('Test 9 (STOl-OOl):', testRegex('STOl-OOl'));
console.log('Test 10 (OP17-O39):', testRegex('OP17-O39'));
console.log('Test 11 (OPO2-OO4):', testRegex('OPO2-OO4'));
