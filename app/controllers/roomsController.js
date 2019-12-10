'use strict';

var bodyParser = require('body-parser');
var mysql = require('mysql');
var Room = require('../models/Room');
var Reservation = require('../models/Reservation');
var Sequelize = require('sequelize');

var urlencodedParser = bodyParser.urlencoded({ extended: false });

/* GET - Accommodation page */
module.exports.accommodationPage = function (req, res) {
	res.render('accommodation', { layout: 'accommodation.ejs' });
};

/* GET - Availability page */
module.exports.availabilityPage = function (req, res) {
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
	var { date_checkin, date_checkout, dropdown_adult, dropdown_children } = req.body;
	date_checkin = new Date(date_checkin)
	date_checkout = new Date(date_checkout)
	dropdown_adult = parseInt(dropdown_adult)
	dropdown_children = parseInt(dropdown_children)

	// Get all rooms with capacity desired by the user
	const Op = Sequelize.Op;
	Room.findAll({
		raw: true,
		attributes: [['id', 'id'],['capacity', 'capacity']],
		include: [{
			model: Reservation,
			attributes: [['date_in', 'date_in'],['date_out', 'date_out']],
			required: false
		}],
		where: {
			'$room.capacity$': [dropdown_adult + dropdown_children]
		},
		group: ['id', 'capacity', 'date_in', 'date_out']
	})
		.then(rooms => {
			if (rooms) {
				var i;
				var j;
				var length = rooms.length;
				var removedItemsCount = 0;
				// Check if the room reservations are conflicting with the desired dates by the user
				// If that is the case, cut all room instances with this id from the rooms array
				for (i = 0; i < length; i++) {
					if ((rooms[i-removedItemsCount]['reservations.date_in'] >= date_checkin && rooms[i-removedItemsCount]['reservations.date_in'] <= date_checkout) 
						|| (rooms[i-removedItemsCount]['reservations.date_out'] >= date_checkin && rooms[i-removedItemsCount]['reservations.date_out'] <= date_checkout)) {
						console.log("Thе room with id " + rooms[i-removedItemsCount].id + " should not appear in results");
						var conflictRoom = rooms[i-removedItemsCount]
						// Reset rooms length and removed items count before cutting more room instances
						length = rooms.length
						removedItemsCount = 0;
						for (j = 0; j < length; j++) {
							if (rooms[j-removedItemsCount].id == conflictRoom.id) {
								rooms.splice(j - removedItemsCount, 1)
								removedItemsCount++
							}
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
				// console.log('Result rooms');
				// console.log(rooms);
				res.render('accommodation', {
					rooms,
					dropdown_adult,
					dropdown_children,
					date_checkin,
					date_checkout
				});
				
			}
			else {
				console.log('No rooms');
			}
		})
};

/* POST booking */
module.exports.booking = function (req, res) {
	var { fromDate, toDate, roomid} = req.body;
	console.log(fromDate);

	var checkin = new Date(fromDate);
	var checkout = new Date(toDate);
	var room_id = parseInt(roomid);
	console.log(checkin);
	console.log(checkout);
	console.log(room_id);
	const Op = Sequelize.Op;

	const newReservation = Reservation.build({
		date_in: checkin,
		date_out: checkout,
		room_id: room_id
	})

	console.log("New reservation details...");
	console.log(newReservation);

	newReservation.save()
		.then(function (user) {
			// Create a flash message
			req.flash('success_msg', 'Your room was booked successfully');
			res.redirect('accommodation');
		})
		.catch(function (err) { console.log(err) });
}