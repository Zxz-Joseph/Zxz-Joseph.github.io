/**
 * Original locally sculpted portrait bust. No photograph is embedded or uploaded.
 * Run: node web/scripts/generate-portrait.mjs (from the repository root).
 * Coordinates: Y up, +Z forward. All meshes are closed except intentional surface details.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as THREE from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';

// GLTFExporter uses the browser FileReader API for its final binary buffer.
globalThis.FileReader = class {
  async readAsArrayBuffer(blob) {
    this.result = await blob.arrayBuffer();
    this.onloadend?.();
  }
  async readAsDataURL(blob) {
    this.result = `data:${blob.type};base64,${Buffer.from(await blob.arrayBuffer()).toString('base64')}`;
    this.onloadend?.();
  }
};

const root = new THREE.Group();
root.name = 'Original stylized portrait — locally modeled';
const material = (name, color, roughness = .8, extra = {}) => new THREE.MeshStandardMaterial({name, color, roughness, metalness: 0, ...extra});
const skin = material('Warm porcelain skin', '#d3a283', .84);
const skinSoft = material('Lid and ear warmth', '#c99175', .85);
const earInner = material('Ear concha', '#b97d67', .9);
const hair = material('Soft black hair', '#161b20', .73);
const hairLight = material('Sculpted hair ridges', '#22272d', .76);
const hairShadow = material('Hair undercuts', '#12171c', .82);
const brow = material('Dark brows', '#292322', .94);
const white = material('Ivory eye whites', '#e5dcd1', .58);
const iris = material('Dark brown irises', '#302820', .47);
const pupil = material('Pupils', '#101518', .4);
const eyeHighlight = material('Eye catchlights', '#f8f1df', .3);
const lipUpper = material('Muted upper lip', '#9e6260', .86);
const lipLower = material('Muted lower lip', '#b97771', .86);
const crease = material('Subtle mouth seam', '#704e48', .98);
const nostril = material('Nostril recess', '#815d4d', .98);
const jacket = material('Deep blue jacket', '#24364c', .93);
const lapel = material('Blue folded collar', '#2d425b', .88);
const stitch = material('Quiet blue seam', '#3b5065', .94);
const shirt = material('Warm white shirt', '#e3e0d7', .94);
const shirtShade = material('Shirt folds', '#c7cbc5', .95);
const button = material('Slate buttons', '#4b5b62', .67);

function add(name, geometry, mat) {
  geometry.computeVertexNormals();
  // Collapsed ends of lenses / tapered locks share a point. Give those isolated
  // vertices a useful unit normal instead of exporting a zero normal.
  const normals = geometry.attributes.normal;
  const positions = geometry.attributes.position;
  const n = new THREE.Vector3();
  for(let i=0;i<normals.count;i++) {
    n.fromBufferAttribute(normals,i);
    if(n.lengthSq()<.0001) {
      n.set(positions.getX(i),positions.getY(i)-2.5,positions.getZ(i));
      if(n.lengthSq()<.0001)n.set(0,0,1);
    }
    n.normalize();
    normals.setXYZ(i,n.x,n.y,n.z);
  }
  const mesh = new THREE.Mesh(geometry, mat);
  mesh.name = name;
  root.add(mesh);
  return mesh;
}
function ellipsoid(name, center, scale, mat, segments = 40, rings = 28) {
  const geo = new THREE.SphereGeometry(1, segments, rings);
  geo.scale(...scale);
  geo.translate(...center);
  return add(name, geo, mat);
}
const g = (v, center, sigma) => Math.exp(-.5 * ((v - center) / sigma) ** 2);
const interpolate = (keys, y, index) => {
  for (let i = 0; i < keys.length - 1; i++) {
    if (y <= keys[i + 1][0]) {
      const p0=keys[Math.max(0,i-1)],p1=keys[i],p2=keys[i+1],p3=keys[Math.min(keys.length-1,i+2)];
      const span=p2[0]-p1[0];
      const t=THREE.MathUtils.clamp((y-p1[0])/span,0,1),t2=t*t,t3=t2*t;
      const m0=(p2[index]-p0[index])/(p2[0]-p0[0])*span;
      const m1=(p3[index]-p1[index])/(p3[0]-p1[0])*span;
      return (2*t3-3*t2+1)*p1[index]+(t3-2*t2+t)*m0+(-2*t3+3*t2)*p2[index]+(t3-t2)*m1;
    }
  }
  return keys.at(-1)[index];
};

// Width, front depth, and back depth profile. A broad cheek/oval jaw and restrained chin.
const headProfile = [
  [1.91, .012, .18, .20], [1.98, .25, .39, .34], [2.12, .46, .48, .43],
  [2.32, .60, .52, .51], [2.57, .68, .57, .57], [2.80, .71, .60, .61],
  [3.04, .70, .61, .64], [3.28, .69, .61, .65], [3.50, .67, .60, .64],
  [3.73, .59, .53, .58], [3.92, .39, .38, .40], [4.00, .01, .01, .01],
];
function faceSculpt(x, y) {
  let z = 0;
  // Integrated nose bridge, rounded tip and nasal wings, with a subtle philtrum.
  z += .14 * g(x, 0, .095) * g(y, 2.92, .26);
  z += .235 * g(x, 0, .11) * g(y, 2.65, .09);
  z += .058 * (g(x, -.115, .06) + g(x, .115, .06)) * g(y, 2.62, .065);
  z -= .012 * g(x, 0, .028) * g(y, 2.44, .085);
  // Eyes are seated within shallow sockets. Cheeks and muzzle join the main head.
  z -= .102 * (g(x, -.30, .145) + g(x, .30, .145)) * g(y, 2.98, .10);
  z += .036 * (g(x, -.40, .16) + g(x, .40, .16)) * g(y, 2.72, .16);
  z += .038 * g(x, 0, .28) * g(y, 2.35, .10);
  z += .026 * g(x, 0, .27) * g(y, 2.08, .09);
  return z;
}
function faceZ(x, y) {
  const w = interpolate(headProfile, y, 1);
  const c = Math.sqrt(Math.max(0, 1 - (x / w) ** 2));
  return interpolate(headProfile, y, 2) * c ** .50 + faceSculpt(x, y) * c ** 4;
}
function ringMesh(name, rows, cols, fn, mat, cap = true, outward = true) {
  const positions = [], indices = [];
  for (let i = 0; i <= rows; i++) {
    for (let j = 0; j <= cols; j++) positions.push(...fn(i / rows, 2 * Math.PI * j / cols));
  }
  for (let i = 0; i < rows; i++) for (let j = 0; j < cols; j++) {
    const a = i * (cols + 1) + j, b = a + cols + 1;
    if(outward) indices.push(a, a + 1, b, b, a + 1, b + 1);
    else indices.push(a, b, a + 1, b, b + 1, a + 1);
  }
  if (cap) {
    for (const row of [0, rows]) {
      const start = row * (cols + 1);
      const center = new THREE.Vector3();
      for (let j = 0; j < cols; j++) center.add(new THREE.Vector3(...positions.slice((start+j)*3, (start+j)*3+3)));
      center.divideScalar(cols);
      const c = positions.length / 3;
      positions.push(...center);
      for(let j = 0; j < cols; j++) {
        if((row === 0) === outward) indices.push(c, start+j+1, start+j);
        else indices.push(c, start+j, start+j+1);
      }
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setIndex(indices);
  return add(name, geo, mat);
}
ringMesh('Continuous sculpted oval head', 100, 112, (v, phi) => {
  const y = THREE.MathUtils.lerp(1.91, 4.00, v);
  const w = interpolate(headProfile, y, 1);
  const x = Math.sin(phi) * w;
  const c = Math.cos(phi);
  const z = c >= 0 ? interpolate(headProfile, y, 2) * c ** .50 + faceSculpt(x,y) * c ** 4 : interpolate(headProfile, y, 3) * c;
  return [x, y, z];
}, skin);

// The nape and neck continue below the head and disappear beneath the shirt collar.
ringMesh('Neck and nape', 28, 64, (v, phi) => {
  const y = 1.10 + v * .91;
  const width = .32 + .10 * v + .095 * g(v, 0, .22);
  return [Math.sin(phi) * width, y, Math.cos(phi) * (.34 + .035 * v) - .085];
}, skin);

for (const s of [-1, 1]) {
  ellipsoid(`${s < 0 ? 'Left' : 'Right'} sculpted ear`, [s*.712, 2.83, -.015], [.137, .258, .13], skin, 36, 28);
  // Shallow inset bowl and a folded inner antihelix create volume in profile.
  ellipsoid('Ear recessed bowl', [s*.773,2.83,.074], [.064,.162,.019], earInner, 28,24);
  ellipsoid('Ear inner fold', [s*.758,2.835,.088], [.032,.11,.023], skinSoft,28,20);
  ellipsoid('Ear tragus', [s*.702,2.78,.102], [.035,.053,.035], skin,24,16);
}

function curveTube(name, points, radius, mat, segments = 48, radial = 10) {
  const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)));
  return add(name, new THREE.TubeGeometry(curve,segments,radius,radial,false),mat);
}
// A patch is a shallow curved lens, so each eye lies inside its socket rather than on a plate.
function eyePatch(name, cx, cy, minX, maxX, bounds, mat, offset, rows=12, cols=40) {
  const positions = [], indices = [];
  for(let i=0;i<=rows;i++) for(let j=0;j<=cols;j++) {
    const u = THREE.MathUtils.lerp(minX,maxX,j/cols);
    const [lo, hi] = bounds(u);
    const v = THREE.MathUtils.lerp(lo,hi,i/rows);
    const x = cx + u;
    const y = cy + v;
    const arc = Math.max(0, Math.sin(Math.PI * (u + eyeW) / (eyeW * 2)));
    const z = faceZ(x,y) + .011 + .045 * arc * Math.max(.12,1-(v/.08)**2) + offset;
    positions.push(x,y,z);
  }
  for(let i=0;i<rows;i++) for(let j=0;j<cols;j++) {
    const a=i*(cols+1)+j,b=a+cols+1;
    indices.push(a,a+1,b,b,a+1,b+1);
  }
  const geo=new THREE.BufferGeometry();
  geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  geo.setIndex(indices);
  return add(name,geo,mat);
}
const eyeW = .172;
const eyeBounds = u => {
  const t=(u+eyeW)/(eyeW*2), arc=Math.max(0,Math.sin(Math.PI*t));
  return [-.037*arc, .059*arc];
};
for (const s of [-1,1]) {
  const cx=s*.30,cy=2.98;
  eyePatch('Almond eye white',cx,cy,-eyeW,eyeW,eyeBounds,white,0);
  const ir=.060;
  eyePatch('Deep brown iris',cx,cy,-ir,ir,u=>{
    const r=Math.sqrt(Math.max(0,ir*ir-u*u));
    const [a,b]=eyeBounds(u);
    return [Math.max(a,-r+.004),Math.min(b,r+.004)];
  },iris,.002,12,28);
  const pr=.032;
  eyePatch('Dark pupil',cx,cy,-pr,pr,u=>{
    const r=Math.sqrt(Math.max(0,pr*pr-u*u));
    const [a,b]=eyeBounds(u);
    return [Math.max(a,-r+.004),Math.min(b,r+.004)];
  },pupil,.004,10,24);
  ellipsoid('Tiny eye catchlight',[cx-.018,cy+.027,faceZ(cx-.018,cy+.027)+.057],[.008,.008,.004],eyeHighlight,16,12);
  const upper=[],lower=[];
  for(let k=0;k<=20;k++) {
    const u=-eyeW+2*eyeW*k/20;
    const [lo,hi]=eyeBounds(u);
    upper.push([cx+u,cy+hi+.007,faceZ(cx+u,cy+hi+.007)+.021]);
    lower.push([cx+u,cy+lo-.006,faceZ(cx+u,cy+lo-.006)+.021]);
  }
  curveTube('Sculpted upper eyelid',upper,.021,skinSoft,48,10);
  curveTube('Sculpted lower eyelid',lower,.016,skin,48,10);
  curveTube('Fine upper lash line',upper.map(([x,y,z])=>[x,y-.012,z+.010]),.005,brow,48,6);
  // Tapered solid eyebrows: mostly straight with a quiet rise towards the outer third.
  ringMesh('Tapered straight eyebrow',24,10,(t,phi)=> {
    const local=THREE.MathUtils.lerp(-.178,.183,t);
    const x=cx+local;
    const y=3.188+.024*Math.sin(Math.PI*t)-.030*(s>0?t:1-t);
    const radius=.029*Math.sin(Math.PI*t)**.6+.002;
    return [x,y+Math.sin(phi)*radius,faceZ(x,y)+.012+Math.cos(phi)*radius*.48];
  },brow,true,false);
}

// Nose remains part of the face mesh. Only recessed nostril accents are added.
for(const s of [-1,1]) {
  const x=s*.082,y=2.589;
  ellipsoid('Small recessed nostril',[x,y,faceZ(x,y)+.004],[.032,.012,.009],nostril,24,14);
}

function lipPatch(name, isUpper, mat) {
  const positions=[],indices=[],rows=14,cols=48;
  for(let i=0;i<=rows;i++) for(let j=0;j<=cols;j++) {
    const u=j/cols,x=(u-.5)*.468;
    const taper=Math.sin(Math.PI*u)**.85;
    const seam=2.359+.008*Math.cos(x/.234*Math.PI);
    const border=isUpper ? seam + taper*(.041+.014*g(Math.abs(x),.065,.033)-.008*g(x,0,.025)) : seam-.054*taper;
    const t=i/rows,y=THREE.MathUtils.lerp(seam,border,t);
    const z=faceZ(x,y)+.008+.023*taper*Math.sin(Math.PI*t);
    positions.push(x,y,z);
  }
  for(let i=0;i<rows;i++) for(let j=0;j<cols;j++) {
    const a=i*(cols+1)+j,b=a+cols+1;
    if(isUpper) indices.push(a,a+1,b,b,a+1,b+1); else indices.push(a,b,a+1,b,b+1,a+1);
  }
  const geo=new THREE.BufferGeometry();
  geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  geo.setIndex(indices);
  add(name,geo,mat);
}
lipPatch('Quiet cupid bow',true,lipUpper);
lipPatch('Soft lower lip',false,lipLower);
const mouth=[];
for(let i=0;i<=24;i++) {
  const x=(i/24-.5)*.459,y=2.359+.008*Math.cos(x/.234*Math.PI);
  mouth.push([x,y,faceZ(x,y)+.011]);
}
curveTube('Closed relaxed mouth line',mouth,.0055,crease,48,6);

// A complete asymmetric hair shell closes the back of the skull. Front locks are
// flattened tapered volumes following the shell, sculpted like an animation maquette.
function hairPoint(t,phi) {
  const front=Math.max(0,Math.cos(phi));
  const back=Math.max(0,-Math.cos(phi));
  const rim=1.78-.56*front+.32*back;
  const theta=t*rim;
  const swell=.015*Math.sin(phi*5+theta*2)*Math.sin(theta)**2;
  return [(.775+swell)*Math.sin(theta)*Math.sin(phi),3.30+.89*Math.cos(theta),(.697+swell)*Math.sin(theta)*Math.cos(phi)-.014];
}
ringMesh('Continuous swept hair shell',44,96,(t,phi)=>hairPoint(t,phi),hair,false,false);
function hairLock(name,points,width,thickness,mat) {
  const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));
  ringMesh(name,30,12,(t,phi)=>{
    const p=curve.getPoint(t),dir=curve.getTangent(t).normalize();
    const outward=new THREE.Vector3(p.x/.775,(p.y-3.3)/.89,p.z/.70).normalize();
    const side=new THREE.Vector3().crossVectors(dir,outward).normalize();
    const normal=new THREE.Vector3().crossVectors(side,dir).normalize();
    if(normal.dot(outward)<0) normal.negate();
    const taper=.10+.90*Math.sin(Math.PI*t)**.65;
    p.addScaledVector(side,Math.cos(phi)*width*taper);
    p.addScaledVector(normal,Math.sin(phi)*thickness*taper+.008);
    return p.toArray();
  },mat,true,false);
}
// Broad flow leaves a soft off-center part, with two longer forelocks framing the forehead.
for(const side of [-1,1]) for(let i=0;i<6;i++) {
  const u=i/5;
  const xStart=.045+side*(.06+.54*u);
  const yStart=3.66-.21*u;
  const zStart=.65-.29*u*u;
  const xMid=side*(.24+.38*u);
  hairLock('Swept front sculpted lock',[
    [xStart,yStart,zStart],
    [xMid,3.88-.14*u,.53-.26*u],
    [side*(.16+.37*u),4.10-.20*u,.26-.16*u],
    [side*(.08+.27*u),4.04-.14*u,-.19],
  ],.082+.018*(1-u),.026, i%3===0 ? hairLight : hair);
}
for(const side of [-1,1]) for(let i=0;i<5;i++) {
  const u=i/4;
  hairLock('Side hair flow',[
    [side*(.68+.032*u),3.07+.23*u,.12+.12*u],
    [side*(.76-.013*u),3.49+.04*u,.13-.05*u],
    [side*(.57-.06*u),3.92,.0-.16*u],
    [side*.25,4.09,-.17-.05*u],
  ],.049,.022,i%3===0?hairLight:hair);
}
// Small sideburn tapers attach the hairstyle to the temples.
for(const side of [-1,1]) {
  ellipsoid('Short tapered sideburn',[side*.676,3.09,.080],[.038,.154,.125],hairShadow,28,24);
}
// Reduce the visible neck without compressing the sculpted facial proportions.
for(const mesh of root.children)if(mesh.name!=='Neck and nape')mesh.geometry.translate(0,-.20,0);

// Rounded shoulder and upper chest shell, with a finished flat bust cut.
const torsoProfile=[
  [0,1.20,.50],[.08,1.28,.53],[.36,1.33,.55],[.67,1.36,.53],
  [.92,1.32,.48],[1.10,1.20,.43],[1.28,.87,.39],[1.45,.54,.34],[1.52,.37,.31],
];
ringMesh('Complete jacket torso and shoulders',38,88,(v,phi)=>{
  const y=v*1.52,w=interpolate(torsoProfile,y,1),d=interpolate(torsoProfile,y,2);
  return [w*Math.sin(phi),y,d*Math.cos(phi)-.055];
},jacket);

function solidPatch(name,points,depth,mat) {
  const shape=new THREE.Shape();
  points.forEach(([x,y],i)=>i===0?shape.moveTo(x,y):shape.lineTo(x,y));
  shape.closePath();
  const geo=new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:.012,bevelThickness:.012,curveSegments:12});
  // Points carry a front z as the third value. Warp the extrusion to a soft chest curve.
  const pos=geo.attributes.position;
  for(let i=0;i<pos.count;i++) {
    const x=pos.getX(i),y=pos.getY(i);
    const dz=.51-.105*Math.abs(x)-.018*(y-.75)**2;
    pos.setZ(i,pos.getZ(i)+dz);
  }
  return add(name,geo,mat);
}
solidPatch('Visible shirt chest',[[-.36,1.59],[.36,1.59],[.28,.78],[.10,.11],[-.08,.10],[-.29,.78]],.026,shirt);
// Collar sits ahead of the neck and has distinct folded planes, like a dress shirt.
for(const s of [-1,1]) {
  solidPatch('White shirt collar wing',[[s*.035,1.50],[s*.33,1.73],[s*.43,1.44],[s*.28,1.10]],.053,shirt);
  solidPatch('Folded blue jacket collar',[[s*.35,1.70],[s*.68,1.50],[s*.89,.99],[s*.53,1.01],[s*.29,.52],[s*.19,.27],[s*.30,1.32]],.055,lapel);
  // A restrained shoulder topstitch and chest pocket convey the garment's structure.
  curveTube('Shoulder seam',[[s*.74,1.26,.35],[s*1.0,1.17,.28],[s*1.21,1.00,.22]],.008,stitch,32,6);
  solidPatch('Jacket chest pocket welt',[[s*.67,.70],[s*1.04,.70],[s*1.03,.66],[s*.66,.66]],.011,lapel);
  curveTube('Pocket lower stitch',[[s*.67,.64,.441],[s*.85,.638,.415],[s*1.03,.64,.39]],.004,stitch,26,6);
}
// Button placket and quiet folds avoid an empty blank shirt panel.
solidPatch('Shirt button placket',[[-.024,.94],[.043,.94],[.07,.16],[.0,.13]],.036,shirtShade);
for(const y of [.77,.49,.22]) {
  const b=ellipsoid('Small shirt button',[.024,y,.577],[.029,.029,.012],button,24,12);
  for(const s of [-1,1]) ellipsoid('Button sewn hole',[.024+s*.009,y,.59],[.003,.005,.002],jacket,10,8);
}
curveTube('Left jacket opening',[[-.20,.10,.54],[-.33,.49,.538],[-.43,.77,.515]],.010,lapel,32,8);
curveTube('Right jacket opening',[[.21,.10,.54],[.36,.49,.532],[.49,.77,.51]],.010,lapel,32,8);

root.updateMatrixWorld(true);
let vertices=0,triangles=0;
root.traverse(obj=>{
  if(!obj.isMesh)return;
  const p=obj.geometry.attributes.position,n=obj.geometry.attributes.normal;
  for(const attr of [p,n]) for(const x of attr.array) if(!Number.isFinite(x)) throw new Error(`Nonfinite geometry: ${obj.name}`);
  vertices+=p.count;
  triangles+=(obj.geometry.index?.count??p.count)/3;
});
const bounds=new THREE.Box3().setFromObject(root);
const exporter=new GLTFExporter();
const buffer=await exporter.parseAsync(root,{binary:true,onlyVisible:true,includeCustomExtensions:false});
const output=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../public/models/portrait.glb');
await fs.mkdir(path.dirname(output),{recursive:true});
await fs.writeFile(output,Buffer.from(buffer));
const bytes=await fs.readFile(output);
if(bytes.readUInt32LE(0)!==0x46546c67||bytes.readUInt32LE(4)!==2||bytes.readUInt32LE(8)!==bytes.length)throw new Error('Invalid GLB header');
const jsonLength=bytes.readUInt32LE(12);
const gltf=JSON.parse(bytes.subarray(20,20+jsonLength).toString('utf8').trim());
if(!gltf.meshes?.length||!gltf.accessors?.length)throw new Error('Missing mesh data');
console.log(JSON.stringify({output,bytes:bytes.length,meshes:gltf.meshes.length,materials:gltf.materials.length,vertices,triangles,bounds:{min:bounds.min.toArray(),max:bounds.max.toArray()},generator:'Original local Three.js sculpture',photoTextures:0},null,2));
