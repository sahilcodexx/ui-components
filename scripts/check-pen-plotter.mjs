import assert from 'node:assert/strict';
import geometry from '../components/illustrations/pen-plotter/geometry.json' with { type: 'json' };
import { poseAt } from '../components/illustrations/pen-plotter/model.ts';

assert.equal(geometry.parts, 76);
assert(geometry.length > 370 && geometry.length < 380);
for (let i = 0; i <= 1000; i++) {
  const pose = poseAt(geometry.samples, i / 1000);
  assert(Math.abs(pose.x) <= 90 && Math.abs(pose.y) <= 55, 'Pen must stay on the 180 × 110 mm paper');
  assert(pose.ink >= 0 && pose.ink <= 1, 'Ink progress must be normalized');
  if (i) assert(pose.ink >= poseAt(geometry.samples, (i - 1) / 1000).ink, 'Ink must advance monotonically');
}
const first = poseAt(geometry.samples, 0);
const last = poseAt(geometry.samples, 1);
assert(Math.hypot(last.x-first.x,last.y-first.y) < 0.0001, 'Closed path must loop without a pen jump');
assert.deepEqual(poseAt(geometry.samples, -1), first);
assert.deepEqual(poseAt(geometry.samples, 2), last);
assert.equal(first.ink, 0);
assert.equal(last.ink, 1);
console.log('PASS: 76 solids; bounded pen travel; monotonic ink; closed loop; progress clamping.');
