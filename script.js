// Game State
let gameState = {
    board: [],
    currentPlayer: 'w', // 'w' for white, 'b' for black
    selectedCell: null,
    possibleMoves: [],
    gameOver: false,
    moveHistory: [],
    N: 8,
    gameMode: 'bot', // 'bot', '2player', or 'online'
    difficulty: 2, // 1=Easy, 2=Medium, 3=Hard
    // Online multiplayer state
    online: {
        roomId: null,
        playerId: null,
        playerColor: null,
        polling: false,
        pollInterval: null
    }
};

// Piece mapping for display
const PIECE_DISPLAY = {
    'w': '♙', // White Pichu
    'W': '♘', // White Pikachu
    '@': '♕', // White Raichu
    'b': '♟', // Black Pichu
    'B': '♞', // Black Pikachu
    '$': '♛', // Black Raichu
    '.': ''
};

// Initialize game
function initGame() {
    // Standard Raichu starting position
    const initialBoard = [
        'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w',
        '.', '.', '.', '.', '.', '.', '.', '.',
        '.', '.', '.', '.', '.', '.', '.', '.',
        '.', '.', '.', '.', '.', '.', '.', '.',
        '.', '.', '.', '.', '.', '.', '.', '.',
        '.', '.', '.', '.', '.', '.', '.', '.',
        '.', '.', '.', '.', '.', '.', '.', '.',
        'b', 'b', 'b', 'b', 'b', 'b', 'b', 'b'
    ];

    gameState.board = [...initialBoard];
    gameState.currentPlayer = 'w';
    gameState.selectedCell = null;
    gameState.possibleMoves = [];
    gameState.gameOver = false;
    gameState.moveHistory = [];

    renderBoard();
    updateGameInfo();
}

// Render the game board
function renderBoard() {
    const boardElement = document.getElementById('game-board');
    boardElement.innerHTML = '';

    // Render rows in reverse order (7 to 0) so white pieces appear at bottom
    for (let row = gameState.N - 1; row >= 0; row--) {
        for (let col = 0; col < gameState.N; col++) {
            const index = row * gameState.N + col;
            const cell = document.createElement('div');
            cell.className = 'cell';
            // Adjust checkerboard pattern for flipped board
            const visualRow = gameState.N - 1 - row;
            cell.classList.add((visualRow + col) % 2 === 0 ? 'light' : 'dark');
            cell.dataset.index = index;

            const piece = gameState.board[index];
            if (piece !== '.') {
                // Use SVG pieces if feature flag is enabled
                if (typeof FEATURE_FLAGS !== 'undefined' && FEATURE_FLAGS.USE_SVG_PIECES) {
                    const pieceContainer = document.createElement('div');
                    pieceContainer.className = 'piece-container';

                    const img = document.createElement('img');
                    img.src = `assets/pieces/${PIECE_SVG[piece]}`;
                    img.className = 'piece piece-svg';
                    img.alt = piece;
                    img.draggable = false; // Prevent image drag

                    pieceContainer.appendChild(img);
                    cell.appendChild(pieceContainer);
                } else {
                    // Fallback to Unicode
                    const pieceSpan = document.createElement('span');
                    pieceSpan.className = 'piece';
                    pieceSpan.textContent = PIECE_DISPLAY[piece];
                    // Add class for color styling
                    if (isWhitePiece(piece)) {
                        pieceSpan.classList.add('piece-white');
                    } else {
                        pieceSpan.classList.add('piece-black');
                    }
                    cell.appendChild(pieceSpan);
                }

                // Enable drag and drop for player's pieces
                const canDrag = getPieceColor(piece) === gameState.currentPlayer && !gameState.gameOver;
                if (canDrag && (gameState.gameMode !== 'online' || gameState.online.playerColor === gameState.currentPlayer)) {
                    cell.setAttribute('draggable', 'true');
                    cell.addEventListener('dragstart', handleDragStart);
                }
            }

            // Make cell a drop target
            cell.addEventListener('dragover', handleDragOver);
            cell.addEventListener('drop', handleDrop);

            // Highlight selected cell
            if (gameState.selectedCell === index) {
                cell.classList.add('selected');
            }

            // Highlight possible moves
            if (gameState.possibleMoves.includes(index)) {
                cell.classList.add('possible-move');
            }

            cell.addEventListener('click', () => handleCellClick(index));
            boardElement.appendChild(cell);
        }
    }

    // Validate sync in dev mode
    if (typeof validateBoardSync !== 'undefined') {
        validateBoardSync();
    }
}

// Drag and Drop Handlers
let draggedPieceIndex = null;

