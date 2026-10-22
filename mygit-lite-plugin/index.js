import crypto from 'node:crypto';
import fs from 'node:fs';
import { Readable } from 'node:stream';
import { createWorkspaceZip, removeWorkspaceZip } from './zip.js';

const BASE_URL_REF = 'MYGIT_BASE_URL';
const API_PREFIX = '/mygit-lite/api';
const TOKEN_REF = 'MYGIT_TOKEN';
const MAX_JSON_BYTES = 1024 * 1024;
const MAX_PREVIEW_BYTES = 512 * 1024;

const STD = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const codecCache = new Map();

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest();
}

function codecFor(token) {
  const cached = codecCache.get(token);
  if (cached) return cached;

  const seed = sha256(Buffer.from(`mygit-b64s1:${token}`, 'utf8'));
  const alphabet = [...STD]
    .sort((a, b) => {
      const ha = sha256(Buffer.concat([seed, Buffer.from(a, 'utf8')]));
      const hb = sha256(Buffer.concat([seed, Buffer.from(b, 'utf8')]));
      return Buffer.compare(ha, hb) || (a < b ? -1 : 1);
    })
    .join('');

  const toCustom = Object.create(null);
  const toStd = Object.create(null);
  for (let i = 0; i < STD.length; i += 1) {
    toCustom[STD[i]] = alphabet[i];
    toStd[alphabet[i]] = STD[i];
  }

  const codec = { toCustom, toStd };
  codecCache.set(token, codec);
  if (codecCache.size > 4) {
    const oldest = codecCache.keys().next().value;
    codecCache.delete(oldest);
  }
  return codec;
}

function encodeB64s1(text, token) {
  const { toCustom } = codecFor(token);
  const base64 = Buffer.from(text, 'utf8').toString('base64');
  let out = '';
  for (const char of base64) out += char === '=' ? char : toCustom[char];
  return out;
}

function decodeB64s1(text, token) {
  const { toStd } = codecFor(token);
  const compact = text.trim();
  if (compact.length === 0 || compact.length % 4 !== 0 || !/^[A-Za-z0-9+/]*={0,2}$/.test(compact)) {
    throw new Error('invalid b64s1 payload');
  }
  let standard = '';
  for (const char of compact) {
    if (char === '=') {
      standard += '=';
    } else {
      const mapped = toStd[char];
      if (!mapped) throw new Error('invalid b64s1 character');
      standard += mapped;
    }
  }
  const bytes = Buffer.from(standard, 'base64');
  if (bytes.toString('base64') !== standard) throw new Error('invalid b64s1 padding');
  return bytes;
}

function sendJson(res, status, value) {
  const body = Buffer.from(JSON.stringify(value), 'utf8');
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Length', String(body.length));
  res.end(body);
}

async function readJson(req, limit = MAX_JSON_BYTES) {
  const chunks = [];
  let total = 0;
  for await (const chunk of req) {
    total += chunk.length;
    if (total > limit) throw new HttpError(413, 'request body is too large');
    chunks.push(chunk);
  }
  if (total === 0) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw new HttpError(400, 'request body must be valid JSON');
  }
}

function isSlug(value) {
  return typeof value === 'string' && /^[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?$/.test(value);
}

function parseSegments(req) {
  const url = new URL(req.url || '/', 'http://localhost');
  const path = url.pathname.startsWith(API_PREFIX) ? url.pathname.slice(API_PREFIX.length) : '';
  const segments = path
    .split('/')
    .filter(Boolean)
    .map((part) => {
      try {
        return decodeURIComponent(part);
      } catch {
        throw new HttpError(400, 'invalid path encoding');
      }
    });
  return { url, segments };
}

async function resolveToken(ctx) {
  const resolved = await ctx.credentials.resolve(TOKEN_REF);
  const value = resolved?.value?.trim();
  return value || undefined;
}

async function requireToken(ctx) {
  const token = await resolveToken(ctx);
  if (!token) throw new HttpError(401, 'MyGit token is not configured');
  return token;
}

function normalizeBaseUrl(raw) {
  const value = typeof raw === 'string' ? raw.trim() : '';
  if (!value) throw new HttpError(400, 'baseUrl must not be empty');
  if (value.length > 2048) throw new HttpError(400, 'baseUrl is too long');
  if (/\s/.test(value)) throw new HttpError(400, 'baseUrl must not contain whitespace');
  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    throw new HttpError(400, 'baseUrl must be a valid http(s) URL');
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new HttpError(400, 'baseUrl must use http or https');
  }
  if (parsed.username || parsed.password) throw new HttpError(400, 'baseUrl must not embed credentials');
  if (parsed.search || parsed.hash) throw new HttpError(400, 'baseUrl must not contain a query or fragment');
  return `${parsed.origin}${parsed.pathname.replace(/\/+$/, '')}`;
}

