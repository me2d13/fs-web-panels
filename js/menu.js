import { menuItems } from './config.js';

const createFloatingMenu = () => {
    // Create floating menu button
    const menuButton = document.createElement('button');
    menuButton.id = 'floating-menu-button';
    menuButton.innerText = 'Menu';
    menuButton.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 15px 25px;
        background-color: #007bff;
        color: white;
        border: none;
        border-radius: 50px;
        font-size: 16px;
        font-weight: bold;
        cursor: pointer;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 1000;
        transition: background-color 0.3s;
    `;
    
    // Create overlay
    const overlay = document.createElement('div');
    overlay.id = 'menu-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.7);
        display: none;
        justify-content: center;
        align-items: center;
        z-index: 1001;
    `;
    
    // Create menu container
    const menuContainer = document.createElement('div');
    menuContainer.id = 'menu-container';
    menuContainer.style.cssText = `
        background-color: white;
        border-radius: 10px;
        padding: 30px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        max-width: 400px;
        width: 90%;
    `;
    
    // Create menu title
    const menuTitle = document.createElement('h2');
    menuTitle.innerText = 'Navigation';
    menuTitle.style.cssText = `
        margin-top: 0;
        margin-bottom: 20px;
        color: #333;
    `;
    menuContainer.appendChild(menuTitle);
    
    // Get current page
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // Create menu items
    menuItems.forEach(itemDef => {
        const item = document.createElement('button');
        item.innerText = itemDef.title;
        item.style.cssText = `
            display: block;
            width: 100%;
            padding: 15px;
            margin-bottom: 10px;
            border: 2px solid #007bff;
            border-radius: 5px;
            font-size: 16px;
            cursor: pointer;
            transition: all 0.3s;
        `;
        
        if (itemDef.file === currentPage) {
            item.style.backgroundColor = '#007bff';
            item.style.color = 'white';
            item.style.fontWeight = 'bold';
        } else {
            item.style.backgroundColor = 'white';
            item.style.color = '#007bff';
            item.onmouseover = () => {
                item.style.backgroundColor = '#e7f3ff';
            };
            item.onmouseout = () => {
                item.style.backgroundColor = 'white';
            };
            item.onclick = () => {
                window.location = itemDef.file;
            };
        }
        
        menuContainer.appendChild(item);
    });
    
    // Create close button
    const closeButton = document.createElement('button');
    closeButton.innerText = 'Close';
    closeButton.style.cssText = `
        display: block;
        width: 100%;
        padding: 15px;
        margin-top: 10px;
        background-color: #6c757d;
        color: white;
        border: none;
        border-radius: 5px;
        font-size: 16px;
        cursor: pointer;
        transition: background-color 0.3s;
    `;
    closeButton.onmouseover = () => {
        closeButton.style.backgroundColor = '#5a6268';
    };
    closeButton.onmouseout = () => {
        closeButton.style.backgroundColor = '#6c757d';
    };
    closeButton.onclick = () => {
        overlay.style.display = 'none';
    };
    menuContainer.appendChild(closeButton);
    
    // Append menu container to overlay
    overlay.appendChild(menuContainer);
    
    // Add click event to menu button
    menuButton.onclick = () => {
        overlay.style.display = 'flex';
    };
    
    // Add click event to overlay (close when clicking outside menu)
    overlay.onclick = (e) => {
        if (e.target === overlay) {
            overlay.style.display = 'none';
        }
    };
    
    // Append elements to body
    document.body.appendChild(menuButton);
    document.body.appendChild(overlay);
};

// Initialize menu when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createFloatingMenu);
} else {
    createFloatingMenu();
}