// Balance Beam Game Logic
document.addEventListener('DOMContentLoaded', () => {
    // Canvas setup
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Game elements
    const beamWidth = 200;
    const beamHeight = 10;
    const ballRadius = 15;

    // Game state
    let gameRunning = false;
    let gameOver = false;
    let score = 0;
    let timeElapsed = 0;
    let lastTimestamp = 0;
    let difficulty = 1;

    // Ball physics
    let ball = {
        x: width / 2,
        y: height / 2 - ballRadius - beamHeight / 2,
        vx: 0,
        vy: 0,
        acceleration: 0.05
    };

    // Beam state
    let beam = {
        x: width / 2 - beamWidth / 2,
        y: height / 2,
        angle: 0, // in radians
        rotationSpeed: 0.03,
        maxAngle: Math.PI / 8
    };

    // Controls
    let keys = {
        left: false,
        right: false
    };

    let mouseX = width / 2;

    // DOM elements
    const scoreElement = document.getElementById('score');
    const timeElement = document.getElementById('time');
    const gameOverElement = document.getElementById('gameOver');
    const finalScoreElement = document.getElementById('finalScore');
    const finalTimeElement = document.getElementById('finalTime');
    const startButton = document.getElementById('startButton');
    const restartButton = document.getElementById('restartButton');

    // Event listeners
    startButton.addEventListener('click', startGame);
    restartButton.addEventListener('click', restartGame);

    window.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') keys.left = true;
        if (e.key === 'ArrowRight') keys.right = true;
    });

    window.addEventListener('keyup', (e) => {
        if (e.key === 'ArrowLeft') keys.left = false;
        if (e.key === 'ArrowRight') keys.right = false;
    });

    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
    });

    // Game functions
    function startGame() {
        resetGame();
        gameRunning = true;
        lastTimestamp = performance.now();
        requestAnimationFrame(gameLoop);
        startButton.style.display = 'none';
    }

    function restartGame() {
        gameOverElement.classList.add('hidden');
        startGame();
    }

    function resetGame() {
        ball = {
            x: width / 2,
            y: height / 2 - ballRadius - beamHeight / 2,
            vx: 0,
            vy: 0,
            acceleration: 0.05
        };

        beam = {
            x: width / 2 - beamWidth / 2,
            y: height / 2,
            angle: 0,
            rotationSpeed: 0.03,
            maxAngle: Math.PI / 8
        };

        gameRunning = false;
        gameOver = false;
        score = 0;
        timeElapsed = 0;
        difficulty = 1;

        updateUI();
    }

    function gameLoop(timestamp) {
        if (!gameRunning) return;

        // Calculate time delta
        const deltaTime = timestamp - lastTimestamp;
        lastTimestamp = timestamp;

        // Update game state
        updateGameState(deltaTime);

        // Render the game
        render();

        // Continue the game loop
        if (!gameOver) {
            requestAnimationFrame(gameLoop);
        }
    }

    function updateGameState(deltaTime) {
        // Update time and score
        timeElapsed += deltaTime / 1000;
        score = Math.floor(timeElapsed * 10);

        // Increase difficulty over time
        difficulty = 1 + Math.min(timeElapsed / 20, 2);

        // Update beam rotation based on keys or mouse
        updateBeamRotation();

        // Apply physics to the ball
        updateBallPhysics(deltaTime);

        // Check if ball is still on the beam
        checkGameOver();

        // Update UI
        updateUI();
    }

    function updateBeamRotation() {
        if (keys.left && !keys.right) {
            beam.angle = Math.max(beam.angle - beam.rotationSpeed, -beam.maxAngle);
        } else if (keys.right && !keys.left) {
            beam.angle = Math.min(beam.angle + beam.rotationSpeed, beam.maxAngle);
        } else {
            // Use mouse position
            const targetPosition = mouseX;
            const centerX = width / 2;
            const maxDistance = width / 3;
            const distance = (targetPosition - centerX) / maxDistance;
            const targetAngle = distance * beam.maxAngle;

            // Smooth beam rotation
            beam.angle += (targetAngle - beam.angle) * 0.1;

            // Clamp angle
            beam.angle = Math.max(Math.min(beam.angle, beam.maxAngle), -beam.maxAngle);
        }
    }

    function updateBallPhysics(deltaTime) {
        // Apply acceleration based on beam angle
        ball.vx += Math.sin(beam.angle) * ball.acceleration * difficulty * deltaTime;

        // Apply friction to simulate a rolling ball
        const friction = 0.99;
        ball.vx *= friction;

        // Update ball position
        ball.x += ball.vx;

        // Calculate ball's y position based on beam angle
        // Find the beam's current endpoints
        const beamLeft = {
            x: width / 2 - beamWidth / 2 * Math.cos(beam.angle),
            y: height / 2 - beamWidth / 2 * Math.sin(beam.angle)
        };

        const beamRight = {
            x: width / 2 + beamWidth / 2 * Math.cos(beam.angle),
            y: height / 2 + beamWidth / 2 * Math.sin(beam.angle)
        };

        // Calculate beam position under the ball
        const beamPercentage = (ball.x - beamLeft.x) / (beamRight.x - beamLeft.x);
        if (beamPercentage >= 0 && beamPercentage <= 1) {
            const beamY = beamLeft.y + beamPercentage * (beamRight.y - beamLeft.y);
            ball.y = beamY - ballRadius - beamHeight / 2;
        }
    }

    function checkGameOver() {
        // Get beam endpoints
        const beamLeft = {
            x: width / 2 - beamWidth / 2 * Math.cos(beam.angle),
            y: height / 2 - beamWidth / 2 * Math.sin(beam.angle)
        };

        const beamRight = {
            x: width / 2 + beamWidth / 2 * Math.cos(beam.angle),
            y: height / 2 + beamWidth / 2 * Math.sin(beam.angle)
        };

        // Check if ball is off the beam
        const beamPercentage = (ball.x - beamLeft.x) / (beamRight.x - beamLeft.x);
        if (beamPercentage < 0 || beamPercentage > 1 || ball.x < 0 || ball.x > width) {
            endGame();
        }
    }

    function endGame() {
        gameRunning = false;
        gameOver = true;
        finalScoreElement.textContent = score;
        finalTimeElement.textContent = timeElapsed.toFixed(1);
        gameOverElement.classList.remove('hidden');
    }

    function updateUI() {
        scoreElement.textContent = score;
        timeElement.textContent = timeElapsed.toFixed(1);
    }

    function render() {
        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Draw beam
        ctx.save();
        ctx.translate(width / 2, height / 2);
        ctx.rotate(beam.angle);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-beamWidth / 2, -beamHeight / 2, beamWidth, beamHeight);
        ctx.restore();

        // Draw ball
        ctx.fillStyle = '#ff6f61';
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ballRadius, 0, Math.PI * 2);
        ctx.fill();
    }

    // Initial render
    render();
});
