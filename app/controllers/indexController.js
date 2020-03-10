'use strict';

var bodyParser = require('body-parser');
var mysql = require('mysql');
var jwt = require('jsonwebtoken');
var Notification = require('../models/Notification');
var Receptionist = require('../models/Receptionist');
var Reservation = require('../models/Reservation');
var Payslip = require('../models/Payslip');
var Room = require('../models/Room');
var Sequelize = require('sequelize');

var urlencodedParser = bodyParser.urlencoded({ extended: false });

/* GET - Index page */
module.exports.indexPage = async function(req, res) {
    // Load data
	var roomsType = await loadRoomsData_pricing()
    res.render('index', {
        roomsType
    });
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

/* GET - Payslip page */
module.exports.paymentPage = async function(req, res) {
    // console.log("TOKEN: " + req.cookies.jwt);
    jwt.verify(req.cookies.jwt, 'secret', async function(err, authData) {
        if(err) {
            res.sendStatus(403);
        } else {
            userData = authData;
            console.log('USER DATA')
            console.log(userData)

            var monthsArray = await loadMonthsArray()
            var receptionistMap = await loadReceptionists()
            var notificationsArray = await loadNotifications()
            var payslipsArray = await loadPayslips()
            var userReservations = await loadUserReservations()
            console.log("RESULTS")
            console.log(userReservations)
            console.log(monthsArray)
            console.log(receptionistMap)
            res.render('payment', {
                receptionistMap,
                monthsArray,
                notificationsArray,
                payslipsArray,
                userReservations
            })
        }
    });
};

/* GET - Progress page */
module.exports.progressPage = async function(req, res) {
    // console.log("TOKEN: " + req.cookies.jwt);
    jwt.verify(req.cookies.jwt, 'secret', async function(err, authData) {
        if(err) {
            res.sendStatus(403);
        } else {
            userData = authData;
            console.log('USER DATA')
            console.log(userData);

            var notificationsArray = await loadNotifications()
            res.render('progress', {
                notificationsArray
            });
        }
    });
};

/* GET - Settings page */
module.exports.settingsPage = async function(req, res) {
    // console.log("TOKEN: " + req.cookies.jwt);
    jwt.verify(req.cookies.jwt, 'secret', async function(err, authData) {
        if(err) {
            res.sendStatus(403);
        } else {
            userData = authData;
            console.log('USER DATA')
            console.log(userData);

            var roomsType = await loadRoomsData_pricing()
            var notificationsArray = await loadNotifications()
            res.render('settings', {
                roomsType,
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

async function loadPayslips () {
	var payslipsArray = []
	// Get all rooms 
    const Op = Sequelize.Op;
	await Payslip.findAll({
        raw: true,
        where: {
            receptionist_id: userData.user.receptionist_id
        }
	})
		.then(payslips => {
			payslips.forEach(function(payslip) {
				payslipsArray.push(payslip)
            })
		})

	return payslipsArray
}

async function loadRoomsData_pricing () {
	var roomTypes
	// Get all rooms 
	const Op = Sequelize.Op;
	await Room.findAll({
		raw: true,
		attributes: [['type', 'type'],['price_adult', 'price_adult'],['price_child', 'price_child']],
		group: ['type', 'price_adult', 'price_child']
	})
		.then(rooms => {
			var roomsType = []
			rooms.forEach(function(room) {
				roomsType.push(room)
			})
			console.log("Rooms data (grouped by type) loaded.")
			console.log("ALL ROOMS")
			console.log(roomsType)

			roomTypes = roomsType
		})
	
	return roomTypes
}

async function loadReceptionists() {
	var receptionistMap
	// Get all rooms 
	const Op = Sequelize.Op;
	await Receptionist.findAll({
		raw: true
	})
		.then(receptionistMembers => {
			// Get all receptionist names
			var receptionistsMap = new Map()
			receptionistMembers.forEach(function(receptionist) {
				var fullName = receptionist.firstname + " " + receptionist.lastname
				var id = receptionist.id
				receptionistsMap.set(fullName, id)
			})

			receptionistMap = receptionistsMap
		})

	return receptionistMap
}

async function loadUserReservations() {
	// Get all rooms 
	const Op = Sequelize.Op;
	var userReservations = await Reservation.findAll({
        raw: true,
        where : {
            user_id: userData.user.id
        }
	})

    userReservations.sort(function(a, b) {
        return a.room_id - b.room_id
    })

	return userReservations
}

async function loadMonthsArray() {
    var now = new Date()
    var monthsArray = []
    switch (now.getMonth()) {
        case 0: 
            monthsArray[0] = 'December';
            monthsArray[1] = 'January';
            break;
        case 1:
            monthsArray[0] = 'January';
            monthsArray[1] = 'February';
            break;
        case 2:
            monthsArray[0] = 'February';
            monthsArray[1] = 'March';
            break;
        case 3:
            monthsArray[0] = 'March';
            monthsArray[1] = 'April';
            break;
        case 4:
            monthsArray[0] = 'April';
            monthsArray[1] = 'May';
            break;
        case 5:
            monthsArray[0] = 'May';
            monthsArray[1] = 'June';
            break;
        case 6:
            monthsArray[0] = 'June';
            monthsArray[1] = 'July';
            break;
        case 7:
            monthsArray[0] = 'July';
            monthsArray[1] = 'August';
            break;
        case 8:
            monthsArray[0] = 'August';
            monthsArray[1] = 'September';
            break;
        case 9:
            monthsArray[0] = 'September';
            monthsArray[1] = 'October';
            break;
        case 10:
            monthsArray[0] = 'October';
            monthsArray[1] = 'November';
            break;
        case 11:
            monthsArray[0] = 'November';
            monthsArray[1] = 'December';
            break;
    }

    return monthsArray
}