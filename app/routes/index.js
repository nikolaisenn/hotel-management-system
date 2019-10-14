var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/index.html', function(req, res, next) {
  res.render('index');
});

/* GET accommodation page. */
router.get('/accommodation.html', function(req, res, next) {
  res.render('accommodation');
});

/* GET register page. */
router.get('/register.html', function(req, res, next) {
  res.render('register');
});

/* GET login page. */
router.get('/login.html', function(req, res, next) {
  res.render('login');
});

module.exports = router;
