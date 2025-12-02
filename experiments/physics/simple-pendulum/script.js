import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ============ Constants ============
const G = 9.81; // m/s² (what we're trying to measure)
const PIVOT_HEIGHT = 1.5; // Height of pivot point (increased for better visibility)
const BOB_RADIUS = 0.12; // Radius of pendulum bob (increased for visibility)
const STRING_THICKNESS = 0.015; // Increased for visibility

// ============ State ============
let state = {
  length: 50, // cm
  initialAngle: 5, // degrees
  angle: 0, // radians
  angularVelocity: 0,
  angularAcceleration: 0,
  isRunning: false,
  startTime: 0,
  lastCrossTime: 0,
  oscillations: 0,
  elapsedTime: 0,
  lastAngle: 0, // For detecting zero crossings
  dataPoints: [] // Array of {length, period, periodSquared}
};

// ============ Three.js Scene Setup ============
const container = document.getElementById('container');
const sceneEl = document.getElementById('scene');

if (!sceneEl) {
  console.error('ERROR: Scene element not found! Make sure #scene div exists in HTML.');
}

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xe8e8e8);

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 1.5, 3);
camera.lookAt(0, 1, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.domElement.style.display = 'block';
renderer.domElement.style.width = '100%';
renderer.domElement.style.height = '100%';

if (sceneEl) {
  sceneEl.appendChild(renderer.domElement);
  console.log('Renderer canvas appended to scene element');
} else {
  console.error('ERROR: Cannot append renderer - scene element not found');
}

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.target.set(0, 1, 0);
controls.minDistance = 1.5;
controls.maxDistance = 8;
controls.update();

// ============ Lighting ============
const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x888888, 1.5);
scene.add(hemisphereLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
directionalLight.position.set(5, 10, 7);
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

const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

// ============ Materials ============
const stringMaterial = new THREE.MeshStandardMaterial({
  color: 0x333333,
  roughness: 0.8,
  metalness: 0.1
});

const bobMaterial = new THREE.MeshStandardMaterial({
  color: 0x2563eb,
  roughness: 0.3,
  metalness: 0.4
});

const pivotMaterial = new THREE.MeshStandardMaterial({
  color: 0x555555,
  roughness: 0.4,
  metalness: 0.6
});

const standMaterial = new THREE.MeshStandardMaterial({
  color: 0x8b7355,
  roughness: 0.8,
  metalness: 0.1
});

const groundMaterial = new THREE.MeshStandardMaterial({
  color: 0x8b7355,
  roughness: 0.8,
  metalness: 0.1
});

// ============ Create Scene Objects ============

// Stand/Support
const standGroup = new THREE.Group();

// Vertical post (made thicker for visibility)
const postGeometry = new THREE.CylinderGeometry(0.05, 0.05, PIVOT_HEIGHT, 16);
const postMesh = new THREE.Mesh(postGeometry, standMaterial);
postMesh.position.set(0, PIVOT_HEIGHT / 2, 0);
postMesh.castShadow = true;
standGroup.add(postMesh);

// Horizontal support (made thicker for visibility)
const supportGeometry = new THREE.BoxGeometry(0.5, 0.05, 0.05);
const supportMesh = new THREE.Mesh(supportGeometry, standMaterial);
supportMesh.position.set(0, PIVOT_HEIGHT, 0);
supportMesh.castShadow = true;
standGroup.add(supportMesh);

scene.add(standGroup);

// Pivot point (made larger for visibility)
const pivotGeometry = new THREE.SphereGeometry(0.04, 16, 16);
const pivotMesh = new THREE.Mesh(pivotGeometry, pivotMaterial);
pivotMesh.position.set(0, PIVOT_HEIGHT, 0);
pivotMesh.castShadow = true;
scene.add(pivotMesh);

// Pendulum Group (string + bob)
const pendulumGroup = new THREE.Group();
pendulumGroup.position.set(0, PIVOT_HEIGHT, 0);
scene.add(pendulumGroup);

// String
const stringGeometry = new THREE.CylinderGeometry(STRING_THICKNESS, STRING_THICKNESS, 1, 8);
const stringMesh = new THREE.Mesh(stringGeometry, stringMaterial);
stringMesh.position.set(0, -0.5, 0);
stringMesh.castShadow = true;
stringMesh.receiveShadow = true;
pendulumGroup.add(stringMesh);

// Bob
const bobGeometry = new THREE.SphereGeometry(BOB_RADIUS, 16, 16);
const bobMesh = new THREE.Mesh(bobGeometry, bobMaterial);
bobMesh.position.set(0, -1, 0);
bobMesh.castShadow = true;
bobMesh.receiveShadow = true;
pendulumGroup.add(bobMesh);

// Reference line (vertical line to help count oscillations)
const referenceLineGeometry = new THREE.BufferGeometry();
const referenceLineMaterial = new THREE.LineDashedMaterial({
  color: 0x0ea5a4,
  linewidth: 2,
  dashSize: 0.05,
  gapSize: 0.02
});
const referenceLine = new THREE.Line(referenceLineGeometry, referenceLineMaterial);
referenceLine.position.set(0, PIVOT_HEIGHT, 0);
scene.add(referenceLine);

// Update reference line
const refLinePoints = [
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(0, -1.5, 0)
];
referenceLineGeometry.setFromPoints(refLinePoints);
referenceLineGeometry.computeLineDistances();
referenceLine.visible = true;

// Ground/Table (made larger)
const groundGeometry = new THREE.PlaneGeometry(6, 6);
const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
groundMesh.rotation.x = -Math.PI / 2;
groundMesh.position.y = 0;
groundMesh.receiveShadow = true;
scene.add(groundMesh);

// Add grid helper for debugging
const gridHelper = new THREE.GridHelper(6, 10, 0x888888, 0xcccccc);
gridHelper.position.y = 0.01;
scene.add(gridHelper);

// Add axes helper for debugging
const axesHelper = new THREE.AxesHelper(2);
axesHelper.position.y = 0.1;
scene.add(axesHelper);

// Length indicator
function createLengthIndicator() {
  const group = new THREE.Group();
  
  // Arrow line
  const lineGeometry = new THREE.BufferGeometry();
  const lineMaterial = new THREE.LineBasicMaterial({ color: 0x0ea5a4 });
  const line = new THREE.Line(lineGeometry, lineMaterial);
  group.add(line);
  
  // Arrow head
  const arrowHeadGeometry = new THREE.ConeGeometry(0.01, 0.02, 8);
  const arrowHeadMaterial = new THREE.MeshBasicMaterial({ color: 0x0ea5a4 });
  const arrowHead = new THREE.Mesh(arrowHeadGeometry, arrowHeadMaterial);
  group.add(arrowHead);
  
  return { group, line, lineGeometry, arrowHead };
}

const lengthIndicator = createLengthIndicator();
lengthIndicator.group.position.set(0.15, PIVOT_HEIGHT, 0);
scene.add(lengthIndicator.group);

// Add a test cube to verify scene is rendering (can be removed later)
const testGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
const testMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const testCube = new THREE.Mesh(testGeometry, testMaterial);
testCube.position.set(0, PIVOT_HEIGHT + 0.3, 0);
scene.add(testCube);
console.log('Test cube added at position:', testCube.position);

console.log('Scene setup complete. Total objects in scene:', scene.children.length);
console.log('Scene children:', scene.children.map(c => c.type || c.constructor.name));

// ============ Physics ============

function updatePendulumPhysics(deltaTime) {
  if (!state.isRunning) return;
  
  const L = state.length / 100; // Convert cm to meters
  const g = G;
  
  // More accurate: use full equation with damping
  const damping = 0.001; // Small damping factor
  state.angularAcceleration = -(g / L) * Math.sin(state.angle) - damping * state.angularVelocity;
  
  // Update velocity and angle using Euler integration
  state.angularVelocity += state.angularAcceleration * deltaTime;
  state.angle += state.angularVelocity * deltaTime;
  
  // Update elapsed time
  state.elapsedTime += deltaTime;
  
  // Detect oscillation: count when pendulum crosses zero going from negative to positive
  if (state.angle >= 0 && state.lastAngle < 0) {
    if (state.lastCrossTime === 0) {
      state.lastCrossTime = state.elapsedTime;
    } else {
      state.oscillations += 1;
    }
  }
  
  state.lastAngle = state.angle;
}

function updatePendulumVisual() {
  const L = state.length / 100; // Convert cm to meters
  
  // Update string length
  stringMesh.scale.y = L;
  stringMesh.position.y = -L / 2;
  
  // Update bob position
  bobMesh.position.set(0, -L, 0);
  
  // Rotate pendulum group around Z axis
  pendulumGroup.rotation.z = state.angle;
  
  // Update length indicator
  const indicatorLength = L;
  const points = [
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, -indicatorLength, 0)
  ];
  lengthIndicator.lineGeometry.setFromPoints(points);
  lengthIndicator.arrowHead.position.set(0, -indicatorLength, 0);
  lengthIndicator.arrowHead.rotation.z = Math.PI;
}

