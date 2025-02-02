const colors = ["#000000", "#1abc9c", "#16a085", "#2ecc71", "#27ae60", "#3498db", "#2980b9", "#9b59b6", "#8e44ad", "#34495e", "#2c3e50", "#f1c40f", "#f39c12", "#e67e22", "#d35400", "#e74c3c", "#c0392b", "#ecf0f1", "#bdc3c7", "#95a5a6", "#7f8c8d"];
const grid = document.querySelector(".grid");
const palette = document.querySelector(".palette");
let selectedColor = colors[0]; // Default to black
let isDrawing = false;
let isFillMode = false;
let isMoveMode = false;
let pixelData = Array(16 * 16).fill(null);
const GRID_SIZE = 16;
const PIXEL_SIZE = 20;

document.onload = saveState();

// Create color palette
colors.forEach((color, index) => {
    const div = document.createElement("div");
    div.classList.add("color");
    div.style.background = color;
    if (index === 0) div.classList.add("selected"); // Default selection
    div.addEventListener("click", () => {
        document.querySelectorAll(".color").forEach(c => c.classList.remove("selected"));
        div.classList.add("selected");
        selectedColor = color;
        if (isMoveMode) toggleMoveMode();
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

// Create grid
for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
    const pixel = document.createElement("div");
    pixel.classList.add("pixel");
    pixel.dataset.index = i;
    grid.appendChild(pixel);
}

// Update grid visuals
function updateGrid() {
    document.querySelectorAll(".pixel").forEach((pixel, index) => {
        pixel.style.background = pixelData[index] || "transparent";
    });
}

// Fill function using Flood Fill
function fillPixels(startIndex) {
    let targetColor = pixelData[startIndex];
    if (targetColor === selectedColor) return;
    
    let queue = [startIndex];
    let visited = new Set();
    
    while (queue.length > 0) {
        let index = queue.shift();
        if (visited.has(index)) continue;
        visited.add(index);
        
        let x = index % GRID_SIZE;
        let y = Math.floor(index / GRID_SIZE);

        if (pixelData[index] !== targetColor) continue;

        pixelData[index] = selectedColor === "transparent" ? null : selectedColor;

        if (x > 0) queue.push(index - 1);
        if (x < GRID_SIZE - 1) queue.push(index + 1);
        if (y > 0) queue.push(index - GRID_SIZE);
        if (y < GRID_SIZE - 1) queue.push(index + GRID_SIZE);
    }

    updateGrid();
    saveState();
}

// Start drawing or filling (modified)
function startDrawing(e) {
    if (isMoveMode) return;
    const pixel = getPixelFromEvent(e);
    if (!pixel) return;
    const index = parseInt(pixel.dataset.index);

    if (isFillMode) {
        fillPixels(index);
    } else {
        isDrawing = true;
        applyColor(pixel);
    }
}

// Apply color to a pixel (modified)
function applyColor(pixel) {
    if (!isDrawing || isMoveMode) return;
    const index = parseInt(pixel.dataset.index);
    pixelData[index] = selectedColor === "transparent" ? null : selectedColor;
    updateGrid();
}

// Stop drawing (modified)
function stopDrawing() {
    if (!isDrawing) return;
    saveState();
    isDrawing = false;
}

// Clear Canvas with Confirmation (modified)
function clearCanvas() {
    if (confirm("Are you sure you want to clear the canvas?")) {
        saveState(); // Save before clearing
        pixelData = Array(GRID_SIZE * GRID_SIZE).fill(null);
        updateGrid();
    }
}

// Get pixel from event
function getPixelFromEvent(e) {
    let clientX, clientY;
    if (e.touches) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else {
        clientX = e.clientX;
        clientY = e.clientY;
    }
    const element = document.elementFromPoint(clientX, clientY);
    return element?.closest(".pixel");
}

// Enable swipe painting on mobile
grid.addEventListener("mousedown", startDrawing);
grid.addEventListener("mouseover", (e) => {
    const pixel = getPixelFromEvent(e);
    if (pixel) applyColor(pixel);
});
document.addEventListener("mouseup", stopDrawing);
grid.addEventListener("touchstart", (e) => {
    e.preventDefault();
    startDrawing(e.touches[0]);
});
grid.addEventListener("touchmove", (e) => {
    e.preventDefault();
    const pixel = getPixelFromEvent(e.touches[0]);
    if (pixel) applyColor(pixel);
});
document.addEventListener("touchend", stopDrawing);

// Move all pixels together (fixed speed)
let moveOffsetX = 0, moveOffsetY = 0, moveStartX, moveStartY, newPixelData;

function startMove(e) {
    if (!isMoveMode) return;
    moveStartX = (e.clientX || e.touches[0].clientX);
    moveStartY = (e.clientY || e.touches[0].clientY);
    newPixelData = [...pixelData]; // Clone before moving

    document.addEventListener("mousemove", moveHandler);
    document.addEventListener("mouseup", stopMove);
    document.addEventListener("touchmove", moveHandler);
    document.addEventListener("touchend", stopMove);
}

function moveHandler(e) {
    let currentX = (e.clientX || e.touches[0].clientX);
    let currentY = (e.clientY || e.touches[0].clientY);

    let deltaX = Math.floor((currentX - moveStartX) / PIXEL_SIZE);
    let deltaY = Math.floor((currentY - moveStartY) / PIXEL_SIZE);

    if (deltaX !== moveOffsetX || deltaY !== moveOffsetY) {
        moveOffsetX = deltaX;
        moveOffsetY = deltaY;
        updateMovePreview();
    }
}

function updateMovePreview() {
    let previewData = Array(GRID_SIZE * GRID_SIZE).fill(null);

    newPixelData.forEach((color, index) => {
        if (color) {
            let x = index % GRID_SIZE;
            let y = Math.floor(index / GRID_SIZE);
            let newX = x + moveOffsetX;
            let newY = y + moveOffsetY;

            if (newX >= 0 && newX < GRID_SIZE && newY >= 0 && newY < GRID_SIZE) {
                previewData[newY * GRID_SIZE + newX] = color;
            }
        }
    });

    pixelData = previewData;
    updateGrid();
}

function stopMove() {
    document.removeEventListener("mousemove", moveHandler);
    document.removeEventListener("mouseup", stopMove);
    document.removeEventListener("touchmove", moveHandler);
    document.removeEventListener("touchend", stopMove);

    saveState();
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

// Toggle Move Mode
function toggleMoveMode() {
    isMoveMode = !isMoveMode;
    document.getElementById("moveButton").classList.toggle("active");
}

// Toggle Fill Mode
function toggleFillMode() {
    isFillMode = !isFillMode;
    if (isFillMode) isMoveMode = false; // Disable Move Mode when Fill Mode is ON
    document.getElementById("fillButton").classList.toggle("active");
}

// Add event listeners
document.getElementById("moveButton").addEventListener("click", toggleMoveMode);
document.getElementById("fillButton").addEventListener("click", toggleFillMode);
document.getElementById("clearButton").addEventListener("click", clearCanvas);
document.getElementById("exportButton").addEventListener("click", exportImage);
document.addEventListener("mousedown", startMove);
document.addEventListener("touchstart", startMove);