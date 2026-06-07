// =============================================================================
// entrance.js — Entrance / Front Door scene logic
// Edit this file to work on entrance interactions.
// Depends on: game-core.js (must be loaded first)
// =============================================================================

// ---------------------------------------------------------------------------
// Front Door interaction
// ---------------------------------------------------------------------------
interactHandlers['front_door'] = function () {
    if (gameState.entranceDoorOpen) {
        if (!gameState.clothesChanged) {
            showText("Self", "Wait, I can't leave home dressed in my pijama. I need to change first.");
        } else {
            showText("Self", "The door is open, I'm out of here.");
            if (gameState.currentTimeMinutes <= 8 * 60 + 45) {
                winningSound.play();
                showText("System", "You escaped on time! You win!", () => {
                    document.getElementById('win-screen').classList.remove('hidden');
                });
            } else {
                document.getElementById('fail-screen').classList.remove('hidden');
            }
        }
    } else if (gameState.entranceDoorKeyUsed) {
        gameState.entranceDoorOpen = true;
        removeItem("Entrance Door Key");
        updateEntranceImages();
        if (!gameState.clothesChanged) {
            showText("Self", "I unlocked the door, but wait... I can't leave home dressed in my pijama. I need to change first.");
        } else {
            showText("Self", "I unlocked the door! Let's go.");
        }
    } else {
        showText("Self", "The front door is locked tight. I need the key to get out.");
    }
};

// ---------------------------------------------------------------------------
// Hallway Table Drawer interaction (contains a code clue)
// ---------------------------------------------------------------------------
interactHandlers['hallway_table'] = function () {
    if (!gameState.hallwayTableOpen) {
        gameState.hallwayTableOpen = true;
        cabinetOpenSound.cloneNode().play();
        if (!gameState.hallwayTableOpenedOnce) {
            gameState.hallwayTableOpenedOnce = true;
            showText("Self", `I pulled open the hallway table drawer. There is a torn piece of paper inside!`);
            addItem(`Piece of Paper ${targetCode[3]}`);
        }
    } else {
        gameState.hallwayTableOpen = false;
        cabinetCloseSound.cloneNode().play();
    }
    updateEntranceImages();
};

// ---------------------------------------------------------------------------
// Keys interaction (on the table)
// ---------------------------------------------------------------------------
interactHandlers['keys'] = function () {
    if (!gameState.inventory.includes("Living Room Key")) {
        keysSound.cloneNode().play();
        addItem("Living Room Key");
        showText("Self", "I took the Living Room Key from the table.");
        const hotspot = document.getElementById('keys-hotspot');
        if (hotspot) hotspot.remove();
        updateEntranceImages();
    } else {
        showText("Self", "I already have the Living Room Key.");
    }
};

// ---------------------------------------------------------------------------
// Image State Manager
// Handles all background combinations for the entrance scene.
// ---------------------------------------------------------------------------
function updateEntranceImages() {
    const drawerOpen = gameState.hallwayTableOpen;
    const keysTaken  = gameState.inventory.includes("Living Room Key");

    const entranceScene = document.getElementById('scene-entrance');
    const doorOpenImg = document.getElementById('door-open-overlay');

    if (doorOpenImg) {
        if (gameState.entranceDoorOpen) {
            doorOpenImg.classList.remove('hidden');
        } else {
            doorOpenImg.classList.add('hidden');
        }
    }

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
