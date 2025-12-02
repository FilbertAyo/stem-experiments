import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ---------- Scene Setup ----------
const container = document.getElementById('container');
const sceneEl = document.getElementById('scene');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
// Default top view position
camera.position.set(0, 8, 0);
camera.lookAt(0, 0, 0);

// Store original camera position for reset
const originalCameraPosition = new THREE.Vector3(0, 8, 0);
const originalCameraTarget = new THREE.Vector3(0, 0, 0);

// Camera animation state
let isAnimatingCamera = false;
let cameraAnimationStart = null;
let cameraStartPosition = new THREE.Vector3();
let cameraStartTarget = new THREE.Vector3();
const cameraAnimationDuration = 1000; // 1 second

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

  // Magnet dimensions
  const width = 0.4;
  const height = 0.4;
  const poleLength = 0.7;
  const middleLength = 0.2;
  const totalLength = poleLength * 2 + middleLength;

  // North pole (red) - positioned at positive Z
  const northGeo = new THREE.BoxGeometry(width, height, poleLength);
  const northMat = new THREE.MeshStandardMaterial({ 
    color: 0xdc2626, 
    metalness: 0.4, 
    roughness: 0.3 
  });
  const north = new THREE.Mesh(northGeo, northMat);
  north.position.z = (poleLength + middleLength) / 2;
  north.castShadow = true;
  north.receiveShadow = true;
  group.add(north);

  // South pole (blue) - positioned at negative Z
  const southGeo = new THREE.BoxGeometry(width, height, poleLength);
  const southMat = new THREE.MeshStandardMaterial({ 
    color: 0x2563eb, 
    metalness: 0.4, 
    roughness: 0.3 
  });
  const south = new THREE.Mesh(southGeo, southMat);
  south.position.z = -(poleLength + middleLength) / 2;
  south.castShadow = true;
  south.receiveShadow = true;
  group.add(south);

  // Middle connector (dark gray/black)
  const middleGeo = new THREE.BoxGeometry(width, height, middleLength);
  const middleMat = new THREE.MeshStandardMaterial({ 
    color: 0x1e293b, 
    metalness: 0.6, 
    roughness: 0.2 
  });
  const middle = new THREE.Mesh(middleGeo, middleMat);
  middle.castShadow = true;
  middle.receiveShadow = true;
  group.add(middle);

  // Create N label (North pole - red end)
  const canvasN = document.createElement('canvas');
  canvasN.width = 256;
  canvasN.height = 128;
  const ctxN = canvasN.getContext('2d');
  ctxN.fillStyle = '#ffffff';
  ctxN.font = 'bold 72px Arial, sans-serif';
  ctxN.textAlign = 'center';
  ctxN.textBaseline = 'middle';
  ctxN.fillText('N', 128, 64);
  const texN = new THREE.CanvasTexture(canvasN);
  texN.needsUpdate = true;
  const labelN = new THREE.Mesh(
    new THREE.PlaneGeometry(0.35, 0.18),
    new THREE.MeshBasicMaterial({ map: texN, transparent: true })
  );
  labelN.position.set(0, height * 0.6, totalLength / 2 + 0.15);
  labelN.lookAt(0, 10, totalLength / 2 + 0.15); // Face upward
  group.add(labelN);

  // Create S label (South pole - blue end)
  const canvasS = document.createElement('canvas');
  canvasS.width = 256;
  canvasS.height = 128;
  const ctxS = canvasS.getContext('2d');
  ctxS.fillStyle = '#ffffff';
  ctxS.font = 'bold 72px Arial, sans-serif';
  ctxS.textAlign = 'center';
  ctxS.textBaseline = 'middle';
  ctxS.fillText('S', 128, 64);
  const texS = new THREE.CanvasTexture(canvasS);
  texS.needsUpdate = true;
  const labelS = new THREE.Mesh(
    new THREE.PlaneGeometry(0.35, 0.18),
    new THREE.MeshBasicMaterial({ map: texS, transparent: true })
  );
  labelS.position.set(0, height * 0.6, -totalLength / 2 - 0.15);
  labelS.lookAt(0, 10, -totalLength / 2 - 0.15); // Face upward
  group.add(labelS);

  return group;
}

