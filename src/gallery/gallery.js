// Load the existing data from firebase and display it in the gallery
window.onload = function() {
    firebaseHandler.loadAllDocuments("assets").then(dataArray => {
        const gridContainer = document.getElementById('gridContainer');
        gridContainer.innerHTML = ''; // Clear the grid

        dataArray.forEach(data => {
            // Create a card for each element
            const card = document.createElement('div');
            card.className = 'card';

            // Add file name
            const fileName = document.createElement('h2');
            fileName.textContent = data.name;
            card.appendChild(fileName);

            // Create canvas for pixel art
            const canvas = document.createElement('canvas');
            canvas.width = data.size[0] * 8; // Assuming each tile is 8x8 pixels
            canvas.height = data.size[1] * 8;
            const ctx = canvas.getContext('2d');

            // Draw the pixel art
            for (let y = 0; y < data.size[1]; y++) {
                for (let x = 0; x < data.size[0]; x++) {
                    const tileIndex = data.tiles[y * data.size[0] + x];
                    if (tileIndex !== -1) {
                        ctx.fillStyle = colors[tileIndex];
                        ctx.fillRect(x * 8, y * 8, 8, 8);
                    }
                }
            }
            
            // Append canvas to the card
            card.appendChild(canvas);

            // Add devider line
            const devider = document.createElement('hr');
            card.appendChild(devider);

            // Add file description
            const fileDescription = document.createElement('p');
            fileDescription.textContent = `Description: ${data.description}`;
            card.appendChild(fileDescription);

            // Add creator email
            const fileCreator = document.createElement('p');
            fileCreator.textContent = `Creator: ${data.creator}`;
            card.appendChild(fileCreator);

            // Add file date
            const fileDate = document.createElement('p');
            fileDate.textContent = `Date: ${new Date(data.date).toLocaleDateString()}`;
            card.appendChild(fileDate);

            // Add file size
            const fileSize = document.createElement('p');
            fileSize.textContent = `Size: ${data.size[0]}x${data.size[1]}`;
            card.appendChild(fileSize);

            // Append card to the grid container
            gridContainer.appendChild(card);
        });
    }).catch(error => {
        console.error("Error loading documents: ", error);
    });
};

document.getElementById("create-button").addEventListener("click", function() {
    document.getElementById("drawing-container").style.display = "flex";
    document.getElementById("gallery-container").style.display = "none";
});