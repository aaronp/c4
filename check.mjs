// Smoke test for the component logic in Main.dc.html (no browser): the sample parses and
// round-trips, and the address bar <-> state mapping round-trips.   node check.mjs
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const html = readFileSync(new URL('Main.dc.html', import.meta.url), 'utf8');
const start = html.indexOf('>', html.indexOf('data-dc-script')) + 1;
const src = html.slice(start, html.indexOf('</script>', start));
globalThis.window = { location: { search: '' }, localStorage: { getItem: () => null } };
const C = new Function('DCLogic', `${src}; return Component;`)(class {});

const L = C.lib;
const doc = L.tryParse(L.SAMPLE);
assert.ok(doc.ok, 'sample parses');
assert.equal(L.serialize(doc.doc), L.SAMPLE, 'sample is already canonical');
assert.equal(readFileSync(new URL('examples/acme-platform/architecture.md', import.meta.url), 'utf8'), L.SAMPLE, 'example matches the built-in sample');

const p = C.fromQuery('?sel=trading.orders.gateway&theme=dark&zoom=1.5&view=split&mode=present&src=a/b.md&x=1');
assert.deepEqual(p.expanded, ['trading', 'trading.orders'], 'selecting a nested element expands its ancestors');
const q = C.toQuery({ ...p, srcUrl: p.src }, '?x=1');
assert.equal(q, '?x=1&src=a/b.md&view=split&mode=present&theme=dark&sel=trading.orders.gateway&open=trading,trading.orders&zoom=1.5');
assert.deepEqual(C.fromQuery(q), p, 'query round-trips');
assert.equal(C.fromQuery('?view=nope&theme=nope&zoom=9').view, 'chart', 'bad values fall back to defaults');
assert.equal(C.toQuery({ ...C.fromQuery(''), theme: 'light', srcUrl: null }, ''), '', 'defaults give a clean URL');
console.log('ok');
