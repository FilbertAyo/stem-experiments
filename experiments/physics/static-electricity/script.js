import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// ---------- Material definitions and triboelectric ranking ----------
const materials = {
  glass: { name: "Glass rod", rank: 5, modelPath: "models/glass_rod", color: 0x87ceeb },
  silk: { name: "Silk", rank: 4, modelPath: "models/silk", color: 0xf0f0f0 },
  fur: { name: "Fur", rank: 3, modelPath: "models/fur_patch", color: 0x8b7355 },
  perspex: { name: "Perspex comb", rank: 2, modelPath: "models/comb", color: 0xffffff },
  plastic_pen: { name: "Plastic pen", rank: 1, modelPath: "models/pen.glb", color: 0x333333 },
  ebonite: { name: "Ebonite rod", rank: -1, modelPath: "models/ebonate", color: 0x1a1a1a },
  polythene: { name: "Polythene rod", rank: -2, modelPath: "models/polythene", color: 0xe0e0e0 }
};

// Standard size for all models (normalize to this size)
const STANDARD_MODEL_SIZE = 0.9; // Maximum dimension in units

// State
let state = {
  A: { key: 'plastic_pen', charge: 0 },
  B: { key: 'fur', charge: 0 }
};

// ---------- Three.js Scene Setup ----------
const container = document.getElementById('container');
const sceneEl = document.getElementById('scene');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 1.5, 5);
camera.lookAt(0, 0.5, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
sceneEl.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.target.set(0, 0.5, 0);
controls.update();

// Lights
scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 0.8));
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
directionalLight.position.set(5, 10, 5);
directionalLight.castShadow = true;
scene.add(directionalLight);

// No ground plane or grid - clean background

// ---------- Model Loading ----------
const loader = new GLTFLoader();
const modelCache = {};

