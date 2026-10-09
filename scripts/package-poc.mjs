// Minimal dependency-free ZIP builder for a known, small WebExtension file set.
// STORE method avoids any nonstandard runtime dependencies; artifact is reproducible.
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';

const base = fileURLToPath(new URL('../poc/firefox-mv3/', import.meta.url));
const dest = fileURLToPath(new URL('../dist/claude-split-ui-firefox-poc.zip', import.meta.url));
const names = ['manifest.json', 'bootstrap-hook.js', 'README.md'];

const crcTable = Uint32Array.from({ length: 256 }, (_, i) => {
  let value = i;
  for (let j = 0; j < 8; j++) value = (value >>> 1) ^ ((value & 1) ? 0xedb88320 : 0);
  return value >>> 0;
});
function crc32(data) {
  let crc = 0xffffffff;
  for (const byte of data) crc = (crc >>> 8) ^ crcTable[(crc ^ byte) & 0xff];
  return (crc ^ 0xffffffff) >>> 0;
}

let offset = 0;
const localParts = [];
const centralParts = [];
for (const name of names) {
  const data = readFileSync(resolve(base, name));
  const filename = Buffer.from(name);
  const crc = crc32(data);
  const local = Buffer.alloc(30);
  local.writeUInt32LE(0x04034b50, 0);
  local.writeUInt16LE(20, 4); // ZIP format version needed
  local.writeUInt32LE(crc, 14);
  local.writeUInt32LE(data.length, 18);
  local.writeUInt32LE(data.length, 22);
  local.writeUInt16LE(filename.length, 26);
  localParts.push(local, filename, data);

  const central = Buffer.alloc(46);
  central.writeUInt32LE(0x02014b50, 0);
  central.writeUInt16LE(20, 4); // ZIP creator version
  central.writeUInt16LE(20, 6);
  central.writeUInt32LE(crc, 16);
  central.writeUInt32LE(data.length, 20);
  central.writeUInt32LE(data.length, 24);
  central.writeUInt16LE(filename.length, 28);
  central.writeUInt32LE(offset, 42);
  centralParts.push(central, filename);
  offset += local.length + filename.length + data.length;
}
const centralDirectory = Buffer.concat(centralParts);
const ending = Buffer.alloc(22);
ending.writeUInt32LE(0x06054b50, 0);
ending.writeUInt16LE(names.length, 8);
ending.writeUInt16LE(names.length, 10);
ending.writeUInt32LE(centralDirectory.length, 12);
ending.writeUInt32LE(offset, 16);
mkdirSync(dirname(dest), { recursive: true });
writeFileSync(dest, Buffer.concat([...localParts, centralDirectory, ending]));
console.log(`Packaged ${names.length} files -> ${dest}`);
