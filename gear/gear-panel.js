import { html } from 'htm/preact';
import { useState, useEffect } from 'preact/hooks';

export function GearPanel() {
    const [gearNose, setGearNose] = useState(0);
    const [gearLeft, setGearLeft] = useState(0);
    const [gearRight, setGearRight] = useState(0);
    const [leverPosition, setLeverPosition] = useState('down'); // 'up' or 'down'

    useEffect(() => {
        // TODO: Subscribe to gear data from flight simulator
        // Example: Subscribe to datarefs/simvars for nose, left, and right gear positions
    }, []);

    const getGearStatus = (position) => {
        if (position > 0.95) return 'down';
        if (position < 0.05) return 'up';
        return 'transit';
    };

    const handleLeverClick = () => {
        const newPosition = leverPosition === 'down' ? 'up' : 'down';
        setLeverPosition(newPosition);
        // TODO: Send command to flight simulator to change gear position
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

