// Game State
let gameState = {
    board: [],
    currentPlayer: 'w', // 'w' for white, 'b' for black
    selectedCell: null,
    possibleMoves: [],
    gameOver: false,
    moveHistory: [],
    N: 8,
    gameMode: 'bot' // 'bot' or '2player'
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
                const pieceSpan = document.createElement('span');
                pieceSpan.className = 'piece';
                pieceSpan.textContent = PIECE_DISPLAY[piece];
                const color = isWhitePiece(piece) ? '#2c3e50' : '#e74c3c';
                // Set color for Safari compatibility
                pieceSpan.style.color = color;
                pieceSpan.style.webkitTextFillColor = color;
                cell.appendChild(pieceSpan);
            }

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

    // Check win condition
    if (checkWinCondition()) {
        gameState.gameOver = true;
        showMessage(`🎉 ${gameState.currentPlayer === 'w' ? 'White' : 'Black'} wins!`);
        renderBoard();
        return;
    }

    // Switch player
    gameState.currentPlayer = gameState.currentPlayer === 'w' ? 'b' : 'w';

    renderBoard();
    updateGameInfo();

    // If it's now black's turn and in bot mode, trigger bot move
    if (gameState.currentPlayer === 'b' && gameState.gameMode === 'bot') {
        setTimeout(() => requestBotMove(), 500);
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
        [0, -1],           [0, 1],
        [1, -1],  [1, 0],  [1, 1]
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
        [0, -1],           [0, 1],
        [1, -1],  [1, 0],  [1, 1]
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
        const response = await fetch('/api/bot-move', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                board: gameState.board.join(''),
                player: gameState.currentPlayer,
                timelimit: 10
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
                showMessage(`🎉 ${gameState.currentPlayer === 'w' ? 'White' : 'Black'} wins!`);
                showLoading(false);
                renderBoard();
                updateGameInfo();
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
    initGame();
    showMessage('Bot mode selected. Your move!');
});

document.getElementById('mode-2player').addEventListener('click', () => {
    gameState.gameMode = '2player';
    document.getElementById('mode-2player').classList.add('active');
    document.getElementById('mode-bot').classList.remove('active');
    document.getElementById('bot-move-btn').style.display = 'none';
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

// Initialize game on load
window.addEventListener('DOMContentLoaded', () => {
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
});
