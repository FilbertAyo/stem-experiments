import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ============ Constants ============
const GRAVITY = 9.81; // m/s²
const BEAM_LENGTH = 1.0; // 1 meter (100cm)
const BEAM_WIDTH = 0.08;
const BEAM_HEIGHT = 0.02;
const PIVOT_HEIGHT = 0.3;
const MAX_TILT_ANGLE = Math.PI / 6; // 30 degrees max tilt

// ============ State ============
let state = {
  mass1: 200, // grams
  dist1: 30,  // cm from pivot
  mass2: 300, // grams
  dist2: 20,  // cm from pivot
  currentAngle: 0,
  targetAngle: 0
};

// ============ Three.js Scene Setup ============
const container = document.getElementById('container');
const sceneEl = document.getElementById('scene');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 0.6, 1.5);
camera.lookAt(0, 0.3, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
sceneEl.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.target.set(0, 0.3, 0);
controls.minDistance = 0.8;
controls.maxDistance = 5;
controls.update();

// ============ Lighting ============
scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 0.8));

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 10, 5);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 50;
directionalLight.shadow.camera.left = -5;
directionalLight.shadow.camera.right = 5;
directionalLight.shadow.camera.top = 5;
directionalLight.shadow.camera.bottom = -5;
scene.add(directionalLight);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

// ============ Materials ============
const beamMaterial = new THREE.MeshStandardMaterial({
  color: 0xc9a45c,
  roughness: 0.6,
  metalness: 0.1
});

const pivotMaterial = new THREE.MeshStandardMaterial({
  color: 0x555555,
  roughness: 0.4,
  metalness: 0.6
});

const mass1Material = new THREE.MeshStandardMaterial({
  color: 0x2563eb,
  roughness: 0.3,
  metalness: 0.4
});

const mass2Material = new THREE.MeshStandardMaterial({
  color: 0xdc2626,
  roughness: 0.3,
  metalness: 0.4
});

const stringMaterial = new THREE.LineBasicMaterial({ color: 0x333333, linewidth: 2 });

const tableMaterial = new THREE.MeshStandardMaterial({
  color: 0x8b7355,
  roughness: 0.8,
  metalness: 0.1
});

// ============ Create Scene Objects ============

// Table/Ground
const tableGeometry = new THREE.BoxGeometry(3, 0.1, 1.5);
const tableMesh = new THREE.Mesh(tableGeometry, tableMaterial);
tableMesh.position.set(0, -0.05, 0);
tableMesh.receiveShadow = true;
scene.add(tableMesh);

// Pivot/Fulcrum (triangular prism) - height should reach the beam
const pivotActualHeight = PIVOT_HEIGHT - BEAM_HEIGHT / 2; // Height to touch bottom of beam
const pivotHalfWidth = 0.08;
const pivotDepth = 0.1;

// Create triangular prism using BufferGeometry for proper vertical orientation
const pivotGeometry = new THREE.BufferGeometry();

// Define the 6 vertices of the triangular prism
const vertices = new Float32Array([
  // Front triangle (z = pivotDepth/2)
  -pivotHalfWidth, 0, pivotDepth / 2,           // 0: bottom left front
  pivotHalfWidth, 0, pivotDepth / 2,            // 1: bottom right front
  0, pivotActualHeight, pivotDepth / 2,         // 2: top front
  
  // Back triangle (z = -pivotDepth/2)
  -pivotHalfWidth, 0, -pivotDepth / 2,          // 3: bottom left back
  pivotHalfWidth, 0, -pivotDepth / 2,           // 4: bottom right back
  0, pivotActualHeight, -pivotDepth / 2,        // 5: top back
]);

// Define faces using indices (two triangles per quad face)
const indices = [
  // Front face
  0, 1, 2,
  // Back face
  4, 3, 5,
  // Bottom face
  3, 4, 1,
  3, 1, 0,
  // Left face
  3, 0, 2,
  3, 2, 5,
  // Right face
  1, 4, 5,
  1, 5, 2
];

pivotGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
pivotGeometry.setIndex(indices);
pivotGeometry.computeVertexNormals();

