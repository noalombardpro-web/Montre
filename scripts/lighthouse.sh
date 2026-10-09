#!/usr/bin/env bash
# Audit Lighthouse (desktop + mobile) du build de production servi par `npm run preview`.
# Usage : scripts/lighthouse.sh [url] [outDir]
set -euo pipefail
URL=${1:-http://127.0.0.1:4173/}
OUT=${2:-lighthouse}
mkdir -p "$OUT"
CHROME=${CHROME_PATH:-$( [ -e /opt/pw-browsers/chromium ] && echo /opt/pw-browsers/chromium || echo "" )}
for form in desktop mobile; do
  PRESET=""; [ "$form" = desktop ] && PRESET="--preset=desktop"
  CHROME_PATH=$CHROME npx lighthouse "$URL" $PRESET \
    --only-categories=performance,accessibility,best-practices,seo \
    --chrome-flags="--headless=new --no-sandbox" --disable-full-page-screenshot \
    --output=json --output=html --output-path="$OUT/$form" --quiet
  node -e "
    const d = require(require('path').resolve('$OUT/$form.report.json'));
    const s = Object.fromEntries(Object.entries(d.categories).map(([k, v]) => [k, Math.round(v.score * 100)]));
    const m = Object.fromEntries(['first-contentful-paint','largest-contentful-paint','total-blocking-time','cumulative-layout-shift','speed-index'].map(a => [a, d.audits[a].displayValue]));
    console.log('$form', JSON.stringify(s), JSON.stringify(m));
  "
done
