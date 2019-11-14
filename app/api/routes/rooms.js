var express = require('express');
var router = express.Router();

// Require controllers
var roomsController = require('../../controllers/roomsController');

/* GET accommodation page */
router.get('/accommodation', roomsController.accommodationPage);

/* GET availability page */
router.get('/availability', roomsController.availabilityPage);

module.exports = router;
