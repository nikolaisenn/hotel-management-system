'use strict';

var bodyParser = require('body-parser');
var mysql = require('mysql');
var Room = require('../models/Room');
var Reservation = require('../models/Reservation');
var Notification = require('../models/Notification');
var Sequelize = require('sequelize');

var urlencodedParser = bodyParser.urlencoded({ extended: false });

/* GET - Accommodation page */
module.exports.accommodationPage = async function (req, res) {
	var roomsArray = await loadRoomsData_accommodation()
	res.render('accommodation', {
		roomsArray
	})
};

/* GET - Pricing page */
module.exports.pricingPage = async function (req, res) {
	var roomsType = await loadRoomsData_pricing()
	console.log(roomsType)
	res.render('pricing', {
		roomsType
	})
};

/* GET - Availability page */
module.exports.availabilityPage = async function (req, res) {
	let errors = [];
	// Require valid user input (specify check-in, check-out and the number of people)
	if(req.body.date_checkin == '') {
		errors.push({ msg: 'Please provide a check-in date' })
	}
	if(req.body.date_checkout == '') {
		errors.push({ msg: 'Please provide a check-out date' })
	}
	if(req.body.dropdown_adult + req.body.dropdown_children == 0) {
		errors.push({ msg: 'Please specify the number of people' })
	}
	if (errors.length > 0) {
		res.render('accommodation', {
			errors
		});
	}

	// Obtain values from input forms 
	var { date_checkin, date_checkout, dropdown_type, dropdown_adult, dropdown_children } = req.body;
	console.log(req.body)
	console.log(date_checkin)
	console.log(date_checkout)
	date_checkin = new Date(date_checkin)
	date_checkin.setHours(12)
	date_checkout = new Date(date_checkout)
	date_checkout.setHours(12)
	dropdown_adult = parseInt(dropdown_adult)
	dropdown_children = parseInt(dropdown_children)
	console.log(date_checkin)
	console.log(date_checkout)

	// Get all rooms with capacity desired by the user
	const Op = Sequelize.Op;
	var rooms = await Room.findAll({
		raw: true,
		attributes: [['id', 'id'],['capacity', 'capacity'],['price_adult', 'price_adult'],['price_child', 'price_child']],
		include: [{
			model: Reservation,
			attributes: [['date_in', 'date_in'],['date_out', 'date_out']],
			required: false
		}],
		where: {
			'$room.capacity$': [dropdown_adult + dropdown_children],
			'$room.type$': [dropdown_type]
		},
		group: ['id', 'capacity', 'price_adult', 'price_child', 'date_in', 'date_out']
	})
		if (rooms.length > 0) {
			rooms = getAvailableRooms(rooms, date_checkin, date_checkout)
			var room_ids = getRoomsIDs(rooms)

			res.render('accommodation', {
				rooms,
				room_ids,
				dropdown_adult,
				dropdown_children,
				date_checkin,
				date_checkout
			});
			
		}
		else {
			errors.push({ msg: 'There are currently no available rooms matching the selection criteria.' })
			res.render('accommodation', {
				errors
			});
		}
}

/* POST room information */
module.exports.roomInformation = async function (req, res) {
	var {thisRoomID} = req.body
	console.log(req.body)

	// Load data
	var roomsArray = await loadRoomsData_accommodation()

	// Get all reservations with the given room id
	const Op = Sequelize.Op;
	Reservation.findAll({
		raw: true,
		where: {
			room_id: thisRoomID
		}
	})
		.then(reservations => {
			var reservationsMap = new Map()
			var dateinSorted = []
			var dateoutSorted = []
			reservations.forEach(function(reservation) {
				dateinSorted.push(reservation.date_in)
				dateoutSorted.push(reservation.date_out)
			})
			dateinSorted.sort(function(a, b) {
				return a - b
			})
			dateoutSorted.sort(function(a, b) {
				return a - b
			})	
			console.log("HERE")
			dateinSorted.forEach(function(date) {
				console.log(date)
			})

			for (var i = 0; i < dateinSorted.length; i++) {
				var datein = dateinSorted[i].getDate() + "/" + (dateinSorted[i].getMonth() + 1) + "/" + dateinSorted[i].getFullYear()
				var dateout = dateoutSorted[i].getDate() + "/" + (dateoutSorted[i].getMonth() + 1) + "/" + dateoutSorted[i].getFullYear()
				reservationsMap.set(datein, dateout)
			}
			console.log(reservationsMap)
			
			res.render('accommodation', {
				roomsArray,
				reservationsMap
			})
		})
}

