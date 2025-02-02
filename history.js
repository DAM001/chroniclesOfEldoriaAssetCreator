let history = []; // Stores all states
let historyIndex = -1; // Tracks the current state in history

// Save the current state to history
function saveState() {
    // Clear future redo states if a new action is performed after undo
    if (historyIndex < history.length - 1) {
        history = history.slice(0, historyIndex + 1);
    }
    history.push(pixelData.slice()); // Store a copy of the current state
    historyIndex++; // Move the index to the new state
}

// Undo: Revert to the previous state
function undo() {
    if (historyIndex > 0) {
        historyIndex--; // Move back in history
        pixelData = history[historyIndex].slice(); // Restore the state
        updateGrid();
    }
}

// Redo: Reapply the next state
function redo() {
    if (historyIndex < history.length - 1) {
        historyIndex++; // Move forward in history
        pixelData = history[historyIndex].slice(); // Restore the state
        updateGrid();
    }
}

// Add event listeners for undo/redo buttons
document.getElementById("undoButton").addEventListener("click", undo);
document.getElementById("redoButton").addEventListener("click", redo);