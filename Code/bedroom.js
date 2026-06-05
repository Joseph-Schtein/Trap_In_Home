// =============================================================================
// bedroom.js — Bedroom scene logic
// Edit this file to work on bedroom interactions.
// Depends on: game-core.js (must be loaded first)
// =============================================================================

// ---------------------------------------------------------------------------
// Phone interaction
// ---------------------------------------------------------------------------
interactHandlers['phone'] = function () {
    if (gameState.isPhoneRinging) {
        // Remove phone hotspot from DOM once picked up
        const phoneHotspot = document.getElementById('bedroom-phone-hotspot');
        if (phoneHotspot) phoneHotspot.remove();

        if (!gameState.inventory.includes("My Phone")) {
            addItem("My Phone");
        }

        // Stop ringtone and update bedroom background
        gameState.phoneRingtone.pause();
        gameState.phoneRingtone.currentTime = 0;
        gameState.isPhoneRinging = false;

        document.getElementById('scene-bedroom').style.backgroundImage =
            "url('../pictures/Bedroom/Bedroom%20without%20phone.png')";

        // Show the incoming call UI immediately so the player can answer/decline
        document.getElementById('incoming-call-ui').classList.remove('hidden');
    }
};

// ---------------------------------------------------------------------------
// Image State Manager
// ---------------------------------------------------------------------------
function updateBedroomImages() {
    const wardrobeEl = document.getElementById('wardrobe-open');
    const drawerEl = document.getElementById('drawer-open');
    const drawerClosetCloseEl = document.getElementById('drawer-open-closet-close');

    if (wardrobeEl) wardrobeEl.classList.add('hidden');
    if (drawerEl) drawerEl.classList.add('hidden');
    if (drawerClosetCloseEl) drawerClosetCloseEl.classList.add('hidden');

    if (gameState.wardrobeOpen && gameState.dresserUnlocked) {
        if (wardrobeEl) wardrobeEl.classList.remove('hidden');
        if (drawerEl) drawerEl.classList.remove('hidden');
    } else if (gameState.wardrobeOpen) {
        if (wardrobeEl) wardrobeEl.classList.remove('hidden');
    } else if (gameState.dresserUnlocked) {
        if (drawerClosetCloseEl) drawerClosetCloseEl.classList.remove('hidden');
    }
}

// ---------------------------------------------------------------------------
// Wardrobe interaction
// ---------------------------------------------------------------------------
interactHandlers['wardrobe'] = function () {
    if (!gameState.wardrobeOpen) {
        gameState.wardrobeOpen = true;
        advanceTime(7);
        updateBedroomImages();
        showText("Self", "I flung the closet doors open and took 7 minutes to change my clothes. Sadly, Narnia is closed for renovations, but there's a suspicious-looking lockbox here instead.");
    } else {
        gameState.wardrobeOpen = false;
        updateBedroomImages();
        showText("Self", "I closed the closet doors. Maybe I should focus on finding a way out.");
    }
};

// ---------------------------------------------------------------------------
// Dresser Drawer interaction (combination lock)
// ---------------------------------------------------------------------------
interactHandlers['Drawer'] = function () {
    if (!gameState.dresserUnlocked) {
        document.getElementById('combination-lock-ui').classList.remove('hidden');
        document.getElementById('game-container').classList.add('lock-active');
        // Reset digits
        lockCode = [0, 0, 0, 0];
        for (let i = 0; i < 4; i++) {
            document.getElementById(`digit-${i}`).innerText = '0';
        }
        showText("Self", "The drawer has a 4-digit combination lock. I need the correct code.");
    } else {
        showText("Self", "The drawer is unlocked. Just some old socks and a spare key inside.");
    }
};

// ---------------------------------------------------------------------------
// Alarm clock (Easter egg)
// ---------------------------------------------------------------------------
interactHandlers['alarm_clock'] = function () {
    showText("Self", "The digital display is completely blank. The power must have cut out during the night.");
};
