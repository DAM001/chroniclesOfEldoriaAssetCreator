const colors = ["#000000", "#1abc9c", "#16a085", "#2ecc71", "#27ae60", "#3498db", "#2980b9", "#9b59b6", "#8e44ad", "#34495e", "#2c3e50", "#f1c40f", "#f39c12", "#e67e22", "#d35400", "#e74c3c", "#c0392b", "#ecf0f1", "#bdc3c7", "#95a5a6", "#7f8c8d"];
const grid = document.querySelector(".grid");
const palette = document.querySelector(".palette");
let selectedColor = colors[0];
let isDrawing = false;
let isMoveMode = false;
let pixelData = Array(16 * 16).fill(null);
const GRID_SIZE = 16;
const PIXEL_SIZE = 20;

// Create color palette
colors.forEach(color => {
    const div = document.createElement("div");
    div.classList.add("color");
    div.style.background = color;
    div.addEventListener("click", () => {
        document.querySelectorAll(".color").forEach(c => c.classList.remove("selected"));
        div.classList.add("selected");
        selectedColor = color;
    });
    palette.appendChild(div);
});

// Add erase button
const erase = document.createElement("div");
erase.classList.add("color", "erase");
erase.addEventListener("click", () => {
    document.querySelectorAll(".color").forEach(c => c.classList.remove("selected"));
    erase.classList.add("selected");
    selectedColor = "transparent";
});
palette.appendChild(erase);

palette.children[0].classList.add("selected");

// Create grid
for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
    const pixel = document.createElement("div");
    pixel.classList.add("pixel");
    pixel.dataset.index = i;
    grid.appendChild(pixel);
}

// Update grid
function updateGrid() {
    document.querySelectorAll(".pixel").forEach((pixel, index) => {
        pixel.style.background = pixelData[index] || "transparent";
    });
}

// Drawing functions
function startDrawing(e) {
    if (isMoveMode) return;
    isDrawing = true;
    applyColor(e);
}

function applyColor(e) {
    if (!isDrawing || isMoveMode) return;
    let pixel = e.target.closest(".pixel");
    if (!pixel) return;
    let index = parseInt(pixel.dataset.index);
    pixelData[index] = selectedColor === "transparent" ? null : selectedColor;
    updateGrid();
}

function stopDrawing() {
    isDrawing = false;
}

// Enable swipe painting on mobile
grid.addEventListener("mousedown", startDrawing);
grid.addEventListener("mouseover", applyColor);
document.addEventListener("mouseup", stopDrawing);
grid.addEventListener("touchstart", (e) => (e.preventDefault(), startDrawing(e.touches[0])));
grid.addEventListener("touchmove", (e) => {
    e.preventDefault();
    let touch = e.touches[0];
    let element = document.elementFromPoint(touch.clientX, touch.clientY);
    if (element && element.classList.contains("pixel")) applyColor({ target: element });
});
document.addEventListener("touchend", stopDrawing);

// Move all pixels together
function movePixels(deltaX, deltaY) {
    if (!isMoveMode) return;
    let newPixelData = Array(GRID_SIZE * GRID_SIZE).fill(null);

    pixelData.forEach((color, index) => {
        if (color) {
            let x = index % GRID_SIZE;
            let y = Math.floor(index / GRID_SIZE);
            let newX = x + deltaX;
            let newY = y + deltaY;

            if (newX >= 0 && newX < GRID_SIZE && newY >= 0 && newY < GRID_SIZE) {
                newPixelData[newY * GRID_SIZE + newX] = color;
            }
        }
    });

    pixelData = newPixelData;
    updateGrid();
}

// Handle movement
let startX, startY;
function startMove(e) {
    if (!isMoveMode) return;
    startX = e.clientX || e.touches[0].clientX;
    startY = e.clientY || e.touches[0].clientY;

    document.addEventListener("mousemove", moveHandler);
    document.addEventListener("mouseup", stopMove);
    document.addEventListener("touchmove", moveHandler);
    document.addEventListener("touchend", stopMove);
}

function moveHandler(e) {
    let endX = e.clientX || e.touches[0].clientX;
    let endY = e.clientY || e.touches[0].clientY;

    let deltaX = Math.round((endX - startX) / PIXEL_SIZE);
    let deltaY = Math.round((endY - startY) / PIXEL_SIZE);

    if (deltaX !== 0 || deltaY !== 0) {
        movePixels(deltaX, deltaY);
        startX = endX;
        startY = endY;
    }
}

function stopMove() {
    document.removeEventListener("mousemove", moveHandler);
    document.removeEventListener("mouseup", stopMove);
    document.removeEventListener("touchmove", moveHandler);
    document.removeEventListener("touchend", stopMove);
}

// Export to PNG
function exportImage() {
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    pixelData.forEach((color, index) => {
        if (color) {
            const x = index % GRID_SIZE;
            const y = Math.floor(index / GRID_SIZE);
            ctx.fillStyle = color;
            ctx.fillRect(x * PIXEL_SIZE, y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
        }
    });

    const name = document.getElementById("name").value || "pixel-art";
    const dataURL = canvas.toDataURL("image/png");

    const link = document.createElement("a");
    link.download = `${name}.png`;
    link.href = dataURL;
    link.click();
}

// Clear Canvas with Confirmation
function clearCanvas() {
    if (confirm("Are you sure you want to clear the canvas?")) {
        pixelData = Array(GRID_SIZE * GRID_SIZE).fill(null);
        updateGrid();
    }
}

// Toggle Move Mode
function toggleMoveMode() {
    isMoveMode = !isMoveMode;
    document.getElementById("moveButton").textContent = isMoveMode ? "Move Mode: ON" : "Move Mode: OFF";
}

// Add event listeners
document.getElementById("exportButton").addEventListener("click", exportImage);
document.getElementById("clearButton").addEventListener("click", clearCanvas);
document.getElementById("moveButton").addEventListener("click", toggleMoveMode);
document.addEventListener("mousedown", startMove);
document.addEventListener("touchstart", startMove);
