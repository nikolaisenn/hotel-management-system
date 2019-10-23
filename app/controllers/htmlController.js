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
            
            // Hash password
            // Generate a salt
            var salt = bcrypt.genSaltSync(10);
            // Hash the password with salt
            var hash = bcrypt.hashSync("my password", salt);

            // var hashedPassword;
            // bcrypt.genSalt(10, function(err, salt) {
            //     bcrypt.hash(req.body.password, salt, function(err, hash) {
            //         if(err) throw err;
            //         hashedPassword = hash;
            //     })
            // })
            // console.log(hashedPassword);
            var sql = "INSERT INTO `client` (`firstname`, `lastname`, `email`, `username`, `password`, `address`, `client_id`) " + 
                    "VALUES ('"+req.body.first_name+"', '"+req.body.last_name+"', '"+req.body.email+"', " +
                            " '"+req.body.username+"', '"+hash+"', NULL, NULL)";
            console.log(sql);

            con.query(sql, function(err, result) {
                console.log(result);
                if(err) throw err;
            });
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
            
            var sql = "SELECT username, password FROM `client` WHERE `username`='"+req.body.username+"' and password = '"+req.body.password+"'";
            console.log(sql);

            con.query(sql, function(err, result) {
                console.log(result);
                if(err) throw err;

                if(result[0] != undefined && result[0].username == req.body.username && result[0].password == req.body.password){
                    res.render('index');
                }
                else res.render('login');
            });
        });
    });
}