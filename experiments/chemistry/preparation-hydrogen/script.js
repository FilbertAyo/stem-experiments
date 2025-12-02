import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ---------- State Management ----------
const state = {
  zincAdded: false,
  hclAdded: false,
  gasCollected: false,
  popTested: false,
  cuoAdded: false,
  heated: false,
  hydrogenPassed: false,
  waterTested: false
};

// ---------- Three.js Scene Setup ----------
const container = document.getElementById('container');
const sceneEl = document.getElementById('scene');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf0f4f8);

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 2, 8);
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

// Ground plane
const groundGeometry = new THREE.PlaneGeometry(20, 20);
const groundMaterial = new THREE.MeshStandardMaterial({ color: 0xe8e8e8 });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.position.y = 0;
ground.receiveShadow = true;
scene.add(ground);

// ---------- Lab Equipment Models ----------
let conicalFlask = null;
let thistleFunnel = null;
let gasCollectionTube = null;
let waterTrough = null;
let testTube = null;
let burner = null;
let zincGranules = null;
let cuoPowder = null;
let gasBubbles = [];
let flame = null;
let cobaltPaper = null;

// Create conical flask
function createConicalFlask() {
  const group = new THREE.Group();
  
  // Flask body (truncated cone)
  const flaskGeometry = new THREE.ConeGeometry(0.4, 1.2, 32);
  const flaskMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xffffff, 
    transparent: true, 
    opacity: 0.3,
    side: THREE.DoubleSide
  });
  const flask = new THREE.Mesh(flaskGeometry, flaskMaterial);
  flask.position.y = 0.6;
  flask.castShadow = true;
  group.add(flask);
  
  // Flask outline
  const outlineGeometry = new THREE.ConeGeometry(0.4, 1.2, 32);
  const outlineMaterial = new THREE.MeshBasicMaterial({ 
    color: 0x333333, 
    wireframe: true,
    transparent: true,
    opacity: 0.5
  });
  const outline = new THREE.Mesh(outlineGeometry, outlineMaterial);
  outline.position.y = 0.6;
  group.add(outline);
  
  // Flask neck
  const neckGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.3, 32);
  const neck = new THREE.Mesh(neckGeometry, flaskMaterial);
  neck.position.y = 1.35;
  group.add(neck);
  
  const neckOutline = new THREE.Mesh(neckGeometry, outlineMaterial);
  neckOutline.position.y = 1.35;
  group.add(neckOutline);
  
  group.position.set(-1.5, 0, 0);
  return group;
}

// Create thistle funnel
function createThistleFunnel() {
  const group = new THREE.Group();
  
  const funnelGeometry = new THREE.ConeGeometry(0.25, 0.6, 32);
  const funnelMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xffffff, 
    transparent: true, 
    opacity: 0.3
  });
  const funnel = new THREE.Mesh(funnelGeometry, funnelMaterial);
  funnel.position.y = 1.5;
  group.add(funnel);
  
  const funnelOutline = new THREE.Mesh(funnelGeometry, new THREE.MeshBasicMaterial({ 
    color: 0x333333, 
    wireframe: true,
    transparent: true,
    opacity: 0.5
  }));
  funnelOutline.position.y = 1.5;
  group.add(funnelOutline);
  
  return group;
}

// Create gas collection apparatus
function createGasCollectionApparatus() {
  const group = new THREE.Group();
  
  // Water trough
  const troughGeometry = new THREE.BoxGeometry(1.5, 0.6, 1.5);
  const troughMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x4a90e2, 
    transparent: true, 
    opacity: 0.6
  });
  const trough = new THREE.Mesh(troughGeometry, troughMaterial);
  trough.position.y = 0.3;
  group.add(trough);
  
  // Inverted test tube in water
  const tubeGeometry = new THREE.CylinderGeometry(0.2, 0.2, 1.0, 32);
  const tubeMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xffffff, 
    transparent: true, 
    opacity: 0.3
  });
  const tube = new THREE.Mesh(tubeGeometry, tubeMaterial);
  tube.position.y = 0.8;
  group.add(tube);
  
  const tubeOutline = new THREE.Mesh(tubeGeometry, new THREE.MeshBasicMaterial({ 
    color: 0x333333, 
    wireframe: true,
    transparent: true,
    opacity: 0.5
  }));
  tubeOutline.position.y = 0.8;
  group.add(tubeOutline);
  
  // Delivery tube
  const deliveryGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1.5, 16);
  const deliveryMaterial = new THREE.MeshStandardMaterial({ color: 0x666666 });
  const delivery = new THREE.Mesh(deliveryGeometry, deliveryMaterial);
  delivery.rotation.z = Math.PI / 4;
  delivery.position.set(0.3, 0.5, 0);
  group.add(delivery);
  
  group.position.set(1.5, 0, 0);
  return group;
}

