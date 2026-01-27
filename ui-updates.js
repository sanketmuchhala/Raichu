/**
 * UI Update Functions for Move History and Captured Pieces
 * @file ui-updates.js
 */

// Update Move History Display
function updateMoveHistoryDisplay() {
    const container = document.getElementById('move-history-container');
    if (!container) return;

    // Clear existing content
    container.innerHTML = '';

    if (gameState.moveHistoryNotation.length === 0) {
        container.innerHTML = '<div class="no-moves">No moves yet</div>';
        return;
    }

    // Display moves in pairs (white, black)
    gameState.moveHistoryNotation.forEach((movePair, index) => {
        const moveDiv = document.createElement('div');
        moveDiv.className = 'move-pair';

        const moveNumber = document.createElement('span');
        moveNumber.className = 'move-number';
        moveNumber.textContent = `${index + 1}.`;

        const whiteMove = document.createElement('span');
        whiteMove.className = 'white-move';
        whiteMove.textContent = movePair.white || '';
        whiteMove.title = 'Click to view position';

        const blackMove = document.createElement('span');
        blackMove.className = 'black-move';
        blackMove.textContent = movePair.black || '...';
        blackMove.title = 'Click to view position';

        moveDiv.appendChild(moveNumber);
        moveDiv.appendChild(whiteMove);
        moveDiv.appendChild(blackMove);
        container.appendChild(moveDiv);
    });

    // Auto-scroll to bottom
    container.scrollTop = container.scrollHeight;
}

// Update Captured Pieces Display
function updateCapturedPiecesDisplay() {
    const whiteContainer = document.getElementById('captured-white');
    const blackContainer = document.getElementById('captured-black');

    if (!whiteContainer || !blackContainer) return;

    // Clear existing
    whiteContainer.innerHTML = '';
    blackContainer.innerHTML = '';

    // Count captured pieces by type
    const whiteCaptured = {};
    const blackCaptured = {};

    gameState.capturedPieces.white.forEach(piece => {
        whiteCaptured[piece] = (whiteCaptured[piece] || 0) + 1;
    });

    gameState.capturedPieces.black.forEach(piece => {
        blackCaptured[piece] = (blackCaptured[piece] || 0) + 1;
    });

    // Display white's captured pieces (black pieces captured by white)
    Object.entries(whiteCaptured).forEach(([piece, count]) => {
        for (let i = 0; i < count; i++) {
            const img = document.createElement('img');
            if (FEATURE_FLAGS && FEATURE_FLAGS.USE_SVG_PIECES) {
                img.src = `assets/pieces/${PIECE_SVG[piece]}`;
            } else {
                // Fallback: use Unicode in a span
                const span = document.createElement('span');
                span.textContent = PIECE_DISPLAY[piece];
                span.className = 'captured-piece-unicode';
                whiteContainer.appendChild(span);
                continue;
            }
            img.className = 'captured-piece';
            img.alt = piece;
            whiteContainer.appendChild(img);
        }
    });

    // Display black's captured pieces (white pieces captured by black)
    Object.entries(blackCaptured).forEach(([piece, count]) => {
        for (let i = 0; i < count; i++) {
            const img = document.createElement('img');
            if (FEATURE_FLAGS && FEATURE_FLAGS.USE_SVG_PIECES) {
                img.src = `assets/pieces/${PIECE_SVG[piece]}`;
            } else {
                // Fallback: use Unicode in a span
                const span = document.createElement('span');
                span.textContent = PIECE_DISPLAY[piece];
                span.className = 'captured-piece-unicode';
                blackContainer.appendChild(span);
                continue;
            }
            img.className = 'captured-piece';
            img.alt = piece;
            blackContainer.appendChild(img);
        }
    });

    // Show empty state if no captures
    if (Object.keys(whiteCaptured).length === 0) {
        whiteContainer.innerHTML = '<span class="no-captures">-</span>';
    }
    if (Object.keys(blackCaptured).length === 0) {
        blackContainer.innerHTML = '<span class="no-captures">-</span>';
    }
}

// Add move to history
function addMoveToHistory(from, to, piece, capturedPiece) {
    const notation = getMoveNotation(from, to, piece, capturedPiece !== null);
    const currentPlayer = gameState.currentPlayer;

    if (currentPlayer === 'w') {
        // White's move - start new pair
        gameState.moveHistoryNotation.push({ white: notation, black: null });
    } else {
        // Black's move - complete the pair
        const lastPair = gameState.moveHistoryNotation[gameState.moveHistoryNotation.length - 1];
        if (lastPair) {
            lastPair.black = notation;
        } else {
            // Shouldn't happen, but handle it
            gameState.moveHistoryNotation.push({ white: null, black: notation });
        }
    }

    updateMoveHistoryDisplay();
}

// Add captured piece to tracker
function addCapturedPiece(piece) {
    const capturedBy = getPieceColor(piece) === 'w' ? 'black' : 'white';
    gameState.capturedPieces[capturedBy].push(piece);
    updateCapturedPiecesDisplay();
}
