var express = require('express');
var router = express.Router();

// Require controllers
var staffController = require('../../controllers/staffController');

// Require database and models
var db = require('../../config/database');
var Client = require('../../models/Client');

/* GET schedule page */
router.get('/schedule', staffController.schedulePage)

/* POST modify schedule */
router.post('/modifySchedule', staffController.modifySchedule)

/* POST generate payslip */
router.post('/generatePayslip', staffController.generatePayslip);

/* POST delete outdated payslip */
router.post('/deleteOutdatedPayslip', staffController.deleteOutdatedPayslip);

module.exports = router;
