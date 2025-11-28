import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Material properties
const MATERIALS = {
  iron: { name: 'Iron Rod', magnetic: true, color: 0x8b7355 },
  cobalt: { name: 'Cobalt Plate', magnetic: true, color: 0x2e5090 },
  nickel: { name: 'Nickel Rod', magnetic: true, color: 0x727472 },
  steel: { name: 'Steel Rod', magnetic: true, color: 0x71797e },
  copper: { name: 'Copper Rod', magnetic: false, color: 0xb87333 },
  wood: { name: 'Piece of Wood', magnetic: false, color: 0x8b4513 },
  glass: { name: 'Glass Block', magnetic: false, color: 0x87ceeb }
};

// ---------- Scene Setup ----------
const container = document.getElementById('container');
const sceneEl = document.getElementById('scene');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(4, 3, 5);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
sceneEl.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.target.set(0, 0, 0);
controls.update();

// Lights
scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 0.8));
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
directionalLight.position.set(5, 10, 5);
directionalLight.castShadow = true;
scene.add(directionalLight);

// Ground plane
const groundGeo = new THREE.PlaneGeometry(8, 8);
const groundMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.8 });
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.position.y = 0;
ground.receiveShadow = true;
scene.add(ground);

// Grid helper
const gridHelper = new THREE.GridHelper(8, 20, 0xd1d8e5, 0xe2e8f0);
gridHelper.position.y = 0.01;
scene.add(gridHelper);

// ---------- Bar Magnet ----------
const magnetGroup = new THREE.Group();
scene.add(magnetGroup);

function createBarMagnet() {
  const group = new THREE.Group();

  // North pole (red)
  const northGeo = new THREE.BoxGeometry(0.3, 0.3, 0.6);
  const northMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, metalness: 0.3, roughness: 0.4 });
  const north = new THREE.Mesh(northGeo, northMat);
  north.position.z = 0.3;
  north.castShadow = true;
  group.add(north);

  // South pole (blue)
  const southGeo = new THREE.BoxGeometry(0.3, 0.3, 0.6);
  const southMat = new THREE.MeshStandardMaterial({ color: 0x2563eb, metalness: 0.3, roughness: 0.4 });
  const south = new THREE.Mesh(southGeo, southMat);
  south.position.z = -0.3;
  south.castShadow = true;
  group.add(south);

  // Middle connector
  const middleGeo = new THREE.BoxGeometry(0.3, 0.3, 0.2);
  const middleMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.5, roughness: 0.3 });
  const middle = new THREE.Mesh(middleGeo, middleMat);
  middle.castShadow = true;
  group.add(middle);

  // Labels
  const canvasN = document.createElement('canvas');
  canvasN.width = 128;
  canvasN.height = 64;
  const ctxN = canvasN.getContext('2d');
  ctxN.fillStyle = '#ffffff';
  ctxN.font = 'bold 32px sans-serif';
  ctxN.textAlign = 'center';
  ctxN.fillText('N', 64, 42);
  const texN = new THREE.CanvasTexture(canvasN);
  const labelN = new THREE.Mesh(
    new THREE.PlaneGeometry(0.2, 0.1),
    new THREE.MeshBasicMaterial({ map: texN, transparent: true })
  );
  labelN.position.set(0, 0.2, 0.6);
  group.add(labelN);

  const canvasS = document.createElement('canvas');
  canvasS.width = 128;
  canvasS.height = 64;
  const ctxS = canvasS.getContext('2d');
  ctxS.fillStyle = '#ffffff';
  ctxS.font = 'bold 32px sans-serif';
  ctxS.textAlign = 'center';
  ctxS.fillText('S', 64, 42);
  const texS = new THREE.CanvasTexture(canvasS);
  const labelS = new THREE.Mesh(
    new THREE.PlaneGeometry(0.2, 0.1),
    new THREE.MeshBasicMaterial({ map: texS, transparent: true })
  );
  labelS.position.set(0, 0.2, -0.6);
  group.add(labelS);

  return group;
}

const barMagnet = createBarMagnet();
barMagnet.position.y = 0.15;
magnetGroup.add(barMagnet);

// ---------- Test Material Object ----------
let testMaterialObj = null;
let testMaterialType = null;