function handleDragStart(e) {
    const index = parseInt(e.currentTarget.dataset.index);
    draggedPieceIndex = index;

    // Select the piece and show possible moves
    selectPiece(index);

    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index);

    // Add visual feedback
    e.currentTarget.style.opacity = '0.5';
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
}

function handleDrop(e) {
    e.preventDefault();
    const targetIndex = parseInt(e.currentTarget.dataset.index);

    if (draggedPieceIndex !== null && gameState.possibleMoves.includes(targetIndex)) {
        makeMove(draggedPieceIndex, targetIndex);
    }

    draggedPieceIndex = null;
    renderBoard();
}

// Handle cell click
function handleCellClick(index) {
    if (gameState.gameOver) {
        showMessage('Game is over! Click "New Game" to play again.');
        return;
    }

    const piece = gameState.board[index];

    // If clicking on possible move, make the move
    if (gameState.possibleMoves.includes(index)) {
        makeMove(gameState.selectedCell, index);
        return;
    }

    // If clicking on own piece, select it
    if (piece !== '.' && getPieceColor(piece) === gameState.currentPlayer) {
        selectPiece(index);
    } else {
        // Deselect if clicking elsewhere
        gameState.selectedCell = null;
        gameState.possibleMoves = [];
        renderBoard();
    }
}

// Select a piece and show possible moves
function selectPiece(index) {
    gameState.selectedCell = index;
    gameState.possibleMoves = getPossibleMoves(index);
    renderBoard();

    if (gameState.possibleMoves.length === 0) {
        showMessage('No valid moves for this piece!');
    } else {
        showMessage(`Selected piece. ${gameState.possibleMoves.length} possible moves.`);
    }
}

// Make a move
function makeMove(from, to) {
    // Save move to history
    gameState.moveHistory.push({
        board: [...gameState.board],
        player: gameState.currentPlayer
    });

    const piece = gameState.board[from];

    // Handle captures (check if jumping over opponent piece)
    const capturedPiece = detectCapture(from, to);

    // Check if animations are enabled
    const useAnimations = typeof FEATURE_FLAGS !== 'undefined' &&
        FEATURE_FLAGS.ENABLE_ANIMATIONS &&
        typeof animatePieceMove !== 'undefined';

    if (useAnimations) {
        // Animate the move, then update state
        animatePieceMove(from, to, piece, () => {
            // Complete the move after animation
            completeMoveLogic(from, to, piece, capturedPiece);
        });

        // Optionally animate capture
        if (capturedPiece !== null && typeof animatePieceCapture !== 'undefined') {
            animatePieceCapture(capturedPiece, () => { });
        }
    } else {
        // Instant move (legacy behavior)
        completeMoveLogic(from, to, piece, capturedPiece);
    }
}

// Complete move logic (separated for animation callback)
function completeMoveLogic(from, to, piece, capturedPiece) {
    // Apply capture
    if (capturedPiece !== null) {
        gameState.board[capturedPiece] = '.';
    }

    // Move the piece
    gameState.board[to] = piece;
    gameState.board[from] = '.';

    // Check for promotion
    handlePromotion(to);

    // Clear selection
    gameState.selectedCell = null;
    gameState.possibleMoves = [];

    // Highlight last move
    if (typeof highlightLastMove !== 'undefined') {
        highlightLastMove(from, to);
    }

    // Check win condition
    if (checkWinCondition()) {
        gameState.gameOver = true;
        const winner = gameState.currentPlayer === 'w' ? 'White' : 'Black';
        showMessage(`${winner} wins!`);
        renderBoard();
        showGameModal(winner === 'White' ? 'you' : 'bot');
        return;
    }

    // Switch player
    gameState.currentPlayer = gameState.currentPlayer === 'w' ? 'b' : 'w';

    renderBoard();
    updateGameInfo();

    // If it's now black's turn and in bot mode, trigger bot move
    // REMOVED 500ms artificial delay - bot thinks immediately
    if (gameState.currentPlayer === 'b' && gameState.gameMode === 'bot') {
        requestBotMove();
    }
}

