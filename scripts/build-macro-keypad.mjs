import { writeFileSync } from 'node:fs';
import * as k from './vendor/anatomy-iso-kit.mjs';
const casePlan={x:-78,y:-56,w:156,d:130,r:7};
const P=k.fitProjection(k.boxCorners(casePlan,-7,36),760,440,{pad:48,azimuth:42,elevation:35});
const at=p=>k.iso(p,P), box=(x,y,w,d,r=1)=>({x,y,w,d,r});
let parts=0;
const S=(p,z,h,tone='mid')=>{parts++;return k.solidSvg(k.slabOf(p,z,h,P,5,h>1?.6:0),{tone});};
const L=(d,tone='lo')=>k.lineSvg(d,{tone});
const screw=(x,y,z)=>L(k.ring(x,y,1.4,z,P,16))+k.dotsSvg([at([x,y,z])],{size:.45,tone:'mid'});
let bed=`<path class="iso-halo" d="${k.haloOf(casePlan,-7,12,P)}"/>`;
const feet=k.corners(casePlan,14).sort((a,b)=>k.depthOf([...a,0],P)-k.depthOf([...b,0],P));
for(const [x,y]of feet){bed+=S(box(x-6,y-6,12,12,2.5),-7,3,'lo');bed+=S(box(x-4,y-4,8,8,1.5),-4,4,'lo');}
bed+=S(casePlan,0,9,'mid');bed+=S(k.insetPlan(casePlan,.8),9,5,'hi');bed+=L(k.planOutline(k.insetPlan(casePlan,4),14,P),'faint');
bed+=S(box(-68,-46,136,100,3),14,.8,'lo');bed+=S(box(-66,-44,132,96,2),14.8,1,'mid');
for(const[x,y]of[[-71,-49],[71,-49],[-71,59],[71,59]])bed+=S(box(x-2,y-2,4,4,.5),14,.6,'lo')+screw(x,y,14.6);
bed+=S(box(-42,58,84,9,1.5),14,1,'hi');bed+=S(box(-39,59.5,78,6,.7),15,.2,'faint');
bed+=S(box(57,59,12,7,1),14,1,'mid');bed+=S(box(59,60.5,8,4,.5),15,.2,'lo');
const labels=['Q','W','E','R','A','S','D','F','Z','X','C','V'];
const keys=labels.map((label,i)=>({id:i,label,x:-48+(i%4)*32,y:-28+Math.floor(i/4)*32})).sort((a,b)=>k.depthOf([a.x,a.y,0],P)-k.depthOf([b.x,b.y,0],P)).map(key=>{
let socket=S(box(key.x-12,key.y-12,24,24,2),15.8,1.8,'lo');socket+=S(box(key.x-8,key.y-8,16,16,1.5),17.6,3,'mid');
let cap=S(box(key.x-3,key.y-3,6,6,.6),20.6,6,'mid');cap+=S(box(key.x-12.5,key.y-12.5,25,25,3),26.6,7,'hi');
cap+=L(k.planOutline(box(key.x-10.5,key.y-10.5,21,21,2),33.6,P),'faint');
cap+=k.faceTextSvg(k.topMatrix([key.x,key.y-1],33.65,P),key.label,{size:5,tone:'hi',anchor:'middle'});
return {...key,socket,cap};});
const displayTransform=k.topMatrix([0,63.8],15.25,P);
const displayClip=k.planOutline(box(-39,59.5,78,6,.7),15.25,P);
writeFileSync(new URL('../components/illustrations/macro-keypad/geometry.json',import.meta.url),JSON.stringify({bed,keys,parts,travel:k.screenRise(3.6,P),displayTransform,displayClip}));
console.log(`Built macro keypad: ${parts} solids; 12 depth-sorted switches; 3.6 mm travel.`);
