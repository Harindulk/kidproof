// Runs every sample policy through the live check and saves the reports as the site's example reports.
// npm run examples   (needs ANTHROPIC_API_KEY in .env)
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { runCheck, validatePolicy } from '../lib/check.js';

const dir = new URL('../public/', import.meta.url);
for (const name of (await readdir(new URL('samples/', dir))).filter((n) => n.endsWith('.txt'))) {
  const { policy, error } = validatePolicy(await readFile(new URL(`samples/${name}`, dir), 'utf8'));
  if (error) throw new Error(`${name}: ${error}`);
  console.log(`Checking ${name}…`);
  const report = await runCheck(policy);
  await writeFile(new URL(`examples/${name.replace('.txt', '.json')}`, dir), JSON.stringify(report, null, 2) + '\n');
  console.log(`  ${report.counts.met} met, ${report.counts.partial} partial, ${report.counts.missing} missing`);
}
