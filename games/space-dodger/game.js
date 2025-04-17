/**
 * Space Dodger - A minimalist arcade game
 * Core mechanic: Mouse-based asteroid avoidance
 */

(function () {
    'use strict';

    // ==========================================
    // Game constants
    // ==========================================
    const CONFIG = {
        // Game settings
        INITIAL_LIVES: 3,
        PARTICLE_POOL_SIZE: 100,
        ASTEROID_POOL_SIZE: 50,
        STORAGE_KEY_PLAYED: 'space-dodger-played',
        STORAGE_KEY_HIGH_SCORE: 'space-dodger-high-score',
        INVINCIBILITY_DURATION: 1, // seconds

        // Visual settings
        VISUAL: {
            MAIN_COLOR: '#FFFFFF', // White for player, particles, UI text
            BLACK: '#000000',
            GRAY_ASTEROID: '#999999', // Gray for asteroids
            TRANSITION_SPEED: 0.3, // seconds
        },

        // Game states
        GAME_STATE: {
            INTRO: 'intro',
            PLAYING: 'playing',
            PAUSED: 'paused',
            GAME_OVER: 'gameover',
            ERROR: 'error'
        }
    };

    // ==========================================
    // Game state
    // ==========================================
    const gameState = {
        // Core game state
        state: CONFIG.GAME_STATE.INTRO,
        score: 0,
        lives: CONFIG.INITIAL_LIVES,
        highScore: 0,
        hasPlayed: false,

        // Animation and timing
        lastTime: 0,
        delta: 0,
        gameTime: 0,
        difficultyProgress: 0,
        animationFrameId: null,

        // Mouse input (this game uses mouse only)
        mouse: {
            x: 0,
            y: 0
        },

        // Game entities
        player: null, // Will be initialized in startIntro/startGame
        asteroids: [],
        particles: [],

        // Object pools for better performance
        asteroidPool: [],
        particlePool: []
    };

    // ==========================================
    // DOM elements
    // ==========================================
    let canvas, ctx;
    let scoreDisplay, progressBar, livesContainer;
    let helpButton, helpPanel, closeHelp;
    let pauseOverlay, gameOverOverlay, finalScoreDisplay, highScoreDisplay, restartButton;
    let errorOverlay;

    // ==========================================
    // Initialization
    // ==========================================
    function init() {
        try {
            // Get canvas and context
            canvas = document.getElementById('game-canvas');
            ctx = canvas.getContext('2d');

            // Set canvas dimensions
            resizeCanvas();
            window.addEventListener('resize', resizeCanvas);

            // Get UI elements
            scoreDisplay = document.getElementById('score');
            progressBar = document.getElementById('progress-bar');
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

            // Create lives indicators
            createLivesIndicators();

            // Add event listeners
            addEventListeners();

            // Initialize pools
            initializePools();

            // Check local storage
            loadGameState();

            // Start the intro sequence
            startIntro();

            // Show cursor initially
            document.body.style.cursor = 'default';

            // Start the game loop
            gameState.animationFrameId = requestAnimationFrame(gameLoop);
        } catch (error) {
            handleError(error);
        }
    }

    // ==========================================
    // Setup functions
    // ==========================================
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

    function initializePools() {
        // Pre-create objects for better performance
        for (let i = 0; i < CONFIG.PARTICLE_POOL_SIZE; i++) {
            gameState.particlePool.push({});
        }

        for (let i = 0; i < CONFIG.ASTEROID_POOL_SIZE; i++) {
            gameState.asteroidPool.push({});
        }
    }

    function addEventListeners() {
        // Mouse movement tracking
        canvas.addEventListener('mousemove', handleMouseMove);

        // Help button toggle
        helpButton.addEventListener('click', toggleHelpPanel);
        closeHelp.addEventListener('click', toggleHelpPanel);

        // Restart button
        restartButton.addEventListener('click', startGame);

        // Keyboard controls
        document.addEventListener('keydown', handleKeyPress);

        // Error handling
        window.addEventListener('error', function (event) {
            handleError(event.error);
        });
    }

    // ==========================================
    // UI functions
    // ==========================================
    function toggleHelpPanel() {
        helpPanel.classList.toggle('hidden');

        // Show cursor when help panel is visible, hide it during gameplay
        if (!helpPanel.classList.contains('hidden')) {
            document.body.style.cursor = 'default';
        } else if (gameState.state === CONFIG.GAME_STATE.PLAYING) {
            document.body.style.cursor = 'none';
        }
    }

    function togglePause() {
        if (gameState.state === CONFIG.GAME_STATE.PLAYING) {
            gameState.state = CONFIG.GAME_STATE.PAUSED;
            pauseOverlay.classList.remove('hidden');
            document.body.style.cursor = 'default'; // Show cursor when paused
        } else if (gameState.state === CONFIG.GAME_STATE.PAUSED) {
            gameState.state = CONFIG.GAME_STATE.PLAYING;
            pauseOverlay.classList.add('hidden');
            document.body.style.cursor = 'none'; // Hide cursor when resuming gameplay
            gameState.lastTime = 0; // Reset delta time to prevent jumps
        }
    }

    function updateLivesDisplay() {
        const lifeElements = document.querySelectorAll('.life');
        lifeElements.forEach((life, index) => {
            life.classList.toggle('lost', index >= gameState.lives);
        });
    }

    function updateScoreDisplay() {
        scoreDisplay.textContent = Math.floor(gameState.score);
    }

    function updateProgressBar(progress) {
        if (!progressBar) return;
        progressBar.style.width = `${progress * 100}%`;
    }

    function navigateToLanding() {
        window.location.href = '../../index.html';
    }

    // ==========================================
    // Input handlers
    // ==========================================
    function handleMouseMove(event) {
        gameState.mouse.x = event.clientX;
        gameState.mouse.y = event.clientY;
    }

    function handleKeyPress(event) {
        switch (event.key) {
            case 'Escape':
                togglePause();
                break;
            case 'q':
            case 'Q':
                navigateToLanding();
                break;
        }
    }

    // ==========================================
    // Game state functions
    // ==========================================
    function loadGameState() {
        try {
            gameState.hasPlayed = localStorage.getItem(CONFIG.STORAGE_KEY_PLAYED) === 'true';
            const savedScore = localStorage.getItem(CONFIG.STORAGE_KEY_HIGH_SCORE);
            if (savedScore) {
                gameState.highScore = parseInt(savedScore, 10);
            }
        } catch (error) {
            console.error('LocalStorage error:', error);
            // Continue without storage
        }
    }

    function saveGameState() {
        try {
            localStorage.setItem(CONFIG.STORAGE_KEY_PLAYED, 'true');
            localStorage.setItem(CONFIG.STORAGE_KEY_HIGH_SCORE, gameState.highScore.toString());
        } catch (error) {
            console.error('LocalStorage error:', error);
        }
    }

    function startIntro() {
        gameState.state = CONFIG.GAME_STATE.INTRO;
        gameState.asteroids = [];
        gameState.particles = [];

        // Show cursor during intro
        document.body.style.cursor = 'default';

        // Initialize player
        gameState.player = {
            x: canvas.width / 2,
            y: canvas.height / 2,
            size: 20,
            targetX: canvas.width / 2,
            targetY: canvas.height / 2,
            speed: 0.15,
            rotation: 0,
            active: true,
            invincible: false, // Added
            invincibilityTimer: 0 // Added
        };

        // Create converging particles for intro effect
        for (let i = 0; i < 20; i++) {
            createParticle(
                Math.random() * canvas.width,
                Math.random() * canvas.height,
                canvas.width / 2,
                canvas.height / 2,
                1.5 + Math.random() * 1.5
            );
        }

        // Transition to playing state after animation
        setTimeout(() => {
            startGame();
        }, 1500);
    }

    function startGame() {
        // Hide overlays
        pauseOverlay.classList.add('hidden');
        gameOverOverlay.classList.add('hidden');

        // Reset game parameters
        gameState.state = CONFIG.GAME_STATE.PLAYING;
        gameState.gameTime = 0;
        gameState.difficultyProgress = 0;
        gameState.score = 0;
        gameState.lives = CONFIG.INITIAL_LIVES;
        updateLivesDisplay();
        updateScoreDisplay();
        updateProgressBar(0);

        // Reset player position and state
        gameState.player.x = canvas.width / 2;
        gameState.player.y = canvas.height / 2;
        gameState.player.targetX = canvas.width / 2;
        gameState.player.targetY = canvas.height / 2;
        gameState.player.active = true;
        gameState.player.invincible = true; // Start invincible
        gameState.player.invincibilityTimer = CONFIG.INVINCIBILITY_DURATION; // Set timer

        // Clear game objects
        gameState.asteroids = [];
        gameState.particles = [];

        // Mark as played
        gameState.hasPlayed = true;
        saveGameState();

        // Hide cursor during active gameplay
        document.body.style.cursor = 'none';
    }

    function gameOver() {
        gameState.state = CONFIG.GAME_STATE.GAME_OVER;
        gameState.player.active = false;

        // Show cursor at game over
        document.body.style.cursor = 'default';

        // Update game over screen with final score
        finalScoreDisplay.textContent = Math.floor(gameState.score);
        highScoreDisplay.textContent = gameState.highScore;

        // Show game over overlay after a short delay
        setTimeout(() => {
            gameOverOverlay.classList.remove('hidden');
        }, 1000);
    }

    // ==========================================
    // Game loop & Main update functions
    // ==========================================
    function gameLoop(timestamp) {
        try {
            // Calculate delta time for smooth animation
            if (!gameState.lastTime) gameState.lastTime = timestamp;
            gameState.delta = (timestamp - gameState.lastTime) / 1000; // Convert to seconds
            gameState.lastTime = timestamp;

            // Clear canvas
            ctx.fillStyle = CONFIG.VISUAL.BLACK;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Update and render based on game state
            switch (gameState.state) {
                case CONFIG.GAME_STATE.INTRO:
                    updateIntro(gameState.delta);
                    renderIntro();
                    break;
                case CONFIG.GAME_STATE.PLAYING:
                    updatePlaying(gameState.delta);
                    renderPlaying();
                    break;
                case CONFIG.GAME_STATE.PAUSED:
                    renderPlaying(); // Still render the game while paused
                    break;
                case CONFIG.GAME_STATE.GAME_OVER:
                    updateGameOver(gameState.delta);
                    renderGameOver();
                    break;
                case CONFIG.GAME_STATE.ERROR:
                    // Error overlay is handled by DOM
                    break;
            }

            // Continue game loop
            gameState.animationFrameId = requestAnimationFrame(gameLoop);
        } catch (error) {
            handleError(error);
        }
    }

    function updateIntro(delta) {
        updateParticles(delta);
    }

    function updatePlaying(delta) {
        // Update game time and score
        gameState.gameTime += delta;
        gameState.score = gameState.gameTime * 10; // Score is time * 10
        updateScoreDisplay();

        // Update difficulty progress (max at 3 minutes)
        gameState.difficultyProgress = Math.min(1, gameState.gameTime / 180);
        updateProgressBar(gameState.difficultyProgress);

        // Update high score
        if (gameState.score > gameState.highScore) {
            gameState.highScore = Math.floor(gameState.score);
            saveGameState();
        }

        // Update player
        updatePlayer(delta);

        // Spawn asteroids based on difficulty
        if (Math.random() < 0.05 + (gameState.difficultyProgress * 0.15)) {
            spawnAsteroid();
        }

        // Update game objects
        updateAsteroids(delta);
        updateParticles(delta);

        // Check for collisions
        checkCollisions();
    }

    function updateGameOver(delta) {
        updateParticles(delta);
    }

    // ==========================================
    // Game entity update functions
    // ==========================================
    function updatePlayer(delta) {
        if (!gameState.player || !gameState.player.active) return;

        // Update invincibility timer
        if (gameState.player.invincible) {
            gameState.player.invincibilityTimer -= delta;
            if (gameState.player.invincibilityTimer <= 0) {
                gameState.player.invincible = false;
            }
        }

        // Smooth movement towards mouse position
        gameState.player.targetX = gameState.mouse.x;
        gameState.player.targetY = gameState.mouse.y;

        gameState.player.x += (gameState.player.targetX - gameState.player.x) * gameState.player.speed * (delta * 60);
        gameState.player.y += (gameState.player.targetY - gameState.player.y) * gameState.player.speed * (delta * 60);

        // Subtle rotation based on movement
        const dx = gameState.player.targetX - gameState.player.x;
        const dy = gameState.player.targetY - gameState.player.y;
        const targetRotation = Math.atan2(dy, dx) + Math.PI / 2;

        // Normalize angle difference
        let rotDiff = targetRotation - gameState.player.rotation;
        if (rotDiff > Math.PI) rotDiff -= Math.PI * 2;
        if (rotDiff < -Math.PI) rotDiff += Math.PI * 2;

        gameState.player.rotation += rotDiff * 0.1 * (delta * 60);

        // Create trail particles during movement
        if (Math.random() < 0.2 && (Math.abs(dx) > 1 || Math.abs(dy) > 1)) {
            const trailX = gameState.player.x - Math.cos(gameState.player.rotation - Math.PI / 2) * gameState.player.size * 0.5;
            const trailY = gameState.player.y - Math.sin(gameState.player.rotation - Math.PI / 2) * gameState.player.size * 0.5;

            createParticle(
                trailX,
                trailY,
                trailX + (Math.random() - 0.5) * 10,
                trailY + (Math.random() - 0.5) * 10,
                0.5 + Math.random()
            );
        }
    }

    function spawnAsteroid() {
        // Get asteroid from pool or create new
        let asteroid = gameState.asteroidPool.length > 0 ? gameState.asteroidPool.pop() : {};

        // Position outside viewport
        const side = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
        const speedMultiplier = 1 + gameState.difficultyProgress * 2;

        switch (side) {
            case 0: // top
                asteroid.x = Math.random() * canvas.width;
                asteroid.y = -50;
                asteroid.speedY = (1 + Math.random() * 2) * speedMultiplier;
                asteroid.speedX = (Math.random() - 0.5) * 2 * speedMultiplier;
                break;
            case 1: // right
                asteroid.x = canvas.width + 50;
                asteroid.y = Math.random() * canvas.height;
                asteroid.speedX = -(1 + Math.random() * 2) * speedMultiplier;
                asteroid.speedY = (Math.random() - 0.5) * 2 * speedMultiplier;
                break;
            case 2: // bottom
                asteroid.x = Math.random() * canvas.width;
                asteroid.y = canvas.height + 50;
                asteroid.speedY = -(1 + Math.random() * 2) * speedMultiplier;
                asteroid.speedX = (Math.random() - 0.5) * 2 * speedMultiplier;
                break;
            case 3: // left
                asteroid.x = -50;
                asteroid.y = Math.random() * canvas.height;
                asteroid.speedX = (1 + Math.random() * 2) * speedMultiplier;
                asteroid.speedY = (Math.random() - 0.5) * 2 * speedMultiplier;
                break;
        }

        // Common properties
        asteroid.size = 15 + Math.random() * 25;
        asteroid.rotation = Math.random() * Math.PI * 2;
        asteroid.rotationSpeed = (Math.random() - 0.5) * 0.1;
        asteroid.shape = Math.floor(Math.random() * 5); // 0: circle, 1: triangle, 2: square, 3: pentagon, 4: hexagon

        gameState.asteroids.push(asteroid);
    }

    function updateAsteroids(delta) {
        for (let i = gameState.asteroids.length - 1; i >= 0; i--) {
            const asteroid = gameState.asteroids[i];

            // Update position
            asteroid.x += asteroid.speedX * delta * 60;
            asteroid.y += asteroid.speedY * delta * 60;

            // Update rotation
            asteroid.rotation += asteroid.rotationSpeed * delta * 60;

            // Remove if off screen with padding
            if (asteroid.x < -100 || asteroid.x > canvas.width + 100 ||
                asteroid.y < -100 || asteroid.y > canvas.height + 100) {
                gameState.asteroidPool.push(gameState.asteroids.splice(i, 1)[0]);
            }
        }
    }

    function createParticle(x, y, targetX, targetY, duration) {
        // Get from pool or create new
        let particle = gameState.particlePool.length > 0 ? gameState.particlePool.pop() : {};

        particle.x = x;
        particle.y = y;
        particle.startX = x;
        particle.startY = y;
        particle.targetX = targetX;
        particle.targetY = targetY;
        particle.life = 1.0;
        particle.duration = duration;
        particle.size = 1 + Math.random() * 3;

        gameState.particles.push(particle);
        return particle;
    }

    function updateParticles(delta) {
        for (let i = gameState.particles.length - 1; i >= 0; i--) {
            const particle = gameState.particles[i];

            // Update life
            particle.life -= delta / particle.duration;

            // Update position using easing
            const progress = 1 - particle.life;
            const easedProgress = 1 - Math.pow(1 - progress, 3); // Cubic ease-out

            particle.x = particle.startX + (particle.targetX - particle.startX) * easedProgress;
            particle.y = particle.startY + (particle.targetY - particle.startY) * easedProgress;

            // Remove dead particles
            if (particle.life <= 0) {
                gameState.particlePool.push(gameState.particles.splice(i, 1)[0]);
            }
        }
    }

    function checkCollisions() {
        if (!gameState.player || !gameState.player.active || gameState.player.invincible) return; // Skip if invincible

        for (const asteroid of gameState.asteroids) {
            const dx = gameState.player.x - asteroid.x;
            const dy = gameState.player.y - asteroid.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Collision detection with adjusted radius based on shape
            const playerRadius = gameState.player.size * 0.7;
            let asteroidFactor = 0.8;

            // Adjust collision radius based on shape
            switch (asteroid.shape) {
                case 0: // Circle
                    asteroidFactor = 0.9;
                    break;
                case 1: // Triangle
                    asteroidFactor = 0.7;
                    break;
            }

            // Check for collision
            if (distance < playerRadius + asteroid.size * asteroidFactor) {
                handleCollision(asteroid);
                return;
            }

            // Near miss detection and feedback
            const nearMissThreshold = playerRadius + asteroid.size * 1.8;
            if (distance < nearMissThreshold && Math.random() < 0.1) {
                // Create subtle particle trail for near miss visualization
                for (let i = 0; i < 3; i++) {
                    createParticle(
                        asteroid.x + (Math.random() - 0.5) * asteroid.size,
                        asteroid.y + (Math.random() - 0.5) * asteroid.size,
                        asteroid.x + asteroid.speedX * 20,
                        asteroid.y + asteroid.speedY * 20,
                        0.5 + Math.random() * 0.5
                    );
                }
            }
        }
    }

    function handleCollision(asteroid) {
        // Create explosion particles
        for (let i = 0; i < 30; i++) {
            createParticle(
                gameState.player.x,
                gameState.player.y,
                gameState.player.x + (Math.random() - 0.5) * 200,
                gameState.player.y + (Math.random() - 0.5) * 200,
                1 + Math.random() * 2
            );
        }

        // Reduce lives and check game over
        gameState.lives--;
        updateLivesDisplay();

        if (gameState.lives <= 0) {
            gameOver();
        } else {
            // Temporarily disable player and make invincible after respawn
            gameState.player.active = false;

            // Reset player position and activate invincibility after a short delay
            setTimeout(() => {
                gameState.player.x = canvas.width / 2;
                gameState.player.y = canvas.height / 2;
                gameState.player.active = true;
                gameState.player.invincible = true; // Make invincible on respawn
                gameState.player.invincibilityTimer = CONFIG.INVINCIBILITY_DURATION; // Reset timer
            }, 1000);
        }
    }

    // ==========================================
    // Rendering functions
    // ==========================================
    function renderIntro() {
        renderParticles();
    }

    function renderPlaying() {
        renderAsteroids();
        renderPlayer();
        renderParticles();
    }

    function renderGameOver() {
        renderAsteroids();
        renderParticles();
    }

    function renderPlayer() {
        if (!gameState.player || !gameState.player.active) return;

        // Blinking effect during invincibility
        if (gameState.player.invincible) {
            // Blink roughly 5 times per second (10 Hz)
            const blink = Math.floor(gameState.gameTime * 10) % 2 === 0;
            if (!blink) {
                return; // Skip rendering this frame for blinking effect
            }
        }

        ctx.save();
        ctx.translate(gameState.player.x, gameState.player.y);
        ctx.rotate(gameState.player.rotation);

        // Draw player ship (triangle)
        ctx.fillStyle = CONFIG.VISUAL.MAIN_COLOR;
        ctx.beginPath();
        ctx.moveTo(0, -gameState.player.size);
        ctx.lineTo(-gameState.player.size * 0.6, gameState.player.size * 0.5);
        ctx.lineTo(0, gameState.player.size * 0.3);
        ctx.lineTo(gameState.player.size * 0.6, gameState.player.size * 0.5);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }

    function renderAsteroids() {
        ctx.fillStyle = CONFIG.VISUAL.GRAY_ASTEROID; // Use gray for asteroids

        for (const asteroid of gameState.asteroids) {
            ctx.save();
            ctx.translate(asteroid.x, asteroid.y);
            ctx.rotate(asteroid.rotation);

            // Draw different shapes based on asteroid type
            ctx.beginPath();

            switch (asteroid.shape) {
                case 0: // Circle
                    ctx.arc(0, 0, asteroid.size, 0, Math.PI * 2);
                    break;

                case 1: // Triangle
                    drawPolygon(asteroid.size, 3);
                    break;

                case 2: // Square
                    const squareSize = asteroid.size * 0.9;
                    ctx.rect(-squareSize, -squareSize, squareSize * 2, squareSize * 2);
                    break;

                case 3: // Pentagon
                    drawPolygon(asteroid.size, 5);
                    break;

                case 4: // Hexagon
                    drawPolygon(asteroid.size, 6);
                    break;
            }

            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }
    }

    function renderParticles() {
        ctx.fillStyle = CONFIG.VISUAL.MAIN_COLOR; // Keep particles white

        for (const particle of gameState.particles) {
            const opacity = particle.life;
            ctx.globalAlpha = opacity;

            const size = particle.size * (1 + (1 - particle.life) * 0.5);

            ctx.beginPath();
            ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.globalAlpha = 1;
    }

    // Helper function to draw regular polygons
    function drawPolygon(radius, sides) {
        const angleStep = (Math.PI * 2) / sides;

        ctx.moveTo(
            Math.cos(0) * radius,
            Math.sin(0) * radius
        );

        for (let i = 1; i <= sides; i++) {
            const angle = i * angleStep;
            ctx.lineTo(
                Math.cos(angle) * radius,
                Math.sin(angle) * radius
            );
        }
    }

    // ==========================================
    // Error handling
    // ==========================================
    function handleError(error) {
        console.error('Game error:', error);
        gameState.state = CONFIG.GAME_STATE.ERROR;
        showErrorOverlay();
    }

    function showErrorOverlay() {
        if (errorOverlay) {
            errorOverlay.classList.remove('hidden');
            document.body.style.cursor = 'default'; // Show cursor on error
        }
    }

    // Initialize the game when DOM is loaded
    document.addEventListener('DOMContentLoaded', init);
})();
