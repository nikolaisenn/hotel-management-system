var express = require('express');
var router = express.Router();

// Require controllers
var usersController = require('../../controllers/usersController');

// Require database and models
var db = require('../../config/database');
var Client = require('../../models/Client');

/* GET login page */
router.get('/login', usersController.loginPage);

/* GET register page */
router.get('/register', usersController.registerPage);

/* GET users listing. */
router.get('/clients', usersController.getAllClients);

/* POST register an account */
router.post('/login', usersController.loginAccount);

/* POST register an account */
router.post('/register', usersController.registerAccount);

module.exports = router;
