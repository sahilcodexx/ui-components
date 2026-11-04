export type PlotPoint = { x: number; y: number; at: number; ink: number };

export function poseAt(samples: PlotPoint[], progress: number) {
  const value = Math.min(1, Math.max(0, progress));
  let lo = 0;
  let hi = samples.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (samples[mid].at < value) lo = mid;
    else hi = mid;
  }
  const a = samples[lo];
  const b = samples[hi];
  const mix = (value - a.at) / (b.at - a.at || 1);
  return { x: a.x + (b.x - a.x) * mix, y: a.y + (b.y - a.y) * mix, ink: a.ink + (b.ink - a.ink) * mix };
}