// Detect if a capture occurred
function detectCapture(from, to) {
    const fromRow = Math.floor(from / gameState.N);
    const fromCol = from % gameState.N;
    const toRow = Math.floor(to / gameState.N);
    const toCol = to % gameState.N;

    const rowDiff = toRow - fromRow;
    const colDiff = toCol - fromCol;

    // Check if it's a jump (distance > 1)
    if (Math.abs(rowDiff) === 2 || Math.abs(colDiff) === 2) {
        const midRow = fromRow + Math.floor(rowDiff / 2);
        const midCol = fromCol + Math.floor(colDiff / 2);
        const midIndex = midRow * gameState.N + midCol;

        const midPiece = gameState.board[midIndex];
        if (midPiece !== '.' && getPieceColor(midPiece) !== getPieceColor(gameState.board[from])) {
            return midIndex;
        }
    }

    // For Raichu, check entire path
    const piece = gameState.board[from];
    if (piece === '@' || piece === '$') {
        const rowStep = rowDiff === 0 ? 0 : rowDiff / Math.abs(rowDiff);
        const colStep = colDiff === 0 ? 0 : colDiff / Math.abs(colDiff);

        let currentRow = fromRow + rowStep;
        let currentCol = fromCol + colStep;
        let capturedIndex = null;

        while (currentRow !== toRow || currentCol !== toCol) {
            const currentIndex = currentRow * gameState.N + currentCol;
            const currentPiece = gameState.board[currentIndex];

            if (currentPiece !== '.') {
                if (getPieceColor(currentPiece) !== getPieceColor(piece)) {
                    if (capturedIndex === null) {
                        capturedIndex = currentIndex;
                    } else {
                        return null; // Can't jump over multiple pieces
                    }
                } else {
                    return null; // Can't jump over own piece
                }
            }

            currentRow += rowStep;
            currentCol += colStep;
        }

        return capturedIndex;
    }

    return null;
}

// Handle piece promotion
function handlePromotion(index) {
    const row = Math.floor(index / gameState.N);
    const piece = gameState.board[index];

    // White Pichu reaches row 7 (last row)
    if (piece === 'w' && row === 7) {
        gameState.board[index] = '@';
        showMessage('White Pichu evolved into Raichu!');
    }

    // Black Pichu reaches row 0 (first row)
    if (piece === 'b' && row === 0) {
        gameState.board[index] = '$';
        showMessage('Black Pichu evolved into Raichu!');
    }
}

// Get possible moves for a piece
function getPossibleMoves(index) {
    const piece = gameState.board[index];
    const moves = [];

    if (piece === 'w' || piece === 'b') {
        // Pichu moves
        moves.push(...getPichuMoves(index, piece));
    } else if (piece === 'W' || piece === 'B') {
        // Pikachu moves
        moves.push(...getPikachuMoves(index, piece));
    } else if (piece === '@' || piece === '$') {
        // Raichu moves
        moves.push(...getRaichuMoves(index, piece));
    }

    return moves;
}

// Get Pichu moves (diagonal forward, with captures)
function getPichuMoves(index, piece) {
    const moves = [];
    const row = Math.floor(index / gameState.N);
    const col = index % gameState.N;
    const direction = piece === 'w' ? 1 : -1; // White moves down, black moves up
    const enemy = piece === 'w' ? 'b' : 'w';

    // Diagonal forward moves
    const diagonals = [
        { row: row + direction, col: col - 1 },
        { row: row + direction, col: col + 1 }
    ];

    for (const pos of diagonals) {
        if (isValidPosition(pos.row, pos.col)) {
            const targetIndex = pos.row * gameState.N + pos.col;
            const targetPiece = gameState.board[targetIndex];

            // Empty square - can move
            if (targetPiece === '.') {
                moves.push(targetIndex);
            }

            // Enemy piece - check for jump
            if (targetPiece !== '.' && getPieceColor(targetPiece) === enemy) {
                const jumpRow = pos.row + direction;
                const jumpCol = pos.col + (pos.col - col);

                if (isValidPosition(jumpRow, jumpCol)) {
                    const jumpIndex = jumpRow * gameState.N + jumpCol;
                    if (gameState.board[jumpIndex] === '.') {
                        moves.push(jumpIndex);
                    }
                }
            }
        }
    }

    return moves;
}

// Get Pikachu moves (1-2 squares in any cardinal/diagonal direction)
function getPikachuMoves(index, piece) {
    const moves = [];
    const row = Math.floor(index / gameState.N);
    const col = index % gameState.N;

    const directions = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1], [0, 1],
        [1, -1], [1, 0], [1, 1]
    ];

    for (const [dRow, dCol] of directions) {
        for (let distance = 1; distance <= 2; distance++) {
            const newRow = row + dRow * distance;
            const newCol = col + dCol * distance;

            if (!isValidPosition(newRow, newCol)) break;

            const targetIndex = newRow * gameState.N + newCol;
            const targetPiece = gameState.board[targetIndex];

            // Check intermediate square for distance 2
            if (distance === 2) {
                const midIndex = (row + dRow) * gameState.N + (col + dCol);
                const midPiece = gameState.board[midIndex];

                if (midPiece !== '.') {
                    if (getPieceColor(midPiece) !== getPieceColor(piece) && targetPiece === '.') {
                        // Jump over enemy
                        moves.push(targetIndex);
                    }
                    break;
                }
            }

            if (targetPiece === '.') {
                moves.push(targetIndex);
            } else if (getPieceColor(targetPiece) !== getPieceColor(piece)) {
                // Can't capture directly without jumping
                break;
            } else {
                // Own piece blocks
                break;
            }
        }
    }

    return moves;
}

