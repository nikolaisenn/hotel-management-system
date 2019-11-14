'use strict';

var bodyParser = require('body-parser');
var mysql = require('mysql');

var urlencodedParser = bodyParser.urlencoded({ extended: false });

/* GET - Index page */
module.exports.indexPage = function(req, res) {
    res.render('index');
};

/* GET - Dashboard page */
module.exports.dashboardPage = function(req, res) {
    res.send("HELLO");
    // res.render('dashboard', {
    //     name: req.user.name
    // });
};