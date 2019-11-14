'use strict';

var bodyParser = require('body-parser');
var mysql = require('mysql');
var Room = require('../models/Room');
var Reservation = require('../models/Reservation');

var urlencodedParser = bodyParser.urlencoded({ extended: false });

/* GET - Accommodation page */
module.exports.accommodationPage = function(req, res) {
    res.render('accommodation', { layout: 'accommodation.ejs' });
};

/* GET - Availability page */
module.exports.availabilityPage = function(req, res) {
    var {date_checkin, date_checkout, dropdown_adult, dropdown_children} = req.body;
    console.log(date_checkin);
    console.log(date_checkout);
    console.log(dropdown_adult);
    console.log(dropdown_children);
    /* Get all rooms with capacity = adults + children */
    
    res.render('accommodation', { 
        layout: 'accommodation.ejs' 
    });
};