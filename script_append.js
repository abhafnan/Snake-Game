
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
