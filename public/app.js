const $ = (id) => document.getElementById(id);
const form = $('form'), box = $('policy'), go = $('go'), status = $('status');
const ORDER = { missing: 0, partial: 1, unchecked: 2, met: 3 };
const VERDICT = { met: 'Covered', partial: 'Partly covered', missing: 'Missing', unchecked: 'Not checked' };
const AUDIENCE = { children: 'Made for children', mixed: 'Mixed audience', general: 'General audience', unclear: 'Audience unclear' };
let receipt = null;

// Same clean-up the server applies, so the receipt hashes exactly the text that was checked.
const clean = (s) => s.replace(/\r\n?/g, '\n').trim();
const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
const say = (text, kind = '') => { status.textContent = text; status.className = `status ${kind}`; };

async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

box.addEventListener('input', () => { $('count').textContent = box.value.length.toLocaleString('en'); });

for (const b of document.querySelectorAll('[data-sample]')) {
  b.addEventListener('click', async () => {
    const id = b.dataset.sample;
    box.value = await (await fetch(`samples/${id}.txt`)).text();
    box.dispatchEvent(new Event('input'));
    const saved = await fetch(`examples/${id}.json`).then((r) => (r.ok ? r.json() : null)).catch(() => null);
    if (saved) {
      await render(saved, clean(box.value));
      say(`Saved report from a live check on ${saved.meta.checked_at.slice(0, 10)}. Press Check policy to run it again.`);
    } else say('Sample loaded. Press Check policy.');
  });
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const policy = clean(box.value);
  go.disabled = true;
  const t0 = Date.now();
  const tick = () => say(`Reading the policy against twelve requirements… ${Math.round((Date.now() - t0) / 1000)} s (usually under two minutes)`);
  tick();
  const timer = setInterval(tick, 1000);
  try {
    const res = await fetch('/api/check', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ policy }) });
    const data = await res.json().catch(() => ({ error: 'The server sent back something unreadable. Try again.' }));
    if (!res.ok) throw new Error(data.error || `The check failed (${res.status}).`);
    await render(data, policy);
    say(`Checked in ${Math.round((Date.now() - t0) / 1000)} s.`);
  } catch (err) {
    say(err.message, 'error');
  } finally {
    clearInterval(timer);
    go.disabled = false;
  }
});

async function render(r, policy) {
  $('r-name').textContent = r.service_name;
  $('r-summary').textContent = r.summary;
  $('r-audience').textContent = AUDIENCE[r.audience] || AUDIENCE.unclear;
  for (const k of ['missing', 'partial', 'met']) $(`s-${k}`).textContent = `${r.counts[k]} of ${r.findings.length}`;
  const quoted = r.findings.filter((f) => f.quote);
  $('s-quotes').textContent = `${quoted.filter((f) => f.quote_found).length} of ${quoted.length}`;

  $('strip').replaceChildren(...r.findings.map((f) => {
    const li = el('li', `cell ${f.verdict}`);
    const a = el('a', null, f.title);
    a.href = `#f-${f.id}`;
    a.setAttribute('aria-label', `${f.title}: ${VERDICT[f.verdict]}`);
    li.append(a);
    return li;
  }));

  const sorted = [...r.findings].sort((a, b) => ORDER[a.verdict] - ORDER[b.verdict]);
  $('findings').replaceChildren(...sorted.map((f) => {
    const li = el('li', `finding-row ${f.verdict}`);
    li.id = `f-${f.id}`;
    const head = el('div', 'row-head');
    const left = el('div');
    left.append(el('h4', null, f.title), el('p', 'cites', f.cites.join(' · ')));
    head.append(left, el('span', `pill ${f.verdict}`, VERDICT[f.verdict]));
    li.append(head);
    if (f.quote) {
      const q = el('blockquote', f.quote_found ? '' : 'unverified');
      q.append(el('p', null, f.quote), el('cite', null, f.quote_found ? 'Found word for word in the policy' : 'Not found in the policy text. Check this clause by hand.'));
      li.append(q);
    } else li.append(el('p', 'noquote', 'No clause in the policy covers this.'));
    li.append(el('p', 'why', f.explanation));
    if (f.fix) {
      const fix = el('div', 'fix');
      fix.append(el('span', 'fix-label', 'What to change'), el('p', null, f.fix));
      li.append(fix);
    }
    return li;
  }));

  const [policyHash, reportHash] = await Promise.all([sha256(policy), sha256(JSON.stringify(r))]);
  receipt = { kidproof_receipt: 1, policy_sha256: policyHash, report_sha256: reportHash, model: r.meta.model, checked_at: r.meta.checked_at, checklist: r.meta.checklist, report: r };
  const rows = [['Policy SHA-256', policyHash], ['Report SHA-256', reportHash], ['Checked', r.meta.checked_at.replace('T', ' ').slice(0, 16) + ' UTC'], ['Model', r.meta.model], ['Checklist', r.meta.checklist]];
  $('receipt').replaceChildren(...rows.flatMap(([k, v]) => [el('dt', null, k), el('dd', k.includes('SHA') ? 'hash' : '', v)]));

  $('report').hidden = false;
  $('report').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
}

$('dl').addEventListener('click', () => {
  if (!receipt) return;
  const a = el('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(receipt, null, 2)], { type: 'application/json' }));
  a.download = `kidproof-receipt-${receipt.policy_sha256.slice(0, 12)}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
});