// ============ UI Updates ============

function updateUI() {
  document.getElementById('lengthVal').textContent = state.length + ' cm';
  document.getElementById('angleVal').textContent = state.initialAngle + '°';
  
  document.getElementById('oscillations').textContent = Math.floor(state.oscillations);
  document.getElementById('time').textContent = state.elapsedTime.toFixed(2) + ' s';
  
  if (state.oscillations >= 1) {
    const period = state.elapsedTime / state.oscillations;
    document.getElementById('period').textContent = period.toFixed(3) + ' s';
  } else {
    document.getElementById('period').textContent = '— s';
  }
}

function updateGraph() {
  const canvas = document.getElementById('graphCanvas');
  const ctx = canvas.getContext('2d');
  const width = canvas.width = canvas.offsetWidth * 2;
  const height = canvas.height = canvas.offsetHeight * 2;
  ctx.scale(2, 2);
  
  // Clear
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width / 2, height / 2);
  
  if (state.dataPoints.length < 2) {
    ctx.fillStyle = '#475569';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Need at least 2 data points', width / 4, height / 4);
    return;
  }
  
  // Find min/max for scaling
  const lengths = state.dataPoints.map(p => p.length);
  const tSquared = state.dataPoints.map(p => p.periodSquared);
  const minL = Math.min(...lengths);
  const maxL = Math.max(...lengths);
  const minT2 = Math.min(...tSquared);
  const maxT2 = Math.max(...tSquared);
  
  const padding = 40;
  const graphWidth = width / 2 - 2 * padding;
  const graphHeight = height / 2 - 2 * padding;
  
  // Draw axes
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, height / 2 - padding);
  ctx.lineTo(width / 2 - padding, height / 2 - padding);
  ctx.stroke();
  
  // Draw labels
  ctx.fillStyle = '#475569';
  ctx.font = '11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('L (cm)', width / 4, height / 2 - 5);
  ctx.save();
  ctx.translate(15, height / 4);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText('T² (s²)', 0, 0);
  ctx.restore();
  
  // Draw grid
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 5; i++) {
    const x = padding + (i / 5) * graphWidth;
    ctx.beginPath();
    ctx.moveTo(x, padding);
    ctx.lineTo(x, height / 2 - padding);
    ctx.stroke();
    
    const y = height / 2 - padding - (i / 5) * graphHeight;
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(width / 2 - padding, y);
    ctx.stroke();
  }
  
  // Draw data points
  ctx.fillStyle = '#2563eb';
  state.dataPoints.forEach(point => {
    const x = padding + ((point.length - minL) / (maxL - minL || 1)) * graphWidth;
    const y = height / 2 - padding - ((point.periodSquared - minT2) / (maxT2 - minT2 || 1)) * graphHeight;
    
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
  });
  
  // Draw best fit line (linear regression)
  if (state.dataPoints.length >= 2) {
    const { slope, intercept } = calculateLinearRegression(
      state.dataPoints.map(p => p.length),
      state.dataPoints.map(p => p.periodSquared)
    );
    
    const x1 = padding;
    const y1 = height / 2 - padding - ((slope * minL + intercept - minT2) / (maxT2 - minT2 || 1)) * graphHeight;
    const x2 = width / 2 - padding;
    const y2 = height / 2 - padding - ((slope * maxL + intercept - minT2) / (maxT2 - minT2 || 1)) * graphHeight;
    
    ctx.strokeStyle = '#0ea5a4';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Calculate and display g
    const g = (4 * Math.PI * Math.PI) / slope;
    const slopeDisplay = (slope * 1000).toFixed(2); // Convert to s²/cm
    
    document.getElementById('slopeValue').textContent = slopeDisplay + ' s²/cm';
    document.getElementById('gValue').textContent = g.toFixed(2) + ' m/s²';
    document.getElementById('resultPanel').style.display = 'block';
  }
}

