// passport.js - handle user auth

// load stuff
var LocalStrategy   = require('passport-local').Strategy;
var User = require('../app/models/user');

// create the module
module.exports = function(passport) {

	// serialize the user for session data
	passport.serializeUser(function(user, done) {

		done(null, user.id);

	});

	// deserialize the user for use other places
	passport.deserializeUser(function(id, done) {

        User.findById(id, function(err, user) {
            done(err, user);
        });

    });

    // signup the users locally
    passport.use('local-signup', new LocalStrategy({

    	usernameField : 'email',
    	passwordField : 'password',
    	passReqToCallback : true

    }, function(req, email, password, done) {

    	//process the data
    	process.nextTick(function() {

    		User.findOne({ 'local.email' : email }, function(err, user) {

    			if(err)
    				return done(err);

    			if(user) {

    				//if a user is already registered with that email send an error
    				return done(null, false, req.flash( 'signupMessage', 'That email is already registered.' ));
    			
    			} else {

    				//if not, register the user

    				var newUser = new User();

    				//add the user login info
    				newUser.local.email = email;
    				newUser.local.password = newUser.generateHash(password);

    				//add the user personal info
    				newUser.name = req.body.name;
    				newUser.number = req.body.number;
    				newUser.pctnumber = req.body.pctnumber;

    				//save the user
	                newUser.save(function(err) {

	                    if (err)
	                        throw err;
	                    
	                    return done(null, newUser);

	                });

    			}

    		});

    	});

    }));

	
	// log the users in
	passport.use('local-login', new LocalStrategy({

		usernameField : 'email',
    	passwordField : 'password',
    	passReqToCallback : true

	},
	function(req, email, password, done) {

		//find the user if one exists
		User.findOne({ 'local.email' : email }, function(err, user) {

			if(err)
				return done(err);

			if(!user)
				return done(null, false, req.flash('loginMessage', 'No user found.'));

			if(!user.validPassword(password))
				return done(null, false, req.flash('loginMessage', 'Incorrect password.'));

			//everything works
			return done(null, user);

		});

	}));

};