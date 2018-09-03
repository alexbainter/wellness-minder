const { app, Menu, Tray } = require('electron');
const notifier = require('node-notifier');

const eyeInterval = 21;
const breakInterval = 60;

const reminders = [
  {
    name: '20-20-20 Rule',
    message: 'Look at something at least 20 feet away for 20 seconds',
    intervalTimeMinutes: eyeInterval,
    minutesRemaining: eyeInterval,
  },
  {
    name: 'Hourly Breaks',
    message: 'Take a 5 minute break',
    intervalTimeMinutes: breakInterval,
    minutesRemaining: breakInterval,
  },
];

const getLabel = ({ name, minutesRemaining }) =>
  `${name} (next in ${minutesRemaining}m)`;

const startInterval = reminder => {
  reminder.interval = setInterval(() => {
    notifier.notify({
      message: reminder.message,
      title: 'Wellness Minder',
      timeout: 60,
    });
  }, reminder.intervalTimeMinutes * 60 * 1000);
};

let trayIcon;
const makeMenuTemplate = () =>
  reminders.map(reminder => ({
    label: getLabel(reminder),
    type: 'checkbox',
    checked: true,
    click: ({ checked }) => {
      if (checked) {
        startInterval(reminder);
      } else {
        clearInterval(reminder.interval);
      }
    },
  }));

app.on('ready', () => {
  trayIcon = new Tray('./face.png');
  trayIcon.setToolTip('Wellness Minder');
  setInterval(() => {
    reminders.forEach((reminder, i) => {
      const { minutesRemaining } = reminder;
      reminder.minutesRemaining =
        minutesRemaining === 1
          ? reminder.intervalTimeMinutes
          : minutesRemaining - 1;
    });
    trayIcon.setContextMenu(Menu.buildFromTemplate(makeMenuTemplate()));
  }, 60 * 1000);
  reminders.forEach(reminder => {
    startInterval(reminder);
  });
  trayIcon.setContextMenu(Menu.buildFromTemplate(makeMenuTemplate()));
});