// Get Raichu moves (any distance in any direction, like a queen)
function getRaichuMoves(index, piece) {
    const moves = [];
    const row = Math.floor(index / gameState.N);
    const col = index % gameState.N;

    const directions = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1], [0, 1],
        [1, -1], [1, 0], [1, 1]
    ];

    for (const [dRow, dCol] of directions) {
        let enemyFound = false;

        for (let distance = 1; distance < gameState.N; distance++) {
            const newRow = row + dRow * distance;
            const newCol = col + dCol * distance;

            if (!isValidPosition(newRow, newCol)) break;

            const targetIndex = newRow * gameState.N + newCol;
            const targetPiece = gameState.board[targetIndex];

            if (targetPiece === '.') {
                moves.push(targetIndex);
            } else if (getPieceColor(targetPiece) !== getPieceColor(piece)) {
                if (!enemyFound) {
                    enemyFound = true;
                    // Continue to see if we can jump over
                } else {
                    // Second enemy piece, can't jump
                    break;
                }
            } else {
                // Own piece blocks
                break;
            }
        }
    }

    return moves;
}

// Check if position is valid
function isValidPosition(row, col) {
    return row >= 0 && row < gameState.N && col >= 0 && col < gameState.N;
}

// Get piece color
function getPieceColor(piece) {
    return isWhitePiece(piece) ? 'w' : 'b';
}

// Check if piece is white
function isWhitePiece(piece) {
    return piece === 'w' || piece === 'W' || piece === '@';
}

// Check win condition
function checkWinCondition() {
    let whiteCount = 0;
    let blackCount = 0;

    for (const piece of gameState.board) {
        if (piece !== '.') {
            if (isWhitePiece(piece)) {
                whiteCount++;
            } else {
                blackCount++;
            }
        }
    }

    return whiteCount === 0 || blackCount === 0;
}

// Request bot move from API
async function requestBotMove() {
    if (gameState.gameOver) return;

    showLoading(true);
    showMessage('Bot is thinking...');

    try {
        // Set timelimit based on difficulty
        const timelimits = { 1: 3, 2: 10, 3: 20 };
        const timelimit = timelimits[gameState.difficulty] || 10;

        const response = await fetch('/api/bot-move', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                board: gameState.board.join(''),
                player: gameState.currentPlayer,
                timelimit: timelimit
            })
        });

        if (!response.ok) {
            throw new Error('Bot request failed');
        }

        const data = await response.json();

        if (data.board) {
            // Save to history
            gameState.moveHistory.push({
                board: [...gameState.board],
                player: gameState.currentPlayer
            });

            // Update board
            gameState.board = data.board.split('');

            // Check win condition
            if (checkWinCondition()) {
                gameState.gameOver = true;
                const winner = gameState.currentPlayer === 'w' ? 'White' : 'Black';
                showMessage(`${winner} wins!`);
                showLoading(false);
                renderBoard();
                updateGameInfo();
                showGameModal(winner === 'White' ? 'you' : 'bot');
                return;
            }

            // Switch player
            gameState.currentPlayer = gameState.currentPlayer === 'w' ? 'b' : 'w';

            showMessage('Bot made its move. Your turn!');
        } else if (data.error) {
            showMessage('Bot error: ' + data.error);
        }
    } catch (error) {
        console.error('Bot move error:', error);
        showMessage('Failed to get bot move. Try again or make a manual move.');
    } finally {
        showLoading(false);
        renderBoard();
        updateGameInfo();
    }
}

// Show/hide loading indicator
function showLoading(show) {
    const loading = document.getElementById('loading');
    if (show) {
        loading.classList.remove('hidden');
    } else {
        loading.classList.add('hidden');
    }
}

// Update game info display
function updateGameInfo() {
    if (gameState.gameOver) return;

    if (gameState.gameMode === 'bot') {
        if (gameState.currentPlayer === 'w') {
            showMessage('Your move');
        } else {
            showMessage('Bot is thinking...');
        }
    } else {
        // 2-player mode
        const player = gameState.currentPlayer === 'w' ? 'White' : 'Black';
        showMessage(`${player}'s turn`);
    }
}

