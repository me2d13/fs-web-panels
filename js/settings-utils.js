// Utility functions to access simulator and plane settings from localStorage

/**
 * Get the currently selected simulator
 * @returns {string|null} The selected simulator name (e.g., "X-Plane" or "MSFS")
 */
export function getSelectedSimulator() {
    return localStorage.getItem('selectedSimulator');
}

/**
 * Get the currently selected plane
 * @returns {string|null} The selected plane name (e.g., "Zibo 737", "GA", "737 MAX")
 */
export function getSelectedPlane() {
    return localStorage.getItem('selectedPlane');
}

/**
 * Get both simulator and plane as an object
 * @returns {object} Object with simulator and plane properties
 */
export function getSimulatorSettings() {
    return {
        simulator: getSelectedSimulator(),
        plane: getSelectedPlane()
    };
}

/**
 * Check if settings have been configured
 * @returns {boolean} True if both simulator and plane are set
 */
export function hasConfiguredSettings() {
    const simulator = getSelectedSimulator();
    const plane = getSelectedPlane();
    return simulator !== null && plane !== null;
}

/**
 * Get the menu display mode
 * @returns {string} The menu mode ('popup' or 'overlay')
 */
export function getMenuMode() {
    return localStorage.getItem('menuMode') || 'popup';
}

