// ========================================
// MENU CONFIGURATION
// ========================================
// Define menu items and their navigation targets
export const menuItems = [
    {
        file: 'index.html',
        title: 'Home',
    },
    {
        file: 'views.html',
        title: 'Views',
    },
    {
        file: 'settings.html',
        title: 'Settings',
    },
];

// ========================================
// SIMULATOR AND PLANE CONFIGURATION
// ========================================
// Define available simulators and their planes
// To add a new simulator or plane, simply add it to this object
export const simulatorConfig = {
    'X-Plane': [
        { name: 'Zibo 737', displayName: 'Zibo 737', serviceFile: 'views/xpl-zibo-737.js' },
    ],
    'MSFS': [
        { name: 'GA', displayName: 'GA', serviceFile: 'views/msfs-ga.js' },
        { name: '737 MAX', displayName: '737 MAX', serviceFile: 'views/msfs-ifly-737.js' }
    ]
};

export const msfsConfig = {
    rootUrl: 'http://fs.lan:5018',
}

export const xplaneConfig = {
    apiUrl: 'http://fs.lan/xpl-api/api/v2',
    webSocketUrl: 'ws://fs.lan:8020/api/v2',
}