// Show message
function showMessage(message) {
    const messageElement = document.getElementById('game-message');
    messageElement.textContent = message;
}

// Undo last move
function undoMove() {
    if (gameState.moveHistory.length === 0) {
        showMessage('No moves to undo!');
        return;
    }

    const lastState = gameState.moveHistory.pop();
    gameState.board = lastState.board;
    gameState.currentPlayer = lastState.player;
    gameState.gameOver = false;
    gameState.selectedCell = null;
    gameState.possibleMoves = [];

    renderBoard();
    updateGameInfo();
    showMessage('Move undone!');
}

// Event listeners
document.getElementById('new-game-btn').addEventListener('click', () => {
    if (confirm('Start a new game?')) {
        initGame();
        showMessage(gameState.gameMode === 'bot' ? 'New game started! Your move.' : 'New game started! White goes first.');
    }
});

document.getElementById('bot-move-btn').addEventListener('click', () => {
    if (gameState.gameMode === '2player') {
        showMessage('Bot move is only available in vs Bot mode!');
        return;
    }
    if (gameState.currentPlayer === 'b') {
        showMessage('Bot is already thinking...');
    } else {
        requestBotMove();
    }
});

document.getElementById('undo-btn').addEventListener('click', undoMove);

// Game mode selector
document.getElementById('mode-bot').addEventListener('click', () => {
    gameState.gameMode = 'bot';
    document.getElementById('mode-bot').classList.add('active');
    document.getElementById('mode-2player').classList.remove('active');
    document.getElementById('bot-move-btn').style.display = 'block';
    document.getElementById('difficulty-selector').classList.remove('hidden');
    initGame();
    showMessage('Bot mode selected. Your move!');
});

document.getElementById('mode-2player').addEventListener('click', () => {
    gameState.gameMode = '2player';
    document.getElementById('mode-2player').classList.add('active');
    document.getElementById('mode-bot').classList.remove('active');
    document.getElementById('bot-move-btn').style.display = 'none';
    document.getElementById('difficulty-selector').classList.add('hidden');
    initGame();
    showMessage('2-player mode selected. White goes first!');
});

// Rules toggle
document.getElementById('rules-toggle').addEventListener('click', () => {
    const rulesSection = document.querySelector('.rules-section');
    rulesSection.classList.toggle('collapsed');
});

// Dark mode toggle
document.getElementById('dark-mode-toggle').addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    document.getElementById('dark-mode-toggle').textContent = isDark ? 'Light' : 'Dark';
    // Save preference
    localStorage.setItem('darkMode', isDark);
});

// Mobile Sidebar Management
const sidebarState = {
    isOpen: false,
    touchStartX: 0,
    touchStartY: 0,
    touchEndX: 0,
    touchEndY: 0
};

function openSidebar() {
    const infoPanel = document.querySelector('.info-panel');
    const backdrop = document.getElementById('sidebar-backdrop');
    const hamburger = document.getElementById('hamburger-menu');

    infoPanel.classList.add('active');
    backdrop.classList.add('active');
    hamburger.classList.add('active');
    sidebarState.isOpen = true;

    // Prevent body scroll on mobile when sidebar is open
    document.body.style.overflow = 'hidden';
}

function closeSidebar() {
    const infoPanel = document.querySelector('.info-panel');
    const backdrop = document.getElementById('sidebar-backdrop');
    const hamburger = document.getElementById('hamburger-menu');

    infoPanel.classList.remove('active');
    backdrop.classList.remove('active');
    hamburger.classList.remove('active');
    sidebarState.isOpen = false;

    // Restore body scroll
    document.body.style.overflow = '';
}

function toggleSidebar() {
    if (sidebarState.isOpen) {
        closeSidebar();
    } else {
        openSidebar();
    }
}

// Handle swipe gestures
function handleTouchStart(e) {
    sidebarState.touchStartX = e.touches[0].clientX;
    sidebarState.touchStartY = e.touches[0].clientY;
}

function handleTouchMove(e) {
    sidebarState.touchEndX = e.touches[0].clientX;
    sidebarState.touchEndY = e.touches[0].clientY;
}

function handleTouchEnd() {
    const deltaX = sidebarState.touchEndX - sidebarState.touchStartX;
    const deltaY = Math.abs(sidebarState.touchEndY - sidebarState.touchStartY);
    const threshold = 50; // minimum swipe distance

    // Only detect horizontal swipes (ignore mostly vertical swipes)
    if (deltaY < threshold * 2) {
        // Swipe from left edge to open
        if (!sidebarState.isOpen && sidebarState.touchStartX < 50 && deltaX > threshold) {
            openSidebar();
        }
        // Swipe left to close
        else if (sidebarState.isOpen && deltaX < -threshold) {
            closeSidebar();
        }
    }
}

