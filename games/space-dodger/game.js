/**
 * Space Dodger - A minimalist arcade game
 * Core mechanic: Mouse-based asteroid avoidance
 */

(function () {
    'use strict';

    // Game constants
    const GAME_STATE = {
        INTRO: 'intro',
        PLAYING: 'playing',
        PAUSED: 'paused',
        GAME_OVER: 'gameover',
        ERROR: 'error'
    };

    const INITIAL_LIVES = 3;
    const PARTICLE_POOL_SIZE = 100;
    const ASTEROID_POOL_SIZE = 50;
    const LOCAL_STORAGE_KEY_PLAYED = 'space-dodger-played';
    const LOCAL_STORAGE_KEY_HIGH_SCORE = 'space-dodger-high-score';

    // Game variables
    let canvas, ctx;
    let gameState = GAME_STATE.INTRO;
    let lastTime = 0;
    let delta = 0;
    let mouseX = 0;
    let mouseY = 0;
    let gameTime = 0;
    let difficultyProgress = 0;
    let lives = INITIAL_LIVES;
    let score = 0;
    let highScore = 0;
    let hasPlayed = false;
    let animationFrameId = null;

    // Game entities
    let player;
    let asteroids = [];
    let particles = [];

    // Pooling for better performance
    const asteroidPool = [];
    const particlePool = [];

    // DOM elements
    let scoreDisplay, progressBar, livesContainer;
    let helpButton, helpPanel, closeHelp;
    let pauseOverlay, gameOverOverlay, finalScoreDisplay, highScoreDisplay, restartButton;
    let errorOverlay;

    // Initialize game
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
            animationFrameId = requestAnimationFrame(gameLoop);
        } catch (error) {
            handleError(error);
        }
    }

    // Set canvas to full window size
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    // Create lives indicators
    function createLivesIndicators() {
        livesContainer.innerHTML = '';
        for (let i = 0; i < INITIAL_LIVES; i++) {
            const life = document.createElement('div');
            life.className = 'life';
            livesContainer.appendChild(life);
        }
    }

    // Initialize object pools
    function initializePools() {
        // Pre-create objects for better performance
        for (let i = 0; i < PARTICLE_POOL_SIZE; i++) {
            particlePool.push({});
        }

        for (let i = 0; i < ASTEROID_POOL_SIZE; i++) {
            asteroidPool.push({});
        }
    }

    // Add event listeners
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
    }

    // Track mouse position
    function handleMouseMove(event) {
        mouseX = event.clientX;
        mouseY = event.clientY;
    }

    // Toggle help panel
    function toggleHelpPanel() {
        helpPanel.classList.toggle('hidden');

        // Show cursor when help panel is visible, hide it during gameplay
        if (!helpPanel.classList.contains('hidden')) {
            document.body.style.cursor = 'default';
        } else if (gameState === GAME_STATE.PLAYING) {
            document.body.style.cursor = 'none';
        }
    }

    // Handle key press
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

    // Navigate to landing page
    function navigateToLanding() {
        window.location.href = '../../index.html';
    }

    // Toggle pause state
    function togglePause() {
        if (gameState === GAME_STATE.PLAYING) {
            gameState = GAME_STATE.PAUSED;
            pauseOverlay.classList.remove('hidden');
            document.body.style.cursor = 'default'; // Show cursor when paused
        } else if (gameState === GAME_STATE.PAUSED) {
            gameState = GAME_STATE.PLAYING;
            pauseOverlay.classList.add('hidden');
            document.body.style.cursor = 'none'; // Hide cursor when resuming gameplay
            lastTime = 0; // Reset delta time to prevent jumps
        }
    }

    // Load saved game state from localStorage
    function loadGameState() {
        try {
            hasPlayed = localStorage.getItem(LOCAL_STORAGE_KEY_PLAYED) === 'true';
            const savedScore = localStorage.getItem(LOCAL_STORAGE_KEY_HIGH_SCORE);
            if (savedScore) {
                highScore = parseInt(savedScore, 10);
            }
        } catch (error) {
            console.error('LocalStorage error:', error);
            // Continue without storage
        }
    }

    // Save game state to localStorage
    function saveGameState() {
        try {
            localStorage.setItem(LOCAL_STORAGE_KEY_PLAYED, 'true');
            localStorage.setItem(LOCAL_STORAGE_KEY_HIGH_SCORE, highScore.toString());
        } catch (error) {
            console.error('LocalStorage error:', error);
        }
    }

    // Start intro animation
    function startIntro() {
        gameState = GAME_STATE.INTRO;
        asteroids = [];
        particles = [];

        // Show cursor during intro
        document.body.style.cursor = 'default';

        // Initialize player
        player = {
            x: canvas.width / 2,
            y: canvas.height / 2,
            size: 20,
            targetX: canvas.width / 2,
            targetY: canvas.height / 2,
            speed: 0.15,
            rotation: 0,
            active: true
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

    // Start the main game
    function startGame() {
        // Hide overlays
        pauseOverlay.classList.add('hidden');
        gameOverOverlay.classList.add('hidden');

        // Reset game parameters
        gameState = GAME_STATE.PLAYING;
        gameTime = 0;
        difficultyProgress = 0;
        score = 0;
        lives = INITIAL_LIVES;
        updateLivesDisplay();
        updateScoreDisplay();
        updateProgressBar(0);

        // Reset player position
        player.x = canvas.width / 2;
        player.y = canvas.height / 2;
        player.targetX = canvas.width / 2;
        player.targetY = canvas.height / 2;
        player.active = true;

        // Clear game objects
        asteroids = [];
        particles = [];

        // Mark as played
        hasPlayed = true;
        saveGameState();

        // Hide cursor during active gameplay
        document.body.style.cursor = 'none';
    }

    // Update lives display
    function updateLivesDisplay() {
        const lifeElements = document.querySelectorAll('.life');
        lifeElements.forEach((life, index) => {
            life.classList.toggle('lost', index >= lives);
        });
    }

    // Update score display
    function updateScoreDisplay() {
        scoreDisplay.textContent = Math.floor(score);
    }

    // Update progress bar
    function updateProgressBar(progress) {
        if (!progressBar) return;
        progressBar.style.width = `${progress * 100}%`;
    }

    // Main game loop
    function gameLoop(timestamp) {
        try {
            // Calculate delta time for smooth animation
            if (!lastTime) lastTime = timestamp;
            delta = (timestamp - lastTime) / 1000; // Convert to seconds
            lastTime = timestamp;

            // Clear canvas
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Update and render based on game state
            switch (gameState) {
                case GAME_STATE.INTRO:
                    updateIntro(delta);
                    renderIntro();
                    break;
                case GAME_STATE.PLAYING:
                    updatePlaying(delta);
                    renderPlaying();
                    break;
                case GAME_STATE.PAUSED:
                    renderPlaying(); // Still render the game while paused
                    break;
                case GAME_STATE.GAME_OVER:
                    updateGameOver(delta);
                    renderGameOver();
                    break;
                case GAME_STATE.ERROR:
                    // Error overlay is handled by DOM
                    break;
            }

            // Continue game loop
            animationFrameId = requestAnimationFrame(gameLoop);
        } catch (error) {
            handleError(error);
        }
    }

    // Update intro state
    function updateIntro(delta) {
        updateParticles(delta);
    }

    // Render intro state
    function renderIntro() {
        renderParticles();
    }

    // Update playing state
    function updatePlaying(delta) {
        // Update game time and score
        gameTime += delta;
        score = gameTime * 10; // Score is time * 10
        updateScoreDisplay();

        // Update difficulty progress (max at 3 minutes)
        difficultyProgress = Math.min(1, gameTime / 180);
        updateProgressBar(difficultyProgress);

        // Update high score
        if (score > highScore) {
            highScore = Math.floor(score);
            saveGameState();
        }

        // Update player
        updatePlayer(delta);

        // Spawn asteroids based on difficulty
        if (Math.random() < 0.05 + (difficultyProgress * 0.15)) {
            spawnAsteroid();
        }

        // Update game objects
        updateAsteroids(delta);
        updateParticles(delta);

        // Check for collisions
        checkCollisions();
    }

    // Render playing state
    function renderPlaying() {
        renderAsteroids();
        renderPlayer();
        renderParticles();
    }

    // Update game over state
    function updateGameOver(delta) {
        updateParticles(delta);
    }

    // Render game over state
    function renderGameOver() {
        renderAsteroids();
        renderParticles();
    }

    // Update player ship position
    function updatePlayer(delta) {
        if (!player || !player.active) return;

        // Smooth movement towards mouse position
        player.targetX = mouseX;
        player.targetY = mouseY;

        player.x += (player.targetX - player.x) * player.speed * (delta * 60);
        player.y += (player.targetY - player.y) * player.speed * (delta * 60);

        // Subtle rotation based on movement
        const dx = player.targetX - player.x;
        const dy = player.targetY - player.y;
        const targetRotation = Math.atan2(dy, dx) + Math.PI / 2;

        // Normalize angle difference
        let rotDiff = targetRotation - player.rotation;
        if (rotDiff > Math.PI) rotDiff -= Math.PI * 2;
        if (rotDiff < -Math.PI) rotDiff += Math.PI * 2;

        player.rotation += rotDiff * 0.1 * (delta * 60);

        // Create trail particles during movement
        if (Math.random() < 0.2 && (Math.abs(dx) > 1 || Math.abs(dy) > 1)) {
            const trailX = player.x - Math.cos(player.rotation - Math.PI / 2) * player.size * 0.5;
            const trailY = player.y - Math.sin(player.rotation - Math.PI / 2) * player.size * 0.5;

            createParticle(
                trailX,
                trailY,
                trailX + (Math.random() - 0.5) * 10,
                trailY + (Math.random() - 0.5) * 10,
                0.5 + Math.random()
            );
        }
    }

    // Spawn a new asteroid
    function spawnAsteroid() {
        // Get asteroid from pool or create new
        let asteroid = asteroidPool.length > 0 ? asteroidPool.pop() : {};

        // Position outside viewport
        const side = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
        const speedMultiplier = 1 + difficultyProgress * 2;

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

        asteroids.push(asteroid);
    }

    // Update all asteroids
    function updateAsteroids(delta) {
        for (let i = asteroids.length - 1; i >= 0; i--) {
            const asteroid = asteroids[i];

            // Update position
            asteroid.x += asteroid.speedX * delta * 60;
            asteroid.y += asteroid.speedY * delta * 60;

            // Update rotation
            asteroid.rotation += asteroid.rotationSpeed * delta * 60;

            // Remove if off screen with padding
            if (asteroid.x < -100 || asteroid.x > canvas.width + 100 ||
                asteroid.y < -100 || asteroid.y > canvas.height + 100) {
                asteroidPool.push(asteroids.splice(i, 1)[0]);
            }
        }
    }

    // Create particle effect
    function createParticle(x, y, targetX, targetY, duration) {
        // Get from pool or create new
        let particle = particlePool.length > 0 ? particlePool.pop() : {};

        particle.x = x;
        particle.y = y;
        particle.startX = x;
        particle.startY = y;
        particle.targetX = targetX;
        particle.targetY = targetY;
        particle.life = 1.0;
        particle.duration = duration;
        particle.size = 1 + Math.random() * 3;

        particles.push(particle);
        return particle;
    }

    // Update all particles
    function updateParticles(delta) {
        for (let i = particles.length - 1; i >= 0; i--) {
            const particle = particles[i];

            // Update life
            particle.life -= delta / particle.duration;

            // Update position using easing
            const progress = 1 - particle.life;
            const easedProgress = 1 - Math.pow(1 - progress, 3); // Cubic ease-out

            particle.x = particle.startX + (particle.targetX - particle.startX) * easedProgress;
            particle.y = particle.startY + (particle.targetY - particle.startY) * easedProgress;

            // Remove dead particles
            if (particle.life <= 0) {
                particlePool.push(particles.splice(i, 1)[0]);
            }
        }
    }

    // Check for collisions between player and asteroids
    function checkCollisions() {
        if (!player || !player.active) return;

        for (const asteroid of asteroids) {
            const dx = player.x - asteroid.x;
            const dy = player.y - asteroid.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Collision detection with adjusted radius based on shape
            const playerRadius = player.size * 0.7;
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

    // Handle collision with asteroid
    function handleCollision(asteroid) {
        // Create explosion particles
        for (let i = 0; i < 30; i++) {
            createParticle(
                player.x,
                player.y,
                player.x + (Math.random() - 0.5) * 200,
                player.y + (Math.random() - 0.5) * 200,
                1 + Math.random() * 2
            );
        }

        // Reduce lives and check game over
        lives--;
        updateLivesDisplay();

        if (lives <= 0) {
            gameOver();
        } else {
            // Temporarily disable player to avoid multiple collisions
            player.active = false;

            // Reset player position after a short delay
            setTimeout(() => {
                player.x = canvas.width / 2;
                player.y = canvas.height / 2;
                player.active = true;
            }, 1000);
        }
    }

    // Game over
    function gameOver() {
        gameState = GAME_STATE.GAME_OVER;
        player.active = false;

        // Show cursor at game over
        document.body.style.cursor = 'default';

        // Update game over screen with final score
        finalScoreDisplay.textContent = Math.floor(score);
        highScoreDisplay.textContent = highScore;

        // Show game over overlay after a short delay
        setTimeout(() => {
            gameOverOverlay.classList.remove('hidden');
        }, 1000);
    }

    // Render player ship
    function renderPlayer() {
        if (!player || !player.active) return;

        ctx.save();
        ctx.translate(player.x, player.y);
        ctx.rotate(player.rotation);

        // Draw player ship (triangle)
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.moveTo(0, -player.size);
        ctx.lineTo(-player.size * 0.6, player.size * 0.5);
        ctx.lineTo(0, player.size * 0.3);
        ctx.lineTo(player.size * 0.6, player.size * 0.5);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }

    // Render all asteroids
    function renderAsteroids() {
        ctx.fillStyle = '#FFFFFF';

        for (const asteroid of asteroids) {
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

    // Render all particles
    function renderParticles() {
        ctx.fillStyle = '#FFFFFF';

        for (const particle of particles) {
            const opacity = particle.life;
            ctx.globalAlpha = opacity;

            const size = particle.size * (1 + (1 - particle.life) * 0.5);

            ctx.beginPath();
            ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.globalAlpha = 1;
    }

    // Show error overlay
    function showErrorOverlay() {
        if (errorOverlay) {
            errorOverlay.classList.remove('hidden');
            document.body.style.cursor = 'default'; // Show cursor on error
        }
    }

    // Handle errors
    function handleError(error) {
        console.error('Game error:', error);
        gameState = GAME_STATE.ERROR;
        showErrorOverlay();
    }

    // Initialize the game when DOM is loaded
    document.addEventListener('DOMContentLoaded', init);

    // Global error handler
    window.addEventListener('error', function (event) {
        handleError(event.error);
    });
})();
