var express = require('express');
var router = express.Router();

// Require controllers
var actionsController = require('../../controllers/actionsController');

// Require database and models
var db = require('../../config/database');
var Client = require('../../models/Client');

/* POST delete notification */
router.post('/deleteNotification', actionsController.deleteNotification);

/* POST cancel reservation */
router.post('/cancelReservation', actionsController.cancelReservation);

/* POST publish announcement */
router.post('/publishAnnouncement', actionsController.publishAnnouncement);

module.exports = router;
