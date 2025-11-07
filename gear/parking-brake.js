import { html } from 'htm/preact';
import { useState, useEffect } from 'preact/hooks';

export function ParkingBrakePanel() {
    const [parkingBrake, setParkingBrake] = useState(false);

    useEffect(() => {
        // TODO: Subscribe to parking brake data from flight simulator
        // Example: Subscribe to dataref/simvar for parking brake status
    }, []);

    const handleBrakeClick = () => {
        const newState = !parkingBrake;
        setParkingBrake(newState);
        // TODO: Send command to flight simulator to toggle parking brake
    };

    return html`
        <div class="panel parking-brake-panel">
            <h2>Parking Brake</h2>
            <div class="panel-content">
                <div class="brake-indicator ${parkingBrake ? 'active' : ''}" onClick=${handleBrakeClick}>
                    <span class="brake-status-text">${parkingBrake ? 'SET' : 'OFF'}</span>
                </div>
            </div>
        </div>
    `;
}

