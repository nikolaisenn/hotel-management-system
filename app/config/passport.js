const LocalStrategy = require('passport-local').Strategy;
const mysql = require('mysql');
const bcrypt = require('bcryptjs');

// Load User Model
const Client = require('../models/Client');

var con = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'root'
  });

module.exports = function(passport) {
    passport.use(
        new LocalStrategy({ usernameField: 'username'}, function(username, password, done) {
            // Match User
            User.findOne({ username: username})
                .then(function(user) { 
                    if(!user) {
                        return done(null, false, { message: 'That username is not registered'});
                    }

                    // Match password
                    bcrypt.compare(password, user.password, function(err, isMatch) {
                        if(err) throw err;

                        if(isMatch) {
                            return done(null, user);
                        } else {
                            return done(null, false, { message: 'Password incorrect'});
                        }
                    });  
                })
                .catch(function(err) { console.log(err) });
        })
    )

    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });
      
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });
}
