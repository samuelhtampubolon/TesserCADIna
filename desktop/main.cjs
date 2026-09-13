const { app, BrowserWindow, shell, Menu, protocol } = require('electron');
const path = require('node:path');
const { SCHEME, ORIGIN, createHandler } = require('./protocol.cjs');

protocol.registerSchemesAsPrivileged([{
  scheme: SCHEME,
  privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true },
}]);

const ROOT = require('node:fs').existsSync(path.join(__dirname, 'index.html'))
  ? __dirname
  : path.join(__dirname, '..');

app.commandLine.appendSwitch('enable-unsafe-swiftshader');
app.commandLine.appendSwitch('disable-component-update');
app.commandLine.appendSwitch('disable-domain-reliability');
app.commandLine.appendSwitch('disable-features',
  'MediaRouter,OptimizationHints,Translate,AutofillServerCommunication');
app.commandLine.appendSwitch('metrics-recording-only');
app.commandLine.appendSwitch('no-pings');
app.commandLine.appendSwitch('host-resolver-rules', 'MAP * ~NOTFOUND');

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 380,
    minHeight: 480,
    backgroundColor: '#0d1117',
    title: 'TesserCADIna',
    show: false,
    webPreferences: {
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false,
      nodeIntegrationInWorker: false,
      webSecurity: true,
      allowRunningInsecureContent: false,
      experimentalFeatures: false,
      webviewTag: false,
      navigateOnDragDrop: false,
      spellcheck: false,
    },
  });

  win.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith(`${ORIGIN}/`)) {
      event.preventDefault();
      if (/^https:\/\//.test(url)) shell.openExternal(url);
    }
  });
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https:\/\//.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });
  win.webContents.on('will-attach-webview', (event) => event.preventDefault());

  win.once('ready-to-show', () => win.show());
  win.loadURL(`${ORIGIN}/index.html`);
  return win;
}

function buildMenu() {
  const isMac = process.platform === 'darwin';
  Menu.setApplicationMenu(Menu.buildFromTemplate([
    ...(isMac ? [{ role: 'appMenu' }] : []),
    { role: 'editMenu' },
    {
      label: 'View',
      submenu: [
        { role: 'reload' }, { role: 'forceReload' }, { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' }, { role: 'zoomIn' }, { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    { role: 'windowMenu' },
  ]));
}

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', () => {
    const [win] = BrowserWindow.getAllWindows();
    if (win) { if (win.isMinimized()) win.restore(); win.focus(); }
  });

  app.whenReady().then(() => {
    protocol.handle(SCHEME, createHandler(ROOT));
    buildMenu();
    createWindow();
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });

  app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });

  app.on('web-contents-created', (_event, contents) => {
    contents.session.setPermissionRequestHandler((_wc, _permission, callback) => callback(false));
    contents.session.setPermissionCheckHandler(() => false);
  });
}
