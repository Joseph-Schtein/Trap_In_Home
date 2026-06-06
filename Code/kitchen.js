// =============================================================================
// kitchen.js — Kitchen scene logic
// Edit this file to work on kitchen interactions.
// Depends on: game-core.js (must be loaded first)
// =============================================================================

// ---------------------------------------------------------------------------
// Fruit Bowl interaction (reveals keys)
// ---------------------------------------------------------------------------
interactHandlers['kitchen_middle'] = function () {
    if (!gameState.fruitsBowlClicked) {
        gameState.fruitsBowlClicked = true;
        showText("Self", "I remember that there were keys inside this bowl");
    } else if (!gameState.kitchenKeysFound) {
        gameState.kitchenKeysFound = true;
        document.getElementById('kitchen-bowl-found').classList.remove('hidden');
        keysSound.cloneNode().play();
        addItem("Kitchen Keys");
    }
};

// ---------------------------------------------------------------------------
// Island / Upper Cabinet interaction (requires Kitchen Keys)
// ---------------------------------------------------------------------------
interactHandlers['island_drawers'] = function () {
    if (!gameState.kitchenKeysFound) {
        showText("Self", "You need a key to open the cabinet");
    } else if (!gameState.upperCabinetUnlocked) {
        showText("Self", "The cabinet is locked. I should use the cabinet keys.");
    } else {
        gameState.upperCabinetOpen = !gameState.upperCabinetOpen;
        gameState.upperCabinetOpen ? cabinetOpenSound.cloneNode().play() : cabinetCloseSound.cloneNode().play();
        updateKitchenImages();
        if (gameState.upperCabinetOpen && !gameState.upperCabinetOpenedOnce) {
            gameState.upperCabinetOpenedOnce = true;
            showText("Self", `I opened the upper cabinet. Inside, tucked next to some plates, is a note with a number: "${targetCode[1]}"`);
            addItem(`${targetCode[1]}`);
        }
    }
};

// ---------------------------------------------------------------------------
// Oven / Lower Cabinet interaction (requires Kitchen Keys)
// ---------------------------------------------------------------------------
interactHandlers['oven'] = function () {
    if (!gameState.kitchenKeysFound) {
        showText("Self", "You need a key to open the cabinet");
    } else if (!gameState.lowerCabinetUnlocked) {
        showText("Self", "The cabinet is locked. I should use the cabinet keys.");
    } else {
        gameState.lowerCabinetOpen = !gameState.lowerCabinetOpen;
        gameState.lowerCabinetOpen ? cabinetOpenSound.cloneNode().play() : cabinetCloseSound.cloneNode().play();
        updateKitchenImages();
    }
};

// ---------------------------------------------------------------------------
// Image State Manager
// Handles all overlay combinations for the kitchen scene.
// ---------------------------------------------------------------------------
function updateKitchenImages() {
    const upper = gameState.upperCabinetOpen;
    const lower = gameState.lowerCabinetOpen;

    const bowlEl  = document.getElementById('kitchen-bowl-found');
    const upperEl = document.getElementById('kitchen-upper-open');
    const lowerEl = document.getElementById('kitchen-lower-open');
    const bothEl  = document.getElementById('kitchen-both-open');

    if (upperEl) upperEl.classList.add('hidden');
    if (lowerEl) lowerEl.classList.add('hidden');
    if (bothEl)  bothEl.classList.add('hidden');

    if (!upper && !lower) {
        // Both cabinets closed — hide bowl overlay so base image shows
        if (bowlEl) bowlEl.classList.add('hidden');
    } else {
        if (upper && lower) {
            if (bothEl)  bothEl.classList.remove('hidden');
        } else if (upper) {
            if (upperEl) upperEl.classList.remove('hidden');
        } else if (lower) {
            if (lowerEl) lowerEl.classList.remove('hidden');
        }
    }
}
