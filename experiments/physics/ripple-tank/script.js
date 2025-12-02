// ============ Canvas Setup ============
const canvas = document.getElementById('waveCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  // Recreate wave field with new dimensions
  waveField = new WaveField(canvas.width, canvas.height);
  // Update point sources to center if they were at 0,0
  if (state.pointSources.length > 0 && state.pointSources[0].x === 0 && state.pointSources[0].y === 0) {
    state.pointSources[0].x = canvas.width * 0.5;
    state.pointSources[0].y = canvas.height * 0.5;
  }
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// ============ Wave Simulation State ============
const state = {
  frequency: 3.0,
  amplitude: 15,
  waveSpeed: 100,
  isPaused: false,
  waveMode: 'plane', // 'plane', 'point', 'twoPoints'
  demonstrations: {
    reflection: false,
    refraction: false,
    diffraction: false,
    interference: false
  },
  barriers: [],
  shallowRegions: [],
  gaps: [],
  pointSources: [{ x: canvas.width * 0.5, y: canvas.height * 0.5, time: 0 }],
  time: 0
};

// ============ Wave Physics ============
class WaveField {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.field = new Array(width * height).fill(0);
  }

  getValue(x, y) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return 0;
    return this.field[Math.floor(y) * this.width + Math.floor(x)];
  }

  setValue(x, y, value) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return;
    this.field[Math.floor(y) * this.width + Math.floor(x)] = value;
  }

  addWave(x, y, amplitude, phase) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return;
    this.field[Math.floor(y) * this.width + Math.floor(x)] += amplitude * Math.sin(phase);
  }

  clear() {
    this.field.fill(0);
  }
}

let waveField = new WaveField(canvas.width, canvas.height);

// ============ Drawing Functions ============
function drawWaveField() {
  const imageData = ctx.createImageData(canvas.width, canvas.height);
  const data = imageData.data;
  const maxAmplitude = state.amplitude * 2; // Account for interference

  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const idx = (y * canvas.width + x) * 4;
      const value = waveField.getValue(x, y);
      
      // Create beautiful color gradient based on wave amplitude
      const normalized = Math.max(-1, Math.min(1, value / maxAmplitude));
      const absNormalized = Math.abs(normalized);
      
      // Use cyan/blue for positive, purple/magenta for negative - adjusted for light background
      // Make waves more visible with higher contrast
      const hue = normalized > 0 ? 200 + absNormalized * 30 : 260 - absNormalized * 30;
      const saturation = Math.min(100, absNormalized * 70 + 50);
      const lightness = 25 + absNormalized * 50;
      
      // Convert HSL to RGB
      const h = (hue % 360) / 360;
      const s = saturation / 100;
      const l = lightness / 100;
      const c = (1 - Math.abs(2 * l - 1)) * s;
      const x_h = c * (1 - Math.abs((h * 6) % 2 - 1));
      const m = l - c / 2;
      
      let r, g, b;
      const h6 = h * 6;
      if (h6 < 1) { r = c; g = x_h; b = 0; }
      else if (h6 < 2) { r = x_h; g = c; b = 0; }
      else if (h6 < 3) { r = 0; g = c; b = x_h; }
      else if (h6 < 4) { r = 0; g = x_h; b = c; }
      else if (h6 < 5) { r = x_h; g = 0; b = c; }
      else { r = c; g = 0; b = x_h; }
      
      data[idx] = Math.round((r + m) * 255);
      data[idx + 1] = Math.round((g + m) * 255);
      data[idx + 2] = Math.round((b + m) * 255);
      data[idx + 3] = 255;
    }
  }
  
  ctx.putImageData(imageData, 0, 0);
}

function drawBarriers() {
  ctx.strokeStyle = '#ff6b6b';
  ctx.lineWidth = 4;
  ctx.shadowBlur = 10;
  ctx.shadowColor = 'rgba(255, 107, 107, 0.5)';
  state.barriers.forEach(barrier => {
    ctx.beginPath();
    ctx.moveTo(barrier.x1, barrier.y1);
    ctx.lineTo(barrier.x2, barrier.y2);
    ctx.stroke();
  });
  ctx.shadowBlur = 0;
}

function drawShallowRegions() {
  state.shallowRegions.forEach(region => {
    ctx.fillStyle = 'rgba(255, 193, 7, 0.3)';
    ctx.fillRect(region.x, region.y, region.width, region.height);
    ctx.strokeStyle = '#ffc107';
    ctx.lineWidth = 2;
    ctx.strokeRect(region.x, region.y, region.width, region.height);
  });
}

function drawGaps() {
  // Gaps are represented by barriers with openings
  // The barriers are already drawn, gaps are just the absence
}