/* POST booking */
module.exports.booking = function (req, res) {
	var { fromDate, toDate, room_ids} = req.body;
	var checkin = new Date(fromDate)
	var checkout = new Date(toDate)
	var ids = room_ids.split(",")
	console.log(req.body)
	console.log(checkin)
	console.log(checkout)
	var randomID = ids[Math.floor(Math.random() * ids.length)];

	// Reservations start and end at 12pm
	checkin.setHours(12);
	checkout.setHours(12);

	const newReservation = Reservation.build({
		date_in: checkin,
		date_out: checkout,
		room_id: randomID
	})
	// console.log("New reservation details...");
	// console.log(newReservation);
	newReservation.save()
		.then(function (user) {
			// Create a flash message
			req.flash('success_msg', 'Your room was booked successfully');
			res.redirect('accommodation');
		})
		.catch(function (err) { console.log(err) });
}

/* POST edit adult price */
module.exports.editPrice = async function (req, res) {
	var { dropdown_type, dropdown_priceClass, newPrice} = req.body
	console.log("REQ BODY")
	console.log(req.body)
	console.log(dropdown_type == undefined)
	console.log(dropdown_priceClass == undefined)
	
	let errors = [];
	// Require valid user input (specify check-in, check-out and the number of people)
	if(isNaN(newPrice) || newPrice <= 0) {
		errors.push({ msg: 'Please enter a valid price' })
	}
	if(dropdown_type == undefined || dropdown_priceClass == undefined) {
		errors.push({ msg: 'Please select a value for all inputs'})
	}
	if (errors.length > 0) {
		// Load data
		var roomsType = await loadRoomsData_pricing()

		res.render('pricing', {
			roomsType,
			errors
		})
	}
	
	// Get all rooms with capacity desired by the user
	const Op = Sequelize.Op

	if(dropdown_priceClass == 'Price Adult' && dropdown_priceClass != undefined) {
		await Room.update({ price_adult: newPrice}, {
			where: {
				type: dropdown_type
			}
		})
			.catch(function (err) { console.log(err) });
	}
	if (dropdown_priceClass == 'Price Child' && dropdown_priceClass != undefined) {
		await Room.update({ price_child: newPrice}, {
			where: {
				type: dropdown_type
			}
		})
			.catch(function (err) { console.log(err) });
	}

	// Send a notification to all managers
	const newNotification = Notification.build({
		recipient_class: 'owner',
		message: dropdown_priceClass + ' for ' + dropdown_type + ' room was changed to ' + newPrice,
		issue_time: new Date().toLocaleString()
	})
	await newNotification.save()
	
	// Load data
	var roomsType = await loadRoomsData_pricing()

	res.render('pricing', {
		roomsType
	})
}