function calculateLinearRegression(x, y) {
  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  return { slope, intercept };
}

function updateDataTable() {
  const tbody = document.getElementById('dataTableBody');
  tbody.innerHTML = '';
  
  state.dataPoints.forEach((point, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${point.length}</td>
      <td>${point.period.toFixed(3)}</td>
      <td>${point.periodSquared.toFixed(4)}</td>
      <td><button class="delete-btn" data-index="${index}">×</button></td>
    `;
    tbody.appendChild(row);
  });
  
  // Add delete button listeners
  tbody.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = parseInt(e.target.getAttribute('data-index'));
      state.dataPoints.splice(index, 1);
      updateDataTable();
      updateGraph();
    });
  });
}

// ============ Event Listeners ============

const lengthRange = document.getElementById('lengthRange');
const angleRange = document.getElementById('angleRange');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const resetBtn = document.getElementById('resetBtn');
const resetViewBtn = document.getElementById('resetViewBtn');
const recordBtn = document.getElementById('recordBtn');
const clearDataBtn = document.getElementById('clearDataBtn');

lengthRange.addEventListener('input', () => {
  state.length = parseInt(lengthRange.value);
  if (!state.isRunning) {
    state.angle = (state.initialAngle * Math.PI) / 180;
    state.angularVelocity = 0;
  }
  updatePendulumVisual();
  updateUI();
});

angleRange.addEventListener('input', () => {
  state.initialAngle = parseInt(angleRange.value);
  if (!state.isRunning) {
    state.angle = (state.initialAngle * Math.PI) / 180;
    state.angularVelocity = 0;
  }
  updatePendulumVisual();
  updateUI();
});

startBtn.addEventListener('click', () => {
  if (!state.isRunning) {
    state.isRunning = true;
    state.angle = (state.initialAngle * Math.PI) / 180;
    state.angularVelocity = 0;
    state.startTime = performance.now() / 1000;
    state.lastCrossTime = 0;
    state.oscillations = 0;
    state.elapsedTime = 0;
    state.lastAngle = state.angle;
    startBtn.disabled = true;
    stopBtn.disabled = false;
  }
});

stopBtn.addEventListener('click', () => {
  state.isRunning = false;
  startBtn.disabled = false;
  stopBtn.disabled = true;
});

resetBtn.addEventListener('click', () => {
  state.isRunning = false;
  state.angle = (state.initialAngle * Math.PI) / 180;
  state.angularVelocity = 0;
  state.oscillations = 0;
  state.elapsedTime = 0;
  state.lastCrossTime = 0;
  state.lastAngle = state.angle;
  startBtn.disabled = false;
  stopBtn.disabled = true;
  updatePendulumVisual();
  updateUI();
});

resetViewBtn.addEventListener('click', () => {
  const duration = 800;
  const startTime = Date.now();
  const startPos = { x: camera.position.x, y: camera.position.y, z: camera.position.z };
  const startTarget = { x: controls.target.x, y: controls.target.y, z: controls.target.z };
  const defaultPos = { x: 0, y: 1.5, z: 3 };
  const defaultTarget = { x: 0, y: 1, z: 0 };
  
  function animateCamera() {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easeOut = 1 - Math.pow(1 - progress, 3);
    
    camera.position.x = startPos.x + (defaultPos.x - startPos.x) * easeOut;
    camera.position.y = startPos.y + (defaultPos.y - startPos.y) * easeOut;
    camera.position.z = startPos.z + (defaultPos.z - startPos.z) * easeOut;
    
    controls.target.x = startTarget.x + (defaultTarget.x - startTarget.x) * easeOut;
    controls.target.y = startTarget.y + (defaultTarget.y - startTarget.y) * easeOut;
    controls.target.z = startTarget.z + (defaultTarget.z - startTarget.z) * easeOut;
    
    controls.update();
    
    if (progress < 1) {
      requestAnimationFrame(animateCamera);
    }
  }
  
  animateCamera();
});

recordBtn.addEventListener('click', () => {
  if (state.oscillations >= 1 && state.elapsedTime > 0) {
    const period = state.elapsedTime / state.oscillations;
    const periodSquared = period * period;
    
    state.dataPoints.push({
      length: state.length,
      period: period,
      periodSquared: periodSquared
    });
    
    updateDataTable();
    updateGraph();
  }
});

clearDataBtn.addEventListener('click', () => {
  state.dataPoints = [];
  updateDataTable();
  updateGraph();
  document.getElementById('resultPanel').style.display = 'none';
});

// ============ Animation Loop ============

let lastTime = performance.now() / 1000;

function animate() {
  requestAnimationFrame(animate);
  
  const currentTime = performance.now() / 1000;
  const deltaTime = Math.min(currentTime - lastTime, 0.02); // Cap at 20ms
  lastTime = currentTime;
  
  updatePendulumPhysics(deltaTime);
  updatePendulumVisual();
  updateUI();
  controls.update();
  renderer.render(scene, camera);
}

// ============ Window Resize ============
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  updateGraph();
});

// ============ Initialize ============
function init() {
  console.log('=== Initializing pendulum ===');
  console.log('Renderer:', renderer);
  console.log('Camera position:', camera.position);
  console.log('Camera looking at:', camera.getWorldDirection(new THREE.Vector3()));
  console.log('Scene background:', scene.background);
  console.log('Scene children count:', scene.children.length);
  console.log('Stand group children:', standGroup.children.length);
  console.log('Pendulum group children:', pendulumGroup.children.length);
  
  // Set initial angle
  state.angle = (state.initialAngle * Math.PI) / 180;
  state.lastAngle = state.angle;
  
  updatePendulumVisual();
  updateUI();
  updateDataTable();
  updateGraph();
  
  if (stopBtn) {
    stopBtn.disabled = true;
  }
  
  // Render once to verify
  renderer.render(scene, camera);
  console.log('Initial render complete');
  console.log('Canvas dimensions:', renderer.domElement.width, 'x', renderer.domElement.height);
  console.log('Canvas visible:', renderer.domElement.offsetWidth > 0 && renderer.domElement.offsetHeight > 0);
  
  animate();
  console.log('Animation loop started');
}

// Ensure DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing...');
    init();
  });
} else {
  console.log('DOM already ready, initializing...');
  init();
}