// Create test tube for reduction
function createTestTube() {
  const group = new THREE.Group();
  
  const tubeGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.8, 32);
  const tubeMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xffffff, 
    transparent: true, 
    opacity: 0.3
  });
  const tube = new THREE.Mesh(tubeGeometry, tubeMaterial);
  tube.position.y = 0.4;
  group.add(tube);
  
  const tubeOutline = new THREE.Mesh(tubeGeometry, new THREE.MeshBasicMaterial({ 
    color: 0x333333, 
    wireframe: true,
    transparent: true,
    opacity: 0.5
  }));
  tubeOutline.position.y = 0.4;
  group.add(tubeOutline);
  
  group.position.set(0, 0, -1.5);
  return group;
}

// Create burner
function createBurner() {
  const group = new THREE.Group();
  
  const baseGeometry = new THREE.CylinderGeometry(0.2, 0.25, 0.3, 32);
  const baseMaterial = new THREE.MeshStandardMaterial({ color: 0x444444 });
  const base = new THREE.Mesh(baseGeometry, baseMaterial);
  base.position.y = 0.15;
  group.add(base);
  
  group.position.set(0, 0, -1.5);
  return group;
}

// Create zinc granules
function createZincGranules() {
  const group = new THREE.Group();
  
  for (let i = 0; i < 15; i++) {
    const size = 0.03 + Math.random() * 0.02;
    const granuleGeometry = new THREE.SphereGeometry(size, 8, 8);
    const granuleMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xc0c0c0,
      metalness: 0.8,
      roughness: 0.2
    });
    const granule = new THREE.Mesh(granuleGeometry, granuleMaterial);
    granule.position.set(
      (Math.random() - 0.5) * 0.3,
      0.2 + Math.random() * 0.3,
      (Math.random() - 0.5) * 0.3
    );
    granule.castShadow = true;
    group.add(granule);
  }
  
  group.position.set(-1.5, 0, 0);
  group.visible = false;
  return group;
}

// Create copper oxide powder
function createCuOPowder() {
  const group = new THREE.Group();
  
  const powderGeometry = new THREE.CylinderGeometry(0.12, 0.12, 0.15, 32);
  const powderMaterial = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });
  const powder = new THREE.Mesh(powderGeometry, powderMaterial);
  powder.position.y = 0.2;
  group.add(powder);
  
  group.position.set(0, 0, -1.5);
  group.visible = false;
  return group;
}

// Create gas bubbles
function createGasBubble() {
  const bubbleGeometry = new THREE.SphereGeometry(0.05, 8, 8);
  const bubbleMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xffffff,
    transparent: true,
    opacity: 0.6
  });
  const bubble = new THREE.Mesh(bubbleGeometry, bubbleMaterial);
  bubble.position.set(
    -1.5 + (Math.random() - 0.5) * 0.2,
    0.3 + Math.random() * 0.5,
    (Math.random() - 0.5) * 0.2
  );
  return bubble;
}

// Create flame
function createFlame() {
  const group = new THREE.Group();
  
  const flameGeometry = new THREE.ConeGeometry(0.1, 0.3, 8);
  const flameMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xff6600,
    emissive: 0xff3300,
    transparent: true,
    opacity: 0.8
  });
  const flameMesh = new THREE.Mesh(flameGeometry, flameMaterial);
  flameMesh.position.y = 0.5;
  group.add(flameMesh);
  
  group.position.set(0, 0, -1.5);
  group.visible = false;
  return group;
}

// Create liquid (HCl)
function createLiquid(color = 0x4a90e2, opacity = 0.6) {
  const liquidGeometry = new THREE.CylinderGeometry(0.35, 0.35, 0.4, 32);
  const liquidMaterial = new THREE.MeshStandardMaterial({ 
    color: color,
    transparent: true, 
    opacity: opacity
  });
  const liquid = new THREE.Mesh(liquidGeometry, liquidMaterial);
  liquid.position.y = 0.3;
  liquid.position.set(-1.5, 0, 0);
  return liquid;
}

// Create hydrogen gas in collection tube
function createHydrogenGas() {
  const gasGeometry = new THREE.CylinderGeometry(0.18, 0.18, 0.6, 32);
  const gasMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xffffff,
    transparent: true,
    opacity: 0.1
  });
  const gas = new THREE.Mesh(gasGeometry, gasMaterial);
  gas.position.y = 0.5;
  gas.position.set(1.5, 0, 0);
  return gas;
}

