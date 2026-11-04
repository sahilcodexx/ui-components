export type KeySpring = { position: number; velocity: number };
export const KEY_LABELS = ["Q", "W", "E", "R", "A", "S", "D", "F", "Z", "X", "C", "V"];
export const TRAVEL_MM = 3.6;

export function stepKey(spring: KeySpring, pressed: boolean, elapsed: number, still = false) {
  const target = pressed ? 1 : 0;
  if (still) { spring.position = target; spring.velocity = 0; return; }
  // Substeps keep the damped spring stable even after a slow browser frame.
  const count = Math.max(1, Math.ceil(Math.min(elapsed, 0.05) / (1 / 120)));
  const dt = Math.min(elapsed, 0.05) / count;
  for (let i = 0; i < count; i++) {
    spring.velocity += (420 * (target - spring.position) - 29 * spring.velocity) * dt;
    spring.position += spring.velocity * dt;
    if (spring.position < 0 || spring.position > 1) { spring.position = Math.max(0, Math.min(1, spring.position)); spring.velocity = 0; }
  }
  if (Math.abs(spring.position - target) < 0.0001 && Math.abs(spring.velocity) < 0.001) { spring.position = target; spring.velocity = 0; }
}