const pivotMesh = new THREE.Mesh(pivotGeometry, pivotMaterial);
pivotMesh.position.set(0, 0, 0);
pivotMesh.castShadow = true;
pivotMesh.receiveShadow = true;
scene.add(pivotMesh);

// Beam Group (will contain beam, markings, masses)
const beamGroup = new THREE.Group();
beamGroup.position.set(0, PIVOT_HEIGHT, 0);
scene.add(beamGroup);

// Beam (meter rule)
const beamGeometry = new THREE.BoxGeometry(BEAM_LENGTH, BEAM_HEIGHT, BEAM_WIDTH);
const beamMesh = new THREE.Mesh(beamGeometry, beamMaterial);
beamMesh.castShadow = true;
beamMesh.receiveShadow = true;
beamGroup.add(beamMesh);

// Create ruler markings
function createRulerMarkings() {
  const markingsGroup = new THREE.Group();
  
  // Create marks every 10cm
  for (let i = 0; i <= 10; i++) {
    const x = (i - 5) * 0.1; // -0.5 to 0.5
    const isCenter = i === 5;
    const height = isCenter ? 0.015 : 0.008;
    
    const markGeometry = new THREE.BoxGeometry(0.003, height, BEAM_WIDTH * 0.8);
    const markMaterial = new THREE.MeshBasicMaterial({ 
      color: isCenter ? 0x0ea5a4 : 0x333333 
    });
    const mark = new THREE.Mesh(markGeometry, markMaterial);
    mark.position.set(x, BEAM_HEIGHT / 2 + height / 2, 0);
    markingsGroup.add(mark);
    
    // Add number labels
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = isCenter ? '#0ea5a4' : '#333333';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(i * 10, 32, 24);
    
    const texture = new THREE.CanvasTexture(canvas);
    const labelMaterial = new THREE.MeshBasicMaterial({ 
      map: texture, 
      transparent: true,
      side: THREE.DoubleSide
    });
    const labelGeometry = new THREE.PlaneGeometry(0.04, 0.02);
    const label = new THREE.Mesh(labelGeometry, labelMaterial);
    label.position.set(x, BEAM_HEIGHT / 2 + 0.025, BEAM_WIDTH / 2 + 0.001);
    markingsGroup.add(label);
  }
  
  return markingsGroup;
}

const rulerMarkings = createRulerMarkings();
beamGroup.add(rulerMarkings);

// Mass 1 (Left side - Blue)
const mass1Group = new THREE.Group();
const mass1Size = 0.06;
const mass1Geometry = new THREE.BoxGeometry(mass1Size, mass1Size, mass1Size);
const mass1Mesh = new THREE.Mesh(mass1Geometry, mass1Material);
mass1Mesh.castShadow = true;
mass1Group.add(mass1Mesh);

// String for mass 1
const string1Geometry = new THREE.BufferGeometry();
const string1Line = new THREE.Line(string1Geometry, stringMaterial);
mass1Group.add(string1Line);

beamGroup.add(mass1Group);

// Mass 2 (Right side - Red)
const mass2Group = new THREE.Group();
const mass2Size = 0.06;
const mass2Geometry = new THREE.BoxGeometry(mass2Size, mass2Size, mass2Size);
const mass2Mesh = new THREE.Mesh(mass2Geometry, mass2Material);
mass2Mesh.castShadow = true;
mass2Group.add(mass2Mesh);

// String for mass 2
const string2Geometry = new THREE.BufferGeometry();
const string2Line = new THREE.Line(string2Geometry, stringMaterial);
mass2Group.add(string2Line);

beamGroup.add(mass2Group);

// Mass labels
function createMassLabel(text, color) {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = color;
  ctx.font = 'bold 28px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(text, 64, 44);
  
  const texture = new THREE.CanvasTexture(canvas);
  const labelMaterial = new THREE.MeshBasicMaterial({ 
    map: texture, 
    transparent: true,
    side: THREE.DoubleSide
  });
  const labelGeometry = new THREE.PlaneGeometry(0.08, 0.04);
  const label = new THREE.Mesh(labelGeometry, labelMaterial);
  return { label, canvas, ctx, texture };
}

