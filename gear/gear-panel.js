import { html } from 'htm/preact';
import { useState, useEffect } from 'preact/hooks';
import { forMsfs } from '../js/msfs-lib.js';

export function GearPanel() {
    const [gearNose, setGearNose] = useState(0);
    const [gearLeft, setGearLeft] = useState(0);
    const [gearRight, setGearRight] = useState(0);
    const [leverPosition, setLeverPosition] = useState('down'); // 'up' or 'down'

    useEffect(() => {
        forMsfs((msfsApi, planeName) => {
            // Subscribe to all three gear position variables
            // GEAR CENTER POSITION = nose gear (0-1, where 1 is fully extended)
            // GEAR LEFT POSITION = left gear (0-1, where 1 is fully extended)
            // GEAR RIGHT POSITION = right gear (0-1, where 1 is fully extended)
            msfsApi.onVariablesChanged([
                'GEAR CENTER POSITION',
                'GEAR LEFT POSITION',
                'GEAR RIGHT POSITION'
            ], (data) => {
                // data will be array with three elements
                setGearNose(data[0].Value);
                setGearLeft(data[1].Value);
                setGearRight(data[2].Value);
                
                // Update lever position based on actual gear state
                // If any gear is mostly up (< 0.05), show lever up
                // If all gears are mostly down (> 0.95), show lever down
                const allUp = data[0].Value < 0.05 && data[1].Value < 0.05 && data[2].Value < 0.05;
                const allDown = data[0].Value > 0.95 && data[1].Value > 0.95 && data[2].Value > 0.95;
                
                if (allUp) {
                    setLeverPosition('up');
                } else if (allDown) {
                    setLeverPosition('down');
                }
                
                //console.log('Gear positions - Nose:', data[0].Value, 'Left:', data[1].Value, 'Right:', data[2].Value);
            });
        });
    }, []);

    const getGearStatus = (position) => {
        if (position > 0.95) return 'down';
        if (position < 0.05) return 'up';
        return 'transit';
    };

    const handleLeverClick = () => {
        const newPosition = leverPosition === 'down' ? 'up' : 'down';
        setLeverPosition(newPosition);
        
        forMsfs((msfsApi, planeName) => {
            // Send the appropriate gear event based on the desired position
            const eventName = newPosition === 'up' ? 'GEAR_UP' : 'GEAR_DOWN';
            msfsApi.makeApiCall('event/send', {
                name: eventName
            });
            //console.log('Sending gear event:', eventName);
        });
    };

    return html`
        <div class="panel gear-panel">
            <h2>Landing Gear</h2>
            <div class="panel-content">
                <div class="gear-content-wrapper">
                    <div class="gear-indicators-triangle">
                        <div class="gear-indicator nose">
                            <div class="gear-light ${getGearStatus(gearNose)}" />
                            <span class="gear-label">NOSE</span>
                        </div>
                        <div class="gear-indicator-row">
                            <div class="gear-indicator left">
                                <div class="gear-light ${getGearStatus(gearLeft)}" />
                                <span class="gear-label">LEFT</span>
                            </div>
                            <div class="gear-indicator right">
                                <div class="gear-light ${getGearStatus(gearRight)}" />
                                <span class="gear-label">RIGHT</span>
                            </div>
                        </div>
                    </div>
                    <div class="gear-lever-container" onClick=${handleLeverClick}>
                        <div class="gear-lever ${leverPosition}">
                            <div class="lever-base" />
                            <div class="lever-shaft" />
                            <div class="lever-handle" />
                        </div>
                        <div class="lever-labels">
                            <span class="lever-label up ${leverPosition === 'up' ? 'active' : ''}">UP</span>
                            <span class="lever-label down ${leverPosition === 'down' ? 'active' : ''}">DN</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

