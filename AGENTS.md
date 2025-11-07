# Flight Simulator Web Panels - AI Agent Context

> **Note**: This document is intended for AI coding assistants and tools. It provides comprehensive context about the project architecture, conventions, and extensibility patterns.

## Project Overview

A lightweight web application for controlling and monitoring flight simulators from any device on your network, such as a tablet or secondary monitor. Designed to provide custom cockpit panels for both X-Plane and Microsoft Flight Simulator.

### Key Characteristics

- **Network-accessible**: Run on a web server, access from tablets, phones, or secondary displays
- **No build process**: Direct HTML/CSS/JS development with instant refresh
- **Dual simulator support**: Works with both X-Plane and MSFS
- **Progressively enhanced**: Simple pages use plain HTML/JS, complex UIs can use frameworks
- **Modular**: Easy to extend with new pages and aircraft configurations

## Simulator Communication

This web application communicates with flight simulators through separate API frameworks. The JavaScript code in this repository calls these APIs:

### X-Plane Integration

**Framework**: [xpl-web-panels](https://github.com/me2d13/xpl-web-panels)
- A JavaScript wrapper around X-Plane 12 Web API
- Simplifies dataref reading/writing and command execution
- Supports dataref subscriptions for real-time updates
- Handles ID lookups and caching automatically

**Local file**: `js/xpl-web-api.js` (copied from the framework repository)

**Key features**:
```javascript
// Read dataref
xplApi.getDataRefValue('sim/cockpit/autopilot/heading_mag')
  .then(value => console.log(value));

// Write dataref
xplApi.setDataRefValue('sim/cockpit/autopilot/heading_mag', 180);

// Execute command
xplApi.executeCommand('sim/operation/pause_toggle');

// Subscribe to datarefs (continuous updates)
xplApi.subscribeDataRefs([
  'sim/graphics/view/pilots_head_x',
  'sim/graphics/view/pilots_head_y'
], (values) => {
  console.log('Position updated:', values);
});
```

**Important limitation**: X-Plane 12.2.0 API is localhost-only. Network access requires a reverse proxy (nginx config provided in the framework repo).

### MSFS Integration

**Framework**: [msfs-web-api](https://github.com/me2d13/msfs-web-api)
- .NET-based web API server for Microsoft Flight Simulator
- Uses SimConnect SDK to communicate with MSFS
- Provides REST API and WebSocket streaming
- Supports SimVars reading/writing

**Local file**: `js/msfs-lib.js` (wrapper for the API)

**Key features**:
```javascript
// Read SimVar
GET /api/simvar/get?simVarName=PLANE%20ALTITUDE&unit=feet

// Write SimVar
POST /api/simvar/set
{
  "simVarName": "AUTOPILOT HEADING LOCK DIR",
  "unit": "degrees",
  "value": 180
}

// WebSocket streaming (live updates)
ws://localhost:5018/api/simvar/register?interval=1
// Send: [{"simVarName":"PLANE ALTITUDE","unit":"feet"}]
// Receive: continuous updates when values change
```

**System requirements**: .NET 8.0+, MSFS installed, SimConnect SDK

## Architecture

### No Build Process Philosophy

This project deliberately avoids modern JavaScript build tooling:

- ✅ **No TypeScript compilation** - Plain ES6+ JavaScript
- ✅ **No bundlers** - No Webpack, Vite, Rollup, Parcel, etc.
- ✅ **No package managers for runtime** - npm/yarn not required (CDN dependencies)
- ✅ **No compilation step** - Edit and refresh browser
- ✅ **Native ES modules** - Use `import`/`export` directly
- ✅ **Import maps** - External dependencies via CDN (e.g., Preact)

**Why?**
- Instant iteration cycles (no build wait)
- Easier to understand and debug
- Lower barrier to entry for contributors
- Simpler deployment (just copy files)

**Requirement**: Must run on a web server (not `file://`) for ES module imports to work.

### Project Structure

```
fs-web-panels/
├── AGENTS.md           # This file - AI agent context
├── index.html          # Main landing page (simple HTML/JS)
├── settings.html       # Configuration page (simple HTML/JS)
├── views.html          # Aircraft-specific view selector
├── gear.html           # Landing gear/flaps panel (uses Preact)
│
├── css/
│   └── styles.css      # Global styles
│
├── js/
│   ├── config.js       # Navigation menu configuration
│   ├── menu.js         # Menu component (used by all pages)
│   ├── xpl-web-api.js  # X-Plane communication wrapper
│   ├── msfs-lib.js     # MSFS communication wrapper
│   └── settings-utils.js
│
├── gear/               # Gear page components (Preact-based)
│   ├── gear.css
│   ├── gear-panel.js       # Landing gear control
│   ├── parking-brake.js    # Parking brake toggle
│   └── flaps-panel.js      # Flaps control with configurable positions
│
└── views/              # Aircraft-specific configurations
    ├── views.css
    ├── msfs-ga.js          # General Aviation for MSFS
    ├── msfs-ifly-737.js    # iFly 737 for MSFS
    └── xpl-zibo-737.js     # Zibo 737 for X-Plane
```

## Page Types

### 1. Simple Pages (Plain HTML/JS)

**Examples**: `index.html`, `settings.html`, `views.html`

**Pattern**:
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Page Title</title>
    <link rel="stylesheet" href="css/styles.css">
    <script type="module" src="js/menu.js"></script>
</head>
<body>
    <!-- Your content here -->
    
    <script type="module">
        import { XplWebApi } from './js/xpl-web-api.js';
        
        const xplApi = XplWebApi();
        // Your page logic
    </script>
</body>
</html>
```

**When to use**:
- Static content pages
- Simple configuration interfaces
- Basic data display
- Quick prototypes

### 2. Framework-Enhanced Pages

**Example**: `gear.html` (uses Preact)

**Pattern**:
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Gear Panel</title>
    <link rel="stylesheet" href="css/styles.css">
    <link rel="stylesheet" href="gear/gear.css">
    <script type="module" src="js/menu.js"></script>
    
    <!-- Import map for external dependencies -->
    <script type="importmap">
    {
        "imports": {
            "preact": "https://esm.sh/preact@10.23.1",
            "preact/hooks": "https://esm.sh/preact@10.23.1/hooks",
            "htm/preact": "https://esm.sh/htm@3.1.1/preact?external=preact"
        }
    }
    </script>
</head>
<body>
    <div id="app"></div>
    
    <script type="module">
        import { render } from 'preact';
        import { html } from 'htm/preact';
        import { ParkingBrakePanel } from './gear/parking-brake.js';
        import { GearPanel } from './gear/gear-panel.js';
        import { FlapsPanel } from './gear/flaps-panel.js';
        
        function App() {
            return html`
                <div class="left-panels">
                    <${ParkingBrakePanel} />
                    <${GearPanel} />
                </div>
                <div class="right-panels">
                    <${FlapsPanel} />
                </div>
            `;
        }
        
        render(html`<${App} />`, document.getElementById('app'));
    </script>
</body>
</html>
```

**When to use**:
- Complex interactive UIs
- Real-time data displays with many elements
- Component-based architecture needed
- Sophisticated state management required

**Framework choice**: Preact is used because:
- Small size (3KB)
- React-like API (familiar)
- Works via CDN (no build needed)
- Good performance

## Extension Points

### 1. Adding New Pages

#### Simple Page Recipe

1. Create `your-page.html` in root:
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Your Page</title>
    <link rel="stylesheet" href="css/styles.css">
    <script type="module" src="js/menu.js"></script>
</head>
<body>
    <h1>Your Page</h1>
    <!-- Your content -->
</body>
</html>
```

2. Add to menu in `js/config.js`:
```javascript
export const MENU_ITEMS = [
    { title: 'Home', url: 'index.html' },
    { title: 'Your Page', url: 'your-page.html' }, // Add this
    { title: 'Settings', url: 'settings.html' }
];
```

#### Complex Page Recipe (with Preact)

1. Create page folder: `mkdir your-page`

2. Create component: `your-page/your-component.js`
```javascript
import { html } from 'htm/preact';
import { useState, useEffect } from 'preact/hooks';

export function YourComponent() {
    const [data, setData] = useState(null);
    
    useEffect(() => {
        // Subscribe to simulator data
    }, []);
    
    return html`
        <div class="your-component">
            <h2>Your Component</h2>
            <p>Data: ${data}</p>
        </div>
    `;
}
```

3. Create styles: `your-page/your-page.css`

4. Create HTML page: `your-page.html` (see pattern above)

5. Add to menu in `js/config.js`

### 2. Menu Configuration (`js/config.js`)

The navigation menu is centrally configured:

```javascript
export const MENU_ITEMS = [
    { title: 'Home', url: 'index.html' },
    { title: 'Views', url: 'views.html' },
    { title: 'Gear', url: 'gear.html' },
    { title: 'Settings', url: 'settings.html' }
];
```

**When adding a page**: Update this array and the menu will automatically appear on all pages.

### 3. Aircraft-Specific Configurations

The `views/` directory contains aircraft-specific panel configurations.

**Example structure**:
```javascript
// views/xpl-zibo-737.js
export const ZIBO_737_CONFIG = {
    name: 'Zibo 737',
    simulator: 'xplane',
    datarefs: {
        gear: 'sim/cockpit2/controls/gear_handle_down',
        flaps: 'sim/cockpit2/controls/flap_ratio',
        parkingBrake: 'sim/cockpit2/controls/parking_brake_ratio'
    },
    flapPositions: [0, 1, 2, 5, 10, 15, 25, 30, 40] // degrees
};
```

**When adding aircraft**:
1. Create new file in `views/`: e.g., `views/airbus-a320.js`
2. Export configuration object
3. Import and use in views selector page

### 4. Settings Integration

Pages can access centralized settings stored in localStorage:

```javascript
// Read settings
const settings = JSON.parse(localStorage.getItem('fswebpanels_settings') || '{}');
const simulator = settings.simulator; // 'xplane' or 'msfs'
const serverUrl = settings.serverUrl;

// Write settings
const newSettings = { ...settings, simulator: 'msfs' };
localStorage.setItem('fswebpanels_settings', JSON.stringify(newSettings));
```

See `js/settings-utils.js` for helper functions.

## Example: Gear Page Architecture

The gear page demonstrates best practices for complex panels:

### Component Structure

```
gear.html                   # Main page with Preact setup
gear/
├── gear.css                # Styles for all components
├── gear-panel.js           # Landing gear control
├── parking-brake.js        # Parking brake toggle
└── flaps-panel.js          # Flaps control
```

### Key Patterns

**1. Configurable Components**
```javascript
// flaps-panel.js
const FLAP_POSITIONS = [0, 1, 5, 10, 15, 30, 40]; // Easy to modify per aircraft
```

**2. Separation of Concerns**
- Lever control (pilot input) separate from position indicator (simulator feedback)
- State management via Preact hooks
- TODO comments mark simulator integration points

**3. Tablet-Friendly Design**
- Large click targets (100px wide lever, 30px height positions)
- Clear visual feedback
- Touch-optimized interactions

**4. Independent Operation**
```javascript
const [leverPosition, setLeverPosition] = useState(0);    // Pilot input
const [actualPosition, setActualPosition] = useState(0);   // Sim feedback

// Lever doesn't control indicator - they're independent
// Indicator shows actual flaps position from simulator
// Lever shows pilot's selected position
```

## Development Workflow

### Setup

1. Clone repository
2. Start web server:
```bash
# Python 3
python3 -m http.server 8093

# Node.js
npx http-server -p 8093
```
3. Open `http://localhost:8093`
4. For network access: `http://YOUR_IP:8093`

### Making Changes

1. Edit HTML/CSS/JS files directly
2. Save file
3. Refresh browser (Ctrl+F5 / Cmd+Shift+R for hard refresh)
4. No compilation or build step needed

### Adding External Dependencies

Use import maps for CDN-hosted modules:

```html
<script type="importmap">
{
    "imports": {
        "preact": "https://esm.sh/preact@10.23.1",
        "your-library": "https://esm.sh/your-library@1.0.0"
    }
}
</script>
```

**Popular CDNs**:
- esm.sh (recommended for ESM modules)
- unpkg.com
- cdn.jsdelivr.net

## Coding Conventions

### File Organization

- **Root level**: HTML pages only
- **css/**: Global styles
- **js/**: Shared utilities and framework wrappers
- **[page-name]/**: Page-specific components and styles
- **views/**: Aircraft configurations

### Naming

- **HTML files**: kebab-case (e.g., `gear.html`)
- **JavaScript files**: kebab-case (e.g., `gear-panel.js`)
- **CSS files**: match their scope (e.g., `gear.css` for gear page)
- **Component functions**: PascalCase (e.g., `GearPanel`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `FLAP_POSITIONS`)

### Comments

Use TODO comments to mark simulator integration points:

```javascript
useEffect(() => {
    // TODO: Subscribe to gear data from flight simulator
    // Example: Subscribe to datarefs/simvars for gear positions
}, []);

const handleLeverClick = () => {
    setLeverPosition(newPosition);
    // TODO: Send command to flight simulator to change gear position
};
```

### State Management

For Preact components:
- Use `useState` for local component state
- Use `useEffect` for simulator data subscriptions
- Separate UI state from simulator state

```javascript
// Good: Separate concerns
const [leverPosition, setLeverPosition] = useState(0);     // UI state
const [actualGearPos, setActualGearPos] = useState(0);     // Sim state

// Bad: Mixing concerns
const [gearPosition, setGearPosition] = useState(0);       // Ambiguous
```

## Technical Details

### Browser Compatibility

**Required features**:
- ES6 modules (`import`/`export`)
- Import maps
- Fetch API
- Template literals
- Arrow functions
- Promises/async-await

**Tested browsers**:
- Chrome/Edge 89+ ✅ (recommended)
- Firefox 108+ ✅
- Safari 16.4+ ✅ (iOS/iPadOS)

### Performance Considerations

- Dataref subscriptions update at ~2Hz (configurable)
- WebSocket streaming for MSFS live data
- Component re-renders only when state changes
- CSS animations use `transform` for 60fps

### Security Notes

- **CORS**: Simulator APIs must allow cross-origin requests
- **Network**: Run on local network only (no internet exposure)
- **Validation**: Currently minimal - trust local network
- **Authentication**: None (assumes trusted network)

## Common Tasks for AI Assistants

### Task: Add a New Instrument Panel

1. Create `instrument.html` in root
2. Create `instrument/` folder for components
3. Add page to `js/config.js` menu
4. Use gear page as template
5. Identify needed datarefs/simvars from simulator documentation
6. Add TODO comments for integration points

### Task: Add New Aircraft Configuration

1. Create `views/aircraft-name.js`
2. Export config object with:
   - Aircraft name
   - Simulator type
   - Dataref/simvar mappings
   - Aircraft-specific settings (flap positions, etc.)
3. Import in views page
4. Add to aircraft selector

### Task: Debug Simulator Connection

1. Check browser console for errors
2. Verify simulator API is running:
   - X-Plane: http://localhost:8086 (or proxy URL)
   - MSFS: http://localhost:5018
3. Test API directly with curl/Postman
4. Check CORS headers
5. Verify dataref/simvar names in documentation

### Task: Improve Component for Tablet Use

1. Increase clickable areas (min 44x44px for touch)
2. Add hover states with larger visual feedback
3. Use larger fonts (min 16px)
4. Test on actual tablet or browser mobile view
5. Ensure sufficient contrast (WCAG AA)

## Resources

### External Documentation

- [X-Plane Web API Wrapper](https://github.com/me2d13/xpl-web-panels) - JavaScript wrapper for X-Plane
- [MSFS Web API](https://github.com/me2d13/msfs-web-api) - .NET API server for MSFS
- [Preact Documentation](https://preactjs.com/) - Framework used for complex UIs
- [HTM Documentation](https://github.com/developit/htm) - JSX-like syntax without build
- [ESM.sh CDN](https://esm.sh/) - Recommended CDN for ES modules

### Simulator Documentation

- [X-Plane Datarefs](https://developer.x-plane.com/datarefs/)
- [MSFS SimVars](https://docs.flightsimulator.com/html/Programming_Tools/SimVars/Simulation_Variables.htm)

## Future Enhancement Ideas

- Virtual joystick/throttle controls
- Artificial horizon (attitude indicator)
- HSI (horizontal situation indicator)
- Engine gauges (RPM, EGT, fuel flow)
- Autopilot control panel
- Radio stack panel
- FMS/GPS display
- Multi-monitor layout manager
- Aircraft checklists
- Flight plan viewer
- Weather radar display
- Custom keyboard shortcuts
- Touch gesture controls
- Themes (day/night modes)

---

**Last Updated**: Generated for AI agent context. This document should be kept in sync with actual implementation.

