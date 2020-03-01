'use strict';

var bodyParser = require('body-parser');
var mysql = require('mysql');
var Receptionist = require('../models/Receptionist');
var Schedule = require('../models/Schedule');
var Notification = require('../models/Notification');
var Payslip = require('../models/Payslip');
var User = require('../models/User');
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

	var prevReceptionistID
	// Check if someone else was assigned this slot before updating
	await Schedule.findOne({
		where: {
			date: dropdown_date,
			shift: dropdown_shift
		}
	})
		.then(function(scheduleEntry) {
			console.log("FOUND ONE")
			console.log(scheduleEntry.firstname)
			if (scheduleEntry.receptionist_id != null) {
				// Record the id of the previously assigned receptionist
				prevReceptionistID = scheduleEntry.receptionist_id
			}
		})
	console.log("PREVIOUS RECEPTIONIST ID")
	console.log(prevReceptionistID)

	// Get the ID of the newly assigned receptionist
	await Receptionist.findOne({
		where: {firstname: firstName, lastname: lastName}
	})
		.then(function(receptionist) {
			id = receptionist.id
		})
	console.log("NEW RECEPTIONIST ID")
	console.log(id)

	// Get the current hours of the previously assigned receptionist
	var hoursprevmonth, hoursthismonth, hoursnextmonth
	await Receptionist.findOne({
		where: {
			id: id
		}
	})
		.then(function(receptionist) {
			hoursprevmonth = receptionist.hours_prevmonth
			hoursthismonth = receptionist.hours_thismonth
			hoursnextmonth = receptionist.hours_nextmonth
		})
	console.log("HOURS OF NEW RECEPTIONIST")
	console.log(hoursprevmonth)
	console.log(hoursthismonth)
	console.log(hoursnextmonth)

	var now = new Date()
	var scheduleEntryDate = new Date(dropdown_date)
	console.log(now)
	console.log(scheduleEntryDate)
	console.log(id)
	// Update working hours for the newly assigned person (+8h)
	if ((scheduleEntryDate.getMonth() < now.getMonth() && scheduleEntryDate.getFullYear() == now.getFullYear()) || 
		 (scheduleEntryDate.getMonth() > now.getMonth() && scheduleEntryDate.getFullYear() < now.getFullYear())) {
		await Receptionist.update({
			hours_prevmonth: hoursprevmonth + 8},
			{
			where : {
				id: id
			}
		})
	} else if (now.getMonth() == scheduleEntryDate.getMonth() && scheduleEntryDate.getFullYear() == now.getFullYear()) {
		await Receptionist.update({
			hours_thismonth: hoursthismonth + 8},
			{
			where : {
				id: id
			}
		})
	} else {
		await Receptionist.update({
			hours_nextmonth: hoursnextmonth + 8},
			{
			where : {
				id: id
			}
		})
	}
	
	// Get the current hours of the previously assigned receptionist (if there was one)
	if (prevReceptionistID != null) {
		await Receptionist.findOne({
			where: {
				id: prevReceptionistID
			}
		})
			.then(function(receptionist) {
				hoursprevmonth = receptionist.hours_prevmonth
				hoursthismonth = receptionist.hours_thismonth
				hoursnextmonth = receptionist.hours_nextmonth
			})
		console.log("HOURS OF PREVIOUS RECEPTIONIST")
		console.log(hoursprevmonth)
		console.log(hoursthismonth)
		console.log(hoursnextmonth)
	
		// Update working hours for the previously assigned person (-8h)
		if ((scheduleEntryDate.getMonth() < now.getMonth() && scheduleEntryDate.getFullYear() == now.getFullYear()) || 
			 (scheduleEntryDate.getMonth() > now.getMonth() && scheduleEntryDate.getFullYear() < now.getFullYear())) {
			await Receptionist.update({
				hours_prevmonth: hoursprevmonth - 8},
				{
				where : {
					id: prevReceptionistID
				}
			})
		} else if (now.getMonth() == scheduleEntryDate.getMonth() && scheduleEntryDate.getFullYear() == now.getFullYear()) {
			await Receptionist.update({
				hours_thismonth: hoursthismonth - 8},
				{
				where : {
					id: prevReceptionistID
				}
			})
		} else {
			await Receptionist.update({
				hours_nextmonth: hoursnextmonth - 8},
				{
				where : {
					id: prevReceptionistID
				}
			})
		}
	}

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

	await User.findOne({
		where: {firstname: firstName, lastname: lastName, receptionist_id: id}
	})
		.then(function(user) {
			id = user.id
		})

	console.log(id)

	// Send a notification to all managers
	const newNotification = Notification.build({
		recipient_class: 'receptionist',
		recipient_id: id,
		message: 'You were assigned to shift ' + dropdown_shift + ' on ' + dropdown_date,
		issue_time: new Date().toLocaleString()
	})
	await newNotification.save()
	
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

