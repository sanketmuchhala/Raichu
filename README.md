# Raichu - Pokemon Chess Game

A web-based strategic board game inspired by Pokemon, featuring an AI opponent powered by minimax algorithm with alpha-beta pruning.

## Live Demo

[Play Raichu Now!](#) (Link will be added after deployment)

## Game Description

Raichu is a chess-like strategy game played on an 8x8 board with Pokemon-inspired pieces. The game features three types of pieces with unique movement patterns:

### Pieces

- **Pichu (w/b)**: Basic piece that moves diagonally forward, similar to a chess pawn
- **Pikachu (W/B)**: Intermediate piece that can move 1-2 squares in any direction
- **Raichu (@/$)**: Advanced piece that can move any distance in any direction, like a chess queen

### Rules

1. **Movement**:
   - Pichu moves diagonally forward one square
   - Pikachu moves 1-2 squares in any direction (horizontal, vertical, diagonal)
   - Raichu moves any number of squares in any direction

2. **Captures**:
   - Pieces can jump over opponent pieces to capture them
   - Pichu captures by jumping diagonally over an adjacent opponent piece
   - Pikachu and Raichu can jump over opponent pieces in their movement paths

3. **Promotion**:
   - When a Pichu reaches the opposite end of the board, it promotes to Raichu

4. **Win Condition**:
   - Capture all opponent pieces or leave them with no valid moves

## Features

- Beautiful Pokemon-themed UI with gradient backgrounds and animations
- Interactive drag-and-select gameplay
- Visual highlighting of possible moves
- AI opponent using minimax with alpha-beta pruning
- Move history with undo functionality
- Responsive design for mobile and desktop
- Real-time game status updates

## Technology Stack

### Frontend
- HTML5
- CSS3 (with animations and gradients)
- Vanilla JavaScript

### Backend
- Python 3.x
- Vercel Serverless Functions

### AI Algorithm
- Minimax algorithm with alpha-beta pruning
- Iterative deepening for optimal time management
- Evaluation function based on piece values

## Project Structure

```
raichu-web-game/
├── api/
│   └── bot-move.py          # Python serverless function for AI bot
├── index.html               # Main game interface
├── script.js                # Game logic and frontend code
├── style.css                # Styling and animations
├── vercel.json              # Vercel deployment configuration
├── package.json             # Project metadata
├── requirements.txt         # Python dependencies
└── README.md                # This file
```

## Local Development

### Prerequisites
- Node.js (v14 or higher)
- Python 3.x
- Vercel CLI

### Setup Instructions

1. Clone the repository:
```bash
git clone <repository-url>
cd raichu-web-game
```

2. Install Vercel CLI:
```bash
npm install -g vercel
```

3. Install project dependencies:
```bash
npm install
```

4. Run development server:
```bash
vercel dev
```

5. Open your browser and navigate to:
```
http://localhost:3000
```

## Deployment to Vercel

### One-Click Deployment

1. Install Vercel CLI (if not already installed):
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy the project:
```bash
vercel --prod
```

4. Follow the prompts to complete deployment

### Manual Deployment via Vercel Dashboard

1. Create a new project on [Vercel Dashboard](https://vercel.com/dashboard)
2. Connect your Git repository or upload the project files
3. Vercel will automatically detect the configuration from `vercel.json`
4. Click "Deploy"

## How to Play

1. **Start Game**: The game begins with white pieces at the top and black pieces at the bottom
2. **Select Piece**: Click on one of your pieces (white pieces for human player)
3. **View Moves**: Possible moves will be highlighted in purple
4. **Make Move**: Click on a highlighted square to move your piece
5. **Bot Turn**: The AI will automatically make its move after you
6. **Undo**: Use the "Undo" button to take back your last move
7. **New Game**: Click "New Game" to restart

## AI Bot Details

The AI opponent uses several advanced techniques:

- **Minimax Algorithm**: Explores the game tree to find optimal moves
- **Alpha-Beta Pruning**: Reduces search space by eliminating unpromising branches
- **Iterative Deepening**: Gradually increases search depth within time constraints
- **Evaluation Function**: Assigns values to pieces (Pichu=1, Pikachu=3, Raichu=6)
- **Time Management**: Optimized to respond within reasonable time limits

## Game Strategy Tips

1. **Protect your Pichus**: They can become powerful Raichus if they reach the opposite end
2. **Control the center**: Like chess, controlling the center provides more mobility
3. **Create opportunities**: Position pieces to enable multiple capture options
4. **Think ahead**: The AI looks several moves ahead, so plan your strategy
5. **Use Raichus wisely**: They're your most powerful pieces but also valuable targets

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers (iOS Safari, Chrome Mobile)

## Credits

- Original Raichu bot algorithm: [Elem-AI-FA-22 Repository](https://github.com/sanketmuchhala/Elem-AI-FA-22)
- Pokemon inspiration: Nintendo/Game Freak
- AI implementation: Minimax with Alpha-Beta Pruning

## License

MIT License - feel free to use and modify for your own projects!

## Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation

## Support

If you encounter any issues or have questions:
1. Check the browser console for error messages
2. Ensure you have a stable internet connection
3. Try refreshing the page
4. Clear your browser cache

## Future Enhancements

- [ ] Multiplayer mode (human vs human)
- [ ] Different difficulty levels for AI
- [ ] Game replay feature
- [ ] Move notation and game history
- [ ] Sound effects and music
- [ ] Tournament mode
- [ ] Custom board themes
- [ ] Save/load game state

---

Built with Pokemon spirit! ⚡

Powered by Minimax with Alpha-Beta Pruning
