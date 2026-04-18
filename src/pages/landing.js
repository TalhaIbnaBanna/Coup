// Landing Page
import { navigate } from '../main.js';
import { renderRulesDrawer } from '../components/rulesDrawer.js';

export function renderLanding(container) {
  container.innerHTML = `
    <div class="landing-page">
      <canvas id="particle-canvas"></canvas>
      <div class="landing-bg-overlay"></div>
      <div class="landing-content">
        <div class="landing-header">
          <h1 class="game-title">COUP</h1>
          <p class="game-subtitle">A game of deception, deduction & luck</p>
        </div>

        <div class="character-showcase">
          <div class="character-card-mini" style="--char-color: #7B1FA2">
            <img src="/images/Duke.png" alt="Duke" />
          </div>
          <div class="character-card-mini" style="--char-color: #C62828">
            <img src="/images/Assassin.png" alt="Assassin" />
          </div>
          <div class="character-card-mini" style="--char-color: #1565C0">
            <img src="/images/Captain.png" alt="Captain" />
          </div>
          <div class="character-card-mini" style="--char-color: #2E7D32">
            <img src="/images/Ambassador.png" alt="Ambassador" />
          </div>
          <div class="character-card-mini" style="--char-color: #E65100">
            <img src="/images/Contessa.png" alt="Contessa" />
          </div>
        </div>

        <div class="landing-buttons">
          <button id="btn-create" class="btn btn-primary btn-large">
            <span class="btn-icon">+</span>
            Create New Game
          </button>
          <button id="btn-join" class="btn btn-secondary btn-large">
            <span class="btn-icon">⬡</span>
            Join Game
          </button>
          <button id="btn-rules" class="btn btn-ghost btn-large">
            <span class="btn-icon">📜</span>
            Learn Rules
          </button>
        </div>

        <div class="landing-footer">
          <p>2–6 Players • Free to play • No signup required</p>
        </div>
      </div>

      <!-- Rules FAB -->
      <button id="rules-fab" class="fab fab-rules" title="Game Rules">📜</button>

      <!-- Rules Drawer -->
      <div id="rules-drawer" class="drawer drawer-left">
        <div class="drawer-overlay"></div>
        <div class="drawer-content"></div>
      </div>

      <!-- Image Modal -->
      <div id="image-modal" class="modal-overlay" style="display: none; z-index: 2000; cursor: pointer;">
        <img id="image-modal-content" src="" style="max-height: 90vh; max-width: 90vw; border-radius: var(--radius-md); box-shadow: 0 0 40px rgba(0,0,0,0.8); transition: transform 0.2s;" />
      </div>
    </div>
  `;

  // Event listeners
  document.getElementById('btn-create').addEventListener('click', () => {
    navigate('create');
  });

  document.getElementById('btn-join').addEventListener('click', () => {
    navigate('join');
  });

  const openRules = () => {
    const drawer = document.getElementById('rules-drawer');
    drawer.classList.add('open');
    renderRulesDrawer(drawer.querySelector('.drawer-content'));
  };

  document.getElementById('btn-rules').addEventListener('click', openRules);
  document.getElementById('rules-fab').addEventListener('click', openRules);

  document.querySelector('.drawer-overlay')?.addEventListener('click', () => {
    document.getElementById('rules-drawer').classList.remove('open');
  });

  // Image Modal Logic
  document.querySelectorAll('.character-card-mini').forEach(card => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => {
      const imgSrc = card.querySelector('img').src;
      document.getElementById('image-modal-content').src = imgSrc;
      document.getElementById('image-modal').style.display = 'flex';
    });
  });

  document.getElementById('image-modal')?.addEventListener('click', () => {
    document.getElementById('image-modal').style.display = 'none';
  });

  // ---- Interactive Particle Canvas ----
  initParticles();
}

function initParticles() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let w, h;
  let mouse = { x: -1000, y: -1000 };
  const particles = [];
  const PARTICLE_COUNT = 80;
  const CONNECT_DIST = 120;
  const MOUSE_RADIUS = 150;

  const COLORS = [
    'rgba(99, 102, 241, 0.6)',   // blue
    'rgba(245, 158, 11, 0.5)',   // gold
    'rgba(123, 31, 162, 0.5)',   // purple
    'rgba(34, 197, 94, 0.4)',    // green
    'rgba(239, 68, 68, 0.4)',    // red
  ];

  function resize() {
    w = canvas.width = canvas.parentElement.clientWidth;
    h = canvas.height = canvas.parentElement.clientHeight;
  }

  function createParticle() {
    return {
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 2.5 + 1,
      color: COLORS[Math.floor(Math.random() * COLORS.length)]
    };
  }

  function init() {
    resize();
    particles.length = 0;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(createParticle());
    }
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);

    // Draw connection lines
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECT_DIST) {
          const alpha = (1 - dist / CONNECT_DIST) * 0.15;
          ctx.strokeStyle = `rgba(99, 102, 241, ${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    // Draw & update particles
    for (const p of particles) {
      // Mouse repulsion
      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < MOUSE_RADIUS && dist > 0) {
        const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS * 0.8;
        p.vx += (dx / dist) * force;
        p.vy += (dy / dist) * force;
      }

      // Damping
      p.vx *= 0.98;
      p.vy *= 0.98;

      p.x += p.vx;
      p.y += p.vy;

      // Wrap edges
      if (p.x < 0) p.x = w;
      if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h;
      if (p.y > h) p.y = 0;

      // Draw dot
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
    }

    requestAnimationFrame(draw);
  }

  canvas.parentElement.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  canvas.parentElement.addEventListener('mouseleave', () => {
    mouse.x = -1000;
    mouse.y = -1000;
  });

  // Touch support
  canvas.parentElement.addEventListener('touchmove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.touches[0].clientX - rect.left;
    mouse.y = e.touches[0].clientY - rect.top;
  });

  canvas.parentElement.addEventListener('touchend', () => {
    mouse.x = -1000;
    mouse.y = -1000;
  });

  window.addEventListener('resize', () => {
    resize();
  });

  init();
  draw();
}
