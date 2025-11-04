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
    "Pilot": { viewIndexes: [2, 0, 0], resetView: true },
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