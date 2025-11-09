import { html } from 'htm/preact';
import { useState, useEffect } from 'preact/hooks';
import { forMsfs } from '../js/msfs-lib.js';

// Configurable flap positions (degrees) - can be customized per aircraft
const FLAP_POSITIONS = [0, 1, 2, 5, 10, 15, 30, 40];

export function FlapsPanel() {
    const [flapsLeftAngle, setFlapsLeftAngle] = useState(0); // Left flaps angle in degrees
    const [flapsRightAngle, setFlapsRightAngle] = useState(0); // Right flaps angle in degrees
    const [flapsHandle, setFlapsHandle] = useState(0); // Handle index (0 = first position, etc.)

    useEffect(() => {
        forMsfs((msfsApi, planeName) => {
            // Subscribe to flaps variables
            // TRAILING EDGE FLAPS LEFT ANGLE = actual left flaps angle (radians)
            // TRAILING EDGE FLAPS RIGHT ANGLE = actual right flaps angle (radians)
            // FLAPS HANDLE INDEX = lever detent position (0, 1, 2, etc.)
            msfsApi.onVariablesChanged([
                'TRAILING EDGE FLAPS LEFT ANGLE',
                'TRAILING EDGE FLAPS RIGHT ANGLE',
                'FLAPS HANDLE INDEX'
            ], (data) => {
                // Convert radians to degrees
                const leftDegrees = data[0].Value * (180 / Math.PI);
                const rightDegrees = data[1].Value * (180 / Math.PI);
                
                setFlapsLeftAngle(leftDegrees);
                setFlapsRightAngle(rightDegrees);
                
                // FLAPS HANDLE INDEX gives us the detent position
                setFlapsHandle(data[2].Value);
                
                //console.log('Flaps - Left:', leftDegrees.toFixed(1), '° Right:', rightDegrees.toFixed(1), '° Handle:', data[2].Value);
            });
        });
    }, []);

    const handleLeverClick = (index) => {
        setFlapsHandle(index);
        
        forMsfs((msfsApi, planeName) => {
            // FLAPS_SET event takes a parameter from 0 to 16383
            // Map the index to this range based on total number of positions
            const maxValue = 16383;
            const flapValue = Math.round((index / (FLAP_POSITIONS.length - 1)) * maxValue);
            
            msfsApi.makeApiCall('event/send', {
                name: 'FLAPS_SET',
                value: flapValue
            });
            //console.log('Setting flaps to index:', index, 'value:', flapValue);
        });
    };

    const getCurrentFlapDegrees = () => {
        // Check if left and right flaps are the same (within 0.5 degree tolerance)
        const tolerance = 0.5;
        const difference = Math.abs(flapsLeftAngle - flapsRightAngle);
        
        if (difference > tolerance) {
            // Flaps don't match - failure indication
            return null;
        }
        
        // Return average of both sides, rounded to nearest degree
        const averageAngle = (flapsLeftAngle + flapsRightAngle) / 2;
        return Math.round(averageAngle);
    };

    return html`
        <div class="panel flaps-panel">
            <h2>Flaps</h2>
            <div class="panel-content">
                <div class="flaps-content-wrapper">
                    <!-- Indicator Section -->
                    <div class="flaps-indicator-section">
                        <div class="flaps-position-display">
                            <span class="flaps-current-value">${getCurrentFlapDegrees() !== null ? getCurrentFlapDegrees() + '°' : '--'}</span>
                        </div>
                        <div class="flaps-positions-bar">
                            ${FLAP_POSITIONS.map((deg, index) => {
                                const currentDeg = getCurrentFlapDegrees();
                                const isActive = currentDeg !== null && currentDeg >= deg && (index === FLAP_POSITIONS.length - 1 || currentDeg < FLAP_POSITIONS[index + 1]);
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

