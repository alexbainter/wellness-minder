'use strict';

const STATE_CHANGED = require('./state-changed.type');

const reducer = (state = { time: 0, isRunning: false }, action) => {
  switch (action.type) {
    case STATE_CHANGED: {
      return { ...state, ...action.payload };
    }
    default: {
      return state;
    }
  }
};

module.exports = reducer;
