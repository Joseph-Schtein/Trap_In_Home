// Add phone audio tracking to your global game state
const gameState = {
    currentScene: 'bedroom',
    inventory: [],
    selectedItem: null,

    // States
    wardrobeOpen: false,
    kitchenDrawerOpen: false,
    hasDeadboltKey: false,
    locksRemaining: 3,

    callDeclinedCount: 0,
    isPhoneRinging: false,

    // Audio Reference
    phoneRingtone: new Audio('../Sound/freesound_community-cellphone-ringing-6475.mp3')
};

// Configure the ringtone properties
gameState.phoneRingtone.loop = true;
gameState.phoneRingtone.volume = 0.3;

// Override the window loading sequence
window.onload = () => {
    // Generate random 4-digit code
    targetCode = [
        Math.floor(Math.random() * 10),
        Math.floor(Math.random() * 10),
        Math.floor(Math.random() * 10),
        Math.floor(Math.random() * 10)
    ];

    // Note: Browsers require a click on the document before audio can play
    showOpeningModal();
};

function showOpeningModal() {
    // Show a splash message so browser allows the sound to trigger on click
    showText("System", "Click anywhere to wake up...");

    // Listen for the absolute first interaction to start the atmospheric audio
    document.body.addEventListener('click', startIntroSequence, { once: true });
}

function startIntroSequence() {
    // Queue the introductory narrative sequence
    showText("Self", "Wow, I slept so good. I didn't even hear my spouse leave for their flight.");
    showText("Self", "Wait, what time is it? I hope I'm not late for the meeting!");
    showText("Self", "*Groan*... What is that piercing noise? Is my cell phone ringing somewhere in the room?", () => {

        // Change background image to the phone call state

        // Start the phone ringtone
        gameState.isPhoneRinging = true;
        gameState.phoneRingtone.play().catch(error => {
            console.log("Audio playback prevented by browser policies:", error);
        });
        document.getElementById('scene-bedroom').style.backgroundImage = "url('../pictures/Bedroom/Bedroom%20phone%20call.png')";

        document.getElementById('bedroom-phone-hotspot').classList.add('pulse-glow');
    });
}

// Update the interaction behavior inside your router
function interact(target) {
    if (target !== 'phone' && (!gameState.inventory.includes("My Phone") || gameState.isPhoneRinging)) {
        showText("Self", "I should find my phone first, that ringing is driving me crazy!");
        return;
    }

    switch (target) {
        case 'alarm_clock':
            showText("Self", "The digital display is completely blank. The power must have cut out during the night.");
            break;

        case 'phone':
            if (gameState.isPhoneRinging) {
                const phoneHotspot = document.getElementById('bedroom-phone-hotspot');
                if (phoneHotspot) {
                    phoneHotspot.remove();
                }

                // If it's not already in inventory, add it
                if (!gameState.inventory.includes("My Phone")) {
                    addItem("My Phone");
                }

                // Update the background image to remove the phone visually
                document.getElementById('scene-bedroom').style.backgroundImage = "url('../pictures/Bedroom/Bedroom%20without%20phone.png')";
            }
            break;

        case 'Drawer':
            if (!gameState.dresserUnlocked) {
                document.getElementById('combination-lock-ui').classList.remove('hidden');
                // Reset digits
                lockCode = [0, 0, 0, 0];
                for (let i = 0; i < 4; i++) {
                    document.getElementById(`digit-${i}`).innerText = '0';
                }
                showText("Self", "The drawer has a 4-digit combination lock. I need the correct code.");
            } else {
                showText("Self", "The drawer is unlocked. Just some old socks and a spare key inside.");
            }
            break;

        case 'wardrobe':
            if (!gameState.wardrobeOpen) {
                gameState.wardrobeOpen = true;
                document.getElementById('wardrobe-open').classList.remove('hidden');
                showText("Self", "I flung the closet doors open! Sadly, Narnia is closed for renovations, but there's a suspicious-looking lockbox here instead.");
            } else {
                showText("Self", "Still no magical winter wonderland in here. Just my boring clothes and that stubborn lockbox.");
            }
            break;


        case 'oven':
            showText("Self", "It's cold. Hasn't been used in a while.");
            break;

        case 'kitchen_middle':
            showText("Self", "Just the middle of the kitchen.");
            break;

        case 'tv_drawers':
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
            break;

        case 'hallway_table':
            if (!gameState.hallwayTableOpen) {
                gameState.hallwayTableOpen = true;
                if (!gameState.hallwayTableOpenedOnce) {
                    gameState.hallwayTableOpenedOnce = true;
                    showText("Self", `I pulled open the hallway table drawer. There is a sticky note inside: "And the final digit is ${targetCode[3]}! Hope you can open it."`);
                }
            } else {
                gameState.hallwayTableOpen = false;
            }
            updateEntranceImages();
            break;

        case 'keys':
            if (!gameState.inventory.includes("key number 1")) {
                addItem("key number 1");
                showText("Self", "I took key number 1 from the table.");
                const hotspot = document.getElementById('keys-hotspot');
                if (hotspot) hotspot.remove();
                updateEntranceImages();
            } else {
                showText("Self", "I already have key number 1.");
            }
            break;

        case 'glass_cabinet':
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
            break;

        case 'island_drawers':
            if (!gameState.kitchenDrawerOpen) {
                gameState.kitchenDrawerOpen = true;
                document.getElementById('island-drawer-open').classList.remove('hidden');
                if (!gameState.kitchenDrawerOpenedOnce) {
                    gameState.kitchenDrawerOpenedOnce = true;
                    showText("Self", `I opened the kitchen cabinet. Inside, tucked next to some plates, is a note: "The second digit is ${targetCode[1]}."`);
                }
            } else {
                gameState.kitchenDrawerOpen = false;
                document.getElementById('island-drawer-open').classList.add('hidden');
            }
            break;

        case 'front_door':
            showText("Self", "The front door is locked tight. I need the key to get out.");
            break;
    }
}

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

