var express = require('express');
var router = express.Router();

// Require controllers
var staffController = require('../../controllers/staffController');

// Require database and models
var db = require('../../config/database');
var Client = require('../../models/Client');

/* GET schedule page */
router.get('/schedule', staffController.schedulePage)

module.exports = router;
