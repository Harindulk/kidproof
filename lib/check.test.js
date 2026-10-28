import { test } from 'node:test';
import assert from 'node:assert/strict';
import { finish, validatePolicy } from './check.js';
import { REQUIREMENTS } from './requirements.js';

const policy = 'We do not knowingly collect data from children under 13.\nWe share your device ID with ad partners such as AdMob.' + ' Filler.'.repeat(50);

test('validatePolicy rejects short and huge text and normalises line ends', () => {
  assert.ok(validatePolicy('too short').error);
  assert.ok(validatePolicy('x'.repeat(60001)).error);
  assert.equal(validatePolicy(`  ${policy.replace(/\n/g, '\r\n')}  `).policy, policy);
});

test('finish orders findings, verifies quotes and counts verdicts', () => {
  const raw = {
    service_name: 'Test', audience: 'mixed', summary: 's',
    findings: [
      { id: 'ads_tracking', verdict: 'missing', quote: 'We share your device ID with ad partners such as AdMob.', explanation: 'e', fix: 'f' },
      { id: 'audience', verdict: 'partial', quote: 'We do not  knowingly collect data from children under 13', explanation: 'e', fix: 'f' },
      { id: 'retention', verdict: 'missing', quote: 'We keep data for 30 days.', explanation: 'e', fix: 'f' },
      { id: 'security', verdict: 'met', quote: '', explanation: 'e', fix: '' },
    ],
  };
  const r = finish(raw, policy, { model: 'm' });
  assert.deepEqual(r.findings.map((f) => f.id), REQUIREMENTS.map((q) => q.id));
  const by = Object.fromEntries(r.findings.map((f) => [f.id, f]));
  assert.equal(by.ads_tracking.quote_found, true);
  assert.equal(by.audience.quote_found, true, 'whitespace differences still match');
  assert.equal(by.retention.quote_found, false, 'invented quote is caught');
  assert.equal(by.security.quote_found, null);
  assert.equal(by.geolocation.verdict, 'unchecked');
  assert.deepEqual(r.counts, { met: 1, partial: 1, missing: 2, unchecked: REQUIREMENTS.length - 4 });
  assert.equal(r.counts.met + r.counts.partial + r.counts.missing + r.counts.unchecked, REQUIREMENTS.length);
});