// Create fallback geometry for materials without models
function createFallbackGeometry(materialKey) {
  const mat = materials[materialKey];
  let geometry, position;
  
  if (materialKey === 'fur' || materialKey === 'silk') {
    // Flat materials - use plane
    geometry = new THREE.PlaneGeometry(0.3, 0.3);
    position = { x: 0, y: 0.15, z: 0 };
  } else if (materialKey === 'perspex') {
    // Comb - use box
    geometry = new THREE.BoxGeometry(0.2, 0.05, 0.3);
    position = { x: 0, y: 0.1, z: 0 };
  } else {
    // Rods - use cylinder
    geometry = new THREE.CylinderGeometry(0.05, 0.05, 0.5, 16);
    position = { x: 0, y: 0.25, z: 0 };
  }
  
  const material = new THREE.MeshStandardMaterial({ 
    color: mat.color, 
    metalness: 0.1, 
    roughness: 0.7 
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  
  const group = new THREE.Group();
  group.add(mesh);
  group.position.set(position.x, position.y, position.z);
  
  return group;
}

// Normalize model size to standard size
function normalizeModelSize(model) {
  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  const maxDimension = Math.max(size.x, size.y, size.z);
  
  if (maxDimension > 0) {
    const scale = STANDARD_MODEL_SIZE / maxDimension;
    model.scale.set(scale, scale, scale);
  }
  
  // Center the model
  const center = box.getCenter(new THREE.Vector3());
  model.position.sub(center);
  
  return model;
}

// Load model or create fallback
async function loadModel(materialKey) {
  if (modelCache[materialKey]) {
    return modelCache[materialKey].clone();
  }
  
  const mat = materials[materialKey];
  const modelPath = mat.modelPath;
  
  // Try to load GLB/GLTF model - check multiple possible paths
  const possiblePaths = [];
  
  // If path already ends with .glb/.gltf, use it directly
  if (modelPath.endsWith('.glb') || modelPath.endsWith('.gltf')) {
    possiblePaths.push(modelPath);
  } else {
    // Try various GLB file paths
    possiblePaths.push(
      `${modelPath}.glb`,
      `${modelPath}/model.glb`,
      `${modelPath}/scene.glb`,
      `${modelPath}/${materialKey}.glb`,
      `${modelPath}.gltf`,
      `${modelPath}/model.gltf`,
      `${modelPath}/scene.gltf`
    );
  }
  
  // Try each path
  for (const path of possiblePaths) {
    try {
      const gltf = await loader.loadAsync(path);
      const model = gltf.scene.clone();
      model.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      
      // Normalize model size
      normalizeModelSize(model);
      
      modelCache[materialKey] = model;
      return model.clone();
    } catch (error) {
      // Continue to next path
      continue;
    }
  }
  
  // If all paths fail, use fallback
  console.warn(`Failed to load model for ${materialKey}, using fallback`);
  const fallback = createFallbackGeometry(materialKey);
  modelCache[materialKey] = fallback;
  return fallback.clone();
}

// ---------- Object Management ----------
let objectA = null;
let objectB = null;
let objectAGroup = null;
let objectBGroup = null;
let chargeIndicatorA = null;
let chargeIndicatorB = null;
let forceArrow = null;

// Create charge indicator (sphere with color)
function createChargeIndicator(charge) {
  // Only show indicator if there's a charge
  if (charge === 0) {
    return null; // Return null for neutral charge (no indicator)
  }
  
  const radius = 0.15;
  const geometry = new THREE.SphereGeometry(radius, 16, 16);
  let color, emissive;
  
  if (charge > 0) {
    color = 0xdc2626; // red for positive
    emissive = 0x330000;
  } else {
    color = 0x2563eb; // blue for negative
    emissive = 0x000033;
  }
  
  const material = new THREE.MeshStandardMaterial({ 
    color, 
    emissive,
    metalness: 0.3,
    roughness: 0.7
  });
  const sphere = new THREE.Mesh(geometry, material);
  sphere.position.set(0, 0.8, 0);
  return sphere;
}

// Create force arrow
function createForceArrow() {
  const arrowHelper = new THREE.ArrowHelper(
    new THREE.Vector3(0, 0, 1),
    new THREE.Vector3(0, 0.5, 0),
    1,
    0x0ea5a4,
    0.2,
    0.1
  );
  return arrowHelper;
}

// Update object A
async function updateObjectA() {
  if (objectAGroup) {
    scene.remove(objectAGroup);
  }
  
  objectAGroup = new THREE.Group();
  const model = await loadModel(state.A.key);
  model.position.set(0, 0, 0);
  objectAGroup.add(model);
  
  // Remove old charge indicator if it exists
  if (chargeIndicatorA) {
    objectAGroup.remove(chargeIndicatorA);
    chargeIndicatorA = null;
  }
  
  // Only add charge indicator if there's a charge
  chargeIndicatorA = createChargeIndicator(state.A.charge);
  if (chargeIndicatorA) {
    objectAGroup.add(chargeIndicatorA);
  }
  
  // Add label
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#0f1720';
  ctx.font = 'bold 20px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(materials[state.A.key].name, 128, 40);
  const texture = new THREE.CanvasTexture(canvas);
  const label = new THREE.Mesh(
    new THREE.PlaneGeometry(0.8, 0.2),
    new THREE.MeshBasicMaterial({ map: texture, transparent: true })
  );
  label.position.set(0, 1.2, 0);
  objectAGroup.add(label);
  
  scene.add(objectAGroup);
  objectA = objectAGroup;
}

// Update object B
async function updateObjectB() {
  if (objectBGroup) {
    scene.remove(objectBGroup);
  }
  
  objectBGroup = new THREE.Group();
  const model = await loadModel(state.B.key);
  model.position.set(0, 0, 0);
  objectBGroup.add(model);
  
  // Remove old charge indicator if it exists
  if (chargeIndicatorB) {
    objectBGroup.remove(chargeIndicatorB);
    chargeIndicatorB = null;
  }
  
  // Only add charge indicator if there's a charge
  chargeIndicatorB = createChargeIndicator(state.B.charge);
  if (chargeIndicatorB) {
    objectBGroup.add(chargeIndicatorB);
  }
  
  // Add label
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#0f1720';
  ctx.font = 'bold 20px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(materials[state.B.key].name, 128, 40);
  const texture = new THREE.CanvasTexture(canvas);
  const label = new THREE.Mesh(
    new THREE.PlaneGeometry(0.8, 0.2),
    new THREE.MeshBasicMaterial({ map: texture, transparent: true })
  );
  label.position.set(0, 1.2, 0);
  objectBGroup.add(label);
  
  scene.add(objectBGroup);
  objectB = objectBGroup;
}

// ---------- DOM References ----------
const objA = document.getElementById('objA');
const objB = document.getElementById('objB');
const rubBtn = document.getElementById('rubBtn');
const reverseRub = document.getElementById('reverseRub');
const resetBtn = document.getElementById('resetBtn');
const distRange = document.getElementById('distRange');
const distVal = document.getElementById('distVal');
const chargeA = document.getElementById('chargeA');
const chargeB = document.getElementById('chargeB');
const descA = document.getElementById('descA');
const descB = document.getElementById('descB');
const visA = document.getElementById('visA');
const visB = document.getElementById('visB');
const lastAction = document.getElementById('lastAction');

// Initialize selects
objA.value = state.A.key;
objB.value = state.B.key;

// Event listeners
objA.addEventListener('change', async () => {
  state.A.key = objA.value;
  state.A.charge = 0;
  await updateObjectA();
  updateUI();
  computeForce();
});

objB.addEventListener('change', async () => {
  state.B.key = objB.value;
  state.B.charge = 0;
  await updateObjectB();
  updateUI();
  computeForce();
});

rubBtn.addEventListener('click', () => doRub('A', 'B'));
reverseRub.addEventListener('click', () => doRub('B', 'A'));
resetBtn.addEventListener('click', async () => {
  // Reset charges
  state.A.charge = 0;
  state.B.charge = 0;
  
  // Stop any ongoing rubbing animation
  isRubbing = false;
  
  // Remove force arrows
  if (forceArrow) {
    scene.remove(forceArrow);
    forceArrow = null;
  }
  
  // Update objects (this will remove charge indicators)
  await updateObjectA();
  await updateObjectB();
  
  // Restore object positions to match current distance
  const distance = parseFloat(distRange.value);
  updateObjectPositions(distance);
  
  // Reset rotations
  if (objectAGroup) {
    objectAGroup.rotation.y = 0;
  }
  if (objectBGroup) {
    objectBGroup.rotation.y = 0;
  }
  
  // Update UI
  updateUI();
  lastAction.textContent = 'Reset';
  computeForce();
});

distRange.addEventListener('input', () => {
  const dist = parseFloat(distRange.value);
  distVal.textContent = dist.toFixed(1) + 'm';
  updateObjectPositions(dist);
  computeForce();
});

// ---------- Rubbing Animation ----------
let isRubbing = false;

// Store original positions for each object
let originalPositionA = null;
let originalPositionB = null;

function animateRubbing(primary, secondary) {
  if (isRubbing) return;
  isRubbing = true;
  
  const primaryGroup = primary === 'A' ? objectAGroup : objectBGroup;
  const secondaryGroup = secondary === 'A' ? objectAGroup : objectBGroup;
  
  if (!primaryGroup || !secondaryGroup) {
    isRubbing = false;
    return;
  }
  
  // Store original positions before animation starts
  const originalDistance = parseFloat(distRange.value);
  originalPositionA = -originalDistance / 2;
  originalPositionB = originalDistance / 2;
  
  const primaryOriginal = primary === 'A' ? originalPositionA : originalPositionB;
  const secondaryOriginal = secondary === 'A' ? originalPositionA : originalPositionB;
  
  // Animation parameters
  const rubDuration = 800; // Rubbing phase duration
  const returnDuration = 600; // Return phase duration (longer for smoother return)
  const totalDuration = rubDuration + returnDuration;
  const startTime = Date.now();
  const rubDistance = 0.3; // How close they get during rubbing
  const rubCycles = 3; // Number of back-and-forth motions
  
  // Capture positions at end of rubbing for smooth return
  let rubEndPrimaryX = 0;
  let rubEndSecondaryX = 0;
  
  function animate() {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / totalDuration, 1);
    const rubProgress = Math.min(elapsed / rubDuration, 1);
    const returnProgress = Math.max(0, (elapsed - rubDuration) / returnDuration);
    
    if (progress < 1) {
      if (elapsed < rubDuration) {
        // Rubbing phase: objects move closer and rub
        const cycleProgress = (rubProgress * rubCycles) % 1;
        const rubOffset = Math.sin(cycleProgress * Math.PI * 2) * rubDistance * 0.5;
        
        // Move objects closer and create rubbing motion
        const midPoint = 0;
        const targetDistance = originalDistance * 0.3; // Get closer during rubbing
        
        primaryGroup.position.x = midPoint - targetDistance / 2 + rubOffset;
        secondaryGroup.position.x = midPoint + targetDistance / 2 - rubOffset;
        
        // Store end positions for smooth return
        rubEndPrimaryX = primaryGroup.position.x;
        rubEndSecondaryX = secondaryGroup.position.x;
        
        // Add slight rotation for visual effect
        primaryGroup.rotation.y = Math.sin(cycleProgress * Math.PI * 2) * 0.2;
        secondaryGroup.rotation.y = Math.sin(cycleProgress * Math.PI * 2 + Math.PI) * 0.2;
      } else {
        // Return phase: smoothly return to original positions
        // Smooth interpolation using ease out cubic
        const easeOut = 1 - Math.pow(1 - returnProgress, 3);
        
        // Lerp from rub end position to original position
        primaryGroup.position.x = rubEndPrimaryX + (primaryOriginal - rubEndPrimaryX) * easeOut;
        secondaryGroup.position.x = rubEndSecondaryX + (secondaryOriginal - rubEndSecondaryX) * easeOut;
        
        // Smoothly return rotations to 0
        primaryGroup.rotation.y = 0.2 * (1 - easeOut);
        secondaryGroup.rotation.y = -0.2 * (1 - easeOut);
      }
      
      requestAnimationFrame(animate);
    } else {
      // Ensure final positions are exactly at original positions
      primaryGroup.position.x = primaryOriginal;
      secondaryGroup.position.x = secondaryOriginal;
      primaryGroup.rotation.y = 0;
      secondaryGroup.rotation.y = 0;
      isRubbing = false;
    }
  }
  
  animate();
}

// ---------- Rubbing Logic ----------
async function doRub(primary, secondary) {
  const keyP = state[primary].key;
  const keyS = state[secondary].key;
  
  if (keyP === keyS) {
    lastAction.textContent = 'Same material — no net transfer';
    return;
  }
  
  // Start rubbing animation (non-blocking)
  animateRubbing(primary, secondary);
  
  // Calculate charge transfer
  const pRank = materials[keyP].rank;
  const sRank = materials[keyS].rank;
  const diff = pRank - sRank;
  const base = Math.abs(diff);
  const transfer = Math.max(1, Math.round(base * (1 + Math.random() * 0.6)));
  
  if (diff > 0) {
    state[primary].charge += transfer;
    state[secondary].charge -= transfer;
    lastAction.textContent = `${materials[keyP].name} lost ≈${transfer} µC to ${materials[keyS].name}`;
  } else if (diff < 0) {
    state[primary].charge -= transfer;
    state[secondary].charge += transfer;
    lastAction.textContent = `${materials[keyP].name} gained ≈${transfer} µC from ${materials[keyS].name}`;
  } else {
    const small = Math.round(1 + Math.random() * 2);
    const sign = Math.random() > 0.5 ? 1 : -1;
    state[primary].charge += sign * small;
    state[secondary].charge -= sign * small;
    lastAction.textContent = `Small random charge transfer ≈${small} µC`;
  }
  
  // Clamp charges
  state.A.charge = clamp(state.A.charge, -50, 50);
  state.B.charge = clamp(state.B.charge, -50, 50);
  
  // Update charge indicators after a short delay (during animation)
  setTimeout(async () => {
    await updateObjectA();
    await updateObjectB();
    updateUI();
    computeForce();
  }, 500);
}

// ---------- Force Calculation and Visualization ----------
function updateObjectPositions(distance) {
  if (objectAGroup) {
    objectAGroup.position.x = -distance / 2;
  }
  if (objectBGroup) {
    objectBGroup.position.x = distance / 2;
  }
}

function computeForce() {
  const q1 = state.A.charge;
  const q2 = state.B.charge;
  const d = parseFloat(distRange.value);
  
  // Remove existing force arrow
  if (forceArrow) {
    scene.remove(forceArrow);
    forceArrow = null;
  }
  
  if (q1 === 0 && q2 === 0) {
    return;
  }
  
  const k = 0.08;
  const F = k * (q1 * q2) / (d * d);
  const mag = Math.abs(F);
  
  // Create force arrow between objects
  // For attraction (opposite charges), arrows point toward each other
  // For repulsion (same charges), arrows point away from each other
  const midX = (objectAGroup.position.x + objectBGroup.position.x) / 2;
  const arrowLength = Math.min(1.5, Math.max(0.3, mag * 1.5));
  const arrowColor = (q1 * q2) < 0 ? 0x9ae6b4 : 0xff9d9d; // Green for attract, red for repel
  
  if ((q1 * q2) < 0) {
    // Attraction: arrows point toward center
    // Arrow from A pointing right
    const arrowA = new THREE.ArrowHelper(
      new THREE.Vector3(1, 0, 0),
      new THREE.Vector3(objectAGroup.position.x + 0.3, 0.5, 0),
      arrowLength,
      arrowColor,
      arrowLength * 0.2,
      arrowLength * 0.1
    );
    // Arrow from B pointing left
    const arrowB = new THREE.ArrowHelper(
      new THREE.Vector3(-1, 0, 0),
      new THREE.Vector3(objectBGroup.position.x - 0.3, 0.5, 0),
      arrowLength,
      arrowColor,
      arrowLength * 0.2,
      arrowLength * 0.1
    );
    const group = new THREE.Group();
    group.add(arrowA);
    group.add(arrowB);
    forceArrow = group;
  } else {
    // Repulsion: arrows point away from center
    // Arrow from A pointing left
    const arrowA = new THREE.ArrowHelper(
      new THREE.Vector3(-1, 0, 0),
      new THREE.Vector3(objectAGroup.position.x - 0.3, 0.5, 0),
      arrowLength,
      arrowColor,
      arrowLength * 0.2,
      arrowLength * 0.1
    );
    // Arrow from B pointing right
    const arrowB = new THREE.ArrowHelper(
      new THREE.Vector3(1, 0, 0),
      new THREE.Vector3(objectBGroup.position.x + 0.3, 0.5, 0),
      arrowLength,
      arrowColor,
      arrowLength * 0.2,
      arrowLength * 0.1
    );
    const group = new THREE.Group();
    group.add(arrowA);
    group.add(arrowB);
    forceArrow = group;
  }
  
  scene.add(forceArrow);
}

// ---------- UI Update ----------
function updateUI() {
  descA.textContent = materials[state.A.key].name;
  descB.textContent = materials[state.B.key].name;
  chargeA.textContent = formatCharge(state.A.charge);
  chargeB.textContent = formatCharge(state.B.charge);
  
  setBall(visA, state.A.charge);
  setBall(visB, state.B.charge);
}

function setBall(el, q) {
  el.classList.remove('positive', 'negative', 'neutral');
  if (q > 0) {
    el.classList.add('positive');
    el.textContent = '+' + Math.abs(q);
  } else if (q < 0) {
    el.classList.add('negative');
    el.textContent = '-' + Math.abs(q);
  } else {
    el.classList.add('neutral');
    el.textContent = '0';
  }
}

function formatCharge(q) {
  return q === 0 ? '0 µC' : (q > 0 ? '+' + q : q) + ' µC';
}

function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
}

// ---------- Animation Loop ----------
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

// ---------- Window Resize ----------
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ---------- Initialize ----------
async function init() {
  await updateObjectA();
  await updateObjectB();
  updateObjectPositions(parseFloat(distRange.value));
  updateUI();
  lastAction.textContent = 'No action yet';
  animate();
}

init();

