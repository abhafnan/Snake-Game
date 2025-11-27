const board = document.getElementById("game-board");
const restartBtn = document.getElementById("restartBtn");
const scoreDisplay = document.getElementById("score");
const gridSize = 20;

let snake;
let direction;
let food;
let gameRunning;
let score = 0;

function initGame() {
    snake = [{ x: 10, y: 10 }];
    direction = { x: 0, y: 0 };
    food = randomFood();
    gameRunning = true;
    score = 0;
    scoreDisplay.textContent = "Score: 0";
}

document.addEventListener("keydown", keyPress);
restartBtn.addEventListener("click", initGame);

function keyPress(e) {
    if (e.key === "ArrowUp" && direction.y === 0) direction = { x: 0, y: -1 };
    if (e.key === "ArrowDown" && direction.y === 0) direction = { x: 0, y: 1 };
    if (e.key === "ArrowLeft" && direction.x === 0) direction = { x: -1, y: 0 };
    if (e.key === "ArrowRight" && direction.x === 0) direction = { x: 1, y: 0 };
}

function randomFood() {
    return {
        x: Math.floor(Math.random() * gridSize),
        y: Math.floor(Math.random() * gridSize)
    };
}

function update() {
    if (!gameRunning) return;

    if (direction.x === 0 && direction.y === 0) return;

    const head = {
        x: snake[0].x + direction.x,
        y: snake[0].y + direction.y
    };

    // Wall collision
    if (head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize) {
        return gameOver();
    }

    // Body collision
    if (snake.some(seg => seg.x === head.x && seg.y === head.y)) {
        return gameOver();
    }

    snake.unshift(head);

    // If food eaten
    if (head.x === food.x && head.y === food.y) {
        score++;
        scoreDisplay.textContent = "Score: " + score;
        food = randomFood();
    } else {
        snake.pop();
    }
}

function draw() {
    board.innerHTML = "";

    // Draw snake
    snake.forEach((segment, index) => {
        const div = document.createElement("div");
        div.style.gridColumnStart = segment.x + 1;
        div.style.gridRowStart = segment.y + 1;

        if (index === 0) {
            div.classList.add("snake-head");

            const leftEye = document.createElement("div");
            const rightEye = document.createElement("div");
            leftEye.classList.add("eye", "eye-left");
            rightEye.classList.add("eye", "eye-right");

            // Eye direction
            if (direction.x === 1) {  // right
                leftEye.style.top = "6px"; leftEye.style.left = "4px";
                rightEye.style.top = "6px"; rightEye.style.right = "4px";
            }
            if (direction.x === -1) { // left
                leftEye.style.top = "6px"; leftEye.style.left = "14px";
                rightEye.style.top = "6px"; rightEye.style.left = "4px";
            }
            if (direction.y === -1) { // up
                leftEye.style.top = "4px"; leftEye.style.left = "5px";
                rightEye.style.top = "4px"; rightEye.style.right = "5px";
            }
            if (direction.y === 1) { // down
                leftEye.style.bottom = "4px"; leftEye.style.left = "5px";
                rightEye.style.bottom = "4px"; rightEye.style.right = "5px";
            }

            div.appendChild(leftEye);
            div.appendChild(rightEye);

        } else {
            div.classList.add("snake");
        }

        board.appendChild(div);
    });

    // Draw food
    const foodEl = document.createElement("div");
    foodEl.style.gridColumnStart = food.x + 1;
    foodEl.style.gridRowStart = food.y + 1;
    foodEl.classList.add("food");
    board.appendChild(foodEl);
}

function gameLoop() {
    update();
    draw();
}

function gameOver() {
    gameRunning = false;
    alert("Game Over! Your Score: " + score);
}

initGame();
setInterval(gameLoop, 120);
