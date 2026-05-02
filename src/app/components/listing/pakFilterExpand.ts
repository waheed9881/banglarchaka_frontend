/** URL uses compact tokens; API expects expanded LIKE hints where noted. */

export const PAK_ASSEMBLY_SLUG_TO_HINTS: Record<string, string[]> = {
  imported: ['reconditioned', 'cbu', 'imported', 'jdm', 'japan', 'thailand', 'auction'],
  local: ['ckd', 'local assembly', 'locally assembled', 'assembled in bangladesh'],
};

export const PAK_REGISTRATION_SLUG_TO_HINTS: Record<string, string[]> = {
  dhaka: ['dhaka', 'gazipur', 'narayanganj'],
  chattogram: ['chattogram', 'chattagram', 'cumilla'],
  sylhet: ['sylhet'],
  rajshahi: ['rajshahi', 'bogura'],
  khulna: ['khulna', 'jessore', 'jashore'],
  barishal: ['barishal', 'barisal'],
  rangpur: ['rangpur', 'dinajpur'],
  mymensingh: ['mymensingh'],
};

export function expandCsvSlugs(csv: string | undefined | null, map: Record<string, string[]>): string | undefined {
  if (!csv?.trim()) return undefined;
  const slugs = csv
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  const out = new Set<string>();
  for (const s of slugs) {
    const hints = map[s];
    if (hints?.length) {
      for (const h of hints) out.add(h);
    } else {
      out.add(s);
    }
  }
  if (out.size === 0) return undefined;
  return [...out].join(',');
}
