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
assert.equal(C.toQuery({ ...C.fromQuery(''), srcUrl: null }, ''), '', 'defaults give a clean URL');
assert.deepEqual(L.THEME_IDS, C.THEMES.map((t) => t.id), 'parser and picker know the same themes');
const themed = '# Model: Shop\n- theme: dark\n\n## Person: Customer\n- slug: customer\n';
const t = L.tryParse(themed);
assert.equal(t.ok && L.modelOf(t.doc).theme, 'dark', 'the model can name a theme');
assert.equal(L.serialize(t.doc), themed, 'the theme round-trips');
assert.equal(L.tryParse('# Model: Shop\n- theme: nope\n').ok, false, 'an unknown theme is an error');
assert.equal(L.serialize(L.setTheme(t.doc, 'warm')), themed.replace('dark', 'warm'), 'picking a theme rewrites the line');
assert.match(L.serialize(L.setTheme(doc.doc, 'warm')), /^# Model: .*\n- theme: warm$/m, 'and adds it under the title when missing');
const added = L.addElement(doc.doc, 'trading', 'Container', { x: 0, y: 0 });
assert.equal(added.path, 'trading.new-container-ctr', 'new elements get a placeholder slug with a kind suffix');
const named = L.setPropAndSlug(added.doc, added.path, 'name', 'Risk Limits & Exposure Monitoring Service');
assert.equal(named.newPath, 'trading.risk-limits-exposure-ctr', 'the slug follows the name, kebab-cased and capped');
assert.equal(L.setPropAndSlug(named.doc, named.newPath, 'kind', 'Database').newPath, 'trading.risk-limits-exposure-db', 'and follows the kind');
assert.equal(L.setPropAndSlug(named.doc, 'trading.orders', 'name', 'Order Desk').newPath, 'trading.orders', 'a hand-picked slug stays put');
assert.equal(L.setPropAndSlug(L.setSlug(named.doc, named.newPath, 'risk').doc, 'trading.risk', 'name', 'Risk Desk').newPath, 'trading.risk', 'a hand-edited slug stays put');
const multi = 'Takes **orders** and\n\n- validates\n- routes\n\n```\ncode\n```';
const withDesc = L.setProp(doc.doc, 'trading.orders', 'desc', multi);
const md = L.serialize(withDesc);
assert.match(md, /- desc:\n````md\nTakes/, 'a multi-line desc is a ```md fence, longer than any fence inside it');
const back = L.tryParse(md);
assert.ok(back.ok, 'and parses');
assert.equal(L.findEl(L.modelOf(back.doc), 'trading.orders').desc, multi, 'and round-trips');
assert.equal(L.serialize(back.doc), md, 'canonically');
assert.equal(L.tryParse('# Model: M\n\n## System: S\n- slug: s-sys\n- desc:\n').ok, false, 'an empty desc needs a fence');
assert.equal(L.mdToHtml('**a** *b* `c` [d](https://x.io/?a=1&b=2)\n- e'), '<p><strong>a</strong> <em>b</em> <code>c</code> <a href="https://x.io/?a=1&amp;b=2" target="_blank" rel="noopener noreferrer">d</a><br>- e</p>');
assert.equal(L.mdToHtml('- x\n- y\n\nz'), '<ul><li>x</li><li>y</li></ul><p>z</p>');
assert.equal(L.mdToHtml('<img onerror=x> [j](javascript:alert(1)) "q"'), '<p>&lt;img onerror=x&gt; [j](javascript:alert(1)) &quot;q&quot;</p>', 'html is escaped and only http(s) links render');
// Dragging next to an expanded sibling: the box is drawn where the pointer puts it, and
// releasing (pushes no longer frozen) leaves it there.
const open = new Set(['trading']);
const g0 = L.arrange(L.modelOf(doc.doc), L.layoutOf(doc.doc), open, null);
const frozen = { ...g0.shifts };
delete frozen.bank;
for (const want of [{ x: 96, y: 1200 }, { x: 1500, y: 96 }, { x: 1400, y: 900 }]) {
  const moved = L.moveTo(doc.doc, { bank: L.unpush(g0, 'bank', want) });
  const during = L.arrange(L.modelOf(moved), L.layoutOf(moved), open, frozen).rects.get('bank');
  const after = L.arrange(L.modelOf(moved), L.layoutOf(moved), open, null).rects.get('bank');
  assert.deepEqual([during.x, during.y], [want.x, want.y], `bank follows the pointer to ${want.x},${want.y}`);
  assert.deepEqual([after.x, after.y], [want.x, want.y], 'and stays there on release');
}
// Inside an expanded sibling's growth no stored position fits; the nearest edge wins.
assert.deepEqual(L.unpush(g0, 'bank', { x: 704, y: 900 }), { x: 639, y: 572 }, 'a drop in the push gap takes the nearest edge');
const sm = L.modelOf(doc.doc);
assert.deepEqual(L.search(sm, 'GATEWAY'), ['trading.orders.gateway'], 'search is case-insensitive and finds nested elements');
assert.deepEqual(L.search(sm, '  '), [], 'a blank search matches nothing');
assert.ok(L.search(sm, 'order gate').every((p) => L.search(sm, 'gate').includes(p)), 'every word must match');
console.log('ok');
