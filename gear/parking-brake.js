import { html } from 'htm/preact';
import { useState, useEffect } from 'preact/hooks';
import { forMsfs } from '../js/msfs-lib.js';

export function ParkingBrakePanel() {
    const [parkingBrake, setParkingBrake] = useState(false);

    useEffect(() => {
        forMsfs((msfsApi, planeName) => {
            msfsApi.onVariablesChanged(['BRAKE PARKING INDICATOR'], (data) => {
                // here the response will be array of objects with just one element
                // so we need to get the value from the first element
                const value = data[0].Value;
                setParkingBrake(value === 1);
                //console.log('ws response for BRAKE PARKING INDICATOR:', data);
            });
        });
    }, []);

    const handleBrakeClick = () => {
        const newState = !parkingBrake;
        setParkingBrake(newState);
        forMsfs((msfsApi, planeName) => {
            msfsApi.makeApiCall('event/send', {
                name: 'PARKING_BRAKES'
            });
        });
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

