// Geometry built with the MIT-licensed Anatomy kit; see vendor/anatomy-LICENSE.
import { writeFileSync } from 'node:fs';
import * as k from './vendor/anatomy-iso-kit.mjs';

const base = { x: -125, y: -85, w: 250, d: 170, r: 7 };
const P = k.fitProjection(k.boxCorners(base, -8, 74), 760, 440, { pad: 35, azimuth: 42, elevation: 32 });
const at = point => k.iso(point, P);
let parts = 0;
const S = (plan, z, h, tone = 'mid', lit = false) => { parts++; return k.solidSvg(k.slabOf(plan, z, h, P, 5, h > 1 ? 0.7 : 0), { tone, lit }); };
const L = (path, tone = 'lo', free = false) => k.lineSvg(path, { tone, free });
const screw = (x, y, z, r = 1.5) => L(k.ring(x, y, r, z, P, 16), 'lo') + k.dotsSvg([at([x, y, z])], { size: 0.45, tone: 'mid' });
const box = (x, y, w, d, r = 1) => ({x,y,w,d,r});
const feet = k.corners(base, 16).sort((a,b) => k.depthOf([...a,0],P)-k.depthOf([...b,0],P));
let bed = `<path class="iso-halo" d="${k.haloOf(base,-8,12,P)}"/>`;
for (const [x,y] of feet) { bed += S(box(x-7,y-7,14,14,3),-8,3,'lo'); bed += S(box(x-5,y-5,10,10,2),-5,5,'lo'); }
bed += S(base,0,10,'mid');
bed += L(k.planOutline(k.insetPlan(base,4),10,P),'faint');
for (const [x,y] of k.corners(base,8)) bed += screw(x,y,10);
bed += S(box(-98,-64,196,128,3),10,1.3,'lo');
bed += S(box(-90,-55,180,110,0.4),11.3,0.3,'faint');
for (const [x,y] of [[-91,-56],[83,-56],[-91,49],[83,49]]) bed += S(box(x,y,8,7,1),11.6,2,'mid') + screw(x+4,y+3.5,13.6,1);
for (const x of [-113,107]) {
  bed += S(box(x,-69,6,138,1),10,7,'mid');
  bed += L(k.lineOnTop([x+3,-68],[x+3,68],17,P),'hi');
  bed += S(box(x-3,-72,12,9,2),10,11,'mid') + screw(x+3,-67.5,21);
  bed += S(box(x-3,63,12,9,2),10,11,'mid') + screw(x+3,67.5,21);
  bed += S(box(x+7,-62,2,124,0.5),10,2,'lo');
}
for (const x of [-118,95]) {
  bed += S(box(x,-80,23,15,2),10,10,'mid');
  bed += S(box(x+1,-79,21,13,1),20,1.3,'lo');
  for (let i=0;i<5;i++) bed += S(box(x+3+i*3.5,-77,1,9,0.3),21.3,1.2,'faint');
}
for(let i=0;i<8;i++) bed += S(box(-70+i*6,-77,3,7,0.7),10,0.3,'faint');
const ruler=box(-91,67,182,6,1);
bed += S(ruler,10,0.6,'lo');
const ticks=k.topTicks(-87,87,3,5,67,10.6,[2,6],P);
bed += L(ticks.minor,'lo')+L(ticks.major,'mid');
bed += S(box(-112,74,29,7,1),10,0.5,'lo');
for(let i=0;i<3;i++) bed+=L(k.lineOnTop([-108,75.5+i*1.5],[-90+i*3,75.5+i*1.5],10.5,P),'lo',true);
bed += S(box(97,73,16,8,2),10,2,'mid');
bed += S(box(100,75,5,4,1),12,1,'hi');
bed += S(box(107,75,3,4,0.6),12,1.5,'hi');

let gantry='';
for(const x of [-116,104]) {
  gantry += S(box(x,-20,12,20,2),17,5,'mid');
  for(const y of [-19,-6]) gantry += S(box(x-1,y,14,5,1),22,3,'lo')+screw(x+6,y+2.5,25,1.1);
  gantry += S(box(x+2,-16,8,12,1.3),25,21,'mid');
}
gantry += S(box(-114,-15,228,10,1.4),46,9,'hi');
gantry += L(k.planOutline(box(-110,-13,220,6,1),55,P),'lo');
for(const y of [-14,-7]) gantry += S(box(-103,y,206,1,0.2),55,0.4,'lo');
for(const x of [-116,105]) gantry += S(box(x,-16,11,12,1.5),46,10,'mid')+screw(x+5.5,-10,56,1.2);

let head=S(box(-12,-17,24,16,2),43,14,'hi');
for(const x of [-12,7]) for(const y of [-17,-6]) head+=S(box(x,y,5,5,0.6),57,2,'mid')+screw(x+2.5,y+2.5,59,0.8);
head+=S(box(-8,-4,16,10,1.5),33,17,'hi');
for(const x of [-8,3]) head+=S(box(x,-2,5,7,0.7),30,5,'mid');
head+=S(box(-4,-3,8,6,0.8),35,20,'hi',true);
head+=S(box(-2,-1.5,4,3,0.4),20,15,'hi',true);
head+=S(box(-1.2,-1,2.4,2,0.3),14,6,'hi',true);
head+=S(box(-0.4,-0.4,0.8,0.8,0.1),11.6,2.4,'hi',true);
head+=S(box(-3,-2,6,4,0.6),55,4,'hi');
for(let i=0;i<8;i++) head+=L(k.segment([-2.4+i*.68,2,55],[-2.4+i*.68,2,59],P),'lo');
const origin=at([0,0,0]), px=at([1,0,0]),py=at([0,1,0]);
const path=[];
for(let i=0;i<=1200;i++) { const t=i/1200*Math.PI*2, r=.78+.20*Math.cos(5*t); const world=[70*r*Math.cos(t),43*r*Math.sin(t),11.61]; path.push({x:world[0],y:world[1],screen:at(world)}); }
const distances=[0];
for(let i=1;i<path.length;i++) distances.push(distances[i-1]+Math.hypot(path[i].x-path[i-1].x,path[i].y-path[i-1].y));
const total=distances.at(-1);
const screenDistances=[0];
for(let i=1;i<path.length;i++) screenDistances.push(screenDistances[i-1]+Math.hypot(path[i].screen[0]-path[i-1].screen[0],path[i].screen[1]-path[i-1].screen[1]));
const screenTotal=screenDistances.at(-1);
const samples=path.map((point,i)=>({...point,at:distances[i]/total,ink:screenDistances[i]/screenTotal}));
const trace=path.map((point,i)=>`${i?'L':'M'}${point.screen[0].toFixed(2)} ${point.screen[1].toFixed(2)}`).join('');
const output={ bed, gantry, head, trace, samples, length:total, parts, axisX:[px[0]-origin[0],px[1]-origin[1]],axisY:[py[0]-origin[0],py[1]-origin[1]] };
writeFileSync(new URL('../components/illustrations/pen-plotter/geometry.json',import.meta.url),JSON.stringify(output));
if(samples.some(p=>Math.abs(p.x)>90||Math.abs(p.y)>55)) throw Error('Path leaves paper');
console.log(`Built pen plotter: ${parts} solids, ${total.toFixed(1)} mm path; paper bounds verified.`);
