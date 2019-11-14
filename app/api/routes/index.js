var express = require('express');
var router = express.Router();
var { ensureAuthenticated } = require('../../config/auth');

// Require controllers
var indexController = require('../../controllers/indexController');

/* GET index page */
router.get('/', indexController.indexPage);

/* GET dashboard page */
router.get('/dashboard', ensureAuthenticated, indexController.dashboardPage);


module.exports = router;
