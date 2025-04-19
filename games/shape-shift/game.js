// Game constants
const CONFIG = {
    INITIAL_LIVES: 3,
    STORAGE_KEY: 'shapeShiftHighScore',
    SHAPES: ['circle', 'square', 'triangle', 'hexagon'],
    INITIAL_SPEED: 200, // px per second
    SPEED_INCREMENT: 10, // per score
    INITIAL_SPAWN_INTERVAL: 2000, // ms
    MIN_SPAWN_INTERVAL: 600, // ms
    SPAWN_DECREMENT: 20, // ms per score
    FLASH_DURATION: 0.2, // seconds red flash on life loss
    VISUAL: {
        MAIN_COLOR: '#FFFFFF',
        OBSTACLE_COLOR: '#666666',
        ERROR_COLOR: '#FF0000',
    },
    GAME_STATE: {
        INTRO: 'intro',
        PLAYING: 'playing',
        PAUSED: 'paused',
        GAME_OVER: 'gameover',
        ERROR: 'error'
    }
};

// Game state
const gameState = {
    state: CONFIG.GAME_STATE.INTRO,
    score: 0,
    lives: CONFIG.INITIAL_LIVES,
    highScore: 0,
    isPlaying: false,
    isPaused: false,
    lastTime: 0,
    spawnTimer: 0,
    speed: 0,
    avatarIndex: 0,
    gates: []
};

// DOM elements
let canvas, ctx;
let scoreDisplay, livesContainer;
let helpButton, helpPanel, closeHelp;
let pauseOverlay, gameOverOverlay, finalScoreDisplay, highScoreDisplay, restartButton;
let errorOverlay;

// Initialization
function initGame() {
    try {
        canvas = document.getElementById('game-canvas');
        ctx = canvas.getContext('2d');
        scoreDisplay = document.getElementById('score');
        livesContainer = document.getElementById('lives-container');
        helpButton = document.getElementById('help-button');
        helpPanel = document.getElementById('help-panel');
        closeHelp = document.getElementById('close-help');
        pauseOverlay = document.getElementById('pause-overlay');
        gameOverOverlay = document.getElementById('game-over');
        finalScoreDisplay = document.getElementById('final-score');
        highScoreDisplay = document.getElementById('high-score');
        restartButton = document.getElementById('restart-button');
        errorOverlay = document.getElementById('error-overlay');

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        gameState.highScore = parseInt(localStorage.getItem(CONFIG.STORAGE_KEY)) || 0;

        resetGameVariables();
        createLivesIndicators();
        addEventListeners();
        startIntro();
    } catch (error) {
        handleError(error);
    }
}