const barMagnet = createBarMagnet();
barMagnet.position.y = 0.15;
magnetGroup.add(barMagnet);

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
  const magnetRot = magnetGroup.rotation.y;
  
  // Calculate position relative to magnet
  const dx = x - magnetPos.x;
  const dz = z - magnetPos.z;
  
  // Rotate coordinates to account for magnet rotation
  const cosRot = Math.cos(-magnetRot);
  const sinRot = Math.sin(-magnetRot);
  const dxRot = dx * cosRot - dz * sinRot;
  const dzRot = dx * sinRot + dz * cosRot;
  
  const dist = Math.sqrt(dx * dx + dz * dz);
  if (dist < 0.1) return { bx: 0, bz: 0, strength: 0 };

  // Fixed magnet strength
  const magStrength = 0.5;

  // Simplified dipole field in rotated coordinate system
  const r3 = dist * dist * dist;
  const bxRot = ((3 * dxRot * dzRot) / r3) * magStrength;
  const bzRot = ((2 * dzRot * dzRot - dxRot * dxRot) / r3) * magStrength;
  
  // Rotate field back to world coordinates
  const bx = bxRot * cosRot - bzRot * sinRot;
  const bz = bxRot * sinRot + bzRot * cosRot;

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

function createFieldLine(startX, startZ, steps = 300) {
  const points = [];
  let x = startX;
  let z = startZ;
  const stepSize = 0.02;

  for (let i = 0; i < steps; i++) {
    points.push(new THREE.Vector3(x, 0.02, z));
    const field = calculateFieldAt(x, z);
    
    // Check if field is too weak
    if (field.strength < 0.003) break;

    const dirX = field.bx / field.strength;
    const dirZ = field.bz / field.strength;

    x += dirX * stepSize;
    z += dirZ * stepSize;

    // Check bounds
    if (Math.abs(x) > 5 || Math.abs(z) > 5) break;
    
    // Stop if we've looped back or reached the opposite pole
    const magnetPos = magnetGroup.position;
    const distToMagnet = Math.sqrt((x - magnetPos.x) ** 2 + (z - magnetPos.z) ** 2);
    if (distToMagnet < 0.2 && i > 20) break; // Reached opposite pole
  }

  if (points.length < 3) return null;

  const group = new THREE.Group();
  
  // Create the curved line
  const curve = new THREE.CatmullRomCurve3(points);
  const segments = Math.max(points.length * 2, 100);
  const geo = new THREE.TubeGeometry(curve, segments, 0.008, 8, false);
  const mat = new THREE.MeshBasicMaterial({ 
    color: 0x000000, // Black lines
    transparent: false,
    side: THREE.DoubleSide
  });
  const lineMesh = new THREE.Mesh(geo, mat);
  group.add(lineMesh);

  // Add arrowheads along the line to show direction (from N to S)
  const arrowSpacing = Math.max(Math.floor(points.length / 12), 3); // About 12 arrows per line
  for (let i = arrowSpacing; i < points.length - arrowSpacing; i += arrowSpacing) {
    const point = points[i];
    const nextPoint = points[Math.min(i + 1, points.length - 1)];
    
    // Calculate direction from current point to next
    const direction = new THREE.Vector3().subVectors(nextPoint, point).normalize();
    
    // Create arrow helper pointing in field direction
    const arrow = new THREE.ArrowHelper(
      direction,
      point,
      0.1, // arrow length
      0x000000, // Black color
      0.05, // head length
      0.04 // head width
    );
    group.add(arrow);
  }

  return group;
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
  const magnetPos = magnetGroup.position;
  const magnetRot = magnetGroup.rotation.y;
  
  // Calculate pole positions accounting for rotation
  const poleDistance = 0.7; // Distance from center to pole
  const cosRot = Math.cos(magnetRot);
  const sinRot = Math.sin(magnetRot);
  
  // North pole position (red end - positive Z direction)
  const northPoleX = magnetPos.x - sinRot * poleDistance;
  const northPoleZ = magnetPos.z + cosRot * poleDistance;
  
  // South pole position (blue end - negative Z direction)
  const southPoleX = magnetPos.x + sinRot * poleDistance;
  const southPoleZ = magnetPos.z - cosRot * poleDistance;
  
  // Create field lines starting from North pole (higher density near poles)
  const numLinesFromNorth = 20;
  for (let i = 0; i < numLinesFromNorth; i++) {
    const angle = (i / numLinesFromNorth) * Math.PI * 2;
    // Start from a small circle around the North pole
    const radius = 0.15 + (i % 3) * 0.05; // Vary radius for density
    const startX = northPoleX + Math.cos(angle) * radius;
    const startZ = northPoleZ + Math.sin(angle) * radius;

    const line = createFieldLine(startX, startZ);
    if (line) {
      scene.add(line);
      fieldLines.push(line);
    }
  }
  
  // Create additional lines from around the magnet for complete coverage
  const numLinesAround = 16;
  for (let i = 0; i < numLinesAround; i++) {
    const angle = (i / numLinesAround) * Math.PI * 2;
    const radius = 0.4;
    const startX = magnetPos.x + Math.cos(angle) * radius;
    const startZ = magnetPos.z + Math.sin(angle) * radius;

    const line = createFieldLine(startX, startZ);
    if (line) {
      scene.add(line);
      fieldLines.push(line);
    }
  }
}

