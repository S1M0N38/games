/**
 * Space Dodger - A minimalist arcade game
 * Core mechanic: Mouse-based asteroid avoidance with particle effects
 */

(function () {
    'use strict';

    // Game constants
    const GAME_STATE = {
        PLAYING: 'playing',
        TRANSITIONING: 'transitioning',
        ERROR: 'error'
    };

    // Game variables
    let canvas, ctx;
    let gameState = GAME_STATE.TRANSITIONING;
    let frameCount = 0;
    let lastTime = 0;
    let delta = 0;
    let mouseX = 0;
    let mouseY = 0; // Track mouse Y position
    let score = 0; // Current score (milliseconds survived)
    let highScore = 0; // High score
    let scoreIndicators = []; // Array for score indicator animations

    // Level progression and timing
    let gameTime = 0; // Time in seconds
    let currentLevel = 1;
    let levelThresholds = [30, 60, 90, 120, 180, 240, 300]; // Time thresholds in seconds for level increases
    let progressBar; // DOM element for progress bar

    // Game entities
    let player;
    let asteroids = [];

    // Audio elements (minimal sounds)
    let nearMissSound;
    let collisionSound;
    let ambientSound;

    // Track if game has been played before (for hub integration)
    let gamePlayed = false;

    // Object pool for asteroids
    const asteroidPool = [];

    // Game initialization
    function init() {
        // Set up canvas
        canvas = document.getElementById('game-canvas');
        ctx = canvas.getContext('2d');

        // Set canvas to full window size
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Get progress bar element
        progressBar = document.getElementById('progress-bar');

        // Create audio elements
        createAudioElements();

        // Mouse movement tracking
        canvas.addEventListener('mousemove', handleMouseMove);

        // Check local storage for played state and high score
        checkGamePlayed();

        // Initialize player
        initializePlayer();

        // Start with an intro animation
        startIntroAnimation();

        // Start game loop
        requestAnimationFrame(gameLoop);
    }

    // Resize canvas to full window
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    // Create minimal audio elements
    function createAudioElements() {
        try {
            // These would be minimal, non-intrusive sounds
            // Actual sound files would be added to assets folder if needed
            nearMissSound = new Audio();
            collisionSound = new Audio();
            ambientSound = new Audio();

            // Set volume very low for ambient sound
            ambientSound.volume = 0.1;
            ambientSound.loop = true;
        } catch (error) {
            console.error('Audio initialization error:', error);
            // Game can continue without sound
        }
    }

    // Check if game has been played before
    function checkGamePlayed() {
        try {
            gamePlayed = localStorage.getItem('space-dodger-played') === 'true';

            // Get high score from local storage
            const savedHighScore = localStorage.getItem('space-dodger-high-score');
            if (savedHighScore) {
                highScore = parseInt(savedHighScore, 10);
            }
        } catch (error) {
            console.error('LocalStorage error:', error);
            // Continue without storage if unavailable
        }
    }

    // Mark game as played
    function markGameAsPlayed() {
        try {
            localStorage.setItem('space-dodger-played', 'true');
            gamePlayed = true;
        } catch (error) {
            console.error('LocalStorage error:', error);
        }
    }

    // Save high score
    function saveHighScore() {
        try {
            localStorage.setItem('space-dodger-high-score', highScore.toString());
        } catch (error) {
            console.error('LocalStorage error:', error);
        }
    }

    // Mouse movement handler
    function handleMouseMove(event) {
        mouseX = event.clientX;
        mouseY = event.clientY; // Add tracking for Y position
    }

    // Initialize player ship
    function initializePlayer() {
        player = {
            x: canvas.width / 2,
            y: canvas.height / 2, // Start in the center of the screen
            size: 20,
            targetX: canvas.width / 2,
            targetY: canvas.height / 2, // Add target Y position
            speed: 0.15, // For smooth easing
            isAlive: true
        };
    }

    // Start intro animation with converging particles
    function startIntroAnimation() {
        gameState = GAME_STATE.TRANSITIONING;
        // Clear any existing entities
        asteroids = [];

        // After animation completes, start the game
        setTimeout(() => {
            gameState = GAME_STATE.PLAYING;
            markGameAsPlayed();
            try {
                ambientSound.play();
            } catch (e) {
                // Continue without sound if it fails
            }
        }, 1000);
    }

    // Main game loop
    function gameLoop(timestamp) {
        // Calculate delta time for smooth animation
        if (!lastTime) lastTime = timestamp;
        delta = (timestamp - lastTime) / 1000; // Convert to seconds
        lastTime = timestamp;

        // Increase frame counter
        frameCount++;

        // Clear canvas
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Update and render based on game state
        if (gameState === GAME_STATE.PLAYING) {
            update(delta);
            render();
        } else if (gameState === GAME_STATE.TRANSITIONING) {
            updateTransition(delta);
            renderTransition();
        } else if (gameState === GAME_STATE.ERROR) {
            renderError();
        }

        // Continue game loop
        requestAnimationFrame(gameLoop);
    }

    // Update game logic
    function update(delta) {
        // Update player position with smooth easing
        updatePlayer(delta);

        // Update all asteroids
        updateAsteroids(delta);

        // Update score indicators
        updateScoreIndicators(delta);

        // Update score based on survival time
        if (gameState === GAME_STATE.PLAYING) {
            // Update game time (seconds)
            gameTime += delta;

            // Update score (milliseconds)
            score = Math.floor(gameTime * 1000);

            // Check for level progression
            updateLevelProgression();

            // Update progress bar
            updateProgressBar();

            // Update high score if current score is higher
            if (score > highScore) {
                highScore = score;
                saveHighScore();
            }
        }

        // Spawn new asteroids at varying intervals
        if (frameCount % Math.max(10, 60 - Math.floor(frameCount / 1000)) === 0) {
            spawnAsteroid();
        }

        // Check for collisions
        checkCollisions();
    }

    // Update player
    function updatePlayer(delta) {
        // Smooth movement towards mouse position
        player.targetX = mouseX;
        player.targetY = mouseY; // Update target Y position

        // Smooth easing for both X and Y coordinates
        player.x += (player.targetX - player.x) * player.speed * (delta * 60);
        player.y += (player.targetY - player.y) * player.speed * (delta * 60);

        // Keep player within canvas bounds
        player.x = Math.max(player.size, Math.min(canvas.width - player.size, player.x));
        player.y = Math.max(player.size, Math.min(canvas.height - player.size, player.y));
    }

    // Update all asteroids
    function updateAsteroids(delta) {
        for (let i = asteroids.length - 1; i >= 0; i--) {
            const asteroid = asteroids[i];

            // Update position
            asteroid.y += asteroid.speed * delta * 60;
            asteroid.x += asteroid.horizontalSpeed * delta * 60;

            // Update rotation
            asteroid.rotation += asteroid.rotationSpeed * delta;

            // Remove if off screen
            if (asteroid.y > canvas.height + asteroid.size) {
                // Return to object pool
                asteroidPool.push(asteroids.splice(i, 1)[0]);
            }
        }
    }

    // Spawn a new asteroid
    function spawnAsteroid() {
        // Get from pool or create new
        let asteroid;
        if (asteroidPool.length > 0) {
            asteroid = asteroidPool.pop();
        } else {
            asteroid = {};
        }

        // Set properties
        asteroid.x = Math.random() * canvas.width;
        asteroid.y = -50;
        asteroid.size = 15 + Math.random() * 20;

        // Make asteroids faster and more challenging
        // Base speed increases gradually with game time
        const baseSpeed = 2 + Math.random() * 3; // Increased base speed
        const timeMultiplier = 1 + (frameCount / 5000); // Faster progression
        asteroid.speed = baseSpeed * timeMultiplier;

        // More dynamic horizontal movement
        asteroid.horizontalSpeed = (Math.random() - 0.5) * 3; // Increased horizontal variation

        // More rotation
        asteroid.rotation = Math.random() * Math.PI * 2;
        asteroid.rotationSpeed = (Math.random() - 0.5) * 0.1; // Double rotation speed

        // More shape variety (0: circle, 1: triangle, 2: square, 3: pentagon, 4: hexagon, 5: star)
        asteroid.shape = Math.floor(Math.random() * 6);

        // Add some special properties for certain shapes
        if (asteroid.shape === 5) { // Star shape
            asteroid.starPoints = 5 + Math.floor(Math.random() * 3); // 5-7 points
            asteroid.innerRadius = asteroid.size * 0.4; // Inner radius for star shape
        }

        // Add to active asteroids
        asteroids.push(asteroid);
    }

    // Check for collisions between player and asteroids
    function checkCollisions() {
        // Shape-aware collision detection
        for (const asteroid of asteroids) {
            const dx = player.x - asteroid.x;
            const dy = player.y - asteroid.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Base collision threshold for player (triangular ship)
            const playerCollisionRadius = player.size * 0.8; // Slightly smaller than visual size for better feel

            // Asteroid collision radius varies by shape
            let asteroidCollisionFactor = 0.7; // Default

            // Adjust collision radius based on asteroid shape
            switch (asteroid.shape) {
                case 0: // Circle
                    asteroidCollisionFactor = 0.9; // Most accurate
                    break;
                case 1: // Triangle
                    asteroidCollisionFactor = 0.7; // Pointy corners
                    break;
                case 2: // Square
                    asteroidCollisionFactor = 0.8; // Corners but more substantial
                    break;
                case 3: // Pentagon
                case 4: // Hexagon
                    asteroidCollisionFactor = 0.85; // More round-like
                    break;
                case 5: // Star
                    asteroidCollisionFactor = 0.65; // Very pointy, smaller collision area
                    break;
            }

            // Check for collision with adjusted radius
            if (distance < playerCollisionRadius + asteroid.size * asteroidCollisionFactor) {
                handleCollision(asteroid);
                return;
            }

            // Near miss detection - more generous with stars and triangles
            const nearMissFactor = asteroid.shape === 5 || asteroid.shape === 1 ? 2.5 : 2;
            if (distance < playerCollisionRadius + asteroid.size * nearMissFactor && Math.random() < 0.15) {
                try {
                    nearMissSound.play();
                } catch (e) {
                    // Continue without sound
                }
            }
        }
    }

    // Reset game variables for new game
    function resetGame() {
        // Reset score
        score = 0;
        frameCount = 0;

        // Reset time and level progression
        gameTime = 0;
        currentLevel = 1;

        // Reset progress bar
        if (progressBar) {
            progressBar.style.width = '0%';
        }

        // Clear asteroids
        asteroids.forEach(a => asteroidPool.push(a));
        asteroids = [];
        scoreIndicators = [];
    }

    // Handle collision with asteroid
    function handleCollision(asteroid) {
        // Play collision sound
        try {
            collisionSound.play();
        } catch (e) {
            // Continue without sound
        }

        // Reset player position
        player.x = canvas.width / 2;
        player.targetX = canvas.width / 2;
        player.y = canvas.height / 2;
        player.targetY = canvas.height / 2;

        // Remove all asteroids
        asteroids.forEach(a => asteroidPool.push(a));
        asteroids = [];

        // Reset game variables
        resetGame();

        // Restart with intro animation
        startIntroAnimation();
    }

    // Update transition animations
    function updateTransition(delta) {
        // Placeholder for transition updates
    }

    // Render the game
    function render() {
        // Render asteroids
        renderAsteroids();

        // Render player
        renderPlayer();

        // Render stopwatch (score)
        renderStopwatch();
    }

    // Render transition animations
    function renderTransition() {
        // Render player if ready
        if (gameState === GAME_STATE.TRANSITIONING && frameCount > 30) {
            renderPlayer();
        }
    }

    // Render player ship
    function renderPlayer() {
        ctx.save();
        ctx.translate(player.x, player.y);

        // Draw player ship (triangle)
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.moveTo(0, -player.size);
        ctx.lineTo(-player.size, player.size);
        ctx.lineTo(player.size, player.size);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }

    // Render all asteroids
    function renderAsteroids() {
        for (const asteroid of asteroids) {
            ctx.save();
            ctx.translate(asteroid.x, asteroid.y);
            ctx.rotate(asteroid.rotation);

            ctx.fillStyle = '#FFFFFF';

            // Draw different shapes based on asteroid type
            if (asteroid.shape === 0) {
                // Circle
                ctx.beginPath();
                ctx.arc(0, 0, asteroid.size, 0, Math.PI * 2);
                ctx.fill();
            } else if (asteroid.shape === 1) {
                // Triangle
                ctx.beginPath();
                const points = 3;
                const angleStep = (Math.PI * 2) / points;

                for (let i = 0; i < points; i++) {
                    const angle = i * angleStep;
                    const x = Math.cos(angle) * asteroid.size;
                    const y = Math.sin(angle) * asteroid.size;

                    if (i === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                }

                ctx.closePath();
                ctx.fill();
            } else if (asteroid.shape === 2) {
                // Square
                ctx.beginPath();
                const size = asteroid.size * 0.9; // Slightly smaller for equal area perception
                ctx.rect(-size, -size, size * 2, size * 2);
                ctx.fill();
            } else if (asteroid.shape === 3 || asteroid.shape === 4) {
                // Pentagon (3) or Hexagon (4)
                ctx.beginPath();
                const points = asteroid.shape === 3 ? 5 : 6; // Pentagon or Hexagon
                const angleStep = (Math.PI * 2) / points;

                for (let i = 0; i < points; i++) {
                    const angle = i * angleStep;
                    const x = Math.cos(angle) * asteroid.size;
                    const y = Math.sin(angle) * asteroid.size;

                    if (i === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                }

                ctx.closePath();
                ctx.fill();
            } else if (asteroid.shape === 5) {
                // Star shape
                ctx.beginPath();
                const points = asteroid.starPoints || 5;
                const outerRadius = asteroid.size;
                const innerRadius = asteroid.innerRadius || (asteroid.size * 0.4);
                const angleStep = Math.PI / points;

                for (let i = 0; i < points * 2; i++) {
                    const angle = i * angleStep;
                    const radius = i % 2 === 0 ? outerRadius : innerRadius;
                    const x = Math.cos(angle) * radius;
                    const y = Math.sin(angle) * radius;

                    if (i === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                }

                ctx.closePath();
                ctx.fill();
            }

            ctx.restore();
        }
    }

    // Render stopwatch as score
    function renderStopwatch() {
        // Position in top center
        const x = canvas.width / 2;
        const y = 40;

        ctx.save();

        // Background for stopwatch
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.beginPath();
        ctx.rect(x - 70, y - 15, 140, 30);
        ctx.fill();

        // Draw stopwatch icon
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(x - 50, y, 10, 0, Math.PI * 2);
        ctx.fill();

        // Draw small knob on top of stopwatch
        ctx.fillRect(x - 52, y - 14, 4, 4);

        // Draw visual representation of milliseconds
        // Each segment represents 100ms
        for (let i = 0; i < 10; i++) {
            const segmentWidth = 8;
            const segmentGap = 2;
            const segmentX = x - 30 + (i * (segmentWidth + segmentGap));

            // Fill the segments that represent current time
            const ms = score % 1000;
            const filledSegments = Math.floor(ms / 100);

            if (i <= filledSegments) {
                ctx.fillStyle = '#FFFFFF';
            } else {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            }

            ctx.fillRect(segmentX, y - 5, segmentWidth, 10);
        }

        // Indicate seconds with small dots above
        const seconds = Math.floor(score / 1000);
        const dotsToShow = Math.min(seconds % 10, 9); // Show up to 9 dots

        for (let i = 0; i < dotsToShow; i++) {
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(x - 25 + (i * 10), y - 12, 2, 0, Math.PI * 2);
            ctx.fill();
        }

        // Show high score indicator if current score is approaching high score
        if (highScore > 0 && score > highScore * 0.8) {
            const indicator = (score / highScore) > 0.95 ? "●" : "○";
            const indicatorX = x + 65;

            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(indicatorX, y, 4, 0, Math.PI * 2);
            if ((score / highScore) > 0.95) {
                ctx.fill();
            } else {
                ctx.stroke();
            }
        }

        ctx.restore();
    }

    // Render error screen
    function renderError() {
        // Show the error overlay
        const errorOverlay = document.getElementById('error-overlay');
        errorOverlay.style.display = 'flex';
    }

    // Error handler for the whole game
    function handleError(error) {
        console.error('Game error:', error);
        gameState = GAME_STATE.ERROR;
    }

    // Create a score indicator (visual feedback for points/multiplier)
    function createScoreIndicator(type, x, y) {
        const indicator = {
            x: x,
            y: y,
            targetY: y - 50, // Float upward
            opacity: 1,
            scale: 1,
            life: 1000, // 1 second lifetime
            maxLife: 1000,
            type: type // "+" for multiplier increase, or numeric for points
        };

        scoreIndicators.push(indicator);
        return indicator;
    }

    // Update all score indicators
    function updateScoreIndicators(delta) {
        for (let i = scoreIndicators.length - 1; i >= 0; i--) {
            const indicator = scoreIndicators[i];

            // Update lifetime
            indicator.life -= delta * 1000;

            // Update position (float upward with easing)
            indicator.y += (indicator.targetY - indicator.y) * 0.05;

            // Update scale and opacity
            indicator.scale = 1 + (0.5 * (1 - indicator.life / indicator.maxLife)); // Grow slightly
            indicator.opacity = indicator.life / indicator.maxLife; // Fade out

            // Remove dead indicators
            if (indicator.life <= 0) {
                scoreIndicators.splice(i, 1);
            }
        }
    }

    // Update the level progression based on game time
    function updateLevelProgression() {
        // Check if we should increase the level
        if (currentLevel - 1 < levelThresholds.length && gameTime > levelThresholds[currentLevel - 1]) {
            // Level up!
            currentLevel++;
        }
    }

    // Update the progress bar to reflect game time and level
    function updateProgressBar() {
        if (!progressBar) return;

        // Calculate which level section we're in
        let targetLevel = currentLevel;
        if (targetLevel > levelThresholds.length) {
            targetLevel = levelThresholds.length;
        }

        let prevThreshold = 0;
        if (targetLevel > 1) {
            prevThreshold = levelThresholds[targetLevel - 2];
        }

        let nextThreshold = levelThresholds[targetLevel - 1];
        if (targetLevel > levelThresholds.length) {
            nextThreshold = prevThreshold * 1.5; // After final threshold, just keep going
        }

        // Calculate progress within current level
        const levelProgress = (gameTime - prevThreshold) / (nextThreshold - prevThreshold);

        // Calculate overall progress percentage (0-100)
        let totalProgress = ((targetLevel - 1) / (levelThresholds.length + 1)) * 100;
        totalProgress += (levelProgress / (levelThresholds.length + 1)) * 100;

        // Cap at 100%
        totalProgress = Math.min(100, totalProgress);

        // Update the progress bar width
        progressBar.style.width = `${totalProgress}%`;

        // Pulse effect when close to level change
        if (targetLevel <= levelThresholds.length && levelProgress > 0.9) {
            progressBar.style.opacity = 0.5 + Math.sin(gameTime * 5) * 0.5;
        } else {
            progressBar.style.opacity = 1;
        }
    }

    // Try to initialize the game, catch any errors
    try {
        // Wait for DOM to be ready
        window.addEventListener('load', init);
    } catch (error) {
        handleError(error);
    }

    // Global error handler
    window.addEventListener('error', function (event) {
        handleError(event.error);
    });
})();
