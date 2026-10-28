// POST /api/check { policy } -> the report as JSON.
import { runCheck, validatePolicy } from '../lib/check.js';

// shortcut: per-instance memory limits; a determined abuser can hit several instances. Move to a KV store if that happens.
const hits = new Map();
let day = '', today = 0;

function limited(ip) {
  const now = Date.now();
  const d = new Date().toISOString().slice(0, 10);
  if (d !== day) { day = d; today = 0; }
  if (today >= Number(process.env.MAX_RUNS_PER_DAY || 60)) return "Today's live checks are used up. The example reports still work.";
  const recent = (hits.get(ip) || []).filter((t) => now - t < 3600e3);
  if (recent.length >= Number(process.env.MAX_RUNS_PER_HOUR || 5)) return 'That is five checks this hour from your connection. Try again later, or open an example report.';
  hits.set(ip, [...recent, now]);
  today++;
  return null;
}

export async function POST(request) {
  const body = await request.json().catch(() => null);
  const { policy, error } = validatePolicy(body?.policy);
  if (error) return Response.json({ error }, { status: 400 });
  if (!process.env.ANTHROPIC_API_KEY) return Response.json({ error: 'Live checks are switched off on this deployment. The example reports still work.' }, { status: 503 });
  const ip = (request.headers.get('x-forwarded-for') || 'local').split(',')[0].trim();
  const why = limited(ip);
  if (why) return Response.json({ error: why }, { status: 429 });
  try {
    return Response.json(await runCheck(policy));
  } catch (e) {
    console.error(e);
    return Response.json({ error: e instanceof SyntaxError ? 'The review came back malformed. Run it again.' : (e.message || 'The check failed.') }, { status: 502 });
  }
}
