'use strict';

var bodyParser = require('body-parser');
var mysql = require('mysql');
var jwt = require('jsonwebtoken');

var urlencodedParser = bodyParser.urlencoded({ extended: false });

/* GET - Index page */
module.exports.indexPage = function(req, res) {
    res.render('index');
};

/* GET - Dashboard page */
module.exports.dashboardPage = function(req, res) {
    // console.log("TOKEN: " + req.token);
    // res.render('dashboard');
    jwt.verify(req.token, 'secret', function(err, authData) {
        if(err) {
            res.sendStatus(403);
        } else {
            userData = authData;
            console.log(userData);
            res.render('dashboard');
        }
    });
};