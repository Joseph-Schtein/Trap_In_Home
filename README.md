# Trap In Home 🏠

**Created by:** Joseph Schtein & Rina Oksman

🎮 **[Play the game](https://joseph-schtein.github.io/Trap_In_Home/)**

---

## About the Game

**Trap In Home** is a point-and-click narrative escape room game set inside a home. You wake up late, your spouse has already left for their flight, and the front door is locked. You have until **8:45 AM** to find the keys, solve the combination lock, collect clues scattered around the house, and escape in time for your work meeting.

Every room holds a piece of the puzzle — explore the bedroom, living room, kitchen, and entrance hall to uncover the code, unlock the drawer, and find your way out.

---

## How to Play

1. Click anywhere to wake up and start the game
2. Answer your spouse's phone call to get the first clue
3. Search each room for digit clues hidden in drawers, cabinets, and furniture
4. Use the 4-digit combination lock in the bedroom to retrieve the door key
5. Find the kitchen cabinet keys, unlock the cabinets, and collect all clues
6. Pick up and read the paper in the living room once all digits are found
7. Use the door key at the entrance to escape — before time runs out!

---

## Rooms & Interactions

| Room | Key Interactions |
|------|-----------------|
| 🛏️ Bedroom | Phone call, wardrobe, combination lock drawer |
| 🛋️ Living Room | Glass cabinet, TV drawers, paper pile |
| 🍳 Kitchen | Fruit bowl (cabinet keys), upper & lower cabinets |
| 🚪 Entrance | Hallway table drawer, front door |

---

## Technologies Used

- **HTML5** — Game structure and UI layout
- **CSS3** — Styling, animations, responsive 16:9 game container, overlay sprites
- **JavaScript** — Game engine, state management, dialogue system, inventory, sound, navigation
- **GitHub Pages** — Free static hosting for the live game
- **Google Gemini** — AI-generated images for all game scenes and assets

---

## Project Structure

```
Trap_In_Home/
├── Code/
│   ├── index.html        # Main game HTML
│   ├── style.css         # All styles
│   ├── game-core.js      # Shared engine (state, dialogue, inventory, audio)
│   ├── bedroom.js        # Bedroom interactions
│   ├── livingroom.js     # Living room interactions
│   ├── kitchen.js        # Kitchen interactions
│   └── entrance.js       # Entrance interactions
├── pictures/             # Scene backgrounds and overlay images
├── Sound/                # All audio files
└── .github/
    └── workflows/
        └── deploy.yml    # GitHub Pages deployment workflow
```
