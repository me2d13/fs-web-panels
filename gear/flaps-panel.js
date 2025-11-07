import { html } from 'htm/preact';
import { useState, useEffect } from 'preact/hooks';

// Configurable flap positions (degrees) - can be customized per aircraft
const FLAP_POSITIONS = [0, 1, 5, 10, 15, 30, 40];

export function FlapsPanel() {
    const [flapsPosition, setFlapsPosition] = useState(0); // Current flaps position from simulator (0-1 normalized)
    const [flapsHandle, setFlapsHandle] = useState(0); // Handle index (0 = first position, etc.)

    useEffect(() => {
        // TODO: Subscribe to flaps data from flight simulator
        // Example: Subscribe to dataref/simvar for actual flaps position
    }, []);

    const handleLeverClick = (index) => {
        setFlapsHandle(index);
        // TODO: Send command to flight simulator to set flaps to this position
    };

    const getCurrentFlapDegrees = () => {
        const maxDegrees = FLAP_POSITIONS[FLAP_POSITIONS.length - 1];
        return Math.round(flapsPosition * maxDegrees);
    };

    return html`
        <div class="panel flaps-panel">
            <h2>Flaps</h2>
            <div class="panel-content">
                <div class="flaps-content-wrapper">
                    <!-- Indicator Section -->
                    <div class="flaps-indicator-section">
                        <div class="flaps-position-display">
                            <span class="flaps-current-value">${getCurrentFlapDegrees()}°</span>
                        </div>
                        <div class="flaps-positions-bar">
                            ${FLAP_POSITIONS.map((deg, index) => {
                                const currentDeg = getCurrentFlapDegrees();
                                const isActive = currentDeg >= deg && (index === FLAP_POSITIONS.length - 1 || currentDeg < FLAP_POSITIONS[index + 1]);
                                return html`
                                    <div class="position-marker ${isActive ? 'active' : ''}">
                                        <span class="position-label">${deg}</span>
                                    </div>
                                `;
                            })}
                        </div>
                    </div>
                    
                    <!-- Lever Section -->
                    <div class="flaps-lever-section">
                        <div class="flaps-lever-track">
                            ${FLAP_POSITIONS.map((deg, index) => html`
                                <div 
                                    class="flaps-lever-position ${flapsHandle === index ? 'selected' : ''}"
                                    onClick=${() => handleLeverClick(index)}
                                    data-index="${index}"
                                >
                                    <span class="lever-position-label">${deg}</span>
                                </div>
                            `)}
                            <div 
                                class="flaps-lever-handle" 
                                style="top: calc(1.5rem + ${(flapsHandle / (FLAP_POSITIONS.length - 1)) * 100}% - ${(flapsHandle / (FLAP_POSITIONS.length - 1)) * 3}rem); transform: translate(-50%, -50%);"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