/* POST edit adult price - owner */
module.exports.editPriceOwner = async function (req, res) {
	var { dropdown_type, dropdown_priceClass, newPrice} = req.body
	console.log("REQ BODY")
	console.log(req.body)
	console.log(dropdown_type == undefined)
	console.log(dropdown_priceClass == undefined)
	
	let errors = [];
	// Require valid user input (specify check-in, check-out and the number of people)
	if(isNaN(newPrice) || newPrice <= 0) {
		errors.push({ msg: 'Please enter a valid price' })
	}
	if(dropdown_type == undefined || dropdown_priceClass == undefined) {
		errors.push({ msg: 'Please select a value for all inputs'})
	}
	if (errors.length > 0) {
		// Load data
		var roomsType = await loadRoomsData_pricing()
		var notificationsArray = await loadNotifications()

		res.render('settings', {
			roomsType,
			notificationsArray,
			errors
		})
	}
	
	// Get all rooms with capacity desired by the user
	const Op = Sequelize.Op

	if(dropdown_priceClass == 'Price Adult' && dropdown_priceClass != undefined) {
		await Room.update({ price_adult: newPrice}, {
			where: {
				type: dropdown_type
			}
		})
			.catch(function (err) { console.log(err) });
	}
	if (dropdown_priceClass == 'Price Child' && dropdown_priceClass != undefined) {
		await Room.update({ price_child: newPrice}, {
			where: {
				type: dropdown_type
			}
		})
			.catch(function (err) { console.log(err) });
	}

	// Send a notification to all managers
	const newNotification = Notification.build({
		recipient_class: 'owner',
		message: dropdown_priceClass + ' for ' + dropdown_type + ' room was changed to ' + newPrice,
		issue_time: new Date().toLocaleString()
	})
	await newNotification.save()
	
	// Load data
	var roomsType = await loadRoomsData_pricing()
	var notificationsArray = await loadNotifications()

	res.render('settings', {
		roomsType,
		notificationsArray
	})
}

/* POST receptionist booking */
module.exports.receptionistBooking = async function (req, res) {
	var { roomNumber, roomCapacity, date_checkin, date_checkout, firstname, lastname, email, phone, numberOfRooms} = req.body;
	roomNumber = parseInt(roomNumber)
	var checkin = new Date(date_checkin)
	var checkout = new Date(date_checkout)

	let errors = [];
	// Require valid user input (specify check-in, check-out and the number of people)
	if (!date_checkin || !date_checkout || !roomNumber || !email) {
		errors.push({ msg: 'Please fill in all mandatory fields' });
	}
	if(date_checkin == '') {
		errors.push({ msg: 'Please provide a check-in date' })
	}
	if(date_checkout == '') {
		errors.push({ msg: 'Please provide a check-out date' })
	}
	if(isNaN(roomNumber) || roomNumber <= 0 || roomNumber > numberOfRooms) {
		errors.push({ msg: 'Please select an existing room' })
	}
	if (errors.length > 0) {
		// Load data 
		var roomsArray = await loadRoomsData_accommodation()
		res.render('accommodation', {
			roomsArray,
			errors
		})
	}
	// Reservations start and end at 12pm
	checkin.setHours(12);
	checkin.setMinutes(1);
	checkout.setHours(12);
	checkout.setMinutes(1);

	// Check if the reservation is possible 
	const Op = Sequelize.Op;
	var matchingReservations = await Reservation.findAll({
		where : {
			room_id: roomNumber,
			[Op.or]: {
				date_in: {[Op.between]: [checkin, checkout]},
				date_out: {[Op.between]: [checkin, checkout]}
			}
		}
	})
	console.log("MATCHING")
	console.log(matchingReservations)

	if (matchingReservations.length == 0) {
		const newReservation = Reservation.build({
			date_in: checkin,
			date_out: checkout,
			email: email,
			room_id: roomNumber
		})
		await newReservation.save()
	
		// Send a notification to all managers
		const newNotification = Notification.build({
			recipient_class: 'manager',
			message: 'Room ' + roomNumber + ' was booked',
			issue_time: new Date().toLocaleString()
		})
		await newNotification.save()	

		// Load data 
		var roomsArray = await loadRoomsData_accommodation()
		// Create a flash message
		req.flash('success_msg', 'Your room was booked successfully');
		res.redirect('accommodation')
	} 
	else {
		errors.push({ msg: 'The room is unavailable for that period.' })
		// Load data 
		var roomsArray = await loadRoomsData_accommodation()
		res.render('accommodation', {
			roomsArray,
			errors
		})
	}
}

