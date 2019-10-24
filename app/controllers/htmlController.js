'use strict';

var bodyParser = require('body-parser');
var mysql = require('mysql');
var bcrypt = require('bcryptjs');


var urlencodedParser = bodyParser.urlencoded({ extended: false });

module.exports = function(app) {

    /* Registration */
    app.post('/register', urlencodedParser, function(req, res) {
        
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
                        console.log("Before encryption: " + hashed);
                        callback(hashed);
                    });
                });
            }
            
            // Store the model into the db 
            encryptPassword(function(hashed) {
                console.log("After encryption: " + hashed);
                var sql = "INSERT INTO `clients` (`firstname`, `lastname`, `email`, `username`, `password`, `address`, `client_id`) " + 
                            "VALUES ('"+req.body.first_name+"', '"+req.body.last_name+"', '"+req.body.email+"', " +
                            " '"+req.body.username+"', '"+hashed+"', NULL, NULL)";
                console.log(sql);

                con.query(sql, function(err, result) {
                    console.log(result);
                    if(err) throw err;
                });
            })
        });
    });

    /* Login */
    app.post('/auth', urlencodedParser, function(req, res) {

        var con = mysql.createConnection({
            host: "localhost",
            user: "root",
            password: "root",
            database: "hotel-management"
        });

        con.connect(function(err) {
            if(err) throw err;
            console.log("Connected!");

            var hashedPassword;
            var sql = "SELECT password FROM `clients` WHERE `username`='"+req.body.username+"'";
            console.log(sql);
            
            // Decrypt the password
            function decryptPassword(callback) {
                con.query(sql, function(err, result) {
                    console.log(result);
                    if(err) throw err;
                    
                    hashedPassword = result[0].password;
                    console.log("Before decryption: " + hashedPassword); 
                    callback(hashedPassword);
                })
            }

            // Verify login
            decryptPassword(function(hashedPassword) {
                console.log("After decryption: " + hashedPassword);
                bcrypt.compare(req.body.password, hashedPassword, function(err, isMatch) {
                    if(err) throw err;
    
                    if(isMatch){
                        sql = "SELECT username, password FROM `clients` WHERE `username`='"+req.body.username+"' and password = '"+hashedPassword+"'";
                        console.log(sql);
    
                        con.query(sql, function(err, result) {
                            console.log(result);
                            if(err) throw err;
                            
                            if(result[0] != undefined && result[0].username == req.body.username && result[0].password == hashedPassword){
                                res.render('index');
                            }
                            else res.render('login');
                        });
                    }
                });
            })
        });
    })
}