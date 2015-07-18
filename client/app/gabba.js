// POLYMER COMPONENTS
require('../_bower/paper-button/paper-button.html');
require('../_bower/iron-collapse/iron-collapse.html');

let Cookies = require('../_bower/cookies-js/dist/cookies')(window),
    Gabba = window.Gabba = require('./_modules/gabba')();

console.log(Cookies);

// GABBA TEMPLATES
require('../_dist/templates/login-form.html');
require('../_dist/templates/register-form.html');
