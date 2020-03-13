const path = require('path');
const { Menu, BrowserWindow } = require('electron');
const STATE_CHANGED = require('./state-changed.type');
const stateChanged = require('./state-changed.creator');

const makeMiddleware = tray => {
  let currentTimeout;
  let currentWindow;
  let initialized = false;
  return store => next => action => {
    if (action.type !== STATE_CHANGED) {
      return next(action);
    }
    const previousState = store.getState();
    const result = next(action);
    const nextState = store.getState();
    if (nextState.isRunning) {
      tray.setImage('./assets/eye-open.png');
      if (previousState.time !== nextState.time) {
        clearTimeout(currentTimeout);
        let message;
        if (nextState.time > 0) {
          if (nextState.time % 60 === 0) {
            message = 'Take a break.';
          } else if (nextState.time % 20 === 0) {
            message = 'Look at something 20 feet away for 20 seconds.';
          }
        }
        if (message) {
          currentWindow = new BrowserWindow({
            width: 400,
            height: 200,
            alwaysOnTop: true,
            frame: false,
            webPreferences: {
              nodeIntegration: true,
            },
          });
          currentWindow.loadURL(
            'file://' + path.join(__dirname, '..', 'alert.html')
          );
          currentWindow.text = message;
          currentWindow.on('close', e => {
            const { isRunning } = store.getState();
            if (isRunning) {
              currentTimeout = setTimeout(() => {
                store.dispatch(stateChanged({ time: nextState.time + 1 }));
              }, 60 * 1000);
            }
          });
        } else {
          currentTimeout = setTimeout(() => {
            store.dispatch(stateChanged({ time: nextState.time + 1 }));
          }, 100);
        }
      } else if (!previousState.isRunning) {
        currentTimeout = setTimeout(() => {
          store.dispatch(stateChanged({ time: nextState.time + 1 }));
        }, 60 * 1000);
      }
    } else {
      tray.setImage('./assets/eye-close.png');
      clearTimeout(currentTimeout);
    }
    tray.setContextMenu(
      Menu.buildFromTemplate([
        {
          label: `${20 - (nextState.time % 20)}m to go...`,
          enabled: false,
        },
        {
          label: nextState.isRunning ? 'Pause' : 'Resume',
          click: () => {
            store.dispatch(stateChanged({ isRunning: !nextState.isRunning }));
          },
        },
        {
          label: 'Reset timer',
          click: () => {
            store.dispatch(stateChanged({ time: 0 }));
          },
        },
        {
          label: 'Start at...',
          submenu: [
            {
              label: 'Beginning',
              click: () => {
                store.dispatch(stateChanged({ time: 0, isRunning: true }));
              },
            },
            {
              label: '20 minute eye rest',
              click: () => {
                store.dispatch(stateChanged({ time: 20, isRunning: true }));
              },
            },
            {
              label: '40 minute eye rest',
              click: () => {
                store.dispatch(stateChanged({ time: 40, isRunning: true }));
              },
            },
            {
              label: '60 minute break',
              click: () => {
                store.dispatch(stateChanged({ time: 60, isRunning: true }));
              },
            },
          ],
        },
      ])
    );
    return result;
  };
};

module.exports = makeMiddleware;
