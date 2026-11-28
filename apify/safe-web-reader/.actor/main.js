import { Actor, log } from 'apify';

const CONF = { listField: 'urls', bodyField: 'url', endpoint: 'https://web-reader.ameeras-official.workers.dev/safe-read', event: 'safe-page', max: 500, concurrency: 4,
  empty: 'Add at least one URL in "URLs to read safely".', extra: (i) => ({}) };

await Actor.init();
const input = (await Actor.getInput()) || {};
const KEY = process.env.AGENT_TOOLKIT_KEY;
if (!KEY) await Actor.fail('This Actor is not configured yet (missing service key). Please try again later.');

const raw = [].concat(input[CONF.listField] || []).map((x) => (typeof x === 'string' ? x : (x && (x.url || x.name)) || '')).map((s) => String(s).trim()).filter(Boolean);
const items = [...new Set(raw)].slice(0, Number(input.maxItems) > 0 ? Number(input.maxItems) : CONF.max);
if (!items.length) await Actor.fail(CONF.empty);
log.info(`Processing ${items.length} item(s)...`);

let ok = 0, failed = 0, stop = false;
async function one(item) {
  if (stop) return;
  try {
    const r = await fetch(CONF.endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'X-API-Key': KEY, 'user-agent': 'apify-actor/' + CONF.event },
      body: JSON.stringify(Object.assign({ [CONF.bodyField]: item }, CONF.extra(input))),
      signal: AbortSignal.timeout(120000),
    });
    const j = await r.json().catch(() => ({}));
    if (r.ok) {
      delete j.billing; delete j.free_sample; delete j.free_remaining_today; delete j.teams_plan; delete j.pay_by_card;
      await Actor.pushData({ input: item, ok: true, ...j });
      ok++;
      const c = await Actor.charge({ eventName: CONF.event });
      if (c && c.eventChargeLimitReached) { stop = true; log.warning('Your spending limit for this run was reached. Stopping.'); }
    } else {
      failed++;
      await Actor.pushData({ input: item, ok: false, error: j.error || `HTTP ${r.status}` });
    }
  } catch (e) {
    failed++;
    await Actor.pushData({ input: item, ok: false, error: String((e && e.message) || e) });
  }
}
const queue = [...items];
await Promise.all(Array.from({ length: Math.min(CONF.concurrency, queue.length) }, async () => { while (queue.length && !stop) await one(queue.shift()); }));
log.info(`Done: ${ok} succeeded, ${failed} failed. Failed items are never charged.`);
await Actor.exit();
