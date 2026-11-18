#!/usr/bin/env node
// c4 <architecture.md>: serves the viewer and that file on localhost, then opens it in the browser.
// The file is re-read on every request, so reloading shows your latest edits; File → Save writes it back (PUT).
// c4 card <architecture.md> [out-dir]: writes card.json, the model as a dashboard card (out-dir defaults to the file's folder).
// c4 badge <architecture.md> [out-dir]: writes badge.svg, drawn from the same card.
// Both read the optional sidecar <name>.card.json beside the markdown (titles, legend labels, colours).
// The card's links open the viewer at C4_HOST (default https://aaronp.github.io/c4/) with ?src=C4_SRC,
// where C4_SRC is where the published markdown lives (default: the path given, relative to C4_HOST).
import { createServer } from 'node:http';
import { readFile, rename, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { basename, dirname, join, resolve } from 'node:path';

const pkg = (p) => new URL(`../${p}`, import.meta.url);

/** The viewer's own logic (parser, card, badge), taken from Main.dc.html as check.mjs does. */
const loadLib = async () => {
  const html = await readFile(pkg('Main.dc.html'), 'utf8');
  const start = html.indexOf('>', html.indexOf('data-dc-script')) + 1;
  return new Function('DCLogic', `${html.slice(start, html.indexOf('</script>', start))}; return Component;`)(class {}).lib;
};
const sidecarOf = (md) => `${md.replace(/\.md$/i, '')}.card.json`;

const cmd = process.argv[2];
if (cmd === 'card' || cmd === 'badge') {
  const [md, out = dirname(md ?? '')] = process.argv.slice(3);
  if (!md) { console.error(`Usage: c4 ${cmd} <architecture.md> [out-dir]`); process.exit(1); }
  const fail = (where, e) => { console.error(`c4: ${where}: ${e.message ?? e}`); process.exit(1); };
  const L = await loadLib();
  const sidecar = sidecarOf(md);
  let prefs = {};
  try {
    const { prefs: p, warnings } = L.parsePrefs(JSON.parse(await readFile(sidecar, 'utf8')));
    if (warnings.length > 0) fail(sidecar, warnings.join('; '));
    prefs = p;
  } catch (e) {
    if (e.code !== 'ENOENT') fail(sidecar, e);
  }
  try {
    const parsed = L.tryParse((await readFile(md, 'utf8')).replace(/\r\n?/g, '\n'));
    if (!parsed.ok) throw new Error(`line ${parsed.line}: ${parsed.reason}`);
    const c = L.card(parsed.doc, prefs, new Date().toLocaleDateString('en-CA'), { label: md, src: process.env.C4_SRC || md }, process.env.C4_HOST || undefined);
    const [name, body] = cmd === 'card' ? ['card.json', `${JSON.stringify(c, null, 2)}\n`] : ['badge.svg', L.badgeSvg(c)];
    await writeFile(join(out, name), body);
    console.log(`Wrote ${join(out, name)}`);
  } catch (e) {
    fail(md, e);
  }
  process.exit(0);
}

const file = process.argv[2];
if (!file || file === '-h' || file === '--help') {
  console.error('Usage: c4 <architecture.md>   (PORT=8000 to pick the port, NO_OPEN=1 to skip opening a browser)');
  console.error('       c4 card <architecture.md> [out-dir]    (writes card.json)');
  console.error('       c4 badge <architecture.md> [out-dir]   (writes badge.svg)');
  process.exit(file ? 0 : 1);
}
const path = resolve(file);
await readFile(path).catch((e) => { console.error(`c4: cannot read ${file}: ${e.message}`); process.exit(1); });

const route = `/${encodeURIComponent(basename(path))}`;
const sidecar = sidecarOf(path);
// Only these routes, so nothing else on disk is reachable. Writable ones get a PUT and the x-c4-writable header.
const routes = new Map([
  ['/', { file: pkg('Main.dc.html'), type: 'text/html' }],
  ['/support.js', { file: pkg('support.js'), type: 'text/javascript' }],
  ['/vendor/react.js', { file: pkg('vendor/react.js'), type: 'text/javascript' }],
  ['/vendor/react-dom.js', { file: pkg('vendor/react-dom.js'), type: 'text/javascript' }],
  [route, { file: path, type: 'text/markdown', writable: true }],
  [`/${encodeURIComponent(basename(sidecar))}`, { file: sidecar, type: 'application/json', writable: true }],
]);
// Loopback names a browser may use for this server. Anything else in Host means DNS rebinding, so it is refused.
const hosts = (port) => new Set([`127.0.0.1:${port}`, `localhost:${port}`, `[::1]:${port}`]);
const handler = async (req, res) => {
  if (!hosts(server.address().port).has(req.headers.host)) return res.writeHead(403).end('Forbidden host');
  const r = routes.get(new URL(req.url, 'http://x').pathname);
  if (r === undefined) return res.writeHead(404).end('Not found');
  const marks = r.writable ? { 'x-c4-writable': '1' } : {};
  if (req.method === 'PUT' && r.writable) {
    // Cross-site pages cannot get here: a PUT needs a CORS preflight, which this server never answers.
    try {
      const chunks = [];
      for await (const c of req) chunks.push(c);
      const tmp = `${r.file}.c4-tmp`;
      await writeFile(tmp, Buffer.concat(chunks));
      await rename(tmp, r.file); // whole file or nothing, never half-written
      return res.writeHead(204).end();
    } catch (e) {
      return res.writeHead(500).end(e.message);
    }
  }
  if (req.method !== 'GET' && req.method !== 'HEAD') return res.writeHead(405).end('Method not allowed');
  try {
    const body = await readFile(r.file);
    res.writeHead(200, { 'content-type': `${r.type}; charset=utf-8`, 'cache-control': 'no-store', ...marks }).end(body);
  } catch (e) {
    // A missing sidecar is still writable, so the card designer can create it.
    res.writeHead(e.code === 'ENOENT' ? 404 : 500, marks).end(e.message);
  }
};
const server = createServer(handler);

server.listen(Number(process.env.PORT ?? 0), '127.0.0.1', () => {
  const { port } = server.address();
  // Also answer on ::1 so http://localhost:<port> and http://[::1]:<port> work; skipped if IPv6 loopback is unavailable.
  createServer(handler).on('error', () => {}).listen(port, '::1');
  const url = `http://127.0.0.1:${port}/?src=${route}`;
  console.log(`Serving ${file} at ${url}  (Ctrl-C to stop)`);
  if (process.env.NO_OPEN) return;
  const [opener, args] = process.platform === 'darwin' ? ['open', [url]] : process.platform === 'win32' ? ['cmd', ['/c', 'start', '', url]] : ['xdg-open', [url]];
  spawn(opener, args, { stdio: 'ignore', detached: true }).on('error', () => {}).unref();
});
