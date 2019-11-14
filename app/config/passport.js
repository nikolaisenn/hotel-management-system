const LocalStrategy = require('passport-local').Strategy;
const Sequelize = require('sequelize');
const bcrypt = require('bcryptjs');

// Load User Model
const Client = require('../models/Client');

module.exports = function(passport) {
    passport.use(
        new LocalStrategy({ usernameField: 'username'}, function(username, password, done) {
            // Match User
            Client.findOne({ where: {username: username} })
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
        console.log('Serializing user');
        done(null, user.id);
    });
      
    passport.deserializeUser(function(id, done) {
        console.log('Deserializing user');
        console.log('User ID:', id);
        Client.findByPk(id)
        .then(function(err, user) {
            console.log('User ID:', id);
            done(err, user);
        });
    });
}
