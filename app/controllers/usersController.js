'use strict';

var bodyParser = require('body-parser');
var mysql = require('mysql');
var bcrypt = require('bcryptjs');
var Client = require('../models/Client');
var passport = require('passport');
var Sequelize = require('sequelize');


var urlencodedParser = bodyParser.urlencoded({ extended: false });

/* GET - Login page */
module.exports.loginPage = function(req, res) {
    res.render('login', { layout: 'login.ejs'});
};

/* GET - Register page */
module.exports.registerPage = function(req, res) {
    res.render('register', { layout: 'register.ejs' });
};

/* GET - Dashboard page */
module.exports.dashboardPage = function(req, res) {
    res.render('dashboard', { layout: 'dashboard.ejs' });
    console.log(req.session.passport.user);
};

/* GET - get all clients */
module.exports.getAllClients = function(req, res) {
    Client.findAll()
    .then(function(client) {
        console.log(client);
        res.json(client);
    })
    .catch(function(err) {
        console.log(err);
    })
}

/* POST - Register an account */
module.exports.registerAccount = function(req, res) {
    const {username, first_name, last_name, email, password, password_confirmation} = req.body;
    let errors = [];
    req.flash('success_msg', 'You are now registered and can log in');

    // Check required fields
    if(!username || !first_name || !last_name || !email || !password || !password_confirmation) {
        errors.push({ msg: 'Please fill in all fields'});
    }
    // Check username
    if (!isNaN(username)){
        errors.push({ msg: 'Username must contain at least one character'});
    }
    // Check first name
    if (Number.isInteger(first_name)){
        errors.push({ msg: 'Invalid first name'});
    }
    // Check passwords match
    if(password !== password_confirmation) {
        errors.push({ msg: 'Passwords do not match'});
    }
    // Check pass length
    if(password.length < 6) {
        errors.push({ msg: 'Password should be at least 6 characters'})
    }

    if(errors.length > 0) {
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
        Client.findOne({ where: {[Op.or]: [{username: username}, {email: email}]} })
            .then(user => {
                if(user) {
                    // User Exists
                    errors.push({ msg: 'Username or email is already registered'})
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
                    bcrypt.genSalt(10, function(err, salt) {
                        bcrypt.hash(newClient.password, salt, function(err, hash) {
                            if(err) throw err;
                            // Set password to hashed
                            newClient.password = hash;
                            // Save user
                            newClient.save()
                                .then(function(user) {
                                    // Create a flash message
                                    req.flash('success_msg', 'You are now registered and can log in');
                                    res.redirect('login');
                                })
                                .catch(function(err) { console.log(err)} );
                        })
                    })
                }
            })
        // // Connect to the database
        // var con = mysql.createConnection({
        //     host: "localhost",
        //     user: "root",
        //     password: "root",
        //     database: "hotel-management"
        // });

        // con.connect(function(err) {
        //     if(err) throw err;
        //     console.log("Connected!");
        //     var hashed;
            
        //     // Encrypt the password
        //     function encryptPassword(callback) {
        //         bcrypt.genSalt(10, function(err, salt) {
        //             bcrypt.hash(req.body.password, salt, function(err, hash) {
        //                 // Store hash in your password DB.
        //                 hashed = hash;
        //                 callback(hashed);
        //             });
        //         });
        //     }
            
        //     // Store the model into the db 
        //     encryptPassword(function(hashed) {
        //         var sql = "INSERT INTO `clients` (`firstname`, `lastname`, `email`, `username`, `password`, `address`, `id`) " + 
        //                     "VALUES ('"+req.body.first_name+"', '"+req.body.last_name+"', '"+req.body.email+"', " +
        //                     " '"+req.body.username+"', '"+hashed+"', NULL, NULL)";
        //         console.log(sql);

        //         con.query(sql, function(err, result) {
        //             console.log(result);
        //             if(err) throw err;
        //         });
        //     })
        // });
    }
};

/* POST - Login */

module.exports.loginAccount = function (req, res, next) {
    passport.authenticate('local', function(err, user, info){
        if (err) { return next(err); }
        if (!user) { return res.redirect('/login'); }
        req.logIn(user, function(err) {
            if (err) { return next(err); }
            console.log('[Controller] is authenticated?: ' + req.isAuthenticated());
            if (req.isAuthenticated()){
                res.redirect('/users/dashboard');
                console.log("Going to dashboard");
            }
            else{
                res.redirect('/users/loginnnnn');
                console.log("Going to login");
            }
            return next();
        });
    }) (req, res, next);
}