var express = require('express');
var router = express.Router();

// Require controllers
var indexController = require('../../controllers/indexController');

/* GET index page */
router.get('/', indexController.indexPage);

/* GET dashboard page */
router.get('/dashboard', verifyToken, indexController.dashboardPage);

/* GET notifications page */
router.get('/dashboard/notifications', verifyToken, indexController.notificationsPage);

/* GET payslip page */
router.get('/dashboard/payment', verifyToken, indexController.paymentPage);

/* GET progress page */
router.get('/dashboard/progress', verifyToken, indexController.progressPage);

/* GET reservations page */
router.get('/dashboard/reservations', verifyToken, indexController.reservationsPage);

/* GET settings page */
router.get('/dashboard/settings', verifyToken, indexController.settingsPage);

// Verify token
function verifyToken(req, res, next) {
    // console.log("REQUEST TO ACCESS DASHBOARD");
    // console.log(req.headers.cookie);
    // console.log(req.token);
    // Get auth header value
    var cookieHeader = req.headers.cookie;
    // Check if bearer is undefined
    if(typeof cookieHeader !== 'undefined') {
        // Header format:
        // Authorization: Bearer <access_token>
        // Split at the space to obtain token
        var cookie = cookieHeader.split('jwt=');
        // console.log(cookie)
        var jwtToken = cookie[1];
        // console.log("JWT token")
        // console.log(jwtToken)
        // Set the token
        req.token = jwtToken;
        next();
    } else {
        // Forbidden
        res.sendStatus(403);
    }
}

module.exports = router;
