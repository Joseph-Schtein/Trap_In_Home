// =============================================================================
// entrance.js — Entrance / Front Door scene logic
// Edit this file to work on entrance interactions.
// Depends on: game-core.js (must be loaded first)
// =============================================================================

// ---------------------------------------------------------------------------
// Front Door interaction
// ---------------------------------------------------------------------------
interactHandlers['front_door'] = function () {
    showText("Self", "The front door is locked tight. I need the key to get out.");
};

// ---------------------------------------------------------------------------
// Hallway Table Drawer interaction (contains a code clue)
// ---------------------------------------------------------------------------
interactHandlers['hallway_table'] = function () {
    if (!gameState.hallwayTableOpen) {
        gameState.hallwayTableOpen = true;
        if (!gameState.hallwayTableOpenedOnce) {
            gameState.hallwayTableOpenedOnce = true;
            showText("Self", `I pulled open the hallway table drawer. There is a sticky note inside with a number: "${targetCode[3]}"`);
        }
    } else {
        gameState.hallwayTableOpen = false;
    }
    updateEntranceImages();
};

// ---------------------------------------------------------------------------
// Keys interaction (on the table)
// ---------------------------------------------------------------------------
interactHandlers['keys'] = function () {
    if (!gameState.inventory.includes("key number 1")) {
        addItem("key number 1");
        showText("Self", "I took key number 1 from the table.");
        const hotspot = document.getElementById('keys-hotspot');
        if (hotspot) hotspot.remove();
        updateEntranceImages();
    } else {
        showText("Self", "I already have key number 1.");
    }
};

// ---------------------------------------------------------------------------
// Image State Manager
// Handles all background combinations for the entrance scene.
// ---------------------------------------------------------------------------
function updateEntranceImages() {
    const drawerOpen = gameState.hallwayTableOpen;
    const keysTaken  = gameState.inventory.includes("key number 1");

    const entranceScene = document.getElementById('scene-entrance');

    if (drawerOpen && keysTaken) {
        entranceScene.style.backgroundImage =
            "url('../pictures/Entrance%20door/close%20drawers%20keys%20taken.png')";
    } else if (drawerOpen && !keysTaken) {
        entranceScene.style.backgroundImage =
            "url('../pictures/Entrance%20door/Entrance%20door%20drawer%20open.png')";
    } else if (!drawerOpen && keysTaken) {
        entranceScene.style.backgroundImage =
            "url('../pictures/Entrance%20door/Keys%20taken.png')";
    } else {
        entranceScene.style.backgroundImage =
            "url('../pictures/Entrance%20door/Entrance%20door.png')";
    }
}
