'use strict';

var bodyParser = require('body-parser');
var mysql = require('mysql');
var bcrypt = require('bcryptjs');
var Client = require('../models/Client');
var passport = require('passport');


var urlencodedParser = bodyParser.urlencoded({ extended: false });

/* GET - Login page */
module.exports.loginPage = function(req, res) {
    res.render('login');
};

/* GET - Register page */
module.exports.registerPage = function(req, res) {
    res.render('register');
};

/* GET - get all clients */
module.exports.getAllClients = function(req, res) {
    Client.findAll()
    .then(function(client) {
        console.log(client);
        res.sendStatus(200);
    })
    .catch(function(err) {
        console.log(err);
    })
}

/* POST - Register an account */
module.exports.registerAccount = function(req, res) {
    
    const {username, first_name, last_name, email, password, password_confirmation} = req.body;
    let errors = [];

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
        // Connect to the database
        var con = mysql.createConnection({
            host: "localhost",
            user: "root",
            password: "root",
            database: "hotel-management"
        });

        con.connect(function(err) {
            if(err) throw err;
            console.log("Connected!");
            var hashed;
            
            // Encrypt the password
            function encryptPassword(callback) {
                bcrypt.genSalt(10, function(err, salt) {
                    bcrypt.hash(req.body.password, salt, function(err, hash) {
                        // Store hash in your password DB.
                        hashed = hash;
                        callback(hashed);
                    });
                });
            }
            
            // Store the model into the db 
            encryptPassword(function(hashed) {
                var sql = "INSERT INTO `clients` (`firstname`, `lastname`, `email`, `username`, `password`, `address`, `id`) " + 
                            "VALUES ('"+req.body.first_name+"', '"+req.body.last_name+"', '"+req.body.email+"', " +
                            " '"+req.body.username+"', '"+hashed+"', NULL, NULL)";
                console.log(sql);

                con.query(sql, function(err, result) {
                    console.log(result);
                    if(err) throw err;
                });
            })
        });
    }
};

/* POST - Login */

module.exports.loginAccount = function (req, res, next) {

    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/users/login',
        failureFlash: false,
        successFlash: false
    }) (req, res, next);
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

    //     var hashedPassword;
    //     var sql = "SELECT password FROM `clients` WHERE `username`='"+req.body.username+"'";
    //     console.log(sql);
        
    //     // Decrypt the password
    //     function decryptPassword(callback) {
    //         con.query(sql, function(err, result) {
    //             console.log(result);
    //             if(err) throw err;
                
    //             hashedPassword = result[0].password;
    //             callback(hashedPassword);
    //         })
    //     }

    //     // Verify login
    //     decryptPassword(function(hashedPassword) {
    //         bcrypt.compare(req.body.password, hashedPassword, function(err, isMatch) {
    //             if(err) throw err;

    //             if(isMatch){
    //                 sql = "SELECT username, password FROM `clients` WHERE `username`='"+req.body.username+"' and password = '"+hashedPassword+"'";
    //                 console.log(sql);

    //                 con.query(sql, function(err, result) {
    //                     console.log(result);
    //                     if(err) throw err;
                        
    //                     if(result[0] != undefined && result[0].username == req.body.username && result[0].password == hashedPassword){
    //                         res.render('index');
    //                     }
    //                     else res.render('login');
    //                 });
    //             }
    //         });
    //     })
    // });
}