/**
 * This page is using js wrapper around X-plane web api from https://github.com/me2d13/xpl-web-panels
 * The wrapper is located in js/xpl-web-api.js and it's just downloaded copy of the file from the repo.
 * Actually there's added "export " at the beginning of the file to make it ES6 module.
 */

import { XplWebApi } from '../js/xpl-web-api.js';
import { xplaneConfig } from '../js/config.js';

const xplApi = XplWebApi({
            apiUrl: xplaneConfig.apiUrl,
            webSocketUrl: xplaneConfig.webSocketUrl,
        });

export const onButtonClick = (buttonText) => {
    const buttonItem = viewCoordinates.find(vc => vc.name === buttonText);
    if (buttonItem) {
        console.log(`Button clicked: ${buttonText}`, buttonItem);
        if (buttonItem.datarefs) {
            xplApi.setMultipleDataRefValues(buttonItem.datarefs);
        } else if (buttonItem.command) {
            xplApi.executeCommand(buttonItem.command);
        }
    }
};

export const getSupportedViews = () => viewCoordinates.map(vc => vc.name);

const viewCoordinates = [
    {
        name: 'After overhead',
        datarefs: {
            "sim/graphics/view/pilots_head_x": -0.0451,
            "sim/graphics/view/pilots_head_y": 0.9732,
            "sim/graphics/view/pilots_head_z": -14.9206,
            "sim/graphics/view/pilots_head_psi": 0.8672,
            "sim/graphics/view/pilots_head_the": 75,
            "sim/graphics/view/pilots_head_phi": 0
        },
    },
    {
        name: 'Overhead',
        datarefs: {
            "sim/graphics/view/pilots_head_x": -0.0451,
            "sim/graphics/view/pilots_head_y": 0.5312,
            "sim/graphics/view/pilots_head_z": -15.5096,
            "sim/graphics/view/pilots_head_psi": 0.8672,
            "sim/graphics/view/pilots_head_the": 78,
            "sim/graphics/view/pilots_head_phi": 0
        },
    },
    {
        name: 'Pilot',
        datarefs: {
            "sim/graphics/view/pilots_head_x": -0.3801,
            "sim/graphics/view/pilots_head_y": 1.0454,
            "sim/graphics/view/pilots_head_z": -15.3497,
            "sim/graphics/view/pilots_head_psi": 0.8672,
            "sim/graphics/view/pilots_head_the": -18,
            "sim/graphics/view/pilots_head_phi": 0
        },
    },
    {
        name: 'Copilot',
        datarefs: {
            "sim/graphics/view/pilots_head_x": 0.4599,
            "sim/graphics/view/pilots_head_y": 1.0261,
            "sim/graphics/view/pilots_head_z": -15.4843,
            "sim/graphics/view/pilots_head_psi": 0.8672,
            "sim/graphics/view/pilots_head_the": -18,
            "sim/graphics/view/pilots_head_phi": 0
        },
    },
    {
        name: 'Left',
        datarefs: {
            "sim/graphics/view/pilots_head_x": -0.4436,
            "sim/graphics/view/pilots_head_y": 1.0011,
            "sim/graphics/view/pilots_head_z": -15.6006,
            "sim/graphics/view/pilots_head_psi": 278,
            "sim/graphics/view/pilots_head_the": -18,
            "sim/graphics/view/pilots_head_phi": 0
        },
    },
    {
        name: 'Right',
        datarefs: {
            "sim/graphics/view/pilots_head_x": 0.3917,
            "sim/graphics/view/pilots_head_y": 1.0261,
            "sim/graphics/view/pilots_head_z": -15.5942,
            "sim/graphics/view/pilots_head_psi": 74,
            "sim/graphics/view/pilots_head_the": -18,
            "sim/graphics/view/pilots_head_phi": 0
        },
    },
    {
        name: 'Tablet',
        datarefs: {
            "sim/graphics/view/pilots_head_x": -0.4751,
            "sim/graphics/view/pilots_head_y": 1.0211,
            "sim/graphics/view/pilots_head_z": -15.5143,
            "sim/graphics/view/pilots_head_psi": 317.7188,
            "sim/graphics/view/pilots_head_the": -28.0833,
            "sim/graphics/view/pilots_head_phi": 0
        },
    },
    {
        name: 'Cockpit',
        datarefs: {
            "sim/graphics/view/pilots_head_x": -0.4894,
            "sim/graphics/view/pilots_head_y": 0.9909,
            "sim/graphics/view/pilots_head_z": -15.3396,
            "sim/graphics/view/pilots_head_psi": 27.8438,
            "sim/graphics/view/pilots_head_the": -24.3333,
            "sim/graphics/view/pilots_head_phi": 0
        },
    },
    {
        name: 'FMC',
        datarefs: {
            "sim/graphics/view/pilots_head_x": -0.2051,
            "sim/graphics/view/pilots_head_y": 0.7566,
            "sim/graphics/view/pilots_head_z": -15.8926,
            "sim/graphics/view/pilots_head_psi": 0.6084,
            "sim/graphics/view/pilots_head_the": -46,
            "sim/graphics/view/pilots_head_phi": 0
        },
    },
    {
        name: 'Pedestal',
        datarefs: {
            "sim/graphics/view/pilots_head_x": -0.0451,
            "sim/graphics/view/pilots_head_y": 0.7979,
            "sim/graphics/view/pilots_head_z": -15.3832,
            "sim/graphics/view/pilots_head_psi": 0.6084,
            "sim/graphics/view/pilots_head_the": -88,
            "sim/graphics/view/pilots_head_phi": 0
        },
    },
    {
        name: 'Front',
        datarefs: {
            "sim/graphics/view/pilots_head_x": 0,
            "sim/graphics/view/pilots_head_y": 5.3689,
            "sim/graphics/view/pilots_head_z": -38.2255,
            "sim/graphics/view/pilots_head_psi": 180,
            "sim/graphics/view/pilots_head_the": -88,
            "sim/graphics/view/pilots_head_phi": 0
        },
    },
    {
        name: 'From left',
        datarefs: {
            "sim/graphics/view/pilots_head_x": -41,
            "sim/graphics/view/pilots_head_y": 3.3689,
            "sim/graphics/view/pilots_head_z": -5.2255,
            "sim/graphics/view/pilots_head_psi": 90,
            "sim/graphics/view/pilots_head_the": -88,
            "sim/graphics/view/pilots_head_phi": 0
        },
    },
    {
        name: 'From right',
        datarefs: {
            "sim/graphics/view/pilots_head_x": 41,
            "sim/graphics/view/pilots_head_y": 3.3689,
            "sim/graphics/view/pilots_head_z": -5.2255,
            "sim/graphics/view/pilots_head_psi": 270,
            "sim/graphics/view/pilots_head_the": -88,
            "sim/graphics/view/pilots_head_phi": 0
        },
    },
    {
        name: 'Back',
        datarefs: {
            "sim/graphics/view/pilots_head_x": 41,
            "sim/graphics/view/pilots_head_y": 11.3689,
            "sim/graphics/view/pilots_head_z": 60.7745,
            "sim/graphics/view/pilots_head_psi": 270,
            "sim/graphics/view/pilots_head_the": -88,
            "sim/graphics/view/pilots_head_phi": 0
        },
    },
    {
        name: 'Gear',
        datarefs: {
            "sim/graphics/view/pilots_head_x": 3.1579,
            "sim/graphics/view/pilots_head_y": -2.6286,
            "sim/graphics/view/pilots_head_z": 12.968,
            "sim/graphics/view/pilots_head_psi": 352,
            "sim/graphics/view/pilots_head_the": -2,
            "sim/graphics/view/pilots_head_phi": 0
        },
    },
    {
        name: 'Fly by',
        command: 'sim/view/still_spot',
    },
    {
        name: 'Chase',
        command: 'sim/view/chase',
    }
];