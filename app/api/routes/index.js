var express = require('express');
var router = express.Router();

// Require controllers
var indexController = require('../../controllers/indexController');

/* GET index page */
router.get('/', indexController.indexPage);

/* GET dashboard page */
router.get('/dashboard', verifyToken, indexController.dashboardPage);

// Verify token
function verifyToken(req, res, next) {
    console.log("REQUEST TO ACCESS DASHBOARD");
    console.log(req.headers.cookie);
    console.log(req.token);
    // Get auth header value
    var cookieHeader = req.headers.cookie;
    // Check if bearer is undefined
    if(typeof cookieHeader !== 'undefined') {
        // Header format:
        // Authorization: Bearer <access_token>
        // Split at the space to obtain token
        var cookie = cookieHeader.split(' ');
        var cookieToken = (cookie[1].split('='))[1];
        console.log(cookieToken);
        // Set the token
        req.token = cookieToken;
        console.log(req.token);
        next();
    } else {
        // Forbidden
        res.sendStatus(403);
    }
}

module.exports = router;
