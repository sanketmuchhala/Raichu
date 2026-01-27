/**
 * Animation Layer for Raichu
 * Provides smooth, GPU-accelerated piece movement
 * 
 * @file animations.js
 * @requires script.js (gameState)
 */

// Animation configuration
const ANIMATION_CONFIG = {
    MOVE_DURATION: 250, // ms
    CAPTURE_DURATION: 200, // ms
    EASING: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)', // Chess.com-like easing
    SCALE_LIFT: 1.1,
    SHADOW_LIFT: '0 8px 16px rgba(0, 0, 0, 0.3)'
};

/**
 * Animate a piece moving from one square to another
 * Uses transform (GPU-accelerated) instead of layout changes
 * 
 * @param {number} fromIndex - Source cell index (0-63)
 * @param {number} toIndex - Destination cell index (0-63)
 * @param {string} piece - Piece character ('w', 'W', '@', etc.)
 * @param {Function} onComplete - Callback when animation finishes
 */
function animatePieceMove(fromIndex, toIndex, piece, onComplete) {
    const boardElement = document.getElementById('game-board');
    const fromCell = boardElement.querySelector(`[data-index="${fromIndex}"]`);
    const toCell = boardElement.querySelector(`[data-index="${toIndex}"]`);

    if (!fromCell || !toCell) {
        console.warn('Animation cells not found, skipping animation');
        onComplete();
        return;
    }

    // Get bounding boxes
    const fromRect = fromCell.getBoundingClientRect();
    const toRect = toCell.getBoundingClientRect();

    // Calculate translation
    const deltaX = toRect.left - fromRect.left;
    const deltaY = toRect.top - fromRect.top;

    // Create flying piece (clone of the piece element)
    const flyingPiece = createFlyingPiece(piece, fromRect);
    document.body.appendChild(flyingPiece);

    // Hide original piece during animation
    const originalPieceSpan = fromCell.querySelector('.piece');
    if (originalPieceSpan) {
        originalPieceSpan.style.opacity = '0';
    }

    // Force reflow to ensure initial state is rendered
    flyingPiece.offsetHeight;

    // Apply animation
    flyingPiece.style.transition = `transform ${ANIMATION_CONFIG.MOVE_DURATION}ms ${ANIMATION_CONFIG.EASING}`;
    flyingPiece.style.transform = `translate(${deltaX}px, ${deltaY}px)`;

    // Clean up after animation
    flyingPiece.addEventListener('transitionend', () => {
        flyingPiece.remove();
        if (originalPieceSpan) {
            originalPieceSpan.style.opacity = '1';
        }
        onComplete();
    });

    // Fallback timeout in case transitionend doesn't fire
    setTimeout(() => {
        if (flyingPiece.parentNode) {
            flyingPiece.remove();
            if (originalPieceSpan) {
                originalPieceSpan.style.opacity = '1';
            }
            onComplete();
        }
    }, ANIMATION_CONFIG.MOVE_DURATION + 50);
}

/**
 * Create a flying piece element for animation
 * @param {string} piece - Piece character
 * @param {DOMRect} rect - Starting position
 * @returns {HTMLElement}
 */
function createFlyingPiece(piece, rect) {
    const flyingPiece = document.createElement('div');
    flyingPiece.className = 'flying-piece';
    flyingPiece.style.position = 'fixed';
    flyingPiece.style.left = `${rect.left}px`;
    flyingPiece.style.top = `${rect.top}px`;
    flyingPiece.style.width = `${rect.width}px`;
    flyingPiece.style.height = `${rect.height}px`;
    flyingPiece.style.pointerEvents = 'none';
    flyingPiece.style.zIndex = '1000';
    flyingPiece.style.willChange = 'transform';

    // Add piece image/content
    if (FEATURE_FLAGS.USE_SVG_PIECES) {
        const img = document.createElement('img');
        img.src = `assets/pieces/${PIECE_SVG[piece]}`;
        img.style.width = '80%';
        img.style.height = '80%';
        img.style.objectFit = 'contain';
        img.style.margin = '10%';
        flyingPiece.appendChild(img);
    } else {
        // Fallback to Unicode
        const span = document.createElement('span');
        span.className = 'piece';
        span.textContent = PIECE_DISPLAY[piece];
        span.style.fontSize = `${rect.width * 0.6}px`;
        flyingPiece.appendChild(span);
    }

    return flyingPiece;
}

/**
 * Animate a piece being captured (fade out + scale down)
 * @param {number} capturedIndex - Index of captured piece
 * @param {Function} onComplete - Callback when animation finishes
 */
function animatePieceCapture(capturedIndex, onComplete) {
    const boardElement = document.getElementById('game-board');
    const capturedCell = boardElement.querySelector(`[data-index="${capturedIndex}"]`);

    if (!capturedCell) {
        onComplete();
        return;
    }

    const pieceSpan = capturedCell.querySelector('.piece');
    if (!pieceSpan) {
        onComplete();
        return;
    }

    // Animate out
    pieceSpan.style.transition = `opacity ${ANIMATION_CONFIG.CAPTURE_DURATION}ms ease-out, transform ${ANIMATION_CONFIG.CAPTURE_DURATION}ms ease-out`;
    pieceSpan.style.opacity = '0';
    pieceSpan.style.transform = 'scale(0.5)';

    setTimeout(onComplete, ANIMATION_CONFIG.CAPTURE_DURATION);
}

/**
 * Highlight the last move (origin and destination squares)
 * @param {number} fromIndex
 * @param {number} toIndex
 */
function highlightLastMove(fromIndex, toIndex) {
    // Remove previous highlights
    document.querySelectorAll('.last-move').forEach(el => {
        el.classList.remove('last-move');
    });

    // Add new highlights
    const boardElement = document.getElementById('game-board');
    const fromCell = boardElement.querySelector(`[data-index="${fromIndex}"]`);
    const toCell = boardElement.querySelector(`[data-index="${toIndex}"]`);

    if (fromCell) fromCell.classList.add('last-move');
    if (toCell) toCell.classList.add('last-move');
}

/**
 * Validate that visual state matches game state
 * @returns {boolean} True if in sync
 */
function validateBoardSync() {
    const visualPieces = document.querySelectorAll('.piece').length;
    const statePieces = gameState.board.filter(p => p !== '.').length;

    if (visualPieces !== statePieces) {
        console.error(`[DESYNC] Visual: ${visualPieces} pieces, State: ${statePieces} pieces`);
        return false;
    }

    return true;
}
