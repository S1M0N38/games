// Game constants
const CONFIG = {
    INITIAL_LIVES: 3,
    STORAGE_KEY: 'gapHopHighScore',
    VISUAL: { MAIN_COLOR: '#FFFFFF', ERROR_COLOR: '#FF0000', FLASH_DURATION: 200 },
    PHYSICS: { GRAVITY: 1500, JUMP_VELOCITY: -600, BASE_SPEED: 300 },
    SPAWN: { INIT_INTERVAL: 1.2, RATE_DEC: 0.9 },
    DIFF: { SPEED_INC_TIME: 15, RATE_DEC_TIME: 10 },
    GAME_STATE: { INTRO: 'intro', PLAYING: 'playing', PAUSED: 'paused', GAME_OVER: 'gameover', ERROR: 'error' },
    INVINCIBLE_DURATION: 2
};
let canvas, ctx, scoreEl, livesEl, helpBtn, helpPanel, closeHelp, pauseOv, gameOverOv, finalScoreEl, highScoreEl, restartBtn, errorOv;
const state = {
    st: CONFIG.GAME_STATE.INTRO, score: 0, lives: CONFIG.INITIAL_LIVES, highScore: 0, playing: false, paused: false, flashing: false, invincible: false,
    lastTime: 0, dt: 0, obs: [], playerY: 0, velY: 0, elapsed: 0, speedMult: 1, nextSpeed: CONFIG.DIFF.SPEED_INC_TIME, nextRate: CONFIG.DIFF.RATE_DEC_TIME, spawnInt: CONFIG.SPAWN.INIT_INTERVAL, spawnT: 0
};
let groundY, playerR = 20; const playerX = 100;
window.addEventListener('DOMContentLoaded', initGame);
function initGame() {
    try {
        canvas = document.getElementById('game-canvas'); ctx = canvas.getContext('2d');
        scoreEl = document.getElementById('score'); livesEl = document.getElementById('lives-container');
        helpBtn = document.getElementById('help-button'); helpPanel = document.getElementById('help-panel'); closeHelp = document.getElementById('close-help');
        pauseOv = document.getElementById('pause-overlay'); gameOverOv = document.getElementById('game-over');
        finalScoreEl = document.getElementById('final-score'); highScoreEl = document.getElementById('high-score'); restartBtn = document.getElementById('restart-button');
        errorOv = document.getElementById('error-overlay');
        window.addEventListener('resize', resize); resize();
        state.highScore = parseInt(localStorage.getItem(CONFIG.STORAGE_KEY)) || 0;
        createLives(); addListeners(); intro();
    } catch (e) { err(e); }
}
function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; groundY = canvas.height / 2; }
function createLives() { livesEl.innerHTML = ''; for (let i = 0; i < CONFIG.INITIAL_LIVES; i++) { let d = document.createElement('div'); d.className = 'life'; livesEl.appendChild(d); } }
function addListeners() {
    helpBtn.onclick = () => helpPanel.classList.toggle('hidden');
    closeHelp.onclick = () => helpPanel.classList.toggle('hidden');
    restartBtn.onclick = start;
    document.onkeydown = e => {
        if (e.key === ' ') jump();
        if (e.key === 'Escape') togglePause();
        if (e.key === 'q' || e.key === 'Q') nav();
    };
    window.onerror = (m, u, l, e) => err(e || m);
}
function intro() { state.st = CONFIG.GAME_STATE.INTRO; setTimeout(start, 1000); }
function start() {
    state.st = CONFIG.GAME_STATE.PLAYING; state.playing = true; state.paused = false;
    state.playerY = groundY - playerR; // center player at ground on start
    state.score = 0; state.lives = CONFIG.INITIAL_LIVES; state.obs = []; state.elapsed = 0; state.speedMult = 1;
    state.nextSpeed = CONFIG.DIFF.SPEED_INC_TIME; state.nextRate = CONFIG.DIFF.RATE_DEC_TIME; state.spawnInt = CONFIG.SPAWN.INIT_INTERVAL; state.spawnT = state.spawnInt;
    scoreEl.textContent = state.score; updLives(); pauseOv.classList.add('hidden'); gameOverOv.classList.add('hidden');
    state.lastTime = performance.now(); requestAnimationFrame(loop);
}
function togglePause() {
    if (!state.playing) return;
    state.paused = !state.paused;
    pauseOv.classList.toggle('hidden', !state.paused);
    if (!state.paused) { state.lastTime = performance.now(); requestAnimationFrame(loop); }
}
function nav() { window.location.href = '../../index.html'; }
function jump() { if (state.st !== CONFIG.GAME_STATE.PLAYING) return; if (state.playerY >= groundY - playerR) state.velY = CONFIG.PHYSICS.JUMP_VELOCITY; }
function updLives() { document.querySelectorAll('.life').forEach((d, i) => d.classList.toggle('lost', i >= state.lives)); }
function loop(ts) {
    if (!state.playing || state.paused) return;
    state.dt = (ts - state.lastTime) / 1000; state.lastTime = ts;
    try { update(); render(); requestAnimationFrame(loop); } catch (e) { err(e); }
}
function update() {
    state.elapsed += state.dt;
    if (state.elapsed >= state.nextSpeed) { state.speedMult *= 1.1; state.nextSpeed += CONFIG.DIFF.SPEED_INC_TIME; }
    if (state.elapsed >= state.nextRate) { state.spawnInt *= CONFIG.SPAWN.RATE_DEC; state.nextRate += CONFIG.DIFF.RATE_DEC_TIME; }
    state.spawnT -= state.dt; if (state.spawnT <= 0) { spawnObs(); state.spawnT = state.spawnInt; }
    state.velY += CONFIG.PHYSICS.GRAVITY * state.dt; state.playerY += state.velY * state.dt;
    if (state.playerY > groundY - playerR) { state.playerY = groundY - playerR; state.velY = 0; }
    state.obs.forEach(o => o.x -= CONFIG.PHYSICS.BASE_SPEED * state.speedMult * state.dt);
    state.obs = state.obs.filter(o => o.x + o.w > 0);
    state.obs.forEach(o => {
        if (!o.passed && o.x + o.w < 100) { state.score++; scoreEl.textContent = state.score; o.passed = true; }
        if (collide(o) && !state.invincible) hit();
    });
}
function spawnObs() {
    const w = 20;
    const h = 30 + Math.random() * 30; // random spike height between 30 and 60px
    state.obs.push({ x: canvas.width, y: groundY - h, w, h, passed: false });
}
function collide(o) { const px = playerX, py = state.playerY; return px + playerR > o.x && px - playerR < o.x + o.w && py + playerR > groundY - o.h; }
function hit() {
    if (state.lives <= 0) return;
    state.lives--; updLives();
    state.flashing = true; state.invincible = true;
    setTimeout(() => state.flashing = false, CONFIG.VISUAL.FLASH_DURATION);
    setTimeout(() => state.invincible = false, CONFIG.INVINCIBLE_DURATION * 1000);
    if (state.lives <= 0) over();
}
function over() {
    state.st = CONFIG.GAME_STATE.GAME_OVER; state.playing = false;
    if (state.score > state.highScore) { state.highScore = state.score; localStorage.setItem(CONFIG.STORAGE_KEY, state.highScore); }
    finalScoreEl.textContent = state.score; highScoreEl.textContent = state.highScore;
    setTimeout(() => gameOverOv.classList.remove('hidden'), 500);
}
function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Draw ground line
    ctx.strokeStyle = CONFIG.VISUAL.MAIN_COLOR;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(canvas.width, groundY);
    ctx.stroke();
    const blinkVisible = !state.invincible || Math.floor(state.elapsed * 5) % 2 === 0;
    if (blinkVisible) {
        ctx.fillStyle = state.flashing ? CONFIG.VISUAL.ERROR_COLOR : CONFIG.VISUAL.MAIN_COLOR;
        ctx.beginPath(); ctx.arc(playerX, state.playerY, playerR, 0, 2 * Math.PI); ctx.fill();
    }
    ctx.fillStyle = CONFIG.VISUAL.MAIN_COLOR;
    state.obs.forEach(o => { ctx.beginPath(); ctx.moveTo(o.x, groundY); ctx.lineTo(o.x + o.w / 2, groundY - o.h); ctx.lineTo(o.x + o.w, groundY); ctx.fill(); });
}
function err(e) { console.error(e); state.st = CONFIG.GAME_STATE.ERROR; errorOv.classList.remove('hidden'); }