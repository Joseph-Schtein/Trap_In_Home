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
            showText("Self", "Wait, I can't leave in pajamas. I'm doing a presentation, not a sleepover. Better change first.");
        } else {
            showText("Self", "The door is open, I'm finally out of here! David is sleeping on the couch when he return.");
            if (gameState.currentTimeMinutes <= 8 * 60 + 45) {
                winningSound.play();
                showText("System", "You escaped on time and made it to your meeting! You win!", () => {
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
            showText("Self", "I unlocked the door! But wait, I'm still in pajamas. Can't pitch to the board in my flannels. Gotta change.");
        } else {
            showText("Self", "I unlocked the door! I survived the Escape Room of Paranoia. David is so dead.");
        }
    } else {
        showText("Self", "Locked tight. A fortress. I am trapped in my own home. *Laugh track plays in my head*");
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
            showText("Self", `Drawer open. Oh look, another torn piece of paper! I feel like I'm in a terrible detective movie.`);
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
        showText("Self", "A key labeled 'Living Room'. Who has a key for a living room?! Our open-concept living room!");
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
    const keysTaken = gameState.inventory.includes("Living Room Key");

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
