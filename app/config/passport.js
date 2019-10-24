const LocalStrategy = require('passport-local').Strategy;
const mysql = require('mysql');
const bcrypt = require('bcryptjs');

var con = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'root'
  });

module.exports = function(passport) {
    passport.use(
        new LocalStrategy({ usernameField: 'username'}, function(username, password, done) {

        })
    )
}
