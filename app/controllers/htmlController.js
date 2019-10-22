'use strict';

var bodyParser = require('body-parser');
var mysql = require('mysql');

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
            
            var sql = "INSERT INTO `client` (`firstname`, `lastname`, `email`, `username`, `password`, `address`, `client_id`) " + 
                    "VALUES ('"+req.body.first_name+"', '"+req.body.last_name+"', '"+req.body.email+"', " +
                            " '"+req.body.username+"', '"+req.body.password+"', NULL, NULL)";
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