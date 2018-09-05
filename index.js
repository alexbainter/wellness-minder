const { app, Menu, Tray, BrowserWindow } = require('electron');

let win;
let running = true;

const tick = timeInMinutes => {
  if (running) {
    if (timeInMinutes > 0) {
      let message;
      if (timeInMinutes % 60 === 0) {
        message = 'Take a break.';
      } else if (timeInMinutes % 20 === 0) {
        message = 'Look at something 20 feet away for 20 seconds.';
      }
      if (message) {
        running = false;
        win = new BrowserWindow({
          width: 400,
          height: 200,
          alwaysOnTop: true,
          frame: false,
        });
        win.loadURL('file://' + __dirname + '/alert.html');
        win.text = message;
        win.on('close', e => {
          running = true;
          tick(timeInMinutes + 1);
        });
        return;
      }
    }
    setTimeout(() => tick(timeInMinutes + 1), 100);
  }
};

const makeTurnOn = trayIcon => () => {
  running = true;
  tick(0);
  trayIcon.setContextMenu(
    Menu.buildFromTemplate([
      { label: 'Turn Off', click: makeTurnOff(trayIcon) },
    ])
  );
};

const makeTurnOff = trayIcon => () => {
  running = false;
  trayIcon.setContextMenu(
    Menu.buildFromTemplate([{ label: 'Turn On', click: makeTurnOn(trayIcon) }])
  );
};

let trayIcon;
app.on('ready', () => {
  trayIcon = new Tray('./face.png');
  trayIcon.setToolTip('Wellness Minder');
  makeTurnOn(trayIcon)();
});
app.on('window-all-closed', e => {
  e.preventDefault();
});
