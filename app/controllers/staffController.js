'use strict';

var bodyParser = require('body-parser');
var mysql = require('mysql');
var Receptionist = require('../models/Receptionist');
var Schedule = require('../models/Schedule');
var Sequelize = require('sequelize');

var urlencodedParser = bodyParser.urlencoded({ extended: false });

/* GET - Schedule page */
module.exports.schedulePage = async function (req, res) {
	var values = await loadTimetable()
	var workshifts = values[0]
	var datesarray = values[1]
	var receptionistMap = await loadReceptionists()

	res.render("schedule", {
		workshifts,
		datesarray,
		receptionistMap
	})
}

/* POST - Modify schedule */
module.exports.modifySchedule = async function (req, res) {
	var { dropdown_receptionist, dropdown_date, dropdown_shift } = req.body
	var firstName = dropdown_receptionist.split(' ')[0]
	var lastName = dropdown_receptionist.split(' ')[1]
	var id
	await Receptionist.findOne({
		where: {firstname: firstName, lastname: lastName}
	})
		.then(function(receptionist) {
			id = receptionist.id
		})
	console.log(firstName)
	console.log(lastName)
	console.log(id)
	
	// Get all rooms with capacity desired by the user
	const Op = Sequelize.Op
	await Schedule.update({
		receptionist_id: id,
		firstname: firstName,
		lastname: lastName}, 
		{
		where: {
			date: dropdown_date,
			shift: dropdown_shift
		}
	})
	
	var values = await loadTimetable()
	var workshifts = values[0]
	var datesarray = values[1]
	var receptionistMap = await loadReceptionists()

	res.render("schedule", {
		workshifts,
		datesarray,
		receptionistMap
	})
}

async function loadTimetable() {
	var workshifts, datesarray
	// Get all rooms 
	const Op = Sequelize.Op;
	await Schedule.findAll({
		raw: true
	})
		.then(workShifts => {
			workShifts.forEach(function(workShift) {
				// Get an array of workshift dates
				var date = new Date(workShift.date)

				// Set the weekday
				var weekday = new Array(7)
				weekday[0] = "Sunday"
				weekday[1] = "Monday"
				weekday[2] = "Tuesday"
				weekday[3] = "Wednesday"
				weekday[4] = "Thursday"
				weekday[5] = "Friday"
				weekday[6] = "Saturday"
				workShift["day"] = weekday[date.getDay()]
			})

			// Sort shifts in ascending order (given date and shift number)
			workShifts.sort(function(a, b) {
				var date1 = new Date(a.date)
				var date2 = new Date(b.date)
				return date1 - date2 || a.shift - b.shift
			})

			// Get an array of all the distinct dates
			var datesArray = []
			workShifts.forEach(function(workShift) {
				if (!datesArray.includes(workShift.date)) {
					datesArray.push(workShift.date)
				}
			})

			datesarray = datesArray
			workshifts = workShifts
		})

	return [workshifts, datesarray]
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