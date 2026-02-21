const board = document.getElementById("game-board");
const scoreVal = document.getElementById("score-val");
const highScoreVal = document.getElementById("high-score-val");
const finalScore = document.getElementById("final-score");
const menuOverlay = document.getElementById("menu-overlay");
const gameOverOverlay = document.getElementById("game-over-overlay");
const startBtn = document.getElementById("start-btn");
const restartBtn = document.getElementById("restart-btn");
const modeBtns = document.querySelectorAll(".mode-btn");

let gridSize = 20;
let snake = [];
let direction = { x: 0, y: 0 };
let nextDirection = { x: 0, y: 0 };
let food = {};
let obstacles = [];
let score = 0;
let highScore = localStorage.getItem("snake-high-score") || 0;
let gameMode = "classic";
let gameInterval;

const MODES = {
    classic: { speed: 120, wallDeath: true, wrap: false, obstacleDensity: 0 },
    zen: { speed: 150, wallDeath: false, wrap: true, obstacleDensity: 0 },
    insane: { speed: 80, wallDeath: true, wrap: false, obstacleDensity: 0.05 }
};

highScoreVal.textContent = highScore;

// Mode Selection
modeBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        modeBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        gameMode = btn.dataset.mode;
    });
});

// Fullscreen Logic
function toggleFullScreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.log(`Error attempting to enable full-screen: ${err.message}`);
        });
    }
}

function initGame() {
    toggleFullScreen();
    snake = [{ x: 10, y: 10 }];
    direction = { x: 0, y: 0 };
    nextDirection = { x: 0, y: 0 };
    score = 0;
    updateScore();
    generateObstacles();
    food = spawnFood();

    menuOverlay.classList.add("hidden");
    gameOverOverlay.classList.add("hidden");

    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, MODES[gameMode].speed);
}

function generateObstacles() {
    obstacles = [];
    if (MODES[gameMode].obstacleDensity === 0) return;

    const count = Math.floor(gridSize * gridSize * MODES[gameMode].obstacleDensity);
    for (let i = 0; i < count; i++) {
        let pos = {
            x: Math.floor(Math.random() * gridSize),
            y: Math.floor(Math.random() * gridSize)
        };
        if (pos.x !== 10 && !snake.some(s => s.x === pos.x && s.y === pos.y)) {
            obstacles.push(pos);
        }
    }
}

function spawnFood() {
    let newFood;
    while (true) {
        newFood = {
            x: Math.floor(Math.random() * gridSize),
            y: Math.floor(Math.random() * gridSize),
            type: Math.random() > 0.9 ? "gold" : "normal"
        };
        const onSnake = snake.some(s => s.x === newFood.x && s.y === newFood.y);
        const onObstacle = obstacles.some(o => o.x === newFood.x && o.y === newFood.y);
        if (!onSnake && !onObstacle) break;
    }
    return newFood;
}

function updateScore() {
    scoreVal.textContent = score;
    if (score > highScore) {
        highScore = score;
        highScoreVal.textContent = highScore;
        localStorage.setItem("snake-high-score", highScore);
    }
}

function handleInput(e) {
    const key = e.key;
    if (key === "ArrowUp" && direction.y === 0) nextDirection = { x: 0, y: -1 };
    if (key === "ArrowDown" && direction.y === 0) nextDirection = { x: 0, y: 1 };
    if (key === "ArrowLeft" && direction.x === 0) nextDirection = { x: -1, y: 0 };
    if (key === "ArrowRight" && direction.x === 0) nextDirection = { x: 1, y: 0 };
}

function update() {
    direction = nextDirection;
    if (direction.x === 0 && direction.y === 0) return;

    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

    if (MODES[gameMode].wrap) {
        if (head.x < 0) head.x = gridSize - 1;
        if (head.x >= gridSize) head.x = 0;
        if (head.y < 0) head.y = gridSize - 1;
        if (head.y >= gridSize) head.y = 0;
    } else {
        if (head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize) {
            return gameOver();
        }
    }

    if (snake.some(s => s.x === head.x && s.y === head.y)) return gameOver();
    if (obstacles.some(o => o.x === head.x && o.y === head.y)) return gameOver();

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        const points = food.type === "gold" ? 5 : 1;
        score += points;
        updateScore();

        // Create particle effect
        const particleColor = food.type === "gold" ? "#ffd700" : "#ff2e63";
        createParticles(food.x, food.y, particleColor);

        food = spawnFood();
    } else {
        snake.pop();
    }
}