function updateEntranceImages() {
    const drawerOpen = gameState.hallwayTableOpen;
    const keysTaken = gameState.inventory.includes("key number 1");
    
    const entranceScene = document.getElementById('scene-entrance');
    
    if (drawerOpen && keysTaken) {
        entranceScene.style.backgroundImage = "url('../pictures/Entrance%20door/close%20drawers%20keys%20taken.png')";
    } else if (drawerOpen && !keysTaken) {
        entranceScene.style.backgroundImage = "url('../pictures/Entrance%20door/Entrance%20door%20drawer%20open.png')";
    } else if (!drawerOpen && keysTaken) {
        entranceScene.style.backgroundImage = "url('../pictures/Entrance%20door/Keys%20taken.png')";
    } else {
        entranceScene.style.backgroundImage = "url('../pictures/Entrance%20door/Entrance%20door.png')";
    }
}

// Navigation function to change rooms
function navigateTo(sceneId) {
    // Hide the current scene
    const currentSceneEl = document.getElementById('scene-' + gameState.currentScene);
    if (currentSceneEl) {
        currentSceneEl.classList.remove('active');
    }

    // Show the new scene
    const newSceneEl = document.getElementById('scene-' + sceneId);
    if (newSceneEl) {
        newSceneEl.classList.add('active');
    }

    // Update the game state
    gameState.currentScene = sceneId;

    // Adjust ringtone volume to simulate a muffled sound from other rooms
    if (!gameState.phoneRingtone.paused) {
        if (sceneId === 'bedroom' || gameState.inventory.includes("My Phone")) {
            gameState.phoneRingtone.volume = 0.25; // Normal volume if in bedroom or carrying the phone
        } else {
            gameState.phoneRingtone.volume = 0.05; // Muffled/distant volume if phone is left in bedroom
        }
    }
}

// Dialogue Queue System
let dialogueQueue = [];

function showText(speaker, text, action = null) {
    dialogueQueue.push({ speaker, text, action });
    if (dialogueQueue.length === 1) {
        displayCurrentDialogue();
    }
}

function displayCurrentDialogue() {
    if (dialogueQueue.length === 0) return;
    const current = dialogueQueue[0];
    const container = document.getElementById('dialogue-container');
    const speakerEl = document.getElementById('dialogue-speaker');
    const textEl = document.getElementById('dialogue-text');
    if (container && speakerEl && textEl) {
        speakerEl.innerText = current.speaker;
        textEl.innerText = current.text;
        container.classList.remove('hidden');
        document.getElementById('game-container').classList.add('dialogue-active');
    }

    // Execute associated action if provided
    if (current.action && typeof current.action === 'function') {
        current.action();
    }
}

function advanceDialogue() {
    if (dialogueQueue.length > 0) {
        dialogueQueue.shift();
    }

    if (dialogueQueue.length > 0) {
        displayCurrentDialogue();
    } else {
        const container = document.getElementById('dialogue-container');
        if (container) {
            container.classList.add('hidden');
            document.getElementById('game-container').classList.remove('dialogue-active');
        }
    }
}

let introStarted = false;

// Add global click listener to advance dialogue anywhere on the screen
document.addEventListener('click', function (e) {
    const container = document.getElementById('dialogue-container');
    // If dialogue is active, advance it and prevent the click from doing anything else
    if (container && !container.classList.contains('hidden')) {
        advanceDialogue();
        if (introStarted) {
            e.stopPropagation();
            e.preventDefault();
        } else {
            introStarted = true;
        }
    }
}, true);

function addItem(itemName) {
    gameState.inventory.push(itemName);
    const slots = document.getElementById('inventory-slots');
    if (slots) {
        const itemEl = document.createElement('div');
        itemEl.className = 'inv-item';

        if (itemName === "My Phone") {
            const imgEl = document.createElement('img');
            imgEl.src = "../pictures/Phone/android.png";
            imgEl.alt = itemName;
            imgEl.style.width = "100%";
            imgEl.style.height = "100%";
            imgEl.style.objectFit = "contain";
            itemEl.appendChild(imgEl);
        } else {
            itemEl.innerText = itemName;
        }

        itemEl.onclick = (e) => showInventoryOptions(e, itemName);
        slots.appendChild(itemEl);
    }
}

