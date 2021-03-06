var express = require('express');
var router = express.Router();

// Require controllers
var roomsController = require('../../controllers/roomsController');

/* GET accommodation page */
router.get('/accommodation', roomsController.accommodationPage);

/* GET availability page */
router.post('/availability', roomsController.availabilityPage);

/* POST booking */
router.post('/booking', roomsController.booking);

module.exports = router;
