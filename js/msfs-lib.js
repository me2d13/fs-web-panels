/**
 * This is library for MSFS web api.
 * It creates API calls based on the data provided by service file.
 * Those API calls are received by msfs web API available at https://github.com/me2d13/msfs-web-api
 */

import { msfsConfig } from './config.js';

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
        body: JSON.stringify(body),
    })
};