const mass1Label = createMassLabel('M₁', '#2563eb');
mass1Label.label.position.set(0, 0.06, 0);
mass1Group.add(mass1Label.label);

const mass2Label = createMassLabel('M₂', '#dc2626');
mass2Label.label.position.set(0, 0.06, 0);
mass2Group.add(mass2Label.label);

// Distance indicators (arrows on beam)
function createDistanceIndicator(color) {
  const group = new THREE.Group();
  
  // Arrow line
  const lineGeometry = new THREE.BufferGeometry();
  const lineMaterial = new THREE.LineBasicMaterial({ color });
  const line = new THREE.Line(lineGeometry, lineMaterial);
  group.add(line);
  
  // Arrow heads will be added as small cones
  const arrowHeadGeometry = new THREE.ConeGeometry(0.01, 0.02, 8);
  const arrowHeadMaterial = new THREE.MeshBasicMaterial({ color });
  
  const arrowHead1 = new THREE.Mesh(arrowHeadGeometry, arrowHeadMaterial);
  const arrowHead2 = new THREE.Mesh(arrowHeadGeometry, arrowHeadMaterial);
  
  group.add(arrowHead1);
  group.add(arrowHead2);
  
  return { group, line, lineGeometry, arrowHead1, arrowHead2 };
}

const dist1Indicator = createDistanceIndicator(0x2563eb);
dist1Indicator.group.position.set(0, -BEAM_HEIGHT / 2 - 0.03, 0);
beamGroup.add(dist1Indicator.group);

const dist2Indicator = createDistanceIndicator(0xdc2626);
dist2Indicator.group.position.set(0, -BEAM_HEIGHT / 2 - 0.03, 0);
beamGroup.add(dist2Indicator.group);

// ============ Update Functions ============

function updateMassPositions() {
  const d1 = state.dist1 / 100; // Convert cm to m
  const d2 = state.dist2 / 100;
  
  // Mass 1 on left side (negative x)
  const mass1X = -d1;
  mass1Group.position.set(mass1X, -BEAM_HEIGHT / 2 - 0.08, 0);
  
  // Update string 1
  const string1Points = [
    new THREE.Vector3(0, mass1Size / 2 + 0.02, 0),
    new THREE.Vector3(0, mass1Size / 2 + 0.05, 0)
  ];
  string1Line.geometry.setFromPoints(string1Points);
  
  // Mass 2 on right side (positive x)
  const mass2X = d2;
  mass2Group.position.set(mass2X, -BEAM_HEIGHT / 2 - 0.08, 0);
  
  // Update string 2
  const string2Points = [
    new THREE.Vector3(0, mass2Size / 2 + 0.02, 0),
    new THREE.Vector3(0, mass2Size / 2 + 0.05, 0)
  ];
  string2Line.geometry.setFromPoints(string2Points);
  
  // Update mass sizes based on mass value
  const scale1 = 0.5 + (state.mass1 / 500) * 0.8;
  mass1Mesh.scale.set(scale1, scale1, scale1);
  
  const scale2 = 0.5 + (state.mass2 / 500) * 0.8;
  mass2Mesh.scale.set(scale2, scale2, scale2);
  
  // Update distance indicators
  updateDistanceIndicators();
}

function updateDistanceIndicators() {
  const d1 = state.dist1 / 100;
  const d2 = state.dist2 / 100;
  
  // Distance 1 indicator (from center to left mass)
  const points1 = [
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(-d1, 0, 0)
  ];
  dist1Indicator.lineGeometry.setFromPoints(points1);
  
  dist1Indicator.arrowHead1.position.set(0, 0, 0);
  dist1Indicator.arrowHead1.rotation.z = Math.PI / 2;
  
  dist1Indicator.arrowHead2.position.set(-d1, 0, 0);
  dist1Indicator.arrowHead2.rotation.z = -Math.PI / 2;
  
  // Distance 2 indicator (from center to right mass)
  const points2 = [
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(d2, 0, 0)
  ];
  dist2Indicator.lineGeometry.setFromPoints(points2);
  
  dist2Indicator.arrowHead1.position.set(0, 0, 0);
  dist2Indicator.arrowHead1.rotation.z = -Math.PI / 2;
  
  dist2Indicator.arrowHead2.position.set(d2, 0, 0);
  dist2Indicator.arrowHead2.rotation.z = Math.PI / 2;
}

