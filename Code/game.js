// ==================== GLOBAL GAME STATE ====================
const gameState = {
    currentScene: 'bedroom',
    inventory: [],
    selectedItem: null,

    // Lock States & Drawer Tracking flags
    wardrobeOpen: false,
    kitchenDrawerOpen: false,
    hasDeadboltKey: false,
    hasKnife: false,
    locksRemaining: 3
};

// ==================== SCENE NAVIGATION ====================
function navigateTo(sceneId) {
    // Hide the previous active scene element
    document.querySelector('.scene.active').classList.remove('active');
    // Display targeted scene view container
    document.getElementById(`scene-${sceneId}`).classList.add('active');
    gameState.currentScene = sceneId;

    // Contextual atmospheric updates on transition
    if (sceneId === 'entrance') {
        showText("Self", `There it is. The front door. Locked with ${gameState.locksRemaining} separate locks. Classic over-preparedness.`);
    }
}

// ==================== INTERACTION ROUTER ====================
function interact(target) {
    switch (target) {
        // --- BEDROOM HOTSPOTS ---
        case 'alarm_clock':
            showText("Self", "19:23?! Wait, no, it's morning. The clock screen is flashing. My spouse must have changed the fuse lines again.");
            break;

        case 'wardrobe':
            if (!gameState.wardrobeOpen) {
                gameState.wardrobeOpen = true;
                document.getElementById('wardrobe-open').classList.remove('hidden');
                showText("Self", "I opened the wardrobe. Hidden beneath a pile of heavy winter coats is a sleek lockbox!");
            } else {
                showText("Self", "The lockbox inside needs a 4-digit code. Maybe there is a clue in the living room near the setup.");
            }
            break;

        case 'bedroom_dresser':
            showText("Self", "Just socks and skincare routines here. Nothing helpful for lock-picking.");
            break;

        // --- LIVING ROOM HOTSPOTS ---
        case 'glass_cabinet':
            showText("Self", "The glass display cabinet is locked shut. I can see a brass deadbolt key resting comfortably inside.");
            break;

        case 'tv_drawers':
            if (!gameState.inventory.includes('Spouse\'s Phone')) {
                addItem('Spouse\'s Phone');
                showText("Self", "Found my spouse's old work phone in the console drawer! It just received a text notification.");
                // Immediately queue automated dialogue display sequence
                triggerPhoneDialogue();
            } else {
                showText("Self", "Just a collection of old manuals, tangled HDMI cables, and dust.");
            }
            break;

        // --- KITCHEN HOTSPOTS ---
        case 'island_drawers':
            if (!gameState.kitchenDrawerOpen) {
                gameState.kitchenDrawerOpen = true;
                document.getElementById('island-drawer-open').classList.remove('hidden');
                addItem('Butter Knife');
                showText("Self", "Sliding open the heavy island drawer... Found a dull Butter Knife. Perfect utility tool for prying small hinges.");
            } else {
                showText("Self", "The remaining kitchen drawers are just cutting boards and spices.");
            }
            break;

        // --- ENTRANCE HOTSPOTS ---
        case 'front_door':
            handleDoorLockSystem();
            break;

        default:
            console.warn("Unhandled interaction target: " + target);
    }
}

// ==================== NARRATIVE SYSTEMS ====================
let dialogueQueue = [];
function showText(speaker, text) {
    const box = document.getElementById('dialogue-container');
    document.getElementById('dialogue-speaker').innerText = speaker;
    document.getElementById('dialogue-text').innerText = text;
    box.classList.remove('hidden');
}

function advanceDialogue() {
    if (dialogueQueue.length > 0) {
        const nextLine = dialogueQueue.shift();
        showText(nextLine.speaker, nextLine.text);
    } else {
        document.getElementById('dialogue-container').classList.add('hidden');
    }
}

function triggerPhoneDialogue() {
    dialogueQueue = [
        { speaker: "Spouse (Text Message)", text: "Hey! Left early for work. Locked up standard style so the dog doesn't push the lever." },
        { speaker: "Spouse (Text Message)", text: "Don't forget, to open the glass cabinet in the living room, you just need to pry the magnetic frame latch with something flat!" },
        { speaker: "Self", text: "A flat tool? I should check the kitchen drawers for something like a knife or spatula." }
    ];
    advanceDialogue();
}

// ==================== INVENTORY SYSTEMS ====================
function addItem(itemName) {
    if (!gameState.inventory.includes(itemName)) {
        gameState.inventory.push(itemName);
        updateInventoryUI();
    }
}

function updateInventoryUI() {
    const container = document.getElementById('inventory-slots');
    container.innerHTML = '';

    gameState.inventory.forEach(item => {
        const slot = document.createElement('div');
        slot.className = 'inv-item';
        if (gameState.selectedItem === item) slot.className += ' selected';
        slot.innerText = item;

        slot.addEventListener('click', (e) => {
            e.stopPropagation(); // Avoid triggering base clicks
            selectInventoryItem(item);
        });
        container.appendChild(slot);
    });
}

function selectInventoryItem(item) {
    if (gameState.selectedItem === item) {
        gameState.selectedItem = null; // Deselect if clicked again
    } else {
        gameState.selectedItem = item;
    }
    updateInventoryUI();
}

// ==================== PUZZLE LOGIC MECHANICS ====================
function handleDoorLockSystem() {
    if (gameState.locksRemaining === 0) {
        showText("Self", "All locks are undone! Freedom at last!");
        return;
    }

    // Item-specific puzzle checks
    if (gameState.selectedItem === 'Deadbolt Key') {
        gameState.locksRemaining--;
        // Remove item from inventory arrays
        gameState.inventory = gameState.inventory.filter(i => i !== 'Deadbolt Key');
        gameState.selectedItem = null;
        updateInventoryUI();
        showText("System", `Click! The heavy brass deadbolt unlatches smoothly. ${gameState.locksRemaining} locks remaining.`);
    } else {
        showText("Self", "It's locked securely. I need to systematically open each mechanism to clear the exit path.");
    }
}

// Initialize presentation initialization steps
window.onload = () => {
    showText("Self", "Ugh, my head... What time is it? The front door is calling my name, let's get moving.");
};