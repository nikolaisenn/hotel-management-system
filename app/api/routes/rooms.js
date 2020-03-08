var express = require('express');
var router = express.Router();

// Require controllers
var roomsController = require('../../controllers/roomsController');

/* GET accommodation page */
router.get('/accommodation', roomsController.accommodationPage);

/* GET pricing page */
router.get('/pricing', roomsController.pricingPage);

/* POST get availability page */
router.post('/availability', roomsController.availabilityPage);

/* POST edit room price */
router.post('/editPrice', roomsController.editPrice);

/* POST edit room price - owner */
router.post('/editPriceOwner', roomsController.editPriceOwner);

/* POST room information */
router.post('/roomInformation', roomsController.roomInformation);

/* POST booking */
router.post('/booking', roomsController.booking);

/* POST receptionist booking a room for a customer*/
router.post('/receptionistBooking', roomsController.receptionistBooking);

module.exports = router;
