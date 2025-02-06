// Add event listener for the load image button
document.getElementById("loadImageButton").addEventListener("click", () => {
    document.getElementById("loadImageInput").click(); // Trigger file input
});

// Handle file input change
document.getElementById("loadImageInput").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
        extractMetadataFromFile(file, (metadata) => {
            if (metadata) {
                console.log("Extracted Metadata:", metadata);
                // Set the metadata in the description field
                document.getElementById("description").value = metadata;
            } else {
                console.log("No metadata found in the image.");
            }

            // Load the image into the canvas
            loadImage(file);
        });
    }
});

// Function to load and process the image
function loadImage(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            // Extract metadata from the image
            extractMetadataFromFile(file, (metadata) => {
                if (metadata) {
                    // Set the description in the save popup
                    document.getElementById("description").value = metadata;
                }

                // Scale the image to fit the current grid size
                const scaledImageData = scaleImageToGrid(img);

                // Load the scaled image data into the canvas
                loadImageDataIntoCanvas(scaledImageData);
            });
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// Function to extract metadata from the image
function extractMetadataFromFile(file, callback) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const arrayBuffer = new Uint8Array(e.target.result);
        const metadataTag = "\nTEXT-DATA:";
        const metadataIndex = findMetadataIndex(arrayBuffer, metadataTag);

        if (metadataIndex !== -1) {
            const decoder = new TextDecoder();
            const metadataText = decoder.decode(arrayBuffer.slice(metadataIndex + metadataTag.length));
            callback(metadataText.trim()); // Return the metadata
        } else {
            callback(null); // No metadata found
        }
    };
    reader.readAsArrayBuffer(file);
}

// Function to scale the image to fit the current grid size
function scaleImageToGrid(img) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // Determine the scale factor
    const scaleFactor = GRID_SIZE / Math.max(img.width, img.height);

    // Set canvas size to the scaled dimensions
    canvas.width = GRID_SIZE;
    canvas.height = GRID_SIZE;

    // Draw the image scaled to fit the grid
    ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, GRID_SIZE, GRID_SIZE);

    // Get the pixel data from the scaled image
    const imageData = ctx.getImageData(0, 0, GRID_SIZE, GRID_SIZE).data;

    // Convert the image data to a color array
    const scaledImageData = [];
    for (let i = 0; i < imageData.length; i += 4) {
        const r = imageData[i];
        const g = imageData[i + 1];
        const b = imageData[i + 2];
        const a = imageData[i + 3];

        if (a === 0) {
            scaledImageData.push(null); // Transparent pixel
        } else {
            scaledImageData.push(`rgba(${r}, ${g}, ${b}, ${a / 255})`);
        }
    }

    return scaledImageData;
}

// Function to load the scaled image data into the canvas
function loadImageDataIntoCanvas(imageData) {
    pixelData = imageData; // Update the pixel data
    updateGrid(); // Update the grid visuals
    saveState(); // Save the new state
}