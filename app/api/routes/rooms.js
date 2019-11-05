var express = require('express');
var router = express.Router();

// Require controllers
var roomsController = require('../../controllers/roomsController');

/* GET login page */
router.get('/accommodation', roomsController.accommodationPage);

module.exports = router;
