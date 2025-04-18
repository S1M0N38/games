const CONFIG = {
    INITIAL_LIVES: 3,
    STORAGE_KEY: 'laneSwitchHighScore',
    LANES: 3,
    LANE_WIDTH_RATIO: 1 / 3,
    BLOCK_WIDTH: 80,       // increased from 60
    BLOCK_HEIGHT: 30,      // increased from 15
    INITIAL_SPEED: 300,
    INITIAL_SPAWN_INTERVAL: 0.8,
    SPEED_INCREMENT: 1.15,
    STATE: { INTRO: 'intro', PLAY: 'playing', PAUSED: 'paused', OVER: 'gameover', ERROR: 'error' },
    LANE_SWITCH_SPEED: 10,     // new: how fast player X interpolates (higher = snappier)
    HIT_FLASH_TIME: 0.2        // new: how long the red flash lasts on hit
};

let canvas, ctx, gameState = {}, elements = {};

function initGame() {
    try {
        // ...existing init code...
        canvas = document.getElementById('game-canvas');
        ctx = canvas.getContext('2d');
        elements.score = document.getElementById('score');
        elements.lives = document.getElementById('lives-container');
        elements.helpBtn = document.getElementById('help-button');
        elements.helpPanel = document.getElementById('help-panel');
        elements.closeHelp = document.getElementById('close-help');
        elements.pauseOv = document.getElementById('pause-overlay');
        elements.gameOver = document.getElementById('game-over');
        elements.finalScore = document.getElementById('final-score');
        elements.highScore = document.getElementById('high-score');
        elements.restartBtn = document.getElementById('restart-button');
        elements.errOv = document.getElementById('error-overlay');

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        gameState.highScore = parseInt(localStorage.getItem(CONFIG.STORAGE_KEY)) || 0;
        setupUI();
        startIntro();
    } catch (e) { handleError(e); }
}

function setupUI() {
    // lives & score
    elements.lives.innerHTML = '';
    for (let i = 0; i < CONFIG.INITIAL_LIVES; i++) {
        const d = document.createElement('div'); d.className = 'life';
        elements.lives.appendChild(d);
    }
    elements.helpBtn.onclick = () => elements.helpPanel.classList.toggle('hidden');
    elements.closeHelp.onclick = () => elements.helpPanel.classList.toggle('hidden');
    elements.restartBtn.onclick = startGame;

    // keyboard only
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    document.addEventListener('keydown', e => {
        if (!e.repeat) {
            if (e.key === 'Escape') {
                e.preventDefault();
                togglePause();
            }
            if (e.key === 'q' || e.key === 'Q') {
                window.location.href = '../../index.html';
            }
        }
    });

    window.addEventListener('error', e => handleError(e));
}

function resizeCanvas() {
    canvas.width = innerWidth; canvas.height = innerHeight;
}

function startIntro() {
    gameState.state = CONFIG.STATE.INTRO;
    setTimeout(startGame, 1000);
}

function startGame() {
    // Hide overlays on restart
    elements.gameOver.classList.add('hidden');
    elements.pauseOv.classList.add('hidden');
    elements.errOv.classList.add('hidden');

    gameState.state = CONFIG.STATE.PLAY;
    gameState.score = 0;
    gameState.lives = CONFIG.INITIAL_LIVES;

    // --- initialize player position for drawing ---
    gameState.currentLane = 1;
    const laneWidth = canvas.width * CONFIG.LANE_WIDTH_RATIO;
    const initCenter = gameState.currentLane * laneWidth + laneWidth / 2;
    gameState.playerX = initCenter;
    gameState.targetX = initCenter;
    // --------------------------------------------

    gameState.speed = CONFIG.INITIAL_SPEED;
    gameState.spawnInterval = CONFIG.INITIAL_SPAWN_INTERVAL;
    gameState.obstacles = [];
    updateUI();

    gameState.lastTime = performance.now();
    gameState.lastSpawn = 0;
    gameState.timerSpeedUp = 0;
    requestAnimationFrame(gameLoop);
}

function handleKeyDown(e) {
    if (gameState.state !== CONFIG.STATE.PLAY) return;
    const oldLane = gameState.currentLane;
    if (e.key === 'ArrowLeft') gameState.currentLane = Math.max(0, gameState.currentLane - 1);
    if (e.key === 'ArrowRight') gameState.currentLane = Math.min(CONFIG.LANES - 1, gameState.currentLane + 1);
    if (gameState.currentLane !== oldLane) {
        // compute new target X
        gameState.targetX = gameState.currentLane * (canvas.width * CONFIG.LANE_WIDTH_RATIO)
            + (canvas.width * CONFIG.LANE_WIDTH_RATIO) / 2;
    }
}