function createTestMaterial(materialKey) {
  const mat = MATERIALS[materialKey];
  if (!mat) return null;

  const group = new THREE.Group();

  // Create shape based on material type
  let geo, pos;
  if (materialKey === 'cobalt') {
    geo = new THREE.BoxGeometry(0.4, 0.1, 0.4);
    pos = { x: 1.5, y: 0.05, z: 0 };
  } else if (materialKey === 'glass') {
    geo = new THREE.BoxGeometry(0.3, 0.3, 0.3);
    pos = { x: 1.5, y: 0.15, z: 0 };
  } else {
    geo = new THREE.CylinderGeometry(0.08, 0.08, 0.5, 16);
    pos = { x: 1.5, y: 0.25, z: 0 };
  }

  const material = new THREE.MeshStandardMaterial({
    color: mat.color,
    metalness: mat.magnetic ? 0.5 : 0.1,
    roughness: 0.6
  });
  const mesh = new THREE.Mesh(geo, material);
  mesh.castShadow = true;
  group.add(mesh);

  // Label
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#0f1720';
  ctx.font = 'bold 24px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(mat.name, 128, 40);
  const tex = new THREE.CanvasTexture(canvas);
  const label = new THREE.Mesh(
    new THREE.PlaneGeometry(0.6, 0.15),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true })
  );
  label.position.set(0, 0.4, 0);
  group.add(label);

  group.position.set(pos.x, pos.y, pos.z);
  group.userData = { materialKey, magnetic: mat.magnetic };

  return group;
}

// ---------- Magnetic Field Visualization ----------
let ironFilings = [];
let compassNeedles = [];
let fieldLines = [];

function clearFieldVisualization() {
  ironFilings.forEach(f => scene.remove(f));
  compassNeedles.forEach(c => scene.remove(c));
  fieldLines.forEach(l => scene.remove(l));
  ironFilings = [];
  compassNeedles = [];
  fieldLines = [];
}

function calculateFieldAt(x, z) {
  const magnetPos = magnetGroup.position;
  const dx = x - magnetPos.x;
  const dz = z - magnetPos.z;
  const dist = Math.sqrt(dx * dx + dz * dz);
  if (dist < 0.1) return { bx: 0, bz: 0, strength: 0 };

  const strength = parseFloat(document.getElementById('magnetStrength').value);
  const magStrength = strength * 0.5;

  // Simplified dipole field
  const r3 = dist * dist * dist;
  const bx = ((3 * dx * dz) / r3) * magStrength;
  const bz = ((2 * dz * dz - dx * dx) / r3) * magStrength;

  return { bx, bz, strength: Math.sqrt(bx * bx + bz * bz) };
}

function createIronFiling(x, z) {
  const field = calculateFieldAt(x, z);
  if (field.strength < 0.01) return null;

  const angle = Math.atan2(field.bx, field.bz);
  const length = Math.min(field.strength * 0.3, 0.15);

  const geo = new THREE.CylinderGeometry(0.01, 0.01, length, 8);
  const mat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 });
  const filing = new THREE.Mesh(geo, mat);
  filing.position.set(x, 0.02, z);
  filing.rotation.x = Math.PI / 2;
  filing.rotation.z = angle;

  return filing;
}

function createCompassNeedle(x, z) {
  const field = calculateFieldAt(x, z);
  if (field.strength < 0.01) return null;

  const angle = Math.atan2(field.bx, field.bz);

  const group = new THREE.Group();

  // Needle
  const needleGeo = new THREE.BoxGeometry(0.15, 0.02, 0.02);
  const northMat = new THREE.MeshStandardMaterial({ color: 0xdc2626 });
  const southMat = new THREE.MeshStandardMaterial({ color: 0x2563eb });

  const north = new THREE.Mesh(needleGeo, northMat);
  north.position.x = 0.075;
  group.add(north);

  const south = new THREE.Mesh(needleGeo, southMat);
  south.position.x = -0.075;
  group.add(south);

  // Base
  const baseGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.01, 16);
  const baseMat = new THREE.MeshStandardMaterial({ color: 0x64748b });
  const base = new THREE.Mesh(baseGeo, baseMat);
  base.position.y = -0.005;
  group.add(base);

  group.position.set(x, 0.05, z);
  group.rotation.y = angle;

  return group;
}

function createFieldLine(startX, startZ, steps = 50) {
  const points = [];
  let x = startX;
  let z = startZ;
  const stepSize = 0.05;

  for (let i = 0; i < steps; i++) {
    points.push(new THREE.Vector3(x, 0.01, z));
    const field = calculateFieldAt(x, z);
    if (field.strength < 0.01) break;

    const dirX = field.bx / field.strength;
    const dirZ = field.bz / field.strength;

    x += dirX * stepSize;
    z += dirZ * stepSize;

    // Check bounds
    if (Math.abs(x) > 3 || Math.abs(z) > 3) break;
  }

  if (points.length < 2) return null;

  const curve = new THREE.CatmullRomCurve3(points);
  const geo = new THREE.TubeGeometry(curve, points.length * 2, 0.01, 8, false);
  const mat = new THREE.MeshBasicMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.6 });
  return new THREE.Mesh(geo, mat);
}

