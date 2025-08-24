# Standalone QR Code Generator

A minimal JavaScript library for generating QR codes without any runtime dependencies. The implementation currently supports **version 1** QR codes with low error correction.

## Installation

```bash
npm install standalone-qrcode
```

## Usage

```js
import { toString } from 'standalone-qrcode';

console.log(toString('HELLO'));
```

`toString` renders an ASCII representation of the QR code. For raw matrix data use `generate(text)`, which returns a `21 x 21` array of `0` and `1` values.

## License

MIT