function draw() {
    board.innerHTML = "";
    board.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
    board.style.gridTemplateRows = `repeat(${gridSize}, 1fr)`;

    // Sync grid background
    const cellSize = 100 / gridSize;
    board.style.backgroundSize = `${cellSize}% ${cellSize}%`;

    obstacles.forEach(o => {
        const el = document.createElement("div");
        el.style.gridColumnStart = o.x + 1;
        el.style.gridRowStart = o.y + 1;
        el.classList.add("obstacle");
        board.appendChild(el);
    });

    const foodEl = document.createElement("div");
    foodEl.style.gridColumnStart = food.x + 1;
    foodEl.style.gridRowStart = food.y + 1;
    foodEl.classList.add(food.type === "gold" ? "food-gold" : "food");
    board.appendChild(foodEl);

    snake.forEach((seg, i) => {
        const el = document.createElement("div");
        el.style.gridColumnStart = seg.x + 1;
        el.style.gridRowStart = seg.y + 1;
        el.classList.add(i === 0 ? "snake-head" : "snake");
        board.appendChild(el);
    });
}

function createParticles(x, y, color) {
    for (let i = 0; i < 8; i++) {
        const particle = document.createElement("div");
        particle.style.position = "absolute";
        particle.style.width = "6px";
        particle.style.height = "6px";
        particle.style.borderRadius = "50%";
        particle.style.backgroundColor = color;
        particle.style.boxShadow = `0 0 10px ${color}`;
        particle.style.left = `${(x / gridSize) * 100}%`;
        particle.style.top = `${(y / gridSize) * 100}%`;
        particle.style.pointerEvents = "none";
        particle.style.zIndex = "999";

        const angle = (Math.PI * 2 * i) / 8;
        const velocity = 20 + Math.random() * 10;
        const vx = Math.cos(angle) * velocity;
        const vy = Math.sin(angle) * velocity;

        board.appendChild(particle);

        let posX = parseFloat(particle.style.left);
        let posY = parseFloat(particle.style.top);
        let opacity = 1;

        const animate = () => {
            posX += vx * 0.1;
            posY += vy * 0.1;
            opacity -= 0.02;

            particle.style.left = posX + "%";
            particle.style.top = posY + "%";
            particle.style.opacity = opacity;

            if (opacity > 0) {
                requestAnimationFrame(animate);
            } else {
                particle.remove();
            }
        };

        requestAnimationFrame(animate);
    }
}

function update() {
    direction = nextDirection;
    if (direction.x === 0 && direction.y === 0) return;

    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

    if (MODES[gameMode].wrap) {
        if (head.x < 0) head.x = gridSize - 1;
        if (head.x >= gridSize) head.x = 0;
        if (head.y < 0) head.y = gridSize - 1;
        if (head.y >= gridSize) head.y = 0;
    } else {
        if (head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize) {
            return gameOver();
        }
    }

    if (snake.some(s => s.x === head.x && s.y === head.y)) return gameOver();
    if (obstacles.some(o => o.x === head.x && o.y === head.y)) return gameOver();

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        const points = food.type === "gold" ? 5 : 1;
        score += points;
        updateScore();

        // Create particle effect
        const particleColor = food.type === "gold" ? "#ffd700" : "#ff2e63";
        createParticles(food.x, food.y, particleColor);

        food = spawnFood();
    } else {
        snake.pop();
    }
}


function gameLoop() {
    update();
    draw();
}

function gameOver() {
    clearInterval(gameInterval);
    finalScore.textContent = score;
    gameOverOverlay.classList.remove("hidden");
}

window.addEventListener("keydown", handleInput);
startBtn.addEventListener("click", initGame);
restartBtn.addEventListener("click", initGame);

// Mobile Swipe Logic
let touchStartX = 0;
let touchStartY = 0;

window.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].clientX;
    touchStartY = e.changedTouches[0].clientY;
}, { passive: false });

window.addEventListener('touchend', e => {
    let touchEndX = e.changedTouches[0].clientX;
    let touchEndY = e.changedTouches[0].clientY;
    handleSwipe(touchStartX, touchStartY, touchEndX, touchEndY);
}, { passive: false });

function handleSwipe(startX, startY, endX, endY) {
    const dx = endX - startX;
    const dy = endY - startY;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    if (Math.max(absX, absY) < 30) return;

    if (absX > absY) {
        if (dx > 0 && direction.x === 0) nextDirection = { x: 1, y: 0 };
        else if (dx < 0 && direction.x === 0) nextDirection = { x: -1, y: 0 };
    } else {
        if (dy > 0 && direction.y === 0) nextDirection = { x: 0, y: 1 };
        else if (dy < 0 && direction.y === 0) nextDirection = { x: 0, y: -1 };
    }
}

// Responsive sizing
function resizeBoard() {
    const margin = 20;
    const size = Math.min(window.innerWidth - margin, window.innerHeight - margin);
    board.style.width = `${size}px`;
    board.style.height = `${size}px`;
}

window.addEventListener("resize", resizeBoard);
resizeBoard();