function showIronFilings() {
  clearFieldVisualization();
  const spacing = 0.2;
  for (let x = -2.5; x <= 2.5; x += spacing) {
    for (let z = -2.5; z <= 2.5; z += spacing) {
      const filing = createIronFiling(x, z);
      if (filing) {
        scene.add(filing);
        ironFilings.push(filing);
      }
    }
  }
}

function showCompassNeedles() {
  clearFieldVisualization();
  const spacing = 0.4;
  for (let x = -2; x <= 2; x += spacing) {
    for (let z = -2; z <= 2; z += spacing) {
      const needle = createCompassNeedle(x, z);
      if (needle) {
        scene.add(needle);
        compassNeedles.push(needle);
      }
    }
  }
}

function showFieldLines() {
  clearFieldVisualization();
  const numLines = 20;
  for (let i = 0; i < numLines; i++) {
    const angle = (i / numLines) * Math.PI * 2;
    const radius = 0.3;
    const startX = Math.cos(angle) * radius;
    const startZ = Math.sin(angle) * radius;

    const line = createFieldLine(startX, startZ);
    if (line) {
      scene.add(line);
      fieldLines.push(line);
    }
  }
}

function refreshVisualization() {
  const mode = document.getElementById('vizMode').value;
  if (ironFilings.length > 0 || compassNeedles.length > 0 || fieldLines.length > 0) {
    clearFieldVisualization();
    if (mode === 'ironFilings') showIronFilings();
    else if (mode === 'compass') showCompassNeedles();
    else if (mode === 'fieldLines') showFieldLines();
  }
}

// ---------- UI Controls ----------
document.getElementById('materialSelect').addEventListener('change', () => {
  if (testMaterialObj) {
    scene.remove(testMaterialObj);
    testMaterialObj = null;
  }
  testMaterialType = null;
  document.getElementById('testResult').style.display = 'none';
});

document.getElementById('testMaterial').addEventListener('click', () => {
  const materialKey = document.getElementById('materialSelect').value;
  const mat = MATERIALS[materialKey];

  if (testMaterialObj) {
    scene.remove(testMaterialObj);
  }

  testMaterialObj = createTestMaterial(materialKey);
  scene.add(testMaterialObj);

  // Animate attraction if magnetic
  if (mat.magnetic) {
    const startPos = testMaterialObj.position.clone();
    const magnetPos = magnetGroup.position;
    const targetPos = new THREE.Vector3(magnetPos.x + 0.8, startPos.y, magnetPos.z);

    let progress = 0;
    const animate = () => {
      progress += 0.02;
      if (progress < 1) {
        testMaterialObj.position.lerpVectors(startPos, targetPos, progress);
        requestAnimationFrame(animate);
      }
    };
    animate();
  }

  // Show result
  const resultBox = document.getElementById('testResult');
  const resultValue = document.getElementById('materialType');
  resultBox.style.display = 'block';
  resultValue.textContent = mat.magnetic ? 'MAGNETIC' : 'NON-MAGNETIC';
  resultValue.className = 'result-value ' + (mat.magnetic ? 'magnetic' : 'non-magnetic');

  testMaterialType = materialKey;
});

document.getElementById('resetTest').addEventListener('click', () => {
  if (testMaterialObj) {
    scene.remove(testMaterialObj);
    testMaterialObj = null;
  }
  testMaterialType = null;
  document.getElementById('testResult').style.display = 'none';
});

document.getElementById('showField').addEventListener('click', () => {
  const mode = document.getElementById('vizMode').value;
  if (mode === 'ironFilings') showIronFilings();
  else if (mode === 'compass') showCompassNeedles();
  else if (mode === 'fieldLines') showFieldLines();
});

document.getElementById('clearField').addEventListener('click', () => {
  clearFieldVisualization();
});

document.getElementById('vizMode').addEventListener('change', () => {
  clearFieldVisualization();
});

document.getElementById('magnetStrength').addEventListener('input', (e) => {
  document.getElementById('strengthVal').textContent = parseFloat(e.target.value).toFixed(1) + 'x';
  refreshVisualization();
});

document.getElementById('magnetX').addEventListener('input', (e) => {
  magnetGroup.position.x = parseFloat(e.target.value);
  document.getElementById('magnetXVal').textContent = parseFloat(e.target.value).toFixed(1);
  refreshVisualization();
});

document.getElementById('magnetZ').addEventListener('input', (e) => {
  magnetGroup.position.z = parseFloat(e.target.value);
  document.getElementById('magnetZVal').textContent = parseFloat(e.target.value).toFixed(1);
  refreshVisualization();
});

document.getElementById('magnetRot').addEventListener('input', (e) => {
  magnetGroup.rotation.y = (parseFloat(e.target.value) * Math.PI) / 180;
  document.getElementById('magnetRotVal').textContent = e.target.value + '°';
  refreshVisualization();
});

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();

