'use strict';

var bodyParser = require('body-parser');
var mysql = require('mysql');
var bcrypt = require('bcryptjs');
var Client = require('../models/Client');
var User = require('../models/User');
var passport = require('passport');
var Sequelize = require('sequelize');
var jwt = require('jsonwebtoken');


var urlencodedParser = bodyParser.urlencoded({ extended: false });

/* GET - Login page */
module.exports.loginPage = function (req, res) {
	res.render('login');
};

/* GET - Logout */
module.exports.logout = function (req, res) {
	req.flash('success_msg', 'You have successfully logged out')
	userData = 'undefined'
	userType = 'undefined'
	res.cookie('jwt', '', { httpOnly: true, secure: false, maxAge: 3600000 })
	res.redirect('/users/login')
};

/* GET - Register page */
module.exports.registerPage = function (req, res) {
	res.render('register');
};

/* GET - get all clients */
module.exports.getAllClients = function (req, res) {
	Client.findAll()
		.then(function (client) {
			console.log(client);
			res.json(client);
		})
		.catch(function (err) {
			console.log(err);
		})
}

/* POST - Register an account */
module.exports.registerAccount = function (req, res) {
	const { username, first_name, last_name, email, password, password_confirmation } = req.body;
	let errors = [];

	// Check required fields
	if (!username || !first_name || !last_name || !email || !password || !password_confirmation) {
		errors.push({ msg: 'Please fill in all fields' });
	}
	// Check username
	if (!isNaN(username)) {
		errors.push({ msg: 'Username must contain at least one character' });
	}
	// Check first name
	if (Number.isInteger(first_name)) {
		errors.push({ msg: 'Invalid first name' });
	}
	// Check passwords match
	if (password !== password_confirmation) {
		errors.push({ msg: 'Passwords do not match' });
	}
	// Check pass length
	if (password.length < 6) {
		errors.push({ msg: 'Password should be at least 6 characters' })
	}

	if (errors.length > 0) {
		res.render('register', {
			errors,
			username,
			first_name,
			last_name,
			email,
			password,
			password_confirmation
		});
	} else {
		console.log("Finding user in database...");
		const Op = Sequelize.Op;
		Client.findOne({ where: { [Op.or]: [{ username: username }, { email: email }] } })
			.then(user => {
				if (user) {
					// User Exists
					errors.push({ msg: 'Username or email is already registered' })
					res.render('register', {
						errors,
						username,
						first_name,
						last_name,
						email,
						password,
						password_confirmation
					});
				} else {
					const newClient = Client.build({
						firstname: first_name,
						lastname: last_name,
						email: email,
						username: username,
						password: password
					})
					console.log("New client details...");
					console.log(newClient);

					// Hash password
					bcrypt.genSalt(10, function (err, salt) {
						bcrypt.hash(newClient.password, salt, function (err, hash) {
							if (err) throw err;
							// Set password to hashed
							newClient.password = hash;
							// Save user
							newClient.save()
								.then(function (user) {
									// Create a flash message
									req.flash('success_msg', 'You are now registered and can log in');
									res.redirect('login');
								})
								.catch(function (err) { console.log(err) });
						})
					})
				}
			})
	}
};

/* POST - Login */

module.exports.loginAccount = function (req, res) {
	let errors = [];
	console.log("Login attempt...");
	// console.log(req.body);
	var username = req.body.username;
	var password = req.body.password;
	// Match User
	User.findOne({ where: {username: username} })
	.then(function(user) { 
		if(!user) {
			errors.push({ msg: 'That username is not registered' })
			res.render('login', {
				errors
			});
		}
		// Set user type
		userType = user.usertype
		// Match password
		bcrypt.compare(password, user.password, function(err, isMatch) {
			if(err) throw err;

			if(isMatch) {
				jwt.sign({user: user}, 'secret', function(err, token) {
					// console.log(token);
					res.cookie('jwt', token, { httpOnly: true, secure: false, maxAge: 3600000 })
					res.redirect('../dashboard');
				})
			} else {
				errors.push({ msg: 'Password incorrect' })
				res.render('login', {
					errors
				});
			}
		});  
	})
	.catch(function(err) { console.log(err) });
}