function handleKeyUp() { }

function togglePause() {
    if (gameState.state === CONFIG.STATE.PLAY) {
        gameState.state = CONFIG.STATE.PAUSED;
        elements.pauseOv.classList.remove('hidden');
        cancelAnimationFrame(gameState.raf);
    } else if (gameState.state === CONFIG.STATE.PAUSED) {
        elements.pauseOv.classList.add('hidden');
        gameState.state = CONFIG.STATE.PLAY;
        gameState.lastTime = performance.now();
        requestAnimationFrame(gameLoop);
    }
}

function gameLoop(ts) {
    const dt = (ts - gameState.lastTime) / 1000;
    gameState.lastTime = ts;
    if (gameState.state !== CONFIG.STATE.PLAY) return;
    update(dt); render();
    gameState.raf = requestAnimationFrame(gameLoop);
}

function update(dt) {
    // spawn obstacles
    gameState.lastSpawn += dt;
    if (gameState.lastSpawn > gameState.spawnInterval) {
        gameState.lastSpawn = 0;
        const lane = Math.floor(Math.random() * CONFIG.LANES);
        const x = lane * (canvas.width * CONFIG.LANE_WIDTH_RATIO) + canvas.width * CONFIG.LANE_WIDTH_RATIO / 2 - CONFIG.BLOCK_WIDTH / 2;
        gameState.obstacles.push({ x, y: -CONFIG.BLOCK_HEIGHT });
    }
    // speed up every 15s
    gameState.timerSpeedUp += dt;
    if (gameState.timerSpeedUp > 15) {
        gameState.timerSpeedUp = 0;
        gameState.speed *= CONFIG.SPEED_INCREMENT;
        gameState.spawnInterval /= CONFIG.SPEED_INCREMENT;
    }
    // animate player X toward targetX
    gameState.playerX += (gameState.targetX - gameState.playerX)
        * Math.min(1, dt * CONFIG.LANE_SWITCH_SPEED);

    // move obstacles & check collisions
    for (let o of gameState.obstacles) o.y += gameState.speed * dt;
    gameState.obstacles = gameState.obstacles.filter(o => {
        if (o.y > canvas.height) {
            gameState.score++;
            updateUI();
            return false;
        }
        // collision with player
        if (o.y + CONFIG.BLOCK_HEIGHT > canvas.height - 30 - 10 &&
            Math.abs(o.x + CONFIG.BLOCK_WIDTH / 2 - gameState.playerX) < CONFIG.BLOCK_WIDTH) {
            gameState.lives--;
            gameState.hitTimer = CONFIG.HIT_FLASH_TIME;  // trigger red flash
            updateLives();
            return false;
        }
        return true;
    });

    // decrement flash timer
    if (gameState.hitTimer > 0) gameState.hitTimer = Math.max(0, gameState.hitTimer - dt);

    if (gameState.lives <= 0) endGame();
}

function updateUI() {
    elements.score.textContent = gameState.score;
    updateLives();
}

function updateLives() {
    document.querySelectorAll('.life').forEach((d, i) => {
        d.classList.toggle('lost', i >= gameState.lives);
    });
}

function endGame() {
    gameState.state = CONFIG.STATE.OVER;
    cancelAnimationFrame(gameState.raf);
    if (gameState.score > gameState.highScore) {
        gameState.highScore = gameState.score;
        localStorage.setItem(CONFIG.STORAGE_KEY, gameState.highScore);
    }
    elements.finalScore.textContent = gameState.score;
    elements.highScore.textContent = gameState.highScore;
    setTimeout(() => elements.gameOver.classList.remove('hidden'), 500);
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // draw player, flash red if recently hit
    ctx.fillStyle = gameState.hitTimer > 0 ? '#FF0000' : '#FFFFFF';
    ctx.beginPath();
    ctx.arc(gameState.playerX, canvas.height - 30, 15, 0, 2 * Math.PI);  // radius increased from 10 to 15
    ctx.fill();
    // draw obstacles
    ctx.fillStyle = '#666666';
    for (let o of gameState.obstacles) {
        ctx.fillRect(o.x, o.y, CONFIG.BLOCK_WIDTH, CONFIG.BLOCK_HEIGHT);
    }
}

function handleError(e) {
    console.error(e);
    elements.errOv.classList.remove('hidden');
}

window.addEventListener('DOMContentLoaded', initGame);
