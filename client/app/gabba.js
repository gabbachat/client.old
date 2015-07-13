// POLYMER COMPONENTS
require('../_bower/paper-button/paper-button.html')
require('../_bower/iron-collapse/iron-collapse.html')

var Gabba = window.Gabba = require('./_modules/gabba')();

Gabba.Login = require('./_modules/login')();

// GABBA TEMPLATES
require('../_dist/templates/login-form.html');
