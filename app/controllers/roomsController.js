'use strict';

var bodyParser = require('body-parser');
var mysql = require('mysql');

var urlencodedParser = bodyParser.urlencoded({ extended: false });

/* GET - Accommodation page */
module.exports.accommodationPage = function(req, res) {
    res.render('accommodation', { layout: 'accommodation.ejs' });
};