import fs from 'node:fs';
import fsp from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';
import { once } from 'node:events';
import { Transform, Writable } from 'node:stream';
import { pipeline } from 'node:stream/promises';

export const ZIP_LIMITS = {
  maxEntries: 20000,
  maxUncompressed: 500 * 1024 * 1024,
  maxCompressed: 190 * 1024 * 1024,
  maxPath: 1024,
};

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i += 1) {
    let value = i;
    for (let bit = 0; bit < 8; bit += 1) {
      value = (value & 1) ? (0xedb88320 ^ (value >>> 1)) : (value >>> 1);
    }
    table[i] = value >>> 0;
  }
  return table;
})();

function crc32(buffer, seed = 0) {
  let value = (seed ^ 0xffffffff) >>> 0;
  for (const byte of buffer) value = (CRC_TABLE[(value ^ byte) & 0xff] ^ (value >>> 8)) >>> 0;
  return (value ^ 0xffffffff) >>> 0;
}

function dosDateTime(value) {
  const date = value instanceof Date && !Number.isNaN(value.getTime()) ? value : new Date();
  const year = Math.min(2107, Math.max(1980, date.getFullYear()));
  return {
    time: ((date.getHours() & 0x1f) << 11) | ((date.getMinutes() & 0x3f) << 5) | ((date.getSeconds() & 0x3f) >> 1),
    date: (((year - 1980) & 0x7f) << 9) | (((date.getMonth() + 1) & 0x0f) << 5) | (date.getDate() & 0x1f),
  };
}

function abortError() {
  const error = new Error('workspace packaging was cancelled');
  error.code = 'ABORT_ERR';
  return error;
}

function checkAbort(signal) {
  if (signal?.aborted) throw abortError();
}

class ZipWriter {
  constructor(stream, signal) {
    this.stream = stream;
    this.signal = signal;
    this.offset = 0;
    this.entries = [];
  }

  async write(buffer) {
    checkAbort(this.signal);
    if (this.stream.destroyed) throw new Error('zip stream closed unexpectedly');
    if (!this.stream.write(buffer)) {
      await new Promise((resolve, reject) => {
        const cleanup = () => {
          this.stream.off('drain', onDrain);
          this.stream.off('error', onError);
          if (this.signal) this.signal.removeEventListener('abort', onAbort);
        };
        const onDrain = () => { cleanup(); resolve(); };
        const onError = (error) => { cleanup(); reject(error); };
        const onAbort = () => { cleanup(); reject(abortError()); };
        this.stream.once('drain', onDrain);
        this.stream.once('error', onError);
        if (this.signal) this.signal.addEventListener('abort', onAbort, { once: true });
        if (this.signal?.aborted) onAbort();
      });
    }
    this.offset += buffer.length;
  }

  async addFile(filePath, name, stats) {
    checkAbort(this.signal);
    if (name.length > ZIP_LIMITS.maxPath) {
      throw new Error(`path exceeds ${ZIP_LIMITS.maxPath} characters: ${name}`);
    }
    const nameBuffer = Buffer.from(name, 'utf8');
    const { time, date } = dosDateTime(stats.mtime);
    const mode = (stats.mode & 0o111) ? 0o100755 : 0o100644;
    const localOffset = this.offset;
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0x0808, 6);
    local.writeUInt16LE(8, 8);
    local.writeUInt16LE(time, 10);
    local.writeUInt16LE(date, 12);
    local.writeUInt32LE(0, 14);
    local.writeUInt32LE(0, 18);
    local.writeUInt32LE(0, 22);
    local.writeUInt16LE(nameBuffer.length, 26);
    local.writeUInt16LE(0, 28);
    await this.write(local);
    await this.write(nameBuffer);

    let crc = 0;
    let uncompressed = 0;
    let compressed = 0;
    const read = fs.createReadStream(filePath, this.signal ? { signal: this.signal } : undefined);
    const counter = new Transform({
      transform: (chunk, _encoding, callback) => {
        crc = crc32(chunk, crc);
        uncompressed += chunk.length;
        if (uncompressed > ZIP_LIMITS.maxUncompressed) {
          callback(new Error('workspace exceeds 500 MB uncompressed'));
          return;
        }
        callback(null, chunk);
      },
    });
    const deflate = zlib.createDeflateRaw({ level: 6 });
    const sink = new Writable({
      write: (chunk, _encoding, callback) => {
        compressed += chunk.length;
        if (compressed > ZIP_LIMITS.maxCompressed) {
          callback(new Error('compressed workspace exceeds 190 MB'));
          return;
        }
        this.write(chunk).then(() => callback(), callback);
      },
    });

