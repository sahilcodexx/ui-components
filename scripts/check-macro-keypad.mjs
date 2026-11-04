import assert from 'node:assert/strict';
import geometry from '../components/illustrations/macro-keypad/geometry.json' with { type: 'json' };
import { KEY_LABELS, stepKey, TRAVEL_MM } from '../components/illustrations/macro-keypad/model.ts';
assert.equal(geometry.parts,68);
assert.equal(geometry.keys.length,12);
assert.equal(new Set(geometry.keys.map(k=>k.id)).size,12);
assert.equal(new Set(KEY_LABELS).size,12);
assert.equal(TRAVEL_MM,3.6);
for(const rate of[30,60,120]){
 const spring={position:0,velocity:0};
 for(let i=0;i<rate;i++){stepKey(spring,true,1/rate);assert(spring.position>=0&&spring.position<=1);}
 assert.equal(spring.position,1,'Press reaches physical lower stop');
 for(let i=0;i<rate;i++){stepKey(spring,false,1/rate);assert(spring.position>=0&&spring.position<=1);}
 assert.equal(spring.position,0,'Release returns to rest');
}
const still={position:0,velocity:4};stepKey(still,true,0,true);assert.deepEqual(still,{position:1,velocity:0});stepKey(still,false,0,true);assert.deepEqual(still,{position:0,velocity:0});
console.log('PASS: 68 solids; 12 unique keys; bounded 3.6 mm travel; spring convergence at 30/60/120 Hz; reduced motion.');
