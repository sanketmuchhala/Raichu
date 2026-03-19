/**
 * Feature Flags for Raichu
 * Allows safe rollback of new features
 * 
 * @file feature-flags.js
 */

const FEATURE_FLAGS = {
    // Use SVG pieces instead of Unicode characters
    USE_SVG_PIECES: localStorage.getItem('feature_svg_pieces') !== 'false', // Default ON

    // Enable smooth animations for piece movement
    ENABLE_ANIMATIONS: localStorage.getItem('feature_animations') !== 'false', // Default ON

    // Use incremental rendering instead of full board rebuild
    INCREMENTAL_RENDER: localStorage.getItem('feature_incremental_render') === 'true' // Default OFF (testing)
};

// SVG piece mapping
const PIECE_SVG = {
    'w': 'piece-white-pichu.svg',
    'W': 'piece-white-pikachu.svg',
    '@': 'piece-white-raichu.svg',
    'b': 'piece-black-pichu.svg',
    'B': 'piece-black-pikachu.svg',
    '$': 'piece-black-raichu.svg'
};

/**
 * Toggle a feature flag
 * @param {string} flagName - Name of the flag
 * @param {boolean} value - New value
 */
function setFeatureFlag(flagName, value) {
    const storageKey = `feature_${flagName.toLowerCase().replace(/_/g, '_')}`;
    localStorage.setItem(storageKey, value.toString());
    FEATURE_FLAGS[flagName] = value;
    console.log(`Feature flag ${flagName} set to ${value}`);
}

/**
 * Get all feature flags (for debugging)
 */
function getFeatureFlags() {
    return { ...FEATURE_FLAGS };
}

// Expose to window for console debugging
if (typeof window !== 'undefined') {
    window.FEATURE_FLAGS = FEATURE_FLAGS;
    window.setFeatureFlag = setFeatureFlag;
    window.getFeatureFlags = getFeatureFlags;
}
