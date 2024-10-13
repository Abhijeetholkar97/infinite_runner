const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let score = 0;
let gameState = "PLAY";

// Load images from assets folder
const trexRunImages = [
    'assets/trex_1.png',
    'assets/trex_2.png',
    'assets/trex_3.png'
].map(src => {
    const img = new Image();
    img.src = src;
    return img;
});

const trexCollidedImage = new Image();
trexCollidedImage.src = 'assets/trex_collided.png';

const groundImage = new Image();
groundImage.src = 'assets/ground.png';

const cloudImage = new Image();
const obstacle1Image = new Image();
const obstacle2Image = new Image();
cloudImage.src = 'assets/cloud.png';
obstacle1Image.src = 'assets/obstacle1.png';
obstacle2Image.src = 'assets/obstacle2.png';

const sunImage = new Image();
sunImage.src = 'assets/sun.png';

const gameOverImg = new Image();
gameOverImg.src = 'assets/gameOver.png';

const restartImg = new Image();
restartImg.src = 'assets/restart.png';

// Dinosaur (Trex) properties
const trex = {
    x: 50,
    y: canvas.height - 150,
    width: 50,
    height: 50,
    velocityY: 0,
    gravity: 0.6,
    jumpPower: 15,
    isJumping: false,
    animationFrame: 0,
    frameCount: 0,
    animationSpeed: 10 // Control the speed of the animation frames
};

// Obstacle properties
const obstacles = [];
const obstacleWidth = 50;
const obstacleHeight = 50;
const obstacleSpeed = 6;

// Cloud properties
const clouds = [];

// Ground properties
const ground = {
    x: 0,
    y: canvas.height - 100,
    width: canvas.width,
    height: 20,
    speed: 6
};

// Function to draw Trex (with animation)
function drawTrex() {
    trex.frameCount++;
    if (trex.frameCount % trex.animationSpeed === 0) {
        trex.animationFrame = (trex.animationFrame + 1) % trexRunImages.length;
    }
    const image = trexRunImages[trex.animationFrame];
    ctx.drawImage(image, trex.x, trex.y, trex.width, trex.height);
}

// Function to draw obstacles
function drawObstacles() {
    obstacles.forEach(obstacle => {
        const obstacleImage = obstacle.type === 1 ? obstacle1Image : obstacle2Image;
        ctx.drawImage(obstacleImage, obstacle.x, obstacle.y, obstacleWidth, obstacleHeight);
    });
}

// Function to draw clouds
function drawClouds() {
    clouds.forEach(cloud => {
        ctx.drawImage(cloudImage, cloud.x, cloud.y, 100, 60);
    });
}

// Function to draw the ground
function drawGround() {
    ctx.drawImage(groundImage, ground.x, ground.y, canvas.width, 20);
}

// Function to draw the sun
function drawSun() {
    ctx.drawImage(sunImage, canvas.width - 100, 50, 80, 80);
}

// Function to draw the game over image and score
function drawGameOver() {
    ctx.drawImage(gameOverImg, canvas.width / 2 - 200, canvas.height / 2 - 100, 400, 200); // Center the image
    ctx.font = '30px Arial';
    ctx.fillStyle = 'black';
    ctx.textAlign = 'center';
    ctx.fillText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2 + 50); // Show the final score
}

// Function to draw the score continuously in the top left corner
function drawScore() {
    ctx.font = '20px Arial';
    ctx.fillStyle = 'black';
    ctx.textAlign = 'left';
    ctx.fillText(`Score: ${score}`, 30, 50);
}

// Spawn a new obstacle
function spawnObstacle() {
    const obstacleType = Math.random() > 0.5 ? 1 : 2; // Randomize between obstacle1 and obstacle2
    obstacles.push({ x: canvas.width, y: canvas.height - 150, type: obstacleType });
}

// Spawn a new cloud
function spawnCloud() {
    clouds.push({ x: canvas.width, y: Math.random() * 200 + 50 });
}

// Update obstacles' position
function updateObstacles() {
    for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].x -= obstacleSpeed;
        if (obstacles[i].x + obstacleWidth < 0) {
            obstacles.splice(i, 1); // Remove off-screen obstacles
            score++;
        }
    }
}

// Update clouds' position
function updateClouds() {
    for (let i = clouds.length - 1; i >= 0; i--) {
        clouds[i].x -= 2; // Move clouds slowly
        if (clouds[i].x + 100 < 0) {
            clouds.splice(i, 1); // Remove off-screen clouds
        }
    }
}

// Handle jumping logic
function handleJump() {
    if (trex.isJumping) {
        trex.velocityY -= trex.gravity;
        trex.y -= trex.velocityY;
        if (trex.y >= canvas.height - 150) {
            trex.y = canvas.height - 150;
            trex.isJumping = false;
            trex.velocityY = 0;
        }
    }
}

// Detect collision with obstacles
function detectCollision() {
    for (const obstacle of obstacles) {
        if (
            trex.x < obstacle.x + obstacleWidth &&
            trex.x + trex.width > obstacle.x &&
            trex.y < obstacle.y + obstacleHeight &&
            trex.y + trex.height > obstacle.y
        ) {
            return true; // Collision detected
        }
    }
    return false; // No collision
}

// Game loop
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw game elements
    drawGround();
    drawSun();
    drawTrex();
    drawObstacles();
    drawClouds();
    drawScore(); // Display the score continuously

    handleJump();
    updateObstacles();
    updateClouds();
    
    // Detect collision and show Game Over screen if needed
    if (detectCollision()) {
        gameState = "END";
        drawGameOver(); // Display Game Over image and score
    } else {
        if (gameState === "PLAY") {
            requestAnimationFrame(gameLoop); // Continue the game loop if in PLAY state
        }
    }
}

// Event listener for jump
window.addEventListener('keydown', (event) => {
    if (event.code === 'Space' && !trex.isJumping) {
        trex.isJumping = true;
        trex.velocityY = trex.jumpPower;
    }
});

// Restart the game
document.getElementById('restartBtn').addEventListener('click', () => {
    score = 0;
    obstacles.length = 0;
    clouds.length = 0;
    gameState = "PLAY";
    gameLoop();
});

// Spawn obstacles and clouds periodically
setInterval(spawnObstacle, 1500);
setInterval(spawnCloud, 3000);

// Start the game loop
gameLoop();
