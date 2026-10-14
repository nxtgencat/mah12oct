const CATEGORY_HUE: Record<string, number> = {
  Fiction: 222,
  Science: 168,
  History: 28,
  Technology: 250,
  Biography: 340,
  Mystery: 265,
  Fantasy: 190,
  Philosophy: 150,
};

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function wrapTitle(title: string, maxChars = 14, maxLines = 4): string[] {
  const words = title.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const w of words) {
    const next = current ? `${current} ${w}` : w;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = w;
    } else {
      current = next;
    }
    if (lines.length === maxLines) break;
  }
  if (lines.length < maxLines && current) lines.push(current);
  const result = lines.slice(0, maxLines);
  if (words.join(" ").length > result.join(" ").length) {
    result[result.length - 1] = `${result[result.length - 1].replace(/…$/, "")}…`;
  }
  return result;
}

/** Deterministic, offline-proof book cover as an SVG data URI. */
export function makeCover(title: string, author: string, category: string): string {
  const safeTitle = title.trim() || "Untitled";
  const safeAuthor = author.trim() || "Unknown author";
  const h = hashStr(safeTitle) % 360;
  const base = CATEGORY_HUE[category] ?? h;
  const hue = Math.round((base + (h % 24) - 12 + 360) % 360);
  const hue2 = (hue + 36) % 360;
  const lines = wrapTitle(safeTitle);
  const titleSize = lines.some((l) => l.length > 12) ? 30 : 36;
  const startY = 150 - ((lines.length - 1) * 21);
  const titleTexts = lines
    .map((l, i) => `<text x="200" y="${startY + i * 42}" text-anchor="middle" font-family="Georgia,'Times New Roman',serif" font-size="${titleSize}" font-weight="bold" fill="#ffffff">${escapeXml(l)}</text>`)
    .join("");
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="560" viewBox="0 0 400 560">` +
    `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0" stop-color="hsl(${hue},48%,34%)"/>` +
    `<stop offset="1" stop-color="hsl(${hue2},52%,16%)"/>` +
    `</linearGradient></defs>` +
    `<rect width="400" height="560" fill="url(#g)"/>` +
    `<rect x="0" width="26" height="560" fill="#000" opacity="0.28"/>` +
    `<rect x="26" width="2" height="560" fill="#fff" opacity="0.35"/>` +
    `<circle cx="330" cy="90" r="120" fill="#fff" opacity="0.07"/>` +
    `<circle cx="60" cy="480" r="90" fill="#fff" opacity="0.06"/>` +
    `<text x="200" y="72" text-anchor="middle" font-family="Georgia,serif" font-size="15" letter-spacing="4" fill="#ffffff" opacity="0.75">${escapeXml(category.toUpperCase().slice(0, 18))}</text>` +
    `<line x1="120" y1="94" x2="280" y2="94" stroke="#fff" stroke-opacity="0.4" stroke-width="1"/>` +
    titleTexts +
    `<line x1="150" y1="392" x2="250" y2="392" stroke="#fff" stroke-opacity="0.5" stroke-width="1"/>` +
    `<text x="200" y="424" text-anchor="middle" font-family="Georgia,serif" font-size="19" font-style="italic" fill="#ffffff" opacity="0.92">${escapeXml(safeAuthor.slice(0, 30))}</text>` +
    `<text x="200" y="524" text-anchor="middle" font-family="Georgia,serif" font-size="12" letter-spacing="3" fill="#ffffff" opacity="0.6">ATHENA PRESS</text>` +
    `</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
