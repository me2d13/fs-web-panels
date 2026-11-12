import { handleCommonCall } from '../js/msfs-lib.js';

const buttonHandlers = {
    // Confirmed by the user to match the iFly Pilot view.
    "Pilot": { viewIndexes: [2, 1, 1], resetView: true },
    // SimConnect while viewing the PMDG center console/autopilot panel.
    "MCP": { viewIndexes: [2, 2, 0] },
    // SimConnect while the PMDG FMC view was active: cockpit / instruments / index 2.
    "FMC": { viewIndexes: [2, 2, 2] },
    // SimConnect while the PMDG left-side Tablet view was active: cockpit / instruments / index 8.
    "Tablet": { viewIndexes: [2, 2, 8] },
    // User's upper-overhead view, mapped to the existing After overhead button.
    "After overhead": { viewIndexes: [2, 2, 6] },
    // SimConnect while the PMDG Overhead view was active: cockpit / instruments / index 5.
    "Overhead": { viewIndexes: [2, 2, 5] },
    // SimConnect while the PMDG Pedestal view was active: cockpit / instruments / index 3.
    "Pedestal": { viewIndexes: [2, 2, 3] },
    // SimConnect while the PMDG throttle quadrant view was active: cockpit / instruments / index 4.
    "TQ": { viewIndexes: [2, 2, 4] },
    // Shared external-camera mappings copied from the iFly configuration.
    "Fly by": { viewIndexes: [3, 4, 4] },
    "Chase": { viewIndexes: [3, 0, 0] },
    "From left": { viewIndexes: [3, 4, 0] },
    "From right": { viewIndexes: [3, 4, 2] },
    "Front": { viewIndexes: [3, 4, 1] },
};

export const onButtonClick = (buttonText) => {
    const handler = buttonHandlers[buttonText];
    if (handler) {
        console.log(`Button clicked: ${buttonText}`, handler);
        handleCommonCall(handler);
    }
};

export const getSupportedViews = () => Object.keys(buttonHandlers);
