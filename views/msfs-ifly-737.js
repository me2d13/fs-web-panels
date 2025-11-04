// Service file for MSFS GA

/**
 * From service file point of view you need to define two functions:
 * - onButtonClick(buttonText) - to handle the button click
 * - getSupportedViews() - to get the supported views
 * That's it, no magic.
 * 
 * But as most of the buttons do similar thing - calling msfs web api
 * with similar parameters, let's use following helper object with only data
 * specific to the button.
 * 
 * It's basically map by button text and values are objects which are handled
 * by msfs "engine" imported above to create API calls.
 * Supported keys for those driving object values are:
 *
 * For views: 
 * - viewIndexes: array of 3 integers - according to MSFS predefined views (details in SimConnect documentation)
 * - resetView: boolean - if true, the view will be reset to the default view for the preset (tilt, heading, etc.)
 * In general:
 * - path: string - API call url path
 * - body: object - the body of the API call
 * 
 */

import { handleCommonCall } from '../js/msfs-lib.js';

const buttonHandlers = {
    "Pilot": { viewIndexes: [2, 1, 1], resetView: true },
    "Copilot": { viewIndexes: [2, 1, 4], resetView: true },
    "Tablet": { viewIndexes: [2, 2, 2] },
    "FMC": { viewIndexes: [2, 2, 3] },
    "Overhead": { viewIndexes: [2, 2, 4] },
    "After overhead": { viewIndexes: [2, 2, 5] },
    "Pedestal": { viewIndexes: [2, 2, 7] },
    "Cockpit": { viewIndexes: [2, 1, 7] }, // custom view 0, but not reliable
    "Fly by": { viewIndexes: [3, 4, 4] },
    "Chase": { viewIndexes: [3, 0, 0] },
    "From left": { viewIndexes: [3, 4, 0] },
    "From right": { viewIndexes: [3, 4, 2] },
    "Front": { viewIndexes: [3, 4, 1] },
    "Pause": { path: "simvar/set", body: {} },
};

export const onButtonClick = (buttonText) => {
    const handler = buttonHandlers[buttonText];
    if (handler) {
        console.log(`Button clicked: ${buttonText}`, handler);
        // Handle the button click based on the handler configuration
        handleCommonCall(handler);
    }
};

export const getSupportedViews = () => Object.keys(buttonHandlers);