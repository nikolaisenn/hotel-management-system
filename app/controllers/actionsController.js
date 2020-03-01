'use strict';

var bodyParser = require('body-parser');
var mysql = require('mysql');
var jwt = require('jsonwebtoken');
var Notification = require('../models/Notification');
var Sequelize = require('sequelize');

var urlencodedParser = bodyParser.urlencoded({ extended: false });

/* POST - Delete notification */
module.exports.deleteNotification = async function(req, res) {
    var { notificationID } = req.body;
    console.log("DELETE NOTIFICATION")
    console.log(req.body)

    // Get all rooms 
	const Op = Sequelize.Op;
	Notification.destroy({
        where: {
            id: notificationID
        }
    })

    res.redirect("/dashboard/notifications")
};

