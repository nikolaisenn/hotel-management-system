'use strict';

var bodyParser = require('body-parser');
var mysql = require('mysql');
var jwt = require('jsonwebtoken');
var Notification = require('../models/Notification');
var Sequelize = require('sequelize');

var urlencodedParser = bodyParser.urlencoded({ extended: false });

/* POST - Delete notification */
module.exports.deleteNotification = function(req, res) {
    console.log("DELETE NOTIFICATION")
    console.log(req.body)
};

