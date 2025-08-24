import { toString } from '../lib/index.js';

const svg = await toString('test');
if (typeof svg === 'string' && svg.startsWith('<svg')) {
  console.log('SVG output OK');
} else {
  throw new Error('SVG output invalid');
}