function resetGameVariables() {
    gameState.score = 0;
    gameState.lives = CONFIG.INITIAL_LIVES;
    gameState.avatarIndex = 0;
    gameState.gates = [];
    gameState.speed = CONFIG.INITIAL_SPEED;
    gameState.spawnTimer = CONFIG.INITIAL_SPAWN_INTERVAL;
    gameState.flashTimer = 0; // reset flash timer
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function createLivesIndicators() {
    livesContainer.innerHTML = '';
    for (let i = 0; i < CONFIG.INITIAL_LIVES; i++) {
        const life = document.createElement('div');
        life.className = 'life';
        livesContainer.appendChild(life);
    }
}

function addEventListeners() {
    helpButton.addEventListener('click', toggleHelpPanel);
    closeHelp.addEventListener('click', toggleHelpPanel);
    restartButton.addEventListener('click', startGame);

    document.addEventListener('keydown', (e) => {
        if (gameState.state !== CONFIG.GAME_STATE.PLAYING) return;
        if (e.key === ' ') {
            gameState.avatarIndex = (gameState.avatarIndex + 1) % CONFIG.SHAPES.length;
        }
    });

    document.addEventListener('keydown', (event) => {
        switch (event.key) {
            case 'Escape':
                togglePause();
                break;
            case 'q': case 'Q':
                navigateToLanding();
                break;
        }
    });

    window.addEventListener('error', (e) => handleError(e.error));
}

function toggleHelpPanel() {
    helpPanel.classList.toggle('hidden');
}

function togglePause() {
    if (!gameState.isPlaying) return;
    gameState.isPaused = !gameState.isPaused;
    gameState.state = gameState.isPaused ? CONFIG.GAME_STATE.PAUSED : CONFIG.GAME_STATE.PLAYING;
    pauseOverlay.classList.toggle('hidden', !gameState.isPaused);
    if (!gameState.isPaused) {
        gameState.lastTime = performance.now();
        requestAnimationFrame(gameLoop);
    }
}

function startIntro() {
    gameState.state = CONFIG.GAME_STATE.INTRO;
    setTimeout(startGame, 1000);
}

function startGame() {
    resetGameVariables();
    gameState.isPlaying = true;
    gameState.state = CONFIG.GAME_STATE.PLAYING;
    scoreDisplay.textContent = gameState.score;
    updateLivesDisplay();
    pauseOverlay.classList.add('hidden');
    gameOverOverlay.classList.add('hidden');
    gameState.lastTime = performance.now();
    requestAnimationFrame(gameLoop);
}

function gameOver() {
    gameState.isPlaying = false;
    gameState.state = CONFIG.GAME_STATE.GAME_OVER;
    finalScoreDisplay.textContent = gameState.score;
    if (gameState.score > gameState.highScore) {
        gameState.highScore = gameState.score;
        localStorage.setItem(CONFIG.STORAGE_KEY, gameState.highScore);
    }
    highScoreDisplay.textContent = gameState.highScore;
    setTimeout(() => gameOverOverlay.classList.remove('hidden'), 500);
}

function updateLivesDisplay() {
    const lives = document.querySelectorAll('.life');
    lives.forEach((life, idx) => {
        life.classList.toggle('lost', idx >= gameState.lives);
    });
}

function navigateToLanding() {
    window.location.href = '../../index.html';
}

function gameLoop(timestamp) {
    if (!gameState.isPlaying || gameState.isPaused) return;
    const delta = (timestamp - gameState.lastTime) / 1000;
    gameState.lastTime = timestamp;

    update(delta);
    render();
    requestAnimationFrame(gameLoop);
}

function update(delta) {
    // handle flash timer
    if (gameState.flashTimer > 0) {
        gameState.flashTimer = Math.max(0, gameState.flashTimer - delta);
    }
    gameState.spawnTimer -= delta * 1000;
    if (gameState.spawnTimer <= 0) {
        spawnGate();
        const next = CONFIG.INITIAL_SPAWN_INTERVAL - gameState.score * CONFIG.SPAWN_DECREMENT;
        gameState.spawnTimer = Math.max(CONFIG.MIN_SPAWN_INTERVAL, next);
    }
    gameState.speed = CONFIG.INITIAL_SPEED + gameState.score * CONFIG.SPEED_INCREMENT;

    gameState.gates.forEach(gate => {
        gate.x -= gameState.speed * delta;
        if (!gate.passed && gate.x < avatarX()) {
            gate.passed = true;
            if (gate.type === gameState.avatarIndex) {
                gameState.score++;
                scoreDisplay.textContent = gameState.score;
            } else {
                gameState.lives--;
                gameState.flashTimer = CONFIG.FLASH_DURATION; // trigger red flash
                updateLivesDisplay();
                if (gameState.lives <= 0) return gameOver();
            }
        }
    });

    gameState.gates = gameState.gates.filter(g => g.x > -shapeSize());
}

function spawnGate() {
    const type = Math.floor(Math.random() * CONFIG.SHAPES.length);
    gameState.gates.push({ type, x: canvas.width + shapeSize(), passed: false });
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // draw obstacles first (background), then avatar (foreground)
    gameState.gates.forEach(drawGate);
    drawAvatar();
}

function drawAvatar() {
    const x = avatarX(), y = canvas.height / 2, size = shapeSize();
    // flash red on recent life loss
    const color = gameState.flashTimer > 0 ? CONFIG.VISUAL.ERROR_COLOR : CONFIG.VISUAL.MAIN_COLOR;
    ctx.fillStyle = color;
    drawShape(ctx, x, y, size, CONFIG.SHAPES[gameState.avatarIndex]);
}

function drawGate(gate) {
    const x = gate.x, y = canvas.height / 2, size = shapeSize();
    ctx.fillStyle = CONFIG.VISUAL.OBSTACLE_COLOR;
    drawShape(ctx, x, y, size, CONFIG.SHAPES[gate.type]);
}

function avatarX() {
    return canvas.width * 0.2;
}

function shapeSize() {
    return Math.min(canvas.width, canvas.height) * 0.08;
}

function drawShape(ctx, cx, cy, size, type) {
    // fillStyle set by caller for dynamic coloring
    ctx.beginPath();
    switch (type) {
        case 'circle':
            ctx.arc(cx, cy, size / 2, 0, Math.PI * 2);
            break;
        case 'square':
            ctx.rect(cx - size / 2, cy - size / 2, size, size);
            break;
        case 'triangle':
            ctx.moveTo(cx, cy - size / 2);
            ctx.lineTo(cx - size / 2, cy + size / 2);
            ctx.lineTo(cx + size / 2, cy + size / 2);
            break;
        case 'hexagon':
            for (let i = 0; i < 6; i++) {
                const angle = Math.PI / 3 * i - Math.PI / 6;
                const x = cx + Math.cos(angle) * (size / 2);
                const y = cy + Math.sin(angle) * (size / 2);
                i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            }
            break;
    }
    ctx.closePath();
    ctx.fill();
}

// Error handling
function handleError(error) {
    console.error(error);
    gameState.state = CONFIG.GAME_STATE.ERROR;
    errorOverlay.classList.remove('hidden');
}

// Start
document.addEventListener('DOMContentLoaded', initGame);