function refreshVisualization() {
  const mode = document.getElementById('vizMode').value;
  if (ironFilings.length > 0 || compassNeedles.length > 0) {
    clearFieldVisualization();
    if (mode === 'ironFilings') showIronFilings();
    else if (mode === 'compass') showCompassNeedles();
  }
}

// ---------- UI Controls ----------

document.getElementById('showField').addEventListener('click', () => {
  const mode = document.getElementById('vizMode').value;
  if (mode === 'ironFilings') showIronFilings();
  else if (mode === 'compass') showCompassNeedles();
});

// Auto-show compass needles on load (default view)
window.addEventListener('load', () => {
  setTimeout(() => {
    showCompassNeedles();
  }, 500);
});

document.getElementById('clearField').addEventListener('click', () => {
  clearFieldVisualization();
});

document.getElementById('vizMode').addEventListener('change', () => {
  clearFieldVisualization();
});

// Magnet position controls
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

// Reset camera view button with smooth transition
document.getElementById('resetView').addEventListener('click', () => {
  // Store current camera position and target
  cameraStartPosition.copy(camera.position);
  cameraStartTarget.copy(controls.target);
  
  // Start animation
  isAnimatingCamera = true;
  cameraAnimationStart = Date.now();
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
  
  // Handle camera animation
  if (isAnimatingCamera) {
    const elapsed = Date.now() - cameraAnimationStart;
    const progress = Math.min(elapsed / cameraAnimationDuration, 1);
    
    // Use easing function for smooth transition (ease-in-out)
    const easeProgress = progress < 0.5
      ? 2 * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 2) / 2;
    
    // Interpolate camera position
    camera.position.lerpVectors(cameraStartPosition, originalCameraPosition, easeProgress);
    
    // Interpolate camera target
    controls.target.lerpVectors(cameraStartTarget, originalCameraTarget, easeProgress);
    
    // Update controls
    controls.update();
    
    // Stop animation when complete
    if (progress >= 1) {
      isAnimatingCamera = false;
      camera.position.copy(originalCameraPosition);
      controls.target.copy(originalCameraTarget);
      controls.update();
    }
  } else {
    controls.update();
  }
  
  renderer.render(scene, camera);
}

animate();

