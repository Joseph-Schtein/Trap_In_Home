// =============================================================================
// livingroom.js — Living room scene logic
// Edit this file to work on living room interactions.
// Depends on: game-core.js (must be loaded first)
// =============================================================================

// ---------------------------------------------------------------------------
// TV Drawers interaction
// ---------------------------------------------------------------------------
interactHandlers['tv_drawers'] = function () {
    if (!gameState.tvDrawersOpen) {
        gameState.tvDrawersOpen = true;
        if (!gameState.tvDrawersOpenedOnce) {
            gameState.tvDrawersOpenedOnce = true;
            showText("Self", `I opened the wooden TV drawers. Among old cables, there's a receipt with a note: "The third digit is ${targetCode[2]}."`);
        }
    } else {
        gameState.tvDrawersOpen = false;
    }
    updateLivingRoomImages();
};

// ---------------------------------------------------------------------------
// Glass Cabinet interaction
// ---------------------------------------------------------------------------
interactHandlers['glass_cabinet'] = function () {
    if (!gameState.glassCabinetOpen) {
        gameState.glassCabinetOpen = true;
        if (!gameState.glassCabinetOpenedOnce) {
            gameState.glassCabinetOpenedOnce = true;
            showText("Self", "Just some fancy glasses we never use.");
        }
    } else {
        gameState.glassCabinetOpen = false;
    }
    updateLivingRoomImages();
};

// ---------------------------------------------------------------------------
// Image State Manager
// Handles all overlay combinations for the living room.
// ---------------------------------------------------------------------------
function updateLivingRoomImages() {
    const tvOpen    = gameState.tvDrawersOpen;
    const glassOpen = gameState.glassCabinetOpen;

    const tvEl    = document.getElementById('tv-drawers-open');
    const glassEl = document.getElementById('glass-cabinet-open');
    const bothEl  = document.getElementById('both-doors-open');

    if (tvEl)    tvEl.classList.add('hidden');
    if (glassEl) glassEl.classList.add('hidden');
    if (bothEl)  bothEl.classList.add('hidden');

    if (tvOpen && glassOpen) {
        if (bothEl)  bothEl.classList.remove('hidden');
    } else if (tvOpen) {
        if (tvEl)    tvEl.classList.remove('hidden');
    } else if (glassOpen) {
        if (glassEl) glassEl.classList.remove('hidden');
    }
}