function showInventoryOptions(e, itemName) {
    e.stopPropagation();
    let menu = document.getElementById('inventory-context-menu');
    if (!menu) {
        menu = document.createElement('div');
        menu.id = 'inventory-context-menu';
        menu.innerHTML = `
            <button id="ctx-btn-look" class="ctx-btn">Look</button>
            <button id="ctx-btn-use" class="ctx-btn">Use</button>
        `;
        document.getElementById('game-container').appendChild(menu);

        document.addEventListener('click', (ev) => {
            if (!menu.contains(ev.target)) {
                menu.classList.add('hidden');
            }
        });
    }

    const rect = e.target.closest('.inv-item').getBoundingClientRect();
    const containerRect = document.getElementById('game-container').getBoundingClientRect();

    menu.style.left = (rect.left - containerRect.left) + 'px';
    menu.style.bottom = '80px';
    menu.style.top = 'auto';
    menu.classList.remove('hidden');

    document.getElementById('ctx-btn-look').onclick = (ev) => {
        ev.stopPropagation();
        menu.classList.add('hidden');
        lookItem(itemName);
    };

    document.getElementById('ctx-btn-use').onclick = (ev) => {
        ev.stopPropagation();
        menu.classList.add('hidden');
        useItem(itemName);
    };
}

function lookItem(itemName) {
    if (itemName === "My Phone") {
        showText("Self", "It's my smartphone. The screen is a bit smudged.");
    } else if (itemName === "Small Key") {
        showText("Self", "A small, ordinary-looking key. It looks like it could fit a door.");
    } else {
        showText("Self", `I examined the ${itemName}.`);
    }
}

function useItem(itemName) {
    if (itemName === "My Phone") {
        if (gameState.isPhoneRinging) {
            document.getElementById('incoming-call-ui').classList.remove('hidden');
        } else {
            const now = new Date();
            const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            showText("Self", `I used the phone to check the time. It is ${timeString}.`);
        }
    } else if (itemName === "Small Key") {
        if (gameState.currentScene === 'entrance') {
            showText("System", "You unlocked the front door and escaped! You win!");
        } else {
            showText("Self", "I can't use this here. I need to find what it unlocks.");
        }
    } else {
        showText("Self", `I tried to use the ${itemName}, but nothing happened.`);
    }
}

function acceptCall() {
    document.getElementById('incoming-call-ui').classList.add('hidden');
    gameState.phoneRingtone.pause();
    gameState.phoneRingtone.currentTime = 0;
    gameState.isPhoneRinging = false;

    triggerPhoneDialogue();
}

function declineCall() {
    document.getElementById('incoming-call-ui').classList.add('hidden');
    gameState.phoneRingtone.pause();
    gameState.phoneRingtone.currentTime = 0;
    gameState.isPhoneRinging = false;
    gameState.callDeclinedCount++;

    if (gameState.callDeclinedCount > 3) {
        showText("Self", "Man, I am such a heavy sleeper, I could sleep through an earthquake. Let him call back.");
    } else {
        showText("Self", "Maybe I should answer him...");
    }

    setTimeout(() => {
        gameState.isPhoneRinging = true;
        gameState.phoneRingtone.play().catch(e => console.log(e));
    }, 10000);
}

function triggerPhoneDialogue() {
    if (gameState.callDeclinedCount <= 3) {
        showText("Spouse via Text", `Hey honey! I just landed. Btw, the first digit for your locked drawer is ${targetCode[0]}. I left the other digits around the house!`);
    } else {
        showText("Spouse via Text", `Wow, are you a bear hibernating? I landed. The first digit is ${targetCode[0]}. Find the rest in the other rooms!`);
    }
}

// Combination Lock UI Logic
let lockCode = [0, 0, 0, 0];
let targetCode = [0, 0, 0, 0]; // This is populated in window.onload

function changeDigit(index, delta) {
    lockCode[index] += delta;
    if (lockCode[index] > 9) lockCode[index] = 0;
    if (lockCode[index] < 0) lockCode[index] = 9;
    document.getElementById(`digit-${index}`).innerText = lockCode[index];
}

function checkLock() {
    let correct = true;
    for (let i = 0; i < 4; i++) {
        if (lockCode[i] !== targetCode[i]) {
            correct = false;
            break;
        }
    }

    if (correct) {
        gameState.dresserUnlocked = true;
        closeLock();
        document.getElementById('drawer-open').classList.remove('hidden');
        showText("System", "*Click* The lock opens.");
        showText("Self", "It opened! Let's see what's inside... ah, a key!");
        if (!gameState.inventory.includes("Small Key")) {
            addItem("Small Key");
        }
    } else {
        showText("System", "The lock doesn't budge. Incorrect code.");
    }
}

function closeLock() {
    document.getElementById('combination-lock-ui').classList.add('hidden');
}