function drawPointSources() {
  state.pointSources.forEach(source => {
    // Pulsing effect
    const pulse = Math.sin(state.time * 5) * 2 + 8;
    ctx.fillStyle = '#4ade80';
    ctx.shadowBlur = 15;
    ctx.shadowColor = 'rgba(74, 222, 128, 0.6)';
    ctx.beginPath();
    ctx.arc(source.x, source.y, pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(source.x, source.y, 6, 0, Math.PI * 2);
    ctx.stroke();
  });
}

// ============ Wave Generation ============
function generateWaves() {
  waveField.clear();
  const time = state.time;
  const wavelength = state.waveSpeed / state.frequency;
  const k = 2 * Math.PI / wavelength; // wave number
  const omega = 2 * Math.PI * state.frequency; // angular frequency

  if (state.waveMode === 'plane') {
    // Generate plane waves from left
    const step = 2; // Sampling step for performance
    for (let y = 0; y < canvas.height; y += step) {
      for (let x = 0; x < canvas.width; x += step) {
        // Check if point is behind a barrier (reflection)
        let blocked = false;
        let reflected = false;
        let reflectionPhase = 0;
        
        for (const barrier of state.barriers) {
          if (isPointBehindBarrier(x, y, barrier)) {
            // Calculate reflection
            const barrierAngle = Math.atan2(barrier.y2 - barrier.y1, barrier.x2 - barrier.x1);
            const normalAngle = barrierAngle + Math.PI / 2;
            
            // Calculate distance to barrier for reflection
            const distToBarrier = distanceToLine(x, y, barrier.x1, barrier.y1, barrier.x2, barrier.y2);
            const incidentPhase = k * (x - distToBarrier * 2) - omega * time;
            reflectionPhase = -incidentPhase; // Reflection inverts phase
            reflected = true;
            blocked = false; // Allow reflection
            break;
          }
        }
        
        if (blocked && !reflected) continue;

        let phase = k * x - omega * time;
        if (reflected) {
          phase = reflectionPhase;
        }
        
        let amplitude = state.amplitude;
        let localK = k;
        let localSpeed = state.waveSpeed;
        
        // Check if in shallow region (refraction - slower speed, shorter wavelength)
        for (const region of state.shallowRegions) {
          if (x >= region.x && x < region.x + region.width &&
              y >= region.y && y < region.y + region.height) {
            localSpeed = state.waveSpeed * 0.6; // Slower in shallow water
            localK = 2 * Math.PI / (localSpeed / state.frequency);
            amplitude *= 0.8; // Slightly reduced amplitude
            phase = localK * x - omega * time;
            break;
          }
        }
        
        waveField.addWave(x, y, amplitude, phase);
      }
    }
  } else if (state.waveMode === 'point' || state.waveMode === 'twoPoints') {
    // Generate circular waves from point sources
    state.pointSources.forEach(source => {
      const sourceTime = time - source.time;
      if (sourceTime < 0) return;
      
      const step = 2; // Sampling step for performance
      for (let y = 0; y < canvas.height; y += step) {
        for (let x = 0; x < canvas.width; x += step) {
          const dx = x - source.x;
          const dy = y - source.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const phase = k * distance - omega * sourceTime;
          
          // Circular wave amplitude decreases with distance
          const amplitude = state.amplitude * (1 / (1 + distance / 200));
          
          // Check barriers for reflection
          let blocked = false;
          for (const barrier of state.barriers) {
            if (isPointBlockedByBarrier(x, y, source.x, source.y, barrier)) {
              blocked = true;
              break;
            }
          }
          if (blocked) continue;
          
          waveField.addWave(x, y, amplitude, phase);
        }
      }
    });
  }
}

function isPointBehindBarrier(x, y, barrier) {
  // Check if point is on the "reflection side" of the barrier
  const dx = barrier.x2 - barrier.x1;
  const dy = barrier.y2 - barrier.y1;
  const px = x - barrier.x1;
  const py = y - barrier.y1;
  const cross = dx * py - dy * px;
  return cross < 0; // Point is on one side
}

function isPointBlockedByBarrier(x, y, sourceX, sourceY, barrier) {
  // Check if line from source to point intersects barrier
  return lineIntersectsLine(sourceX, sourceY, x, y, barrier.x1, barrier.y1, barrier.x2, barrier.y2);
}

function lineIntersectsLine(x1, y1, x2, y2, x3, y3, x4, y4) {
  const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  if (Math.abs(denom) < 0.001) return false;
  
  const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
  const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;
  
  return t >= 0 && t <= 1 && u >= 0 && u <= 1;
}

function distanceToLine(px, py, x1, y1, x2, y2) {
  const A = px - x1;
  const B = py - y1;
  const C = x2 - x1;
  const D = y2 - y1;
  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  const param = lenSq !== 0 ? dot / lenSq : -1;
  const xx = x1 + param * C;
  const yy = y1 + param * D;
  const dx = px - xx;
  const dy = py - yy;
  return Math.sqrt(dx * dx + dy * dy);
}

// ============ Demonstration Setup ============
function setupReflection() {
  clearAll();
  state.demonstrations.reflection = true;
  // Add barrier at 45-degree angle
  const centerX = canvas.width * 0.6;
  const centerY = canvas.height * 0.5;
  const length = 300;
  const angle = Math.PI / 4;
  state.barriers.push({
    x1: centerX - length * Math.cos(angle),
    y1: centerY - length * Math.sin(angle),
    x2: centerX + length * Math.cos(angle),
    y2: centerY + length * Math.sin(angle)
  });
  state.waveMode = 'plane';
  updateModeButtons();
}

function setupRefraction() {
  clearAll();
  state.demonstrations.refraction = true;
  // Add shallow region (glass plate)
  state.shallowRegions.push({
    x: canvas.width * 0.5,
    y: canvas.height * 0.3,
    width: 200,
    height: 200
  });
  state.waveMode = 'plane';
  updateModeButtons();
}

function setupDiffraction() {
  clearAll();
  state.demonstrations.diffraction = true;
  // Add barrier with gap
  const gapY = canvas.height * 0.5;
  const gapWidth = 80;
  state.barriers.push({
    x1: canvas.width * 0.6,
    y1: 0,
    x2: canvas.width * 0.6,
    y2: gapY - gapWidth / 2
  });
  state.barriers.push({
    x1: canvas.width * 0.6,
    y1: gapY + gapWidth / 2,
    x2: canvas.width * 0.6,
    y2: canvas.height
  });
  state.waveMode = 'plane';
  updateModeButtons();
}

function setupInterference() {
  clearAll();
  state.demonstrations.interference = true;
  // Two point sources
  state.pointSources = [
    { x: canvas.width * 0.4, y: canvas.height * 0.5, time: state.time },
    { x: canvas.width * 0.6, y: canvas.height * 0.5, time: state.time }
  ];
  state.waveMode = 'twoPoints';
  updateModeButtons();
}

function clearAll() {
  state.barriers = [];
  state.shallowRegions = [];
  state.gaps = [];
  state.demonstrations = {
    reflection: false,
    refraction: false,
    diffraction: false,
    interference: false
  };
  state.pointSources = [{ x: canvas.width * 0.5, y: canvas.height * 0.5, time: state.time }];
}

// ============ UI Controls ============
function updateModeButtons() {
  document.getElementById('planeWaveBtn').classList.toggle('active', state.waveMode === 'plane');
  document.getElementById('pointSourceBtn').classList.toggle('active', state.waveMode === 'point');
  document.getElementById('twoSourcesBtn').classList.toggle('active', state.waveMode === 'twoPoints');
}

document.getElementById('planeWaveBtn').addEventListener('click', () => {
  state.waveMode = 'plane';
  state.pointSources = [{ x: canvas.width * 0.5, y: canvas.height * 0.5, time: state.time }];
  updateModeButtons();
  updateCurrentMode();
});

document.getElementById('pointSourceBtn').addEventListener('click', () => {
  state.waveMode = 'point';
  state.pointSources = [{ x: canvas.width * 0.5, y: canvas.height * 0.5, time: state.time }];
  updateModeButtons();
  updateCurrentMode();
});

document.getElementById('twoSourcesBtn').addEventListener('click', () => {
  state.waveMode = 'twoPoints';
  state.pointSources = [
    { x: canvas.width * 0.4, y: canvas.height * 0.5, time: state.time },
    { x: canvas.width * 0.6, y: canvas.height * 0.5, time: state.time }
  ];
  updateModeButtons();
  updateCurrentMode();
});

document.getElementById('reflectionBtn').addEventListener('click', setupReflection);
document.getElementById('refractionBtn').addEventListener('click', setupRefraction);
document.getElementById('diffractionBtn').addEventListener('click', setupDiffraction);
document.getElementById('interferenceBtn').addEventListener('click', setupInterference);
document.getElementById('clearBtn').addEventListener('click', clearAll);

document.getElementById('pauseBtn').addEventListener('click', () => {
  state.isPaused = !state.isPaused;
  document.getElementById('pauseBtn').textContent = state.isPaused ? 'Resume' : 'Pause';
});

// Sliders
document.getElementById('frequencyRange').addEventListener('input', (e) => {
  state.frequency = parseFloat(e.target.value);
  document.getElementById('frequencyVal').textContent = state.frequency.toFixed(1) + ' Hz';
});

document.getElementById('amplitudeRange').addEventListener('input', (e) => {
  state.amplitude = parseFloat(e.target.value);
  document.getElementById('amplitudeVal').textContent = state.amplitude;
});

document.getElementById('speedRange').addEventListener('input', (e) => {
  state.waveSpeed = parseFloat(e.target.value);
  document.getElementById('speedVal').textContent = state.waveSpeed + ' px/s';
});

function updateCurrentMode() {
  const modeNames = {
    'plane': 'Plane Waves',
    'point': 'Point Source',
    'twoPoints': 'Two Point Sources'
  };
  document.getElementById('currentMode').textContent = modeNames[state.waveMode] || 'Plane Waves';
}

// ============ Animation Loop ============
function animate() {
  if (!state.isPaused) {
    state.time += 0.016; // ~60fps
  }
  
  // Update wave field
  generateWaves();
  
  // Clear and redraw
  ctx.fillStyle = '#e8e8e8';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  drawWaveField();
  drawShallowRegions();
  drawBarriers();
  drawPointSources();
  
  requestAnimationFrame(animate);
}

// Initialize
updateCurrentMode();
animate();

