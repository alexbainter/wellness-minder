const { app, Tray } = require('electron');
const { createStore, applyMiddleware } = require('redux');
const makeMiddleware = require('./store/make-middleware');
const reducer = require('./store/reducer');
const stateChanged = require('./store/state-changed.creator');

let tray;
app.on('ready', () => {
  tray = new Tray('./assets/eye-open.png');
  tray.setToolTip('Wellness Minder');
  const store = createStore(reducer, applyMiddleware(makeMiddleware(tray)));
  store.dispatch(stateChanged({ isRunning: true, time: 0 }));
});
app.on('window-all-closed', e => {
  e.preventDefault();
});