// Create water (for reduction product)
function createWater() {
  const waterGeometry = new THREE.CylinderGeometry(0.12, 0.12, 0.1, 32);
  const waterMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x4a90e2,
    transparent: true,
    opacity: 0.7
  });
  const water = new THREE.Mesh(waterGeometry, waterMaterial);
  water.position.y = 0.15;
  water.position.set(0, 0, -1.5);
  water.visible = false;
  return water;
}

// ---------- Initialize Scene ----------
function initScene() {
  conicalFlask = createConicalFlask();
  scene.add(conicalFlask);
  
  thistleFunnel = createThistleFunnel();
  conicalFlask.add(thistleFunnel);
  
  gasCollectionTube = createGasCollectionApparatus();
  scene.add(gasCollectionTube);
  
  testTube = createTestTube();
  scene.add(testTube);
  
  burner = createBurner();
  scene.add(burner);
  
  zincGranules = createZincGranules();
  scene.add(zincGranules);
  
  cuoPowder = createCuOPowder();
  scene.add(cuoPowder);
  
  flame = createFlame();
  scene.add(flame);
  
  let liquid = createLiquid();
  scene.add(liquid);
  
  let hydrogenGas = createHydrogenGas();
  hydrogenGas.visible = false;
  scene.add(hydrogenGas);
  
  let water = createWater();
  scene.add(water);
  
  // Store references
  scene.userData.liquid = liquid;
  scene.userData.hydrogenGas = hydrogenGas;
  scene.userData.water = water;
}

// ---------- DOM References ----------
const addZincBtn = document.getElementById('addZincBtn');
const addHClBtn = document.getElementById('addHClBtn');
const collectGasBtn = document.getElementById('collectGasBtn');
const popTestBtn = document.getElementById('popTestBtn');
const addCuOBtn = document.getElementById('addCuOBtn');
const heatBtn = document.getElementById('heatBtn');
const passHydrogenBtn = document.getElementById('passHydrogenBtn');
const waterTestBtn = document.getElementById('waterTestBtn');
const resetBtn = document.getElementById('resetBtn');

const zincStatus = document.getElementById('zincStatus');
const hclStatus = document.getElementById('hclStatus');
const gasStatus = document.getElementById('gasStatus');
const popTestStatus = document.getElementById('popTestStatus');
const cuoStatus = document.getElementById('cuoStatus');
const heatStatus = document.getElementById('heatStatus');
const reductionStatus = document.getElementById('reductionStatus');
const waterTestStatus = document.getElementById('waterTestStatus');

// ---------- Event Handlers ----------
addZincBtn.addEventListener('click', () => {
  if (!state.zincAdded) {
    state.zincAdded = true;
    zincGranules.visible = true;
    zincStatus.textContent = 'Added';
    zincStatus.classList.add('complete');
    addHClBtn.disabled = false;
    updateStatus();
  }
});

addHClBtn.addEventListener('click', () => {
  if (state.zincAdded && !state.hclAdded) {
    state.hclAdded = true;
    hclStatus.textContent = 'Added';
    hclStatus.classList.add('complete');
    collectGasBtn.disabled = false;
    
    // Animate bubbles
    startBubbleAnimation();
    updateStatus();
  }
});

collectGasBtn.addEventListener('click', () => {
  if (state.hclAdded && !state.gasCollected) {
    state.gasCollected = true;
    gasStatus.textContent = 'Collected';
    gasStatus.classList.add('complete');
    popTestBtn.disabled = false;
    
    // Show hydrogen gas in collection tube
    scene.userData.hydrogenGas.visible = true;
    updateStatus();
  }
});

popTestBtn.addEventListener('click', () => {
  if (state.gasCollected && !state.popTested) {
    state.popTested = true;
    popTestStatus.textContent = 'Pop!';
    popTestStatus.classList.add('complete');
    
    // Play pop sound (using Web Audio API)
    playPopSound();
    
    // Visual effect
    const flash = new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xffff00, transparent: true, opacity: 0.8 })
    );
    flash.position.set(1.5, 0.8, 0);
    scene.add(flash);
    
    setTimeout(() => {
      scene.remove(flash);
    }, 200);
    
    addCuOBtn.disabled = false;
    updateStatus();
  }
});

addCuOBtn.addEventListener('click', () => {
  if (!state.cuoAdded) {
    state.cuoAdded = true;
    cuoPowder.visible = true;
    cuoStatus.textContent = 'Added';
    cuoStatus.classList.add('complete');
    heatBtn.disabled = false;
    updateStatus();
  }
});

heatBtn.addEventListener('click', () => {
  if (state.cuoAdded && !state.heated) {
    state.heated = true;
    heatStatus.textContent = 'Heating';
    heatStatus.classList.add('active');
    flame.visible = true;
    
    // Animate flame
    animateFlame();
    
    setTimeout(() => {
      heatStatus.textContent = 'Heated';
      heatStatus.classList.remove('active');
      heatStatus.classList.add('complete');
      passHydrogenBtn.disabled = false;
      updateStatus();
    }, 2000);
  }
});

