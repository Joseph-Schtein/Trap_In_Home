// =============================================================================
// livingroom.js — Living room scene logic
// Edit this file to work on living room interactions.
// Depends on: game-core.js (must be loaded first)
// =============================================================================

// ---------------------------------------------------------------------------
// Paper interaction (pick up from floor)
// ---------------------------------------------------------------------------
interactHandlers['paper'] = function () {
    if (!gameState.inventory.includes("Paper")) {
        paperSound.cloneNode().play();
        addItem("Paper");
        const paperEl = document.getElementById('living-room-paper');
        if (paperEl) paperEl.style.display = 'none';
        const hotspot = document.getElementById('paper-hotspot');
        if (hotspot) hotspot.remove();
        showText("Self", "I picked up a suspicious piece of paper. Might be David's scribbles.");
    }
};

// ---------------------------------------------------------------------------
// TV Drawers interaction
// ---------------------------------------------------------------------------
interactHandlers['tv_drawers'] = function () {
    if (!gameState.tvDrawersUnlocked) {
        showText("Self", "Locked. The TV drawers are locked. He really thinks someone's going to steal our old DVDs?");
        return;
    }

    if (!gameState.tvDrawersOpen) {
        gameState.tvDrawersOpen = true;
        cabinetOpenSound.cloneNode().play();
        if (!gameState.tvDrawersOpenedOnce) {
            gameState.tvDrawersOpenedOnce = true;
            showText("Self", "Old batteries, an old Xbox one... and a torn piece of paper with a digit. This isn't an escape room, David, it's our living room!");
            addItem(`Piece of Paper ${targetCode[2]}`);
        }
    } else {
        gameState.tvDrawersOpen = false;
        cabinetCloseSound.cloneNode().play();
    }
    updateLivingRoomImages();
};

// ---------------------------------------------------------------------------
// Glass Cabinet interaction
// ---------------------------------------------------------------------------
interactHandlers['glass_cabinet'] = function () {
    if (!gameState.glassCabinetOpen) {
        gameState.glassCabinetOpen = true;
        cabinetOpenSound.cloneNode().play();
        if (!gameState.glassCabinetOpenedOnce) {
            gameState.glassCabinetOpenedOnce = true;
            showText("Self", "Just some fancy glasses we never use. Thankfully he hasn't padlocked this yet.");
        }
    } else {
        gameState.glassCabinetOpen = false;
        cabinetCloseSound.cloneNode().play();
    }
    updateLivingRoomImages();
};

// ---------------------------------------------------------------------------
// Image State Manager
// Handles all overlay combinations for the living room.
// ---------------------------------------------------------------------------
function updateLivingRoomImages() {
    const tvOpen = gameState.tvDrawersOpen;
    const glassOpen = gameState.glassCabinetOpen;

    const tvEl = document.getElementById('tv-drawers-open');
    const glassEl = document.getElementById('glass-cabinet-open');
    const bothEl = document.getElementById('both-doors-open');

    if (tvEl) tvEl.classList.add('hidden');
    if (glassEl) glassEl.classList.add('hidden');
    if (bothEl) bothEl.classList.add('hidden');

    if (tvOpen && glassOpen) {
        if (bothEl) bothEl.classList.remove('hidden');
    } else if (tvOpen) {
        if (tvEl) tvEl.classList.remove('hidden');
    } else if (glassOpen) {
        if (glassEl) glassEl.classList.remove('hidden');
    }
}