/* POST - Generate payslip */
module.exports.generatePayslip = async function(req, res) {
    var {dropdown_receptionist, dropdown_month} = req.body
    var firstName = dropdown_receptionist.split(' ')[0]
	var lastName = dropdown_receptionist.split(' ')[1]
    console.log(dropdown_receptionist)
    console.log(dropdown_month)
    // Get numeric month (0-11)
    var monthNum
    switch (dropdown_month) {
        case 'January':
            monthNum = 0;
            break;
        case 'February':
            monthNum = 1;
            break;
        case 'March':
            monthNum = 2;
            break;
        case 'April':
            monthNum = 3;
            break;
        case 'May':
            monthNum = 4;
            break;
        case 'June':
            monthNum = 5;
            break;
        case 'July':
            monthNum = 6;
            break;
        case 'August':
            monthNum = 7;
            break;
        case 'September':
            monthNum = 8;
            break;
        case 'October':
            monthNum = 9;
            break;
        case 'November':
            monthNum = 10;
            break;
        case 'December':
            monthNum = 11;
            break;
    }
    console.log(monthNum)
    // Find the receptionist
    var receptionist = await Receptionist.findOne({
        where : {
            firstname: firstName,
            lastname: lastName
        }
    })
    // console.log(receptionist)

    var now = new Date()
    var newPayslip
    // If payslip is generated for current month
    if (monthNum == now.getMonth()) {
        var id = receptionist.id
        var grosspay = (receptionist.hours_thismonth * receptionist.hourly_rate).toFixed(2)
        var tax = (grosspay / 5).toFixed(2)
        var nationalinsurance = ((grosspay - 166) / 8.5).toFixed(2)
        console.log(grosspay)
        console.log(tax)
        console.log(nationalinsurance)
        newPayslip = await Payslip.build({
			receptionist_id: id,
			firstname: receptionist.firstname,
			lastname: receptionist.lastname,
			hours: receptionist.hours_thismonth,
			rate: receptionist.hourly_rate,
            gross_pay: grosspay,
            tax: tax,
			national_insurance: nationalinsurance,
			net_pay: grosspay - tax - nationalinsurance,
            month: dropdown_month
        })
        await newPayslip.save()
    }
    
    // If payslip is generated for last month
    if (monthNum != now.getMonth()) {
        var id = receptionist.id
        var grosspay = (receptionist.hours_prevmonth * receptionist.hourly_rate).toFixed(2)
        var tax = (grosspay / 5).toFixed(2)
		var nationalinsurance = ((grosspay - 166) / 8.5).toFixed(2)
        console.log(grosspay)
        console.log(tax)
        console.log(nationalinsurance)
        newPayslip = await Payslip.build({
			receptionist_id: id,
			firstname: receptionist.firstname,
			lastname: receptionist.lastname,
			hours: receptionist.hours_prevmonth,
			rate: receptionist.hourly_rate,
            gross_pay: grosspay,
            tax: tax,
			national_insurance: nationalinsurance,
			net_pay: grosspay - tax - nationalinsurance,
            month: dropdown_month
        })
        await newPayslip.save()     
    }
	
	var id
	await User.findOne({
		where: {firstname: receptionist.firstname, lastname: receptionist.lastname, receptionist_id: receptionist.id}
	})
		.then(function(user) {
			id = user.id
		})

	// Send a notification to the receptionist who will receive the payslip
	const newNotification = Notification.build({
		recipient_class: 'receptionist',
		recipient_id: id,
		message: 'You received a new payslip! Check your payment section!',
		issue_time: new Date().toLocaleString()
	})
	await newNotification.save()

    console.log(newPayslip)
    // Load all the necessary data
    var monthsArray = await loadMonthsArray()
	var receptionistMap = await loadReceptionists()
    res.render('payment', {
        receptionistMap,
		monthsArray,
		newPayslip
    })
};

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