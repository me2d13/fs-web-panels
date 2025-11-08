/**
 * This is library for MSFS web api.
 * It creates API calls based on the data provided by service file.
 * Those API calls are received by msfs web API available at https://github.com/me2d13/msfs-web-api
 */

import { msfsConfig } from './config.js';
import { hasConfiguredSettings, getSimulatorSettings } from './settings-utils.js';

export const handleCommonCall = (dataObject) => {
    if (dataObject.path && dataObject.body) {
        makeApiCall(dataObject.path, dataObject.body);
    }
    if (dataObject.viewIndexes) {
        makeApiCall(`simvar/setMultiple`, createViewBody(dataObject));
    }
    return null;
}

const createViewBody = (dataObject) => {
    const items = [
        {"simVarName": "CAMERA STATE", "value": dataObject.viewIndexes[0]},
        {"simVarName": "CAMERA VIEW TYPE AND INDEX:0", "value": dataObject.viewIndexes[1]},
        {"simVarName": "CAMERA VIEW TYPE AND INDEX:1", "value": dataObject.viewIndexes[2]},
    ];
    if (dataObject.resetView) {
        items.push({"simVarName": "CAMERA REQUEST ACTION", "value": 1});
    }
    return items;
}

const makeApiCall = (path, body) => {
    return fetch(`${msfsConfig.rootUrl}/api/${path}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body),
    })
};

const onVariablesChanged = (variables, callback) => {
    // variables can be
    // 1. single string as one variable name
    // 2. array of strings as multiple variable names
    // 3. array of objects as body for /api/simvar/register websocket call
    // in any case convert them to type 3
    let requestBody = [];
    if (typeof variables === 'string') {
        requestBody = [{ simVarName: variables }];
    } else if (Array.isArray(variables)) {
        for (const variable of variables) {
            if (typeof variable === 'string') {
                requestBody.push({ simVarName: variable });
            } else if (typeof variable === 'object') {
                requestBody.push(variable);
            } else {
                console.warn(`Invalid variable type: ${typeof variable}, skipping.`);
            }
        }
    }
    if (requestBody.length === 0) {
        console.warn(`No valid variables provided, skipping.`);
        return;
    }
    
    // Create WebSocket connection to MSFS API
    const wsUrl = msfsConfig.rootUrl.replace(/^http/, 'ws') + '/api/simvar/register?interval=1';
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
        console.log('WebSocket connected to MSFS API');
        // Send the request body as the first message
        ws.send(JSON.stringify(requestBody));
    };
    
    ws.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            callback(data);
        } catch (error) {
            console.error('Error parsing WebSocket message:', error);
        }
    };
    
    ws.onerror = (error) => {
        console.error('WebSocket error:', error);
    };
    
    ws.onclose = () => {
        console.log('WebSocket connection closed');
    };
    
    // Return the WebSocket so caller can close it if needed
    return ws;
}

export const msfsApi = {
    makeApiCall: makeApiCall,
    onVariablesChanged: onVariablesChanged,
}

export const forMsfs = (callback) => {
    if (hasConfiguredSettings()) {
        const settings = getSimulatorSettings();
        if (settings.simulator === 'MSFS') {
            // get the plane name
            const planeName = settings.plane;
            callback(msfsApi, planeName);
        }
    }
}