# Kidproof

Kidproof checks a game or app privacy policy against children's privacy law. Paste the policy and you get a verdict on twelve requirements from the US COPPA Rule, GDPR Article 8 and the UK Children's Code. Each verdict comes with the clause it was based on, a plain-English reason and a suggested fix, plus a SHA-256 receipt of the policy and the report.

**Live demo:** https://kidproof.vercel.app
**Track:** LegalTech & RegTech (data privacy for minors), BLI Legal Tech Hackathon 2

## Why I built it

I make small mobile games. Cartoon art and simple controls pull in kids whether you aim at them or not, and the ad and analytics SDKs most free games ship with collect advertising IDs by default. Under COPPA that ID counts as personal information. Plenty of indie privacy policies come from a template that says "we do not knowingly collect data from children under 13" and then lists those same IDs being sent to ad networks a few lines later.

A lawyer costs more than most indie games earn. Kidproof is the first pass you run before talking to one: it shows which parts of the policy are missing, which clause each verdict rests on, and what to write instead. Parents can use it the same way to see what a game does with their child's data.

## How it works

1. A fixed checklist. [`lib/requirements.js`](lib/requirements.js) holds twelve requirements with their citations. Every policy is held against the same list.
2. One Claude call. [`lib/check.js`](lib/check.js) sends the policy to Claude (`claude-opus-5-5`) with the checklist and a JSON schema, and gets back a verdict, a verbatim quote, a reason and a fix for each requirement.
3. Quote check. The server searches the policy for every quote the model returns, ignoring whitespace and curly-quote differences. A quote that isn't in the text is flagged in red on the report, so a made-up clause can't slip through as evidence.
4. Receipt. The browser hashes the exact policy text and the report with SHA-256 (Web Crypto) and offers them as a JSON download. Anyone holding the same policy text can recompute the hash and show the policy wasn't edited after the check.

| Requirement | Sources |
|---|---|
| Says who the service is for | COPPA §312.2 (directed to children), GDPR Art. 8(1), UK Code std 3 |
| Gets a parent's consent first | COPPA §312.5, GDPR Art. 8(2) |
| Lists what it collects from children and why | COPPA §312.4, COPPA §312.7, GDPR Art. 13, UK Code std 8 |
| Keeps ad tracking and profiling off children | COPPA §312.2 (persistent identifiers), COPPA §312.5, GDPR Recital 38, UK Code std 12 |
| Names who receives children's data | COPPA §312.4, COPPA §312.5, UK Code std 9 |
| Tells parents how to review and delete | COPPA §312.6, GDPR Art. 15, GDPR Art. 17 |
| Publishes how long data is kept | COPPA §312.10, GDPR Art. 5(1)(e), GDPR Art. 13(2)(a) |
| Keeps location off or explains it | COPPA §312.2 (geolocation), UK Code std 10 |
| Starts children on high-privacy settings | UK Code std 7, UK Code std 13, GDPR Art. 25 |
| Explains itself in plain words | COPPA §312.4, GDPR Art. 12(1), UK Code std 4 |
| Gives the operator's contact details | COPPA §312.4, GDPR Art. 13(1)(a) |
| Says how children's data is protected | COPPA §312.8, GDPR Art. 32 |

COPPA means 16 CFR Part 312 as amended in 2025. UK Code means the ICO's Age Appropriate Design Code.

## Run it locally

Needs Node 22 or newer.

```bash
npm install
cp .env.example .env    # then add your ANTHROPIC_API_KEY
npm run dev             # http://localhost:8790
npm test
```

`npm run examples` runs the two sample policies in `public/samples/` through a live check and saves the reports to `public/examples/`. The sample buttons on the page then open those saved reports instantly.

The two sample policies are fictional: Pocket Pets Arcade (a casual game with a template policy) and Tiny Tracks (a game made for young children, written to pass).

## Deploy

It's a static page in `public/` plus one serverless function in `api/check.js`, set up for Vercel's free tier. Set `ANTHROPIC_API_KEY` in the project's environment variables. `MAX_RUNS_PER_HOUR` and `MAX_RUNS_PER_DAY` cap live checks on a public demo.

## Limits

- It's an automated first pass, not legal advice. Have a lawyer review anything you ship to children.
- It reads only the policy. It can't see what the app actually sends, so a policy can pass while the app still leaks data.
- The checklist covers COPPA, GDPR and the UK Code. US state laws, the EU Digital Services Act and app store rules aren't in it yet.
- Policy text goes to the Claude API for review. Kidproof itself stores nothing.

## Next

- Anchor the receipt hash on a public chain so the check date can be proven without trusting the person holding the receipt.
- Fetch a policy from its URL and re-check it on a schedule, so a changed policy gets flagged.
- Compare a policy against the SDKs an app actually bundles.

## Licence

MIT. See [LICENSE](LICENSE).
