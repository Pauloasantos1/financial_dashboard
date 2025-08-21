const {app, BrowserWindow} = require('electron');
const path = require('path');

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true, // Important for security
            enableRemoteModule: false, // Disable remote module
            nodeIntegration: false,
            contextIsolation: false,
        }
    });

    mainWindow.loadURL('http:localhost:5173'); // Adjust the URL as needed
    }

    app.whenReady().then(createWindow);
    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') {
            app.quit();
        }
    });