async function resolveBaseUrl(ctx) {
  const resolved = await ctx.credentials.resolve(BASE_URL_REF);
  const value = resolved?.value?.trim();
  return value || '';
}

async function requireBaseUrl(ctx) {
  const baseUrl = await resolveBaseUrl(ctx);
  if (!baseUrl) throw new HttpError(401, 'MyGit server address is not configured');
  return baseUrl;
}

function codecHeader(response) {
  return (response.headers.get('x-mygit-codec') || '').toLowerCase().includes('b64s1');
}

function parseJsonBuffer(buffer) {
  const text = buffer.toString('utf8');
  if (!text.trim()) return null;
  try {
    return JSON.parse(text);
  } catch {
    throw new HttpError(502, 'MyGit returned an invalid JSON response');
  }
}

async function upstreamJson(baseUrl, method, path, options = {}) {
  const token = options.token;
  const url = new URL(`${baseUrl}${path}`);
  if (options.query) {
    for (const [key, value] of options.query) {
      if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, String(value));
    }
  }

  const headers = { Accept: 'application/json' };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
    headers['X-MyGit-Codec'] = 'b64s1';
  }

  let body;
  if (options.json !== undefined) {
    if (!token) throw new HttpError(401, 'MyGit token is not configured');
    body = encodeB64s1(JSON.stringify(options.json), token);
    headers['Content-Type'] = 'application/json';
  }

  let response;
  try {
    response = await fetch(url, { method, headers, body, signal: options.signal });
  } catch {
    throw new HttpError(502, 'MyGit server is unreachable');
  }

  const raw = Buffer.from(await response.arrayBuffer());
  if (response.status === 401) {
    throw new HttpError(401, 'MyGit token is missing or invalid');
  }

  let payload;
  if (codecHeader(response)) {
    if (!token) throw new HttpError(502, 'MyGit returned encoded JSON without a token');
    let decoded;
    try {
      decoded = decodeB64s1(raw.toString('utf8'), token);
    } catch {
      // An error response can be encoded with the server's token rather than this client's,
      // so preserve the HTTP status instead of turning an auth failure into a decode failure.
      if (!response.ok) throw new HttpError(response.status, `MyGit request failed (${response.status})`);
      throw new HttpError(502, 'MyGit response could not be decoded');
    }
    payload = parseJsonBuffer(decoded);
  } else {
    payload = parseJsonBuffer(raw);
  }

  if (!response.ok) {
    const message = payload && typeof payload.error === 'string'
      ? payload.error
      : `MyGit request failed (${response.status})`;
    throw new HttpError(response.status, message);
  }
  return payload;
}

async function readCapped(response, cap) {
  if (!response.body) return { bytes: Buffer.alloc(0), truncated: false };
  const reader = response.body.getReader();
  const chunks = [];
  let total = 0;
  let truncated = false;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value) continue;
    const remaining = cap - total;
    if (value.length > remaining) {
      chunks.push(Buffer.from(value.subarray(0, remaining)));
      total += remaining;
      truncated = true;
      await reader.cancel();
      break;
    }
    chunks.push(Buffer.from(value));
    total += value.length;
    if (total >= cap) {
      truncated = true;
      await reader.cancel();
      break;
    }
  }
  return { bytes: Buffer.concat(chunks), truncated };
}

async function previewFile(baseUrl, slug, query, token) {
  const url = new URL(`${baseUrl}/api/repos/${encodeURIComponent(slug)}/file`);
  const ref = query.get('ref');
  const path = query.get('path');
  if (!path) throw new HttpError(400, 'file path is required');
  if (ref) url.searchParams.set('ref', ref);
  url.searchParams.set('path', path);

  let response;
  try {
    response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  } catch {
    throw new HttpError(502, 'MyGit server is unreachable');
  }

  if (!response.ok) {
    const raw = Buffer.from(await response.arrayBuffer());
    let message = `MyGit request failed (${response.status})`;
    try {
      const payload = parseJsonBuffer(raw);
      if (payload && typeof payload.error === 'string') message = payload.error;
    } catch {
      // Keep the status-based message when the error body is not JSON.
    }
    throw new HttpError(response.status, message);
  }

  const { bytes, truncated } = await readCapped(response, MAX_PREVIEW_BYTES);
  const binary = bytes.subarray(0, 8192).includes(0);
  if (binary) {
    const length = Number(response.headers.get('content-length'));
    return { binary: true, size: Number.isFinite(length) ? length : undefined, truncated };
  }
  return { binary: false, text: bytes.toString('utf8'), truncated, size: bytes.length };
}