passHydrogenBtn.addEventListener('click', () => {
  if (state.heated && state.gasCollected && !state.hydrogenPassed) {
    state.hydrogenPassed = true;
    reductionStatus.textContent = 'Reduced';
    reductionStatus.classList.add('complete');
    
    // Change CuO color from black to brown (copper)
    cuoPowder.children[0].material.color.setHex(0x8b4513);
    
    // Show water
    scene.userData.water.visible = true;
    
    waterTestBtn.disabled = false;
    updateStatus();
  }
});

waterTestBtn.addEventListener('click', () => {
  if (state.hydrogenPassed && !state.waterTested) {
    state.waterTested = true;
    waterTestStatus.textContent = 'Pink!';
    waterTestStatus.classList.add('complete');
    
    // Show pink cobalt chloride paper
    if (!cobaltPaper) {
      const paperGeometry = new THREE.PlaneGeometry(0.2, 0.3);
      const paperMaterial = new THREE.MeshBasicMaterial({ color: 0xff69b4 });
      cobaltPaper = new THREE.Mesh(paperGeometry, paperMaterial);
      cobaltPaper.position.set(0.3, 0.2, -1.5);
      cobaltPaper.rotation.x = -Math.PI / 2;
      scene.add(cobaltPaper);
    }
    updateStatus();
  }
});

resetBtn.addEventListener('click', () => {
  // Reset state
  Object.keys(state).forEach(key => state[key] = false);
  
  // Reset visibility
  zincGranules.visible = false;
  cuoPowder.visible = false;
  flame.visible = false;
  scene.userData.hydrogenGas.visible = false;
  scene.userData.water.visible = false;
  if (cobaltPaper) {
    scene.remove(cobaltPaper);
    cobaltPaper = null;
  }
  
  // Reset CuO color
  cuoPowder.children[0].material.color.setHex(0x1a1a1a);
  
  // Clear bubbles
  gasBubbles.forEach(bubble => scene.remove(bubble));
  gasBubbles = [];
  
  // Reset buttons
  addHClBtn.disabled = true;
  collectGasBtn.disabled = true;
  popTestBtn.disabled = true;
  addCuOBtn.disabled = true;
  heatBtn.disabled = true;
  passHydrogenBtn.disabled = true;
  waterTestBtn.disabled = true;
  
  // Reset status indicators
  zincStatus.textContent = 'Not added';
  hclStatus.textContent = 'Not added';
  gasStatus.textContent = 'Not collected';
  popTestStatus.textContent = 'Not tested';
  cuoStatus.textContent = 'Not added';
  heatStatus.textContent = 'Not heated';
  reductionStatus.textContent = 'Not reduced';
  waterTestStatus.textContent = 'Not tested';
  
  [zincStatus, hclStatus, gasStatus, popTestStatus, cuoStatus, heatStatus, reductionStatus, waterTestStatus].forEach(el => {
    el.classList.remove('complete', 'active');
  });
  
  updateStatus();
});

// ---------- Animations ----------
function startBubbleAnimation() {
  const bubbleInterval = setInterval(() => {
    if (!state.hclAdded) {
      clearInterval(bubbleInterval);
      return;
    }
    
    const bubble = createGasBubble();
    scene.add(bubble);
    gasBubbles.push(bubble);
    
    // Animate bubble rising
    const startY = bubble.position.y;
    const endY = 1.5;
    const duration = 2000;
    const startTime = Date.now();
    
    function animateBubble() {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      bubble.position.y = startY + (endY - startY) * progress;
      bubble.scale.setScalar(1 + progress * 0.5);
      
      if (progress < 1) {
        requestAnimationFrame(animateBubble);
      } else {
        scene.remove(bubble);
        const index = gasBubbles.indexOf(bubble);
        if (index > -1) gasBubbles.splice(index, 1);
      }
    }
    
    animateBubble();
  }, 300);
}

function animateFlame() {
  let time = 0;
  function animate() {
    if (!state.heated) return;
    
    time += 0.1;
    flame.children[0].scale.y = 1 + Math.sin(time) * 0.3;
    flame.children[0].scale.x = 1 + Math.cos(time * 1.2) * 0.2;
    flame.children[0].position.y = 0.5 + Math.sin(time * 1.5) * 0.05;
    
    requestAnimationFrame(animate);
  }
  animate();
}

// ---------- Sound Effects ----------
function playPopSound() {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.1);
  
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.1);
}

// ---------- Status Updates ----------
function updateStatus() {
  // Update reaction displays if needed
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
initScene();
animate();

