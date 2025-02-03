function saveImageWithMetadata(canvas, name, description, scale = 10) {
    // Create a scaled canvas
    const scaledCanvas = document.createElement("canvas");
    scaledCanvas.width = canvas.width * scale;
    scaledCanvas.height = canvas.height * scale;
    const ctx = scaledCanvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(canvas, 0, 0, scaledCanvas.width, scaledCanvas.height);
    
    scaledCanvas.toBlob((blob) => {
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
    const match = text.indexOf(tag);
    return match !== -1 ? match : -1;
}

function toggleSavePopup() {
    document.getElementById("savePopup").classList.toggle("active");
}

document.getElementById("saveButton").addEventListener("click", toggleSavePopup);
document.getElementById("cancelExportButton").addEventListener("click", toggleSavePopup);