async function proxyCommit(baseUrl, req, slug, token) {
  if (!/^multipart\/form-data/i.test(req.headers['content-type'] || '')) {
    throw new HttpError(400, 'commit upload must be multipart/form-data');
  }
  const controller = new AbortController();
  const abort = () => controller.abort();
  req.once('aborted', abort);
  try {
    const response = await fetch(`${baseUrl}/api/repos/${encodeURIComponent(slug)}/commits`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'X-MyGit-Codec': 'b64s1',
        'Content-Type': req.headers['content-type'],
      },
      body: Readable.toWeb(req),
      duplex: 'half',
      signal: controller.signal,
    });
    const raw = Buffer.from(await response.arrayBuffer());
    if (response.status === 401) throw new HttpError(401, 'MyGit token is missing or invalid');
    let payload;
    if (codecHeader(response)) {
      try {
        payload = parseJsonBuffer(decodeB64s1(raw.toString('utf8'), token));
      } catch (error) {
        if (!response.ok) throw new HttpError(response.status, `MyGit request failed (${response.status})`);
        throw error;
      }
    } else {
      payload = parseJsonBuffer(raw);
    }
    if (!response.ok) {
      const message = payload && typeof payload.error === 'string'
        ? payload.error
        : `MyGit request failed (${response.status})`;
      throw new HttpError(response.status, message);
    }
    return payload;
  } catch (error) {
    if (error instanceof HttpError) throw error;
    if (controller.signal.aborted) throw new HttpError(499, 'upload was cancelled');
    throw new HttpError(502, 'MyGit server is unreachable');
  } finally {
    req.off('aborted', abort);
  }
}

function normalizeDeletions(value) {
  if (value === undefined || value === null || value === '') return '';
  let parsed;
  try {
    parsed = typeof value === 'string' ? JSON.parse(value) : value;
  } catch {
    throw new HttpError(400, 'deletions must be a JSON array of strings');
  }
  if (!Array.isArray(parsed) || !parsed.every((item) => typeof item === 'string')) {
    throw new HttpError(400, 'deletions must be a JSON array of strings');
  }
  return JSON.stringify(parsed);
}

