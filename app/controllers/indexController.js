'use strict';

var bodyParser = require('body-parser');
var mysql = require('mysql');
var jwt = require('jsonwebtoken');
var Notification = require('../models/Notification');
var Sequelize = require('sequelize');

var urlencodedParser = bodyParser.urlencoded({ extended: false });

/* GET - Index page */
module.exports.indexPage = function(req, res) {
    res.render('index');
};

/* GET - Dashboard page */
module.exports.dashboardPage = async function(req, res) {
    // console.log("TOKEN: " + req.cookies.jwt);
    jwt.verify(req.cookies.jwt, 'secret', async function(err, authData) {
        if(err) {
            res.sendStatus(403);
        } else {
            userData = authData;
            console.log(userData);

            var notificationsArray = await loadNotifications()
            res.render('dashboard', {
                notificationsArray
            });
        }
    });
};

/* GET - Notifications page */
module.exports.notificationsPage = async function(req, res) {
    // console.log("TOKEN: " + req.cookies.jwt);
    jwt.verify(req.cookies.jwt, 'secret', async function(err, authData) {
        if(err) {
            res.sendStatus(403);
        } else {
            userData = authData;
            console.log('USER DATA')
            console.log(userData);

            var notificationsArray = await loadNotifications()
            res.render('notifications', {
                notificationsArray
            });
        }
    });
};

async function loadNotifications () {
	var notificationsArray
	// Get all rooms 
    const Op = Sequelize.Op;
	await Notification.findAll({
        raw: true,
        where: {
            [Op.or]: [
                { [Op.and]: [{ recipient_class: userData.user.usertype }, { recipient_id: null }] },
                { [Op.and]: [{ recipient_class: userData.user.usertype }, { recipient_id: userData.user.id }] }
            ]
        }
	})
		.then(notifications => {
            var messageArray = []
            
			notifications.forEach(function(notification) {
				messageArray.push(notification)
            })
            messageArray.sort(function(a, b) {
				return b.issue_time - a.issue_time
			})
			// console.log("Rooms data loaded.")
			console.log("ALL Notifications")
			console.log(messageArray)

			notificationsArray = messageArray
		})

	return notificationsArray
}