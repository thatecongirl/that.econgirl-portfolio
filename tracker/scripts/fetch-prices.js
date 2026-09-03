// Fetches gold/silver/platinum spot prices in GBP from metals.dev
// and writes them to data/prices.json. Run daily by
// .github/workflows/update-prices.yml — the API key is read from the
// METALS_API_KEY repo secret, never committed to the repo.

const fs = require('fs');
const path = require('path');

const API_KEY = process.env.METALS_API_KEY;

if (!API_KEY) {
  console.error('Missing METALS_API_KEY environment variable.');
  process.exit(1);
}

const URL = `https://api.metals.dev/v1/latest?api_key=${API_KEY}&currency=GBP&unit=toz`;

async function main() {
  const res = await fetch(URL);
  const data = await res.json();

  if (data.status !== 'success') {
    console.error('metals.dev API error:', data.error_message || data);
    process.exit(1);
  }

  // metals.dev returns troy-ounce prices already converted to the
  // requested currency (GBP here) inside `metals`.
  const gold = data.metals.gold;
  const silver = data.metals.silver;
  const platinum = data.metals.platinum;

  // Read yesterday's snapshot (if it exists) to compute % change.
  const outPath = path.join(__dirname, '..', 'data', 'prices.json');
  let previous = null;
  try {
    previous = JSON.parse(fs.readFileSync(outPath, 'utf8'));
  } catch {
    previous = null;
  }

  function pctChange(current, prevKey) {
    const prevPrice = previous?.metals?.[prevKey]?.price_gbp_oz;
    if (!prevPrice) return null;
    return ((current - prevPrice) / prevPrice) * 100;
  }

  const output = {
    updated_at: new Date().toISOString(),
    currency: 'GBP',
    unit: 'troy_ounce',
    metals: {
      gold: { price_gbp_oz: gold, change_percent: pctChange(gold, 'gold') },
      silver: { price_gbp_oz: silver, change_percent: pctChange(silver, 'silver') },
      platinum: { price_gbp_oz: platinum, change_percent: pctChange(platinum, 'platinum') },
    },
  };

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2));
  console.log('Wrote', outPath, output);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
