var express = require('express');
var router = express.Router();
var db = require('../../config/database');
var Client = require('../../models/Client');

/* GET login page */
router.get('/login', function(req, res, next) {
  res.render('login');
});

/* GET register page */
router.get('/register', function(req, res, next) {
  res.render('register');
});

/* GET users listing. */
router.get('/clients', function(req, res, next) {
  Client.findAll()
    .then(function(client) {
        console.log(client);
        res.sendStatus(200);
    })
    .catch(function(err) {
        console.log(err);
    })
});

module.exports = router;
