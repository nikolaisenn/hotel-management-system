'use strict';

var bodyParser = require('body-parser');
var mysql = require('mysql');
var jwt = require('jsonwebtoken');
var Notification = require('../models/Notification');
var Reservation = require('../models/Reservation');
var Announcement = require('../models/Announcement');
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

/* POST - Delete notification */
module.exports.cancelReservation = async function(req, res) {
    var { reservationID } = req.body;
    console.log("DELETE NOTIFICATION")
    console.log(req.body)

    // Get all rooms 
	const Op = Sequelize.Op;
	Reservation.destroy({
        where: {
            id: reservationID
        }
    })

    res.redirect("/dashboard/reservations")
};

/* POST - Publish announcement */
module.exports.publishAnnouncement = async function(req, res) {
    var { announcementText } = req.body
    var now = new Date()

    const newAnnouncement = Announcement.build({
        text: announcementText,
        publishDate: now
    })
    
    newAnnouncement.save()
		.then(function () {
			// Create a flash message
			req.flash('success_msg', 'Your announcement was published successfully');
			res.redirect('/dashboard/settings');
		})
		.catch(function (err) { console.log(err) });
};

