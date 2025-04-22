// Mirror Dash - Minimalist Endless Reflex Game
(() => {
    const CONFIG = {
        INITIAL_LIVES: 3,
        STORAGE_KEY: 'mirrorDashHighScore',
        VISUAL: {
            MAIN_COLOR: '#FFFFFF',
            SECONDARY_COLOR: '#999999',
            ERROR_COLOR: '#FF0000',
            FLASH_DURATION: 200,
            INVINCIBILITY_DURATION: 2000
        },
        PHYSICS: {
            PLAYER_SIZE: 30,
            PLAYER_SPEED: 400,
            OBSTACLE_WIDTH: 60,
            OBSTACLE_HEIGHT: 20,
            OBSTACLE_SPEED_START: 200,
            OBSTACLE_SPEED_INCREMENT: 10,
            OBSTACLE_SPAWN_INTERVAL_START: 1200,
            OBSTACLE_SPAWN_INTERVAL_MIN: 400,
            OBSTACLE_SPAWN_DECREASE: 10
        }
    };

    // DOM and canvas
    let canvas, ctx, scoreEl, livesEl, helpBtn, helpPanel, closeHelp;
    let pauseOv, gameOverOv, finalScoreEl, highScoreEl, restartBtn, errorOv;
    // Game state
    let width, height;
    let playerX, mirrorX;
    let obstacles = [];
    let score = 0, highScore = 0, lives = CONFIG.INITIAL_LIVES;
    let obstacleSpeed, spawnInterval, spawnTimer = 0;
    let isPlaying = false, isPaused = false, invincible = false;
    // life lost feedback
    let flashRed = false, blinkState = true, blinkInterval = null;
    let lastTime = 0;

    function init() {
        canvas = document.getElementById('game-canvas');
        ctx = canvas.getContext('2d');
        scoreEl = document.getElementById('score');
        livesEl = document.getElementById('lives-container');
        helpBtn = document.getElementById('help-button');
        helpPanel = document.getElementById('help-panel');
        closeHelp = document.getElementById('close-help');
        pauseOv = document.getElementById('pause-overlay');
        gameOverOv = document.getElementById('game-over');
        finalScoreEl = document.getElementById('final-score');
        highScoreEl = document.getElementById('high-score');
        restartBtn = document.getElementById('restart-button');
        errorOv = document.getElementById('error-overlay');

        window.addEventListener('resize', resize);
        document.addEventListener('keydown', onKeyDown);
        document.addEventListener('keyup', onKeyUp);
        helpBtn.addEventListener('click', toggleHelp);
        closeHelp.addEventListener('click', toggleHelp);
        restartBtn.addEventListener('click', startGame);
        window.addEventListener('error', () => showError());

        highScore = parseInt(localStorage.getItem(CONFIG.STORAGE_KEY)) || 0;
        createLives();
        resize();
        // initial positions now handled in resize()
        startIntro();
    }

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        const sz = CONFIG.PHYSICS.PLAYER_SIZE;
        // center players horizontally
        playerX = (width - sz) / 2;
        mirrorX = playerX;
    }

    function createLives() {
        livesEl.innerHTML = '';
        for (let i = 0; i < CONFIG.INITIAL_LIVES; i++) {
            const d = document.createElement('div');
            d.className = 'life';
            livesEl.appendChild(d);
        }
    }

    function startIntro() {
        isPlaying = false;
        setTimeout(startGame, 1000);
    }

    function startGame() {
        isPlaying = true;
        isPaused = false;
        score = 0;
        lives = CONFIG.INITIAL_LIVES;
        obstacleSpeed = CONFIG.PHYSICS.OBSTACLE_SPEED_START;
        spawnInterval = CONFIG.PHYSICS.OBSTACLE_SPAWN_INTERVAL_START;
        spawnTimer = 0;
        obstacles = [];
        invincible = false;
        // reset life feedback
        flashRed = false;
        blinkState = true;
        if (blinkInterval) {
            clearInterval(blinkInterval);
            blinkInterval = null;
        }
        scoreEl.textContent = score;
        updateLives();
        pauseOv.classList.add('hidden');
        gameOverOv.classList.add('hidden');
        lastTime = performance.now();
        requestAnimationFrame(loop);
    }

    function loop(ts) {
        if (!isPlaying || isPaused) return;
        const dt = (ts - lastTime) / 1000;
        lastTime = ts;
        try {
            update(dt);
            render();
            requestAnimationFrame(loop);
        } catch {
            showError();
        }
    }

    function update(dt) {
        // movement
        if (keys.left) playerX = Math.max(0, playerX - CONFIG.PHYSICS.PLAYER_SPEED * dt);
        if (keys.right) playerX = Math.min(width - CONFIG.PHYSICS.PLAYER_SIZE, playerX + CONFIG.PHYSICS.PLAYER_SPEED * dt);
        // mirror follows player symmetrically
        mirrorX = width - playerX - CONFIG.PHYSICS.PLAYER_SIZE;

        // spawning
        spawnTimer += dt * 1000;
        if (spawnTimer >= spawnInterval) {
            spawnTimer = 0;
            const dir = Math.random() < 0.5 ? 'down' : 'up';
            const w = CONFIG.PHYSICS.OBSTACLE_WIDTH;
            const h = CONFIG.PHYSICS.OBSTACLE_HEIGHT;
            const x = Math.random() * (width - w);
            const y = dir === 'down' ? -h : height;
            obstacles.push({ x, y, w, h, dir, passed: false });
            // increase difficulty
            obstacleSpeed += CONFIG.PHYSICS.OBSTACLE_SPEED_INCREMENT;
            spawnInterval = Math.max(CONFIG.PHYSICS.OBSTACLE_SPAWN_INTERVAL_MIN, spawnInterval - CONFIG.PHYSICS.OBSTACLE_SPAWN_DECREASE);
        }

        // move
        obstacles.forEach(o => {
            o.y += (o.dir === 'down' ? 1 : -1) * obstacleSpeed * dt;
        });
        // collision & removal & scoring
        obstacles = obstacles.filter(o => {
            // check pass
            if (!o.passed && ((o.dir === 'down' && o.y > height) || (o.dir === 'up' && o.y + o.h < 0))) {
                o.passed = true;
                score++;
                scoreEl.textContent = score;
            }
            // collision
            if (!invincible) {
                const size = CONFIG.PHYSICS.PLAYER_SIZE;
                const bottomY = height * 0.75;
                const topY = height * 0.25;
                // bottom
                if (playerX < o.x + o.w && playerX + size > o.x && bottomY < o.y + o.h && bottomY + size > o.y) {
                    hit();
                    o.passed = true;
                }
                // mirror
                const mx = mirrorX;
                if (mx < o.x + o.w && mx + size > o.x && topY < o.y + o.h && topY + size > o.y) {
                    hit();
                    o.passed = true;
                }
            }
            // keep onscreen until passed
            return !(o.passed && ((o.dir === 'down' && o.y > height) || (o.dir === 'up' && o.y + o.h < 0)));
        });
    }

    function render() {
        ctx.clearRect(0, 0, width, height);
        const size = CONFIG.PHYSICS.PLAYER_SIZE;
        const bottomY = height * 0.75;
        const topY = height * 0.25;
        // draw obstacles
        ctx.fillStyle = CONFIG.VISUAL.SECONDARY_COLOR;
        obstacles.forEach(o => ctx.fillRect(o.x, o.y, o.w, o.h));
        // draw player and mirror with life lost feedback
        if (flashRed) {
            ctx.globalAlpha = 1;
            ctx.fillStyle = CONFIG.VISUAL.ERROR_COLOR;
        } else if (invincible) {
            ctx.globalAlpha = blinkState ? 1 : 0;
            ctx.fillStyle = CONFIG.VISUAL.MAIN_COLOR;
        } else {
            ctx.globalAlpha = 1;
            ctx.fillStyle = CONFIG.VISUAL.MAIN_COLOR;
        }
        ctx.fillRect(playerX, bottomY, size, size);
        ctx.fillRect(mirrorX, topY, size, size);
        ctx.globalAlpha = 1;
    }

    function hit() {
        if (lives <= 0) return;
        lives--;
        updateLives();
        // step 1: flash red at full opacity
        flashRed = true;
        invincible = true;
        // after red flash, start blinking
        setTimeout(() => {
            flashRed = false;
            blinkInterval = setInterval(() => { blinkState = !blinkState; }, 200);
        }, CONFIG.VISUAL.FLASH_DURATION);
        // end invincibility and blinking after duration
        setTimeout(() => {
            invincible = false;
            blinkState = true;
            clearInterval(blinkInterval);
        }, CONFIG.VISUAL.INVINCIBILITY_DURATION);
        if (lives <= 0) endGame();
    }

    function updateLives() {
        document.querySelectorAll('.life').forEach((d, i) => d.classList.toggle('lost', i >= lives));
    }

    function endGame() {
        isPlaying = false;
        if (score > highScore) {
            highScore = score;
            localStorage.setItem(CONFIG.STORAGE_KEY, highScore);
        }
        finalScoreEl.textContent = score;
        highScoreEl.textContent = highScore;
        setTimeout(() => gameOverOv.classList.remove('hidden'), 500);
    }

    let keys = { left: false, right: false };
    function onKeyDown(e) {
        if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = true;
        if (e.key === 'ArrowRight' || e.key === 'd') keys.right = true;
        if (e.key === 'Escape') togglePause();
        if (e.key === 'q' || e.key === 'Q') window.location.href = '../../index.html';
    }
    function onKeyUp(e) {
        if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = false;
        if (e.key === 'ArrowRight' || e.key === 'd') keys.right = false;
    }

    function togglePause() {
        if (!isPlaying) return;
        isPaused = !isPaused;
        pauseOv.classList.toggle('hidden', !isPaused);
        if (!isPaused) {
            lastTime = performance.now();
            requestAnimationFrame(loop);
        }
    }

    function toggleHelp() {
        helpPanel.classList.toggle('hidden');
    }

    function showError() {
        errorOv.classList.remove('hidden');
        isPlaying = false;
    }

    document.addEventListener('DOMContentLoaded', init);
})();