function calculateMoments() {
  // Convert to SI units
  const m1 = state.mass1 / 1000; // kg
  const m2 = state.mass2 / 1000; // kg
  const d1 = state.dist1 / 100;  // m
  const d2 = state.dist2 / 100;  // m
  
  // Force = mass × gravity
  const F1 = m1 * GRAVITY;
  const F2 = m2 * GRAVITY;
  
  // Moment = Force × distance
  const moment1 = F1 * d1; // Anticlockwise (left side)
  const moment2 = F2 * d2; // Clockwise (right side)
  
  return { moment1, moment2, F1, F2 };
}

function calculateTiltAngle() {
  const { moment1, moment2 } = calculateMoments();
  const netMoment = moment2 - moment1; // Positive = clockwise, Negative = anticlockwise
  
  // Calculate angle based on net moment (with damping)
  // More net moment = more tilt
  const momentMagnitude = Math.abs(netMoment);
  const maxMoment = 0.5; // Approximate max moment
  
  let angle = (netMoment / maxMoment) * MAX_TILT_ANGLE;
  angle = Math.max(-MAX_TILT_ANGLE, Math.min(MAX_TILT_ANGLE, angle));
  
  return angle;
}

function updateBeamRotation() {
  state.targetAngle = calculateTiltAngle();
  
  // Smooth interpolation
  const diff = state.targetAngle - state.currentAngle;
  state.currentAngle += diff * 0.1;
  
  beamGroup.rotation.z = state.currentAngle;
}

function updateUI() {
  const { moment1, moment2 } = calculateMoments();
  const diff = Math.abs(moment1 - moment2);
  
  // Update moment displays
  document.getElementById('moment1').textContent = moment1.toFixed(4) + ' N·m';
  document.getElementById('moment2').textContent = moment2.toFixed(4) + ' N·m';
  document.getElementById('momentDiff').textContent = diff.toFixed(4) + ' N·m';
  
  // Update balance status
  const balanceStatus = document.getElementById('balanceStatus');
  const tolerance = 0.001; // 0.001 N·m tolerance
  
  if (diff < tolerance) {
    balanceStatus.textContent = '✓ Balanced';
    balanceStatus.style.color = '#0ea5a4';
  } else if (moment1 > moment2) {
    balanceStatus.textContent = '↶ Tilting Left';
    balanceStatus.style.color = '#2563eb';
  } else {
    balanceStatus.textContent = '↷ Tilting Right';
    balanceStatus.style.color = '#dc2626';
  }
  
  // Color the difference based on balance
  const momentDiffEl = document.getElementById('momentDiff');
  if (diff < tolerance) {
    momentDiffEl.style.color = '#0ea5a4';
  } else {
    momentDiffEl.style.color = '#f59e0b';
  }
}

// ============ Default Camera Settings ============
const DEFAULT_CAMERA_POSITION = { x: 0, y: 0.6, z: 1.5 };
const DEFAULT_CAMERA_TARGET = { x: 0, y: 0.3, z: 0 };

// ============ DOM References ============
const mass1Range = document.getElementById('mass1Range');
const mass1Val = document.getElementById('mass1Val');
const dist1Range = document.getElementById('dist1Range');
const dist1Val = document.getElementById('dist1Val');
const mass2Range = document.getElementById('mass2Range');
const mass2Val = document.getElementById('mass2Val');
const dist2Range = document.getElementById('dist2Range');
const dist2Val = document.getElementById('dist2Val');
const balanceBtn = document.getElementById('balanceBtn');
const resetBtn = document.getElementById('resetBtn');
const resetViewBtn = document.getElementById('resetViewBtn');

// ============ Event Listeners ============
mass1Range.addEventListener('input', () => {
  state.mass1 = parseInt(mass1Range.value);
  mass1Val.textContent = state.mass1 + ' g';
  updateMassPositions();
  updateUI();
});

