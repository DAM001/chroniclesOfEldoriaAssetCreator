function saveImageWithMetadata(pixelData, name, description, scale = 1) {
    // Create a canvas
    const canvas = document.createElement("canvas");
    canvas.width = GRID_SIZE * scale;
    canvas.height = GRID_SIZE * scale;
    const ctx = canvas.getContext("2d");

    // Draw pixelData onto the canvas
    pixelData.forEach((color, index) => {
        if (color) {
            const x = index % GRID_SIZE;
            const y = Math.floor(index / GRID_SIZE);
            ctx.fillStyle = color;
            ctx.fillRect(x * scale, y * scale, scale, scale); // Scale each pixel
        }
    });

    // Convert canvas to Blob
    canvas.toBlob((blob) => {
        const reader = new FileReader();
        reader.onload = () => {
            let arrayBuffer = new Uint8Array(reader.result);
            const textEncoder = new TextEncoder();
            const metadataTag = "\nTEXT-DATA:";
            const descriptionData = textEncoder.encode(metadataTag + description);

            // Remove existing metadata if present
            const metadataIndex = findMetadataIndex(arrayBuffer, metadataTag);
            if (metadataIndex !== -1) {
                arrayBuffer = arrayBuffer.slice(0, metadataIndex);
            }

            // Combine image and metadata
            const combinedData = new Uint8Array(arrayBuffer.length + descriptionData.length);
            combinedData.set(arrayBuffer);
            combinedData.set(descriptionData, arrayBuffer.length);

            // Create a download link
            const link = document.createElement("a");
            link.download = `${name}.png`;
            link.href = URL.createObjectURL(new Blob([combinedData], { type: "image/png" }));
            link.click();
        };
        reader.readAsArrayBuffer(blob);
    }, "image/png");
}

function findMetadataIndex(data, tag) {
    const decoder = new TextDecoder();
    const text = decoder.decode(data);
    return text.indexOf(tag);
}

// Controls
function toggleSavePopup() {
    document.getElementById("savePopup").classList.toggle("active");
}

// Event Listeners
document.getElementById("saveButton").addEventListener("click", toggleSavePopup);
document.getElementById("cancelExportButton").addEventListener("click", toggleSavePopup);
