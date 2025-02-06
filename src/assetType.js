// Function to change grid size
function changeGridSize(size) {
    if (pixelData.some(pixel => pixel !== null)) { // Check if there's any drawing
        const confirmChange = confirm("Changing the grid size will clear your current drawing. Are you sure?");
        if (!confirmChange) return; // Exit if user cancels
    }

    GRID_SIZE = size;
    document.documentElement.style.setProperty("--grid-size", GRID_SIZE); // Update CSS variable
    pixelData = Array(GRID_SIZE * GRID_SIZE).fill(null); // Reset pixel data
    createGrid(); // Recreate the grid
    saveState(); // Save the new state

    // Update the dropdown button text
    document.getElementById("currentGridSize").textContent = `${GRID_SIZE}x${GRID_SIZE}`;
}

// Update the grid creation logic
function createGrid() {
    grid.innerHTML = ""; // Clear existing grid
    for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
        const pixel = document.createElement("div");
        pixel.classList.add("pixel");
        pixel.dataset.index = i;
        grid.appendChild(pixel);
    }
    updateGrid(); // Update visuals
}

// Replace the existing grid creation loop with this function
createGrid();

// Add event listener for grid size dropdown
document.querySelectorAll(".dropdown-content a").forEach(link => {
    link.addEventListener("click", (e) => {
        e.preventDefault();
        const size = parseInt(e.target.getAttribute("data-size"));
        changeGridSize(size);
    });
});
