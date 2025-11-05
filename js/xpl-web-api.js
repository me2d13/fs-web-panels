export const XplWebApi = (hostOrParams = null, port = null) => {
    // If hostOrParams is a string, treat it as the host
    let baseUrl = null;
    let webSocketUrl = null;
    if (!hostOrParams) {
        hostOrParams = 'localhost';
    }
    if (typeof hostOrParams === 'string') {
        // If it's a string, use it as the host
        baseUrl = `http://${hostOrParams}:${port || 8086}/api/v2`;
        webSocketUrl = `ws://${hostOrParams}:${port || 8086}/api/v2`;
    } else if (typeof hostOrParams === 'object') {
        baseUrl = hostOrParams.apiUrl || `http://${hostOrParams.host || 'localhost'}:${hostOrParams.port || 8086}/api/v2`;
        webSocketUrl = hostOrParams.webSocketUrl || `ws://${hostOrParams.host || 'localhost'}:${hostOrParams.port || 8086}/api/v2`;
    }
    const commandIds = {};
    const dataRefIds = {};
    const subscriptions = {};
    let webSocket = null;
    let wsRequestId = 1;
    const pendingSetMultipleDataRefValues = [];

    const findCommandId = async (commandName) => {
        console.log(`Finding command ID for: ${commandName}`);
        const fullUrl = baseUrl + `/commands?filter\[name\]=${commandName}`;
        // do GET fetch
        const result = fetch(fullUrl, {
            method: 'GET',
        });
        const data = await result;
        if (data.ok) {
            const json = await data.json();
            //console.log(`Command list response:`, json);
            if (json && json.data && json.data.length == 1) {
                const commandId = json.data[0].id;
                console.log(`Command ID: ${commandId}`);
                return commandId;
            } else {
                console.warn(`Command list response:`, json);
            }
        } else {
            console.error(`Command not found with ${data.status}: ${commandName}`);
        }
        return 0;
    }

    const findDataRefId = async (dataRefName) => {
        console.log(`Finding dataRef ID for: ${dataRefName}`);
        const fullUrl = baseUrl + `/datarefs?filter\[name\]=${dataRefName}`;
        // do GET fetch
        const result = fetch(fullUrl, {
            method: 'GET',
        });
        const data = await result;
        if (data.ok) {
            const json = await data.json();
            //console.log(`DR list response:`, json);
            if (json && json.data && json.data.length == 1) {
                const dataRefId = json.data[0].id;
                console.log(`DataRef ID: ${dataRefId}`);
                return dataRefId;
            } else {
                console.warn(`DataRef list response:`, json);
            }
        } else {
            console.error(`DataRef not found with ${data.status}: ${dataRefName}`);
        }
        return 0;
    }

    const executeCommand = async (commandName, params = null) => {
        let commandId = commandIds[commandName];
        if (!commandId) {
            commandId = await findCommandId(commandName);
            if (commandId) {
                commandIds[commandName] = commandId;
            }
        }
        if (!commandId) {
            throw new Error(`Command ${commandName} not found`);
        }
        console.log(`Executing command: ${commandId}`);
        // do POST fetch
        const fullUrl = baseUrl + `/command/${commandId}/activate`;
        const response = await fetch(fullUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ duration: 0 }),
        });
        if (response.ok) {
            console.log(`Command executed successfully: ${commandId}`);
        } else {
            console.error(`Error executing command: ${response.status}`);
        }
    }

    const setDataRefValue = async (dataRefName, value) => {
        let dataRefId = dataRefIds[dataRefName];
        if (!dataRefId) {
            dataRefId = await findDataRefId(dataRefName);
            if (dataRefId) {
                dataRefIds[dataRefName] = dataRefId;
            }
        }
        if (!dataRefId) {
            throw new Error(`DataRef ${dataRefName} not found`);
        }
        //console.log(`Setting value of dataRef: ${dataRefId} to ${value}`);
        // do PATCH request
        const fullUrl = baseUrl + `/dataRefs/${dataRefId}/value`;
        const response = await fetch(fullUrl, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ data: value }),
        });
        if (response.ok) {
            console.log(`DataRef value set successfully: ${dataRefId}`);
        } else {
            console.error(`Error setting dataRef value: ${response.status}`);
        }
    }

    const getDataRefValue = async (dataRefName) => {
        let dataRefId = dataRefIds[dataRefName];
        if (!dataRefId) {
            dataRefId = await findDataRefId(dataRefName);
            if (dataRefId) {
                dataRefIds[dataRefName] = dataRefId;
            }
        }
        if (!dataRefId) {
            throw new Error(`DataRef ${dataRefName} not found`);
        }
        //console.log(`Getting value of dataRef: ${dataRefId}`);
        // do GET fetch
        const fullUrl = baseUrl + `/dataRefs/${dataRefId}/value`;
        const response = await fetch(fullUrl, {
            method: 'GET',
        });
        if (response.ok) {
            const json = await response.json();
            //console.log(`Response:`, json);
            return json.data;
        } else {
            console.error(`Error getting dataRef value with status: ${response.status}`);
        }
        return null;
    }

    const sendSubscriptionRequests = () => {
        console.log(`WebSocket is opened, sending pending subscription requests for dataRefs`);
        for (const subscription of Object.values(subscriptions)) {
            if (subscription.requested) {
                console.log(`Subscription id ${subscription.requestId} for dataRef already requested, skipping.`);
                continue;
            }
            subscription.requested = true;
            const dataRefsToSubscribe = [];
            for (const dataRefName in subscription.datarefs) {
                const dataRefId = subscription.datarefs[dataRefName];
                if (!dataRefId) {
                    console.warn(`DataRef ID not found for ${dataRefName}, skipping subscription.`);
                    continue;
                }
                dataRefsToSubscribe.push({ id: dataRefId });
            }
            const request = {
                req_id: subscription.requestId,
                type: 'dataref_subscribe_values',
                params: {
                    datarefs: dataRefsToSubscribe,
                },
            };
            console.log(`Subscribing request: ${JSON.stringify(request)}`);
            webSocket.send(JSON.stringify(request));
        }
    }

    const openWebSocket = () => {
        if (webSocket) {
            if (webSocket.readyState === WebSocket.OPEN) {
                console.log(`WebSocket is already open, sending subscription request.`);
                sendSubscriptionRequests();
            } else {
                console.log(`WebSocket opening in progress, will send subscription request when it opens.`);
            }
        } else {
            webSocket = new WebSocket(webSocketUrl);
            webSocket.onopen = (event) => {
                sendSubscriptionRequests();
                processPendingSetMultipleDataRefValues();
            };
            webSocket.onmessage = (event) => {
                const debugLog = () => { }; //console.log;
                const message = JSON.parse(event.data);
                debugLog(`WebSocket message parsed:`, message);
                if (message.type == 'dataref_update_values') {
                    // prepare answers to distribute received dataref values
                    const subscriptionAnswers = Object.values(subscriptions).map((sub) => ({ sub, values: {} }));
                    const valuesPerDatarefId = message.data;
                    //console.log('subscriptionAnswers:', subscriptionAnswers);
                    for (const dataRefId in valuesPerDatarefId) {
                        const value = valuesPerDatarefId[dataRefId];
                        debugLog(`Received DataRef ID: ${dataRefId}, value: ${value}`);
                        for (const subscriptionAnswer of Object.values(subscriptionAnswers)) {
                            const dataRefIdsInSubscription = Object.values(subscriptionAnswer.sub.datarefs);
                            debugLog(`Checking subscription for dataRef ID: ${dataRefId} in`, dataRefIdsInSubscription);
                            if (dataRefIdsInSubscription.includes(Number(dataRefId))) {
                                debugLog(`Found subscription for dataRef ID: ${dataRefId}`);
                                const drName = Object.keys(subscriptionAnswer.sub.datarefs)
                                    .find(name => subscriptionAnswer.sub.datarefs[name] === Number(dataRefId));
                                // found subscription for this dataRefId, add value to it
                                subscriptionAnswer.values[drName || dataRefId] = value;
                            }
                        }
                    }
                    debugLog('subscriptionAnswers with results:', subscriptionAnswers);
                    // now call callbacks for each subscription
                    for (const subscriptionAnswer of Object.values(subscriptionAnswers)) {
                        if (Object.keys(subscriptionAnswer.values).length > 0) {
                            // call the callback with the values
                            subscriptionAnswer.sub.callback(subscriptionAnswer.values);
                        }
                    }
                } else {
                    // common message, just log it
                    console.log(event.data);
                }
            };
        }
    }

    const getDataRefIds = async (dataRefNames) => {
        const validDataRefsWithIds = {};
        for (const dataRefName of dataRefNames) {
            if (!dataRefName || typeof dataRefName !== 'string') {
                throw new Error(`Invalid dataRef name: ${dataRefName}`);
            }
            let dataRefId = dataRefIds[dataRefName];
            if (!dataRefId) {
                dataRefId = await findDataRefId(dataRefName);
                if (dataRefId) {
                    dataRefIds[dataRefName] = dataRefId;
                }
            }
            if (!dataRefId) {
                console.warn(`DataRef ${dataRefName} not found, skipping.`);
            } else {
                validDataRefsWithIds[dataRefName] = dataRefId;
            }
        }
        return validDataRefsWithIds;
    }

    const subscribeDataRefs = async (dataRefNames, callback) => {
        if (!Array.isArray(dataRefNames)) {
            dataRefNames = [dataRefNames];
        }
        // get dataRefIds for all dataRefNames
        const validDataRefsWithIds = await getDataRefIds(dataRefNames);
        console.log(`Subscribing to validated datarefs`, validDataRefsWithIds);
        const subscription = {};
        subscription.datarefs = validDataRefsWithIds;
        subscription.callback = callback;
        subscription.requested = false;
        subscription.requestId = wsRequestId++;
        subscriptions[subscription.requestId] = subscription;
        openWebSocket();
    }

    const processPendingSetMultipleDataRefValues = () => {
        if (pendingSetMultipleDataRefValues.length === 0) {
            return;
        }
        if (!webSocket || webSocket.readyState !== WebSocket.OPEN) {
            console.warn(`WebSocket is not open, cannot send set multiple dataRef values request.`);
            return;
        }
        console.log(`Processing pending set multiple dataRef values requests:`, pendingSetMultipleDataRefValues);
        while (pendingSetMultipleDataRefValues.length > 0) {
            const request = pendingSetMultipleDataRefValues.shift();
            webSocket.send(JSON.stringify(request));
        }
    }

    const setMultipleDataRefValues = async (dataRefValues) => {
        if (typeof dataRefValues !== 'object' || Array.isArray(dataRefValues)) {
            throw new Error(`Invalid dataRef values: ${dataRefValues}, provide object`);
        }
        // get dataRefIds for all dataRefNames
        const dataRefNames = Object.keys(dataRefValues);
        const validDataRefsWithIds = await getDataRefIds(dataRefNames);
        // in input parameter dataRefValues, replace names with ids, add to array in XPL request format
        const dataRefValuesWithIds = [];
        for (const dataRefName in validDataRefsWithIds) {
            const dataRefId = validDataRefsWithIds[dataRefName];
            if (dataRefValues.hasOwnProperty(dataRefName)) {
                dataRefValuesWithIds.push({ id: dataRefId, value: dataRefValues[dataRefName] });
            } else {
                console.warn(`DataRef ${dataRefName} not found in values, skipping.`);
            }
        }
        const request = {
            req_id: wsRequestId++,
            type: 'dataref_set_values',
            params: {
                datarefs: dataRefValuesWithIds,
            },
        };
        pendingSetMultipleDataRefValues.push(request);
        if (webSocket && webSocket.readyState === WebSocket.OPEN) {
            processPendingSetMultipleDataRefValues();
        } else {
            openWebSocket();
        }
    }

    return {
        executeCommand,
        getDataRefValue,
        setDataRefValue,
        subscribeDataRefs,
        setMultipleDataRefValues,
    };
};