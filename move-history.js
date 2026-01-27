/**
 * Move History and Captured Pieces Utilities
 */

// Convert board index to algebraic notation (e.g., 0 -> 'a8', 63 -> 'h1')
function indexToAlgebraic(index) {
    const row = Math.floor(index / 8);
    const col = index % 8;
    const file = String.fromCharCode(97 + col); // 'a' to 'h'
    const rank = 8 - row; // 8 to 1 (flipped for display)
    return file + rank;
}

// Get piece symbol for notation
function getPieceSymbol(piece) {
    const symbols = {
        'w': '', 'b': '', // Pawns have no symbol
        'W': 'N', 'B': 'N', // Knight
        '@': 'Q', '$': 'Q'  // Queen (Raichu)
    };
    return symbols[piece] || '';
}

// Generate move notation (e.g., "e2-e4", "Nf3", "Qxd5")
function getMoveNotation(from, to, piece, captured) {
    const fromSquare = indexToAlgebraic(from);
    const toSquare = indexToAlgebraic(to);
    const pieceSymbol = getPieceSymbol(piece);
    const captureSymbol = captured ? 'x' : '-';

    // Simple notation: Pe2-e4 or Nf3 or Qxd5
    if (pieceSymbol) {
        return `${pieceSymbol}${captureSymbol}${toSquare}`;
    } else {
        // Pawn moves
        return `${fromSquare}${captureSymbol}${toSquare}`;
    }
}

// Update move history display
function updateMoveHistoryDisplay() {
    const historyList = document.getElementById('move-history-list');
    if (!historyList) return;

    if (gameState.moveHistoryNotation.length === 0) {
        historyList.innerHTML = '<div class="no-moves">No moves yet</div>';
        return;
    }

    let html = '';
    for (let i = 0; i < gameState.moveHistoryNotation.length; i += 2) {
        const moveNumber = Math.floor(i / 2) + 1;
        const whiteMove = gameState.moveHistoryNotation[i];
        const blackMove = gameState.moveHistoryNotation[i + 1] || '';

        html += `
            <div class="move-pair">
                <span class="move-number">${moveNumber}.</span>
                <span class="move-notation white-move">${whiteMove}</span>
                ${blackMove ? `<span class="move-notation black-move">${blackMove}</span>` : ''}
            </div>
        `;
    }

    historyList.innerHTML = html;
    // Auto-scroll to bottom
    historyList.scrollTop = historyList.scrollHeight;
}

// Update captured pieces display
function updateCapturedPiecesDisplay() {
    const whiteCaptured = document.getElementById('captured-white');
    const blackCaptured = document.getElementById('captured-black');

    if (!whiteCaptured || !blackCaptured) return;

    // Count pieces by type
    const countPieces = (pieces) => {
        const counts = {};
        pieces.forEach(p => {
            counts[p] = (counts[p] || 0) + 1;
        });
        return counts;
    };

    const whiteCounts = countPieces(gameState.capturedPieces.white);
    const blackCounts = countPieces(gameState.capturedPieces.black);

    // Render white captured pieces
    let whiteHTML = '';
    for (const [piece, count] of Object.entries(whiteCounts)) {
        if (typeof FEATURE_FLAGS !== 'undefined' && FEATURE_FLAGS.USE_SVG_PIECES) {
            whiteHTML += `<img src="assets/pieces/${PIECE_SVG[piece]}" class="captured-piece" alt="${piece}">`;
            if (count > 1) {
                whiteHTML += `<span class="captured-piece-count">×${count}</span>`;
            }
        } else {
            whiteHTML += `<span class="captured-piece">${PIECE_DISPLAY[piece]}</span>`;
            if (count > 1) {
                whiteHTML += `<span class="captured-piece-count">×${count}</span>`;
            }
        }
    }
    whiteCaptured.innerHTML = whiteHTML || '<span style="color: #86868b; font-size: 0.75em;">None</span>';

    // Render black captured pieces
    let blackHTML = '';
    for (const [piece, count] of Object.entries(blackCounts)) {
        if (typeof FEATURE_FLAGS !== 'undefined' && FEATURE_FLAGS.USE_SVG_PIECES) {
            blackHTML += `<img src="assets/pieces/${PIECE_SVG[piece]}" class="captured-piece" alt="${piece}">`;
            if (count > 1) {
                blackHTML += `<span class="captured-piece-count">×${count}</span>`;
            }
        } else {
            blackHTML += `<span class="captured-piece">${PIECE_DISPLAY[piece]}</span>`;
            if (count > 1) {
                blackHTML += `<span class="captured-piece-count">×${count}</span>`;
            }
        }
    }
    blackCaptured.innerHTML = blackHTML || '<span style="color: #86868b; font-size: 0.75em;">None</span>';
}

// Clear move history
function clearMoveHistory() {
    gameState.moveHistoryNotation = [];
    gameState.capturedPieces = { white: [], black: [] };
    updateMoveHistoryDisplay();
    updateCapturedPiecesDisplay();
}