dist1Range.addEventListener('input', () => {
  state.dist1 = parseInt(dist1Range.value);
  dist1Val.textContent = state.dist1 + ' cm';
  updateMassPositions();
  updateUI();
});

mass2Range.addEventListener('input', () => {
  state.mass2 = parseInt(mass2Range.value);
  mass2Val.textContent = state.mass2 + ' g';
  updateMassPositions();
  updateUI();
});

dist2Range.addEventListener('input', () => {
  state.dist2 = parseInt(dist2Range.value);
  dist2Val.textContent = state.dist2 + ' cm';
  updateMassPositions();
  updateUI();
});

balanceBtn.addEventListener('click', () => {
  // Calculate d2 needed for balance
  // moment1 = moment2
  // m1 * g * d1 = m2 * g * d2
  // d2 = (m1 * d1) / m2
  
  const requiredD2 = (state.mass1 * state.dist1) / state.mass2;
  
  // Clamp to valid range
  const clampedD2 = Math.max(5, Math.min(45, Math.round(requiredD2)));
  
  // Animate to balanced position
  animateToBalance(clampedD2);
});

resetBtn.addEventListener('click', () => {
  state.mass1 = 200;
  state.dist1 = 30;
  state.mass2 = 300;
  state.dist2 = 20;
  
  mass1Range.value = state.mass1;
  mass1Val.textContent = state.mass1 + ' g';
  dist1Range.value = state.dist1;
  dist1Val.textContent = state.dist1 + ' cm';
  mass2Range.value = state.mass2;
  mass2Val.textContent = state.mass2 + ' g';
  dist2Range.value = state.dist2;
  dist2Val.textContent = state.dist2 + ' cm';
  
  updateMassPositions();
  updateUI();
});

// Reset View button - smoothly animate camera back to original position
resetViewBtn.addEventListener('click', () => {
  const duration = 800;
  const startTime = Date.now();
  
  const startPos = {
    x: camera.position.x,
    y: camera.position.y,
    z: camera.position.z
  };
  
  const startTarget = {
    x: controls.target.x,
    y: controls.target.y,
    z: controls.target.z
  };
  
  function animateCamera() {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Ease out cubic for smooth deceleration
    const easeOut = 1 - Math.pow(1 - progress, 3);
    
    // Interpolate camera position
    camera.position.x = startPos.x + (DEFAULT_CAMERA_POSITION.x - startPos.x) * easeOut;
    camera.position.y = startPos.y + (DEFAULT_CAMERA_POSITION.y - startPos.y) * easeOut;
    camera.position.z = startPos.z + (DEFAULT_CAMERA_POSITION.z - startPos.z) * easeOut;
    
    // Interpolate controls target
    controls.target.x = startTarget.x + (DEFAULT_CAMERA_TARGET.x - startTarget.x) * easeOut;
    controls.target.y = startTarget.y + (DEFAULT_CAMERA_TARGET.y - startTarget.y) * easeOut;
    controls.target.z = startTarget.z + (DEFAULT_CAMERA_TARGET.z - startTarget.z) * easeOut;
    
    controls.update();
    
    if (progress < 1) {
      requestAnimationFrame(animateCamera);
    }
  }
  
  animateCamera();
});

function animateToBalance(targetD2) {
  const startD2 = state.dist2;
  const duration = 800;
  const startTime = Date.now();
  
  function animate() {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Ease out cubic
    const easeOut = 1 - Math.pow(1 - progress, 3);
    
    state.dist2 = Math.round(startD2 + (targetD2 - startD2) * easeOut);
    dist2Range.value = state.dist2;
    dist2Val.textContent = state.dist2 + ' cm';
    
    updateMassPositions();
    updateUI();
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  }
  
  animate();
}

// ============ Animation Loop ============
function animate() {
  requestAnimationFrame(animate);
  
  updateBeamRotation();
  controls.update();
  renderer.render(scene, camera);
}

// ============ Window Resize ============
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ============ Initialize ============
function init() {
  updateMassPositions();
  updateUI();
  animate();
}

init();