async function uploadWorkspaceCommit(zip, slug, fields, baseUrl, token, signal) {
  const boundary = `----MyGitLite${crypto.randomBytes(12).toString('hex')}`;
  const head = [];
  for (const [name, value] of Object.entries(fields)) {
    if (value === undefined || value === null || value === '') continue;
    head.push(Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="${name}"\r\n\r\n${value}\r\n`,
      'utf8',
    ));
  }
  head.push(Buffer.from(
    `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="snapshot.zip"\r\nContent-Type: application/zip\r\n\r\n`,
    'utf8',
  ));
  const prefix = Buffer.concat(head);
  const suffix = Buffer.from(`\r\n--${boundary}--\r\n`, 'utf8');
  const contentLength = prefix.length + zip.zipBytes + suffix.length;

  async function* body() {
    yield prefix;
    for await (const chunk of fs.createReadStream(zip.zipPath, signal ? { signal } : undefined)) {
      yield chunk;
    }
    yield suffix;
  }

  let response;
  try {
    response = await fetch(`${baseUrl}/api/repos/${encodeURIComponent(slug)}/commits`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'X-MyGit-Codec': 'b64s1',
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': String(contentLength),
      },
      body: Readable.from(body()),
      duplex: 'half',
      signal,
    });
  } catch {
    if (signal?.aborted) throw new HttpError(499, 'workspace upload was cancelled');
    throw new HttpError(502, 'MyGit server is unreachable');
  }

  const raw = Buffer.from(await response.arrayBuffer());
  if (response.status === 401) throw new HttpError(401, 'MyGit token is missing or invalid');
  let payload;
  if (codecHeader(response)) {
    try {
      payload = parseJsonBuffer(decodeB64s1(raw.toString('utf8'), token));
    } catch (error) {
      if (!response.ok) throw new HttpError(response.status, `MyGit request failed (${response.status})`);
      throw error;
    }
  } else {
    payload = parseJsonBuffer(raw);
  }
  if (!response.ok) {
    const message = payload && typeof payload.error === 'string'
      ? payload.error
      : `MyGit request failed (${response.status})`;
    throw new HttpError(response.status, message);
  }
  return payload;
}

function repoQuery(url, keys) {
  return keys.map((key) => [key, url.searchParams.get(key)]);
}

async function route(ctx, req, res) {
  const { url, segments } = parseSegments(req);
  const method = req.method || 'GET';

  if (segments.length === 1 && segments[0] === 'state' && method === 'GET') {
    const [token, baseUrl] = await Promise.all([resolveToken(ctx), resolveBaseUrl(ctx)]);
    sendJson(res, 200, {
      configured: Boolean(token && baseUrl),
      baseUrl,
      tokenRef: TOKEN_REF,
    });
    return;
  }

  if (segments.length === 1 && segments[0] === 'token' && method === 'POST') {
    const body = await readJson(req, 64 * 1024);
    const token = typeof body.token === 'string' ? body.token.trim() : '';
    if (!token) throw new HttpError(400, 'token must not be empty');
    if (token.length > 4096) throw new HttpError(400, 'token is too long');
    const rawBaseUrl = typeof body.baseUrl === 'string' ? body.baseUrl.trim() : '';
    // Keep the saved server when the caller only replaces the token.
    const baseUrl = rawBaseUrl ? normalizeBaseUrl(rawBaseUrl) : await resolveBaseUrl(ctx);
    if (!baseUrl) throw new HttpError(400, 'baseUrl is required');
    // Verify the connection before storing it so the UI never reports a broken connection as configured.
    await upstreamJson(baseUrl, 'GET', '/api/repos', { token });
    await ctx.credentials.set(BASE_URL_REF, baseUrl);
    await ctx.credentials.set(TOKEN_REF, token);
    sendJson(res, 200, { ok: true, configured: true, baseUrl });
    return;
  }

  if (segments.length === 1 && segments[0] === 'token' && method === 'DELETE') {
    await ctx.credentials.unset(TOKEN_REF);
    await ctx.credentials.unset(BASE_URL_REF);
    sendJson(res, 200, { ok: true, configured: false });
    return;
  }

  if (segments.length === 1 && segments[0] === 'workspaces' && method === 'GET') {
    const sessionId = url.searchParams.get('sessionId') || '';
    const workspaces = await Promise.all(ctx.workspaceRegistry.list().map(async (workspace) => {
      let missing = false;
      try {
        missing = (await workspace.status()) === 'missing-dir';
      } catch {
        // A status failure should not hide the workspace selector.
      }
      return {
        id: String(workspace.id),
        title: workspace.title,
        path: workspace.path,
        current: Boolean(sessionId) && workspace.sessionIds.some((id) => String(id) === sessionId),
        missing,
      };
    }));
    sendJson(res, 200, { workspaces });
    return;
  }

  const token = await requireToken(ctx);
  const baseUrl = await requireBaseUrl(ctx);

  if (segments.length === 1 && segments[0] === 'repos' && method === 'GET') {
    sendJson(res, 200, await upstreamJson(baseUrl, 'GET', '/api/repos', { token }));
    return;
  }

  if (segments.length === 1 && segments[0] === 'repos' && method === 'POST') {
    const body = await readJson(req);
    if (!isSlug(body.slug)) throw new HttpError(400, 'invalid repository slug');
    const payload = { slug: body.slug };
    if (typeof body.name === 'string' && body.name.trim()) payload.name = body.name.trim();
    if (typeof body.description === 'string' && body.description.trim()) payload.description = body.description.trim();
    sendJson(res, 200, await upstreamJson(baseUrl, 'POST', '/api/repos', { token, json: payload }));
    return;
  }

  if (segments.length >= 2 && segments[0] === 'repos') {
    const slug = segments[1];
    if (!isSlug(slug)) throw new HttpError(400, 'invalid repository slug');
    const tail = segments.slice(2);

    if (tail.length === 0 && method === 'DELETE') {
      sendJson(res, 200, await upstreamJson(baseUrl, 'DELETE', `/api/repos/${encodeURIComponent(slug)}`, { token }));
      return;
    }

    if (tail.length === 1 && tail[0] === 'commits' && method === 'GET') {
      const query = repoQuery(url, ['ref', 'limit', 'offset']);
      sendJson(res, 200, await upstreamJson(baseUrl, 'GET', `/api/repos/${encodeURIComponent(slug)}/commits`, { token, query }));
      return;
    }

    if (tail.length === 2 && tail[0] === 'commits' && tail[1] === 'workspace' && method === 'POST') {
      const body = await readJson(req);
      const workspaceId = typeof body.workspaceId === 'string' ? body.workspaceId : '';
      const workspace = ctx.workspaceRegistry.list().find((candidate) => String(candidate.id) === workspaceId);
      if (!workspace) throw new HttpError(404, 'workspace not found');
      let missing = false;
      try {
        missing = (await workspace.status()) === 'missing-dir';
      } catch {
        // Let packaging report the concrete filesystem error.
      }
      if (missing) throw new HttpError(404, 'workspace directory is missing');

      const message = typeof body.message === 'string' ? body.message.trim() : '';
      if (!message) throw new HttpError(400, 'commit message is required');
      const branch = typeof body.branch === 'string' && body.branch.trim() ? body.branch.trim() : 'main';
      const mode = body.mode === 'patch' ? 'patch' : 'snapshot';
      const deletions = mode === 'patch' ? normalizeDeletions(body.deletions) : '';

      const controller = new AbortController();
      const abort = () => controller.abort();
      req.once('aborted', abort);
      let zip;
      try {
        try {
          zip = await createWorkspaceZip(workspace.path, { signal: controller.signal });
        } catch (error) {
          if (error?.code === 'ABORT_ERR') throw new HttpError(499, 'workspace upload was cancelled');
          if (error?.code === 'ENOENT') throw new HttpError(404, 'workspace directory is missing');
          if (typeof error?.message === 'string' && error.message.includes('exceeds')) {
            throw new HttpError(413, error.message);
          }
          throw new HttpError(500, error instanceof Error ? error.message : 'could not package workspace');
        }
        const payload = await uploadWorkspaceCommit(
          zip,
          slug,
          { message, branch, mode, deletions },
          baseUrl,
          token,
          controller.signal,
        );
        sendJson(res, 200, {
          ...payload,
          workspace: {
            id: String(workspace.id),
            title: workspace.title,
            files: zip.files,
            bytes: zip.bytes,
            zipBytes: zip.zipBytes,
            skipped: zip.skipped,
            skippedCount: zip.skippedCount,
          },
        });
      } finally {
        req.off('aborted', abort);
        await removeWorkspaceZip(zip);
      }
      return;
    }

    if (tail.length === 1 && tail[0] === 'commits' && method === 'POST') {
      sendJson(res, 200, await proxyCommit(baseUrl, req, slug, token));
      return;
    }

    if (tail.length === 1 && tail[0] === 'tree' && method === 'GET') {
      const query = repoQuery(url, ['ref', 'path']);
      sendJson(res, 200, await upstreamJson(baseUrl, 'GET', `/api/repos/${encodeURIComponent(slug)}/tree`, { token, query }));
      return;
    }

    if (tail.length === 1 && tail[0] === 'branches' && method === 'GET') {
      sendJson(res, 200, await upstreamJson(baseUrl, 'GET', `/api/repos/${encodeURIComponent(slug)}/branches`, { token }));
      return;
    }

    if (tail.length === 1 && tail[0] === 'tags' && method === 'GET') {
      sendJson(res, 200, await upstreamJson(baseUrl, 'GET', `/api/repos/${encodeURIComponent(slug)}/tags`, { token }));
      return;
    }

    if (tail.length === 1 && tail[0] === 'diff' && method === 'GET') {
      const query = repoQuery(url, ['base', 'head']);
      sendJson(res, 200, await upstreamJson(baseUrl, 'GET', `/api/repos/${encodeURIComponent(slug)}/diff`, { token, query }));
      return;
    }

    if (tail.length === 1 && tail[0] === 'file' && method === 'GET') {
      sendJson(res, 200, await previewFile(baseUrl, slug, url.searchParams, token));
      return;
    }
  }

  throw new HttpError(404, 'unknown MyGit Lite API route');
}

export const inject = ['webServer', 'credentials', 'workspaceRegistry'];

export function apply(ctx) {
  ctx.effect(() => ctx.webServer.register({
    kind: 'prefix',
    path: API_PREFIX,
    async handler(req, res) {
      try {
        await route(ctx, req, res);
      } catch (error) {
        if (res.headersSent) {
          res.end();
          return;
        }
        const status = error instanceof HttpError ? error.status : 500;
        const message = error instanceof HttpError ? error.message : 'unexpected server error';
        sendJson(res, status, { error: message });
      }
    },
  }), 'mygit-lite: api route');
}
