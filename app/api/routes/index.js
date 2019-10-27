var express = require('express');
var router = express.Router();

// Require controllers
var indexController = require('../../controllers/indexController');

/* GET index page */
router.get('/', indexController.indexPage);

module.exports = router;
