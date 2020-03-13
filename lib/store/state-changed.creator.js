'use strict';

const type = require('./state-changed.type');

module.exports = (payload = {}) => ({ type, payload });
