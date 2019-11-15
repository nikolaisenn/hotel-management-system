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
	var { date_checkin, date_checkout, dropdown_adult, dropdown_children } = req.body;
	req.body.date_checkin = new Date(date_checkin);
	req.body.date_checkout = new Date(date_checkout);
	console.log(req.body.date_checkin);
	console.log(req.body.date_checkout);
	console.log(parseInt(dropdown_adult));
	console.log(parseInt(dropdown_children));

	/* Get all rooms with capacity = adults + children AND available dates */
	const Op = Sequelize.Op;
	Room.findAll({
		raw: true,
		include: [{
			model: Reservation,
			required: false
		}],
		where: {
			[Op.and]: [
				{ '$room.capacity$': [parseInt(dropdown_adult) + parseInt(dropdown_children)] },
				{ '$reservations.date_in$': { [Op.notBetween]: [req.body.date_checkin, req.body.date_checkout] } },
				{ '$reservations.date_out$': { [Op.notBetween]: [req.body.date_checkin, req.body.date_checkout] } }
			]
		}
	})
		.then(rooms => {
			if (rooms) {
				console.log(rooms);
				console.log(rooms.length);
				res.render('accommodation', {
					layout: 'accommodation.ejs',
					rooms,
					dropdown_adult,
					dropdown_children
				});
			}
			else {
				console.log('No rooms');
			}
		})
};