// Hamburger menu click handler
document.getElementById('hamburger-menu').addEventListener('click', toggleSidebar);

// Backdrop click handler (close sidebar when clicking outside)
document.getElementById('sidebar-backdrop').addEventListener('click', closeSidebar);

// Touch gesture listeners for swipe
document.addEventListener('touchstart', handleTouchStart, { passive: true });
document.addEventListener('touchmove', handleTouchMove, { passive: true });
document.addEventListener('touchend', handleTouchEnd);

// Auto-close sidebar on mobile when screen is resized to desktop
window.addEventListener('resize', () => {
    if (window.innerWidth > 1024 && sidebarState.isOpen) {
        closeSidebar();
    }
});

// Game Modal Functions
function showGameModal(winner) {
    const modal = document.getElementById('game-modal');
    const title = document.getElementById('modal-title');
    const message = document.getElementById('modal-message');

    if (winner === 'you') {
        title.textContent = 'Congratulations!';
        message.textContent = 'You won the game!';
    } else if (winner === 'bot') {
        title.textContent = 'Game Over';
        message.textContent = 'The bot won this time. Try again!';
    } else {
        title.textContent = 'Game Over';
        message.textContent = winner === 'White' ? 'White wins!' : 'Black wins!';
    }

    modal.classList.add('active');
}

function hideGameModal() {
    const modal = document.getElementById('game-modal');
    modal.classList.remove('active');
}

document.getElementById('modal-new-game').addEventListener('click', () => {
    hideGameModal();
    initGame();
    showMessage(gameState.gameMode === 'bot' ? 'New game started! Your move.' : 'New game started! White goes first.');
});

