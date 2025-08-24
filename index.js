// Minimal standalone QR code generator for version 1-L
// Generates a 21x21 matrix representing the QR code
// Exports generate() which returns the matrix and toString() for ASCII output

// Galois field setup for GF(256)
const EXP = new Uint8Array(512);
const LOG = new Uint8Array(256);
let x = 1;
for (let i = 0; i < 255; i++) {
  EXP[i] = x;
  LOG[x] = i;
  x <<= 1;
  if (x & 0x100) x ^= 0x11d;
}
for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255];

function gfMul(a, b) {
  return a && b ? EXP[LOG[a] + LOG[b]] : 0;
}

function polyMul(p, q) {
  const res = new Array(p.length + q.length - 1).fill(0);
  for (let i = 0; i < p.length; i++) {
    for (let j = 0; j < q.length; j++) {
      res[i + j] ^= gfMul(p[i], q[j]);
    }
  }
  return res;
}

function rsGeneratorPoly(degree) {
  let poly = [1];
  for (let i = 0; i < degree; i++) {
    poly = polyMul(poly, [1, EXP[i]]);
  }
  return poly;
}

function rsEncode(data, ecLength) {
  const gen = rsGeneratorPoly(ecLength);
  const res = data.concat(new Array(ecLength).fill(0));
  for (let i = 0; i < data.length; i++) {
    const coef = res[i];
    if (coef !== 0) {
      for (let j = 0; j < gen.length; j++) {
        res[i + j] ^= gfMul(coef, gen[j]);
      }
    }
  }
  return res.slice(data.length);
}

function encodeData(text) {
  const bytes = Array.from(Buffer.from(text, 'utf8'));
  if (bytes.length > 17) {
    throw new Error('Input too long for QR version 1-L');
  }
  const bits = [];
  // mode indicator 0100
  bits.push(0,1,0,0);
  // length in 8 bits
  const len = bytes.length;
  for (let i = 7; i >= 0; i--) bits.push((len >> i) & 1);
  // data bytes
  for (const b of bytes) {
    for (let i = 7; i >= 0; i--) bits.push((b >> i) & 1);
  }
  // terminator
  const maxBits = 152;
  for (let i = 0; i < 4 && bits.length < maxBits; i++) bits.push(0);
  while (bits.length % 8 !== 0) bits.push(0);
  const data = [];
  for (let i = 0; i < bits.length; i += 8) {
    data.push(parseInt(bits.slice(i, i + 8).join(''), 2));
  }
  const pad = [0xec, 0x11];
  let padIndex = 0;
  while (data.length < 19) {
    data.push(pad[padIndex++ % 2]);
  }
  return data;
}

function createMatrix(dataCodewords, ecCodewords) {
  const matrix = Array.from({ length: 21 }, () => Array(21).fill(null));

  function placeFinder(r, c) {
    for (let y = -1; y <= 7; y++) {
      for (let x = -1; x <= 7; x++) {
        const xx = c + x;
        const yy = r + y;
        if (xx < 0 || xx >= 21 || yy < 0 || yy >= 21) continue;
        const dist = Math.max(Math.abs(x), Math.abs(y));
        matrix[yy][xx] = dist <= 1 || (dist === 2 && x >= 0 && x <= 4 && y >= 0 && y <= 4)
          ? 1 : 0;
      }
    }
  }
  placeFinder(0,0);
  placeFinder(0,14);
  placeFinder(14,0);

  for (let i = 8; i < 13; i++) {
    matrix[6][i] = i % 2 === 0 ? 0 : 1;
    matrix[i][6] = i % 2 === 0 ? 0 : 1;
  }
  matrix[13][8] = 1; // dark module

  const codewords = dataCodewords.concat(ecCodewords);
  let bitIndex = 0;
  let upward = true;
  for (let col = 20; col > 0; col -= 2) {
    if (col === 6) col--; // skip timing column
    for (let i = 0; i < 21; i++) {
      const row = upward ? 20 - i : i;
      for (let c = col; c >= col - 1; c--) {
        if (matrix[row][c] !== null) continue;
        const bit = (codewords[Math.floor(bitIndex / 8)] >> (7 - (bitIndex % 8))) & 1;
        matrix[row][c] = bit;
        bitIndex++;
      }
    }
    upward = !upward;
  }

  // apply mask 0
  for (let r = 0; r < 21; r++) {
    for (let c = 0; c < 21; c++) {
      if (matrix[r][c] === null) matrix[r][c] = 0;
      else if ((r + c) % 2 === 0) matrix[r][c] ^= 1;
    }
  }

  // format info for level L (01) and mask 0 (000) -> 0b111011111000100
  const format = '111011111000100'.split('').map(Number);
  const formatPositions = [
    [0,8],[1,8],[2,8],[3,8],[4,8],[5,8],[7,8],[8,8],[8,7],[8,5],[8,4],[8,3],[8,2],[8,1],[8,0]
  ];
  for (let i = 0; i < formatPositions.length; i++) {
    const [r,c] = formatPositions[i];
    matrix[r][c] = format[i];
    if (r !== c) matrix[20-r][20-c] = format[i];
  }

  return matrix;
}

export function generate(text) {
  const data = encodeData(text);
  const ec = rsEncode(data, 7);
  return createMatrix(data, ec);
}

export function toString(text, { dark = '##', light = '  ' } = {}) {
  const matrix = generate(text);
  return matrix.map(row => row.map(v => (v ? dark : light)).join('')).join('\n');
}

export default { generate, toString };