    await pipeline(read, counter, deflate, sink);
    const descriptor = Buffer.alloc(16);
    descriptor.writeUInt32LE(0x08074b50, 0);
    descriptor.writeUInt32LE(crc >>> 0, 4);
    descriptor.writeUInt32LE(compressed >>> 0, 8);
    descriptor.writeUInt32LE(uncompressed >>> 0, 12);
    await this.write(descriptor);
    this.entries.push({
      name: nameBuffer,
      crc: crc >>> 0,
      compressed,
      uncompressed,
      localOffset,
      time,
      date,
      external: ((mode << 16) >>> 0),
    });
  }

  async close() {
    const centralOffset = this.offset;
    for (const entry of this.entries) {
      const header = Buffer.alloc(46);
      header.writeUInt32LE(0x02014b50, 0);
      header.writeUInt16LE(0x031e, 4);
      header.writeUInt16LE(20, 6);
      header.writeUInt16LE(0x0808, 8);
      header.writeUInt16LE(8, 10);
      header.writeUInt16LE(entry.time, 12);
      header.writeUInt16LE(entry.date, 14);
      header.writeUInt32LE(entry.crc, 16);
      header.writeUInt32LE(entry.compressed, 20);
      header.writeUInt32LE(entry.uncompressed, 24);
      header.writeUInt16LE(entry.name.length, 28);
      header.writeUInt16LE(0, 30);
      header.writeUInt16LE(0, 32);
      header.writeUInt16LE(0, 34);
      header.writeUInt16LE(0, 36);
      header.writeUInt32LE(entry.external, 38);
      header.writeUInt32LE(entry.localOffset, 42);
      await this.write(header);
      await this.write(entry.name);
    }
    const centralSize = this.offset - centralOffset;
    const end = Buffer.alloc(22);
    end.writeUInt32LE(0x06054b50, 0);
    end.writeUInt16LE(0, 4);
    end.writeUInt16LE(0, 6);
    end.writeUInt16LE(this.entries.length, 8);
    end.writeUInt16LE(this.entries.length, 10);
    end.writeUInt32LE(centralSize, 12);
    end.writeUInt32LE(centralOffset, 16);
    end.writeUInt16LE(0, 20);
    await this.write(end);
    this.stream.end();
    await once(this.stream, 'close');
  }
}

async function* walk(root, relative, skipped, signal) {
  checkAbort(signal);
  const entries = await fsp.readdir(path.join(root, relative), { withFileTypes: true });
  entries.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
  for (const entry of entries) {
    checkAbort(signal);
    if (entry.name === '.git') {
      skipped.push(relative ? `${relative}/${entry.name}` : entry.name);
      continue;
    }
    const childRelative = relative ? `${relative}/${entry.name}` : entry.name;
    const fullPath = path.join(root, childRelative);
    if (entry.isSymbolicLink()) {
      skipped.push(childRelative);
      continue;
    }
    if (entry.isDirectory()) {
      yield* walk(root, childRelative, skipped, signal);
    } else if (entry.isFile()) {
      yield { fullPath, relative: childRelative };
    } else {
      skipped.push(childRelative);
    }
  }
}

export async function createWorkspaceZip(root, options = {}) {
  const signal = options.signal;
  const stat = await fsp.stat(root);
  if (!stat.isDirectory()) throw new Error('workspace path is not a directory');

  const tempDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'mygit-lite-'));
  const zipPath = path.join(tempDir, 'snapshot.zip');
  const stream = fs.createWriteStream(zipPath, { flags: 'wx' });
  const writer = new ZipWriter(stream, signal);
  const skipped = [];
  let files = 0;
  let bytes = 0;

  try {
    for await (const entry of walk(root, '', skipped, signal)) {
      if (files >= ZIP_LIMITS.maxEntries) throw new Error('workspace exceeds 20,000 files');
      const info = await fsp.lstat(entry.fullPath);
      if (!info.isFile() || info.isSymbolicLink()) {
        skipped.push(entry.relative);
        continue;
      }
      bytes += info.size;
      if (bytes > ZIP_LIMITS.maxUncompressed) throw new Error('workspace exceeds 500 MB uncompressed');
      await writer.addFile(entry.fullPath, entry.relative, info);
      files += 1;
    }
    await writer.close();
    const zipStat = await fsp.stat(zipPath);
    return {
      zipPath,
      tempDir,
      files,
      bytes,
      zipBytes: zipStat.size,
      skipped: skipped.slice(0, 100),
      skippedCount: skipped.length,
    };
  } catch (error) {
    stream.destroy();
    await fsp.rm(tempDir, { recursive: true, force: true }).catch(() => {});
    throw error;
  }
}

export async function removeWorkspaceZip(result) {
  if (!result) return;
  await fsp.rm(result.tempDir, { recursive: true, force: true }).catch(() => {});
}