function getAvailableRooms(rooms, date_checkin, date_checkout) {
	var i;
	var j;
	var length = rooms.length;
	var startingLength = rooms.length;
	var removedItemsCount = 0;
	rooms.sort(function(a, b) {
		return a.id - b.id
	});
	console.log(rooms)
	// Check if the room reservations are conflicting with the desired dates by the user
	// If that is the case, cut all room instances with this id from the rooms array
	// Check for undefined because the outer for loop uses the initial length, which shortens during execution
	for (i = 0; i < startingLength; i++) {
		if (rooms[i-removedItemsCount] != undefined) {
			if ((rooms[i-removedItemsCount]['reservations.date_in'] >= date_checkin && rooms[i-removedItemsCount]['reservations.date_in'] < date_checkout) 
				|| (rooms[i-removedItemsCount]['reservations.date_out'] > date_checkin && rooms[i-removedItemsCount]['reservations.date_out'] <= date_checkout)) {
				console.log("Thе room with id " + rooms[i-removedItemsCount].id + " should not appear in results");
				var conflictRoom = rooms[i-removedItemsCount]
				
				// Reset removed items count before cutting room instances
				removedItemsCount = 0;
				for (j = 0; j < length; j++) {
					if (rooms[j-removedItemsCount].id == conflictRoom.id) {
						rooms.splice(j - removedItemsCount, 1)
						removedItemsCount++
					}
				}
				// Reset length after cutting room instances
				length = rooms.length
			}
		}
	}

	// Remove duplicate rooms from the rooms array
	length = rooms.length;
	removedItemsCount = 0;
	var duplicateRooms = []
	for (i = 0; i < length; i++) {
		if (!duplicateRooms.includes(rooms[i-removedItemsCount].id, 0)) {
			duplicateRooms.push(rooms[i-removedItemsCount].id)
		} else {
			rooms.splice(i - removedItemsCount, 1)
			removedItemsCount++
		}

	}
	console.log('Result rooms')
	console.log(rooms)
	return rooms
}

// function getAllRooms(roomCapacity) {
// 	// Get all rooms with capacity desired by the user
// 	const Op = Sequelize.Op;
// 	Room.findAll({
// 		raw: true,
// 		attributes: [['id', 'id'],['capacity', 'capacity']],
// 		include: [{
// 			model: Reservation,
// 			attributes: [['date_in', 'date_in'],['date_out', 'date_out']],
// 			required: false
// 		}],
// 		where: {
// 			'$room.capacity$': roomCapacity
// 		},
// 		group: ['id', 'capacity', 'date_in', 'date_out']
// 	})
// 		.then(rooms => {
// 			var roomsArray = []
// 			rooms.forEach(function(room) {
// 				roomsArray.push(room)
// 			})
// 			console.log("Rooms data loaded.")
// 			console.log("GET ALL ROOMS")
// 			console.log(roomsArray)
// 		})
// }

/* ----------------------------------------------------------------------------------------------------------------------------------
   -------------------------------------------------------- HELPER FUNCTIONS -------------------------------------------------------- 
   ---------------------------------------------------------------------------------------------------------------------------------- */

function getRoomsIDs (rooms) {
	var room_ids = []
	rooms.forEach(function(room) {
		room_ids.push(room.id)
	})

	return room_ids
}

async function loadRoomsData_accommodation () {
	var roomArray
	// Get all rooms 
	const Op = Sequelize.Op;
	await Room.findAll({
		raw: true
	})
		.then(rooms => {
			var roomsArray = []
			rooms.forEach(function(room) {
				roomsArray.push(room)
			})
			// console.log("Rooms data loaded.")
			// console.log("ALL ROOMS")
			// console.log(roomsArray)

			roomArray = roomsArray
		})

	return roomArray
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
			// console.log("Rooms data (grouped by type) loaded.")
			// console.log("ALL ROOMS")
			// console.log(roomsType)

			roomTypes = roomsType
		})
	
	return roomTypes
}

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