// Difficulty Selector
document.getElementById('diff-1').addEventListener('click', () => {
    gameState.difficulty = 1;
    document.querySelectorAll('.diff-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById('diff-1').classList.add('active');
});

document.getElementById('diff-2').addEventListener('click', () => {
    gameState.difficulty = 2;
    document.querySelectorAll('.diff-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById('diff-2').classList.add('active');
});

document.getElementById('diff-3').addEventListener('click', () => {
    gameState.difficulty = 3;
    document.querySelectorAll('.diff-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById('diff-3').classList.add('active');
});

// Online Multiplayer Functions
const MultiplayerAPI = {
    baseURL: '/api',

    async createRoom(playerName) {
        const response = await fetch(`${this.baseURL}/multiplayer-create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ playerName })
        });
        return await response.json();
    },

    async getRooms() {
        const response = await fetch(`${this.baseURL}/multiplayer-rooms`);
        return await response.json();
    },

    async joinRoom(roomId, playerName) {
        const response = await fetch(`${this.baseURL}/multiplayer-join`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ roomId, playerName })
        });
        return await response.json();
    },

    async getGameState(roomId, playerId) {
        const response = await fetch(`${this.baseURL}/multiplayer-state?roomId=${roomId}&playerId=${playerId}`);
        return await response.json();
    },

    async submitMove(roomId, playerId, board) {
        const response = await fetch(`${this.baseURL}/multiplayer-move`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ roomId, playerId, board })
        });
        return await response.json();
    }
};

function showOnlineMenu() {
    document.getElementById('online-menu').classList.remove('hidden');
    document.getElementById('difficulty-selector').classList.add('hidden');
    document.getElementById('game-status').classList.add('hidden');
    document.getElementById('new-game-btn').classList.add('hidden');
    document.getElementById('bot-move-btn').classList.add('hidden');
    document.getElementById('undo-btn').classList.add('hidden');
}

function hideOnlineMenu() {
    document.getElementById('online-menu').classList.add('hidden');
    document.getElementById('room-browser').classList.add('hidden');
    document.getElementById('waiting-room').classList.add('hidden');
}

function showGameControls() {
    document.getElementById('game-status').classList.remove('hidden');
    document.getElementById('new-game-btn').classList.remove('hidden');
    document.getElementById('undo-btn').classList.remove('hidden');
}

async function handleCreateRoom() {
    try {
        const playerName = prompt('Enter your name:') || 'Player 1';
        const result = await MultiplayerAPI.createRoom(playerName);

        if (result.success) {
            gameState.online.roomId = result.roomId;
            gameState.online.playerId = result.playerId;
            gameState.online.playerColor = 'w';

            document.getElementById('room-code-text').textContent = result.roomId;
            document.getElementById('online-menu').classList.add('hidden');
            document.getElementById('waiting-room').classList.remove('hidden');

            // Start polling for opponent
            startWaitingForOpponent();
        } else {
            alert('Failed to create room: ' + result.error);
        }
    } catch (error) {
        console.error('Error creating room:', error);
        alert('Failed to create room');
    }
}

async function handleBrowseRooms() {
    try {
        document.getElementById('online-menu').classList.add('hidden');
        document.getElementById('room-browser').classList.remove('hidden');
        await loadRoomList();
    } catch (error) {
        console.error('Error browsing rooms:', error);
        alert('Failed to load rooms');
    }
}

async function loadRoomList() {
    try {
        const roomList = document.getElementById('room-list');
        roomList.innerHTML = '<p class="loading-text">Loading rooms...</p>';

        const result = await MultiplayerAPI.getRooms();

        if (result.success && result.rooms.length > 0) {
            roomList.innerHTML = '';
            result.rooms.forEach(room => {
                const roomCard = createRoomCard(room);
                roomList.appendChild(roomCard);
            });
        } else {
            roomList.innerHTML = '<p class="loading-text">No rooms available</p>';
        }
    } catch (error) {
        console.error('Error loading rooms:', error);
        document.getElementById('room-list').innerHTML = '<p class="loading-text">Error loading rooms</p>';
    }
}

function createRoomCard(room) {
    const card = document.createElement('div');
    card.className = 'room-card';

    const header = document.createElement('div');
    header.className = 'room-card-header';

    const title = document.createElement('div');
    title.className = 'room-card-title';
    title.textContent = room.roomName;

    const status = document.createElement('span');
    status.className = `room-card-status ${room.status}`;
    status.textContent = room.status === 'waiting' ? 'Waiting' : 'In Progress';

    header.appendChild(title);
    header.appendChild(status);

    const info = document.createElement('div');
    info.className = 'room-card-info';
    info.textContent = `Room: ${room.roomId} • Players: ${room.playerCount}/2`;

    const joinBtn = document.createElement('button');
    joinBtn.className = 'room-card-join';
    joinBtn.textContent = room.canJoin ? 'Join Game' : 'Spectate';
    joinBtn.disabled = !room.canJoin;

    if (room.canJoin) {
        joinBtn.onclick = () => handleJoinRoom(room.roomId);
    }

    card.appendChild(header);
    card.appendChild(info);
    card.appendChild(joinBtn);

    return card;
}

async function handleJoinRoom(roomId) {
    try {
        const playerName = prompt('Enter your name:') || 'Player 2';
        console.log("Attempting to join room:", roomId); // Debug log

        const result = await MultiplayerAPI.joinRoom(roomId, playerName);
        console.log("Join Room Result:", result); // Debug log (CRITICAL)

        if (result.success) {
            gameState.online.roomId = result.room.roomId;
            gameState.online.playerId = result.playerId;
            gameState.online.playerColor = 'b';

            // Robust Board Handling: Handle String OR Array
            let boardData = result.room.board;
            if (typeof boardData === 'string') {
                gameState.board = boardData.split('');
            } else if (Array.isArray(boardData)) {
                gameState.board = boardData;
            } else {
                console.error("Invalid board format:", boardData);
                gameState.board = new Array(64).fill('.'); // Fallback to empty to prevent crash
            }

            gameState.currentPlayer = result.room.currentPlayer;

            document.getElementById('room-browser').classList.add('hidden');
            showGameControls();
            renderBoard();
            updateGameInfo();

            // Start polling
            startOnlineGamePolling();

            showMessage(gameState.online.playerColor === gameState.currentPlayer ? 'Your turn!' : "Opponent's turn");
        } else {
            console.error("Join failed with API error:", result.error);
            alert('Server Refused Join: ' + result.error);
        }
    } catch (error) {
        console.error('CRITICAL Error joining room:', error);
        alert('App Logic Error: ' + error.message);
    }
}

function startWaitingForOpponent() {
    gameState.online.pollInterval = setInterval(async () => {
        try {
            const result = await MultiplayerAPI.getGameState(
                gameState.online.roomId,
                gameState.online.playerId
            );

            if (result.success && result.room.status === 'playing') {
                // Opponent joined!
                clearInterval(gameState.online.pollInterval);
                document.getElementById('waiting-room').classList.add('hidden');
                showGameControls();

                gameState.board = result.room.board.split('');
                renderBoard();
                updateGameInfo();

                startOnlineGamePolling();
                showMessage('Opponent joined! Your turn.');
            }
        } catch (error) {
            console.error('Polling error:', error);
        }
    }, 2000);
}

function startOnlineGamePolling() {
    gameState.online.polling = true;

    gameState.online.pollInterval = setInterval(async () => {
        if (gameState.gameOver) {
            stopOnlineGamePolling();
            return;
        }

        try {
            const result = await MultiplayerAPI.getGameState(
                gameState.online.roomId,
                gameState.online.playerId
            );

            if (result.success) {
                let newBoardStr = '';
                let newBoardArr = [];

                // Robustly handle varying board formats from server
                const incomingBoard = result.room.board;
                if (Array.isArray(incomingBoard)) {
                    newBoardArr = incomingBoard;
                    newBoardStr = incomingBoard.join('');
                } else if (typeof incomingBoard === 'string') {
                    newBoardArr = incomingBoard.split('');
                    newBoardStr = incomingBoard;
                } else {
                    console.error("Invalid board format in poll:", incomingBoard);
                    return; // Skip update if format is bad
                }

                if (newBoardStr !== gameState.board.join('')) {
                    console.log("Board updated from polling");
                    gameState.board = newBoardArr;
                    gameState.currentPlayer = result.room.currentPlayer;
                    renderBoard();
                    updateGameInfo();

                    if (gameState.online.playerColor === gameState.currentPlayer) {
                        showMessage('Your turn!');
                    }
                }

                // Check for game over
                if (result.room.gameOver) {
                    gameState.gameOver = true;
                    const winner = result.room.winner === gameState.online.playerColor ? 'you' : 'opponent';
                    showGameModal(winner);
                }
            }
        } catch (error) {
            console.error('Polling error:', error);
        }
    }, 1500);
}

function stopOnlineGamePolling() {
    if (gameState.online.pollInterval) {
        clearInterval(gameState.online.pollInterval);
        gameState.online.pollInterval = null;
    }
    gameState.online.polling = false;
}

// Override makeMove for online mode
const originalMakeMove = makeMove;
makeMove = function (from, to) {
    if (gameState.gameMode === 'online') {
        // Check if it's player's turn
        if (gameState.online.playerColor !== gameState.currentPlayer) {
            showMessage("Not your turn!");
            return;
        }

        // Make move locally first
        originalMakeMove(from, to);

        // Send move to server
        MultiplayerAPI.submitMove(
            gameState.online.roomId,
            gameState.online.playerId,
            gameState.board.join('')
        ).catch(error => {
            console.error('Error submitting move:', error);
            showMessage('Failed to submit move');
        });
    } else {
        originalMakeMove(from, to);
    }
};

// Event Listeners for Online Mode
document.getElementById('mode-online').addEventListener('click', () => {
    gameState.gameMode = 'online';
    document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById('mode-online').classList.add('active');
    showOnlineMenu();
    showMessage('Select an option to play online');
});

document.getElementById('create-room-btn').addEventListener('click', handleCreateRoom);
document.getElementById('browse-rooms-btn').addEventListener('click', handleBrowseRooms);
document.getElementById('refresh-rooms-btn').addEventListener('click', loadRoomList);

document.getElementById('back-from-browser-btn').addEventListener('click', () => {
    document.getElementById('room-browser').classList.add('hidden');
    document.getElementById('online-menu').classList.remove('hidden');
});

document.getElementById('cancel-room-btn').addEventListener('click', () => {
    stopOnlineGamePolling();
    document.getElementById('waiting-room').classList.add('hidden');
    document.getElementById('online-menu').classList.remove('hidden');
    gameState.online = {
        roomId: null,
        playerId: null,
        playerColor: null,
        polling: false,
        pollInterval: null
    };
});

document.getElementById('copy-code-btn').addEventListener('click', () => {
    const code = document.getElementById('room-code-text').textContent;
    navigator.clipboard.writeText(code).then(() => {
        const btn = document.getElementById('copy-code-btn');
        const originalText = btn.textContent;
        btn.textContent = 'Copied!';
        setTimeout(() => {
            btn.textContent = originalText;
        }, 2000);
    });
});

// Initialize game on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

function initializeApp() {
    // Load dark mode preference (default is light mode)
    const darkMode = localStorage.getItem('darkMode') === 'true';
    if (darkMode) {
        document.body.classList.add('dark-mode');
        document.getElementById('dark-mode-toggle').textContent = 'Light';
    } else {
        // Explicitly set light mode text
        document.getElementById('dark-mode-toggle').textContent = 'Dark';
    }

    initGame();
    showMessage('Welcome to Raichu! Click a white piece to start.');
}
