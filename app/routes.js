// routes.js - app routes

// require user and event models
var User = require('./models/user.js');
var Event = require('./models/event.js');

/////////////////////////////////////////////////////////////////////
// EMAIL AND TEXTING SETUP

//email certs
var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
	service: 'Gmail',
	auth: {
		user: 'alert@congre.us',
		pass: '<PASSWORD>' //removed for security
	}
});

//Twilio Credentials 
var accountSid = '<ACCOUNT #>'; //removed for security
var authToken = '<AUTH TOKEN>';  //removed for security
		 
//require the Twilio module and create a REST client 
var client = require('twilio')(accountSid, authToken); 

// EMAIL AND TEXTING SETUP END
/////////////////////////////////////////////////////////////////////


module.exports = function(app, passport) {

	// home page
	app.get('/', function(req, res) {

		//render the home page
		res.render('index.ejs');

	});





	// login page
	app.get('/login', function(req, res) {

		//render the login page and pass in messages
		res.render('login.ejs', { message: req.flash('loginMessage') });

	});

	// process the login request
	app.post('/login', passport.authenticate('local-login', {

		successRedirect : '/meetings',
		failureRedirect : '/login',
		failureFlash : true

	}));





	app.get('/signup', function(req, res) {

		//render the signup page and pass in messages
		res.render('signup.ejs', { message: req.flash('signupMessage') });

	});

	// post the signup form
	app.post('/signup', passport.authenticate('local-signup', {
		successRedirect : '/meetings',
		failureRedirect : '/signup',
		failureFlash : true
	}));





	app.get('/meetings', isLoggedIn, function(req, res) {

		//show all meetings and allow the user to register for them
		res.render('meetings.ejs', {
			user : req.user
		});

	});

	//add a new meeting
	app.post('/meetings', isLoggedIn, function(req, res) {

		var event = new Event();

		event.name = req.body.name;
		event.date = req.body.date;
		event.location = req.body.location;
		event.description = req.body.description;
		event.textalert = req.body.textalert;
		event.emailalert = req.body.emailalert;

		event.save(function(err) {
			if(err)
				res.send(err);

			res.redirect('/meetings');
		});

	});

		//add a user to a meeting
		app.post('/meetings/register', isLoggedIn, function(req, res) {
			
			//find the event
			Event.findById(req.body.eventid, function(err, event) {
				if(err)
					res.send(err);

				if(! event.users)
					event.users = req.body.userid;
				else
					event.users = event.users + ',' + req.body.userid;

				//save the event
				event.save(function(err) {
					if(err)
						res.send(err);

					res.redirect('/meetings');
				});

			});
		});

		//add an anon user / email to a meeting
		app.post('/meetings/registeremail', function(req, res) {
			Event.findById(req.body.eventid, function(err, event) {
				if(err)
					res.send(err);

				if(event.emails.indexOf(req.body.email) > -1) {
					res.send("Email already registered");
				} else {

					if(! event.emails)
						event.emails = req.body.email;
					else
						event.emails = event.emails + ',' + req.body.email;

					//save the event
					event.save(function(err) {
						if(err)
							res.send(err);

						res.redirect('/');
					});

				}
			});
		});

		//get all meetings
		app.get('/meetings/list', function(req, res) {

			Event.find(function(err, events) {

				if(err)
					res.send(err);

				res.json(events);

			});

		});


		///////////////////////////////////////////////////////////////////////////////////////
		// User alert function
		app.post('/meetings/notify', function(req, res) {

			//user id and emails array
			var userArray;
			var emailArray;

			Event.findById(req.body.eventid, function(err, event) {
				if(err)
					res.send(err)

				//set the user and email arrays
				userArray = event.users.split(",");
				emailArray = event.emails.split(",");

				userArray.forEach(function(element, index, array) {
					//unset user info
					var name;
					var number;
					var email;

						//find each user
						User.findById(element, function(err, user) {
							
							if(err)
								res.send(err);

							name = user.name;
							number = user.number;
							email = user.local.email;

							console.log("User info: " + name + " " + number + " " + email);

							//////////////////////////////////////////////////////////
							//Email Users
							var mailOptions = {
								from: 'alert@congre.us',
								to: email,
								subject: 'Congre.us event alert',
								text: 'Hey ' + name + ', ' + event.emailalert
							}

							transporter.sendMail(mailOptions, function(error, info) {
								if(error) {
									return console.log(error);
									res.json(error);
								}

								console.log('Message sent: ' + info.response);
								

							});
							//end email users

							/////////////////////////////////////////////////////////
							//Text Users
							client.messages.create({ 
								to: number, 
								from: "+12028997754", 
								body: 'Hey ' + name + ', ' + event.textalert,   
							}, function(err, message) { 
								console.log("Text sent: " + message.sid); 
							});


						});
				});
				
				emailArray.forEach(function(element, index, array) {
					//////////////////////////////////////////////////////////
					//Email anon
					var mailOptions = {
						from: 'alert@congre.us',
						to: element,
						subject: 'Congre.us event alert',
						text: event.emailalert
					}

					transporter.sendMail(mailOptions, function(error, info) {
						if(error) {
							return console.log(error);
							res.json(error);
						}

						console.log('Message sent: ' + info.response);
						

					});
					//end email anon
				});

			});
			
			//send the redirect
			res.redirect('/');

		});
		// End user alert function
		///////////////////////////////////////////////////////////////////////////////////////




	app.get('/createmeeting', isLoggedIn, function(req, res) {

		//let the user create a meeting with all the useful info
		res.render('createmeeting.ejs', {
			user : req.user
		});

	});


	// logout
	app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });


    // middleware to authenticate the user
    function isLoggedIn(req, res, next) {

    	//check if the user is logged in
    	if(req.isAuthenticated())
    		return next();

    	//if not, redirect to the home page
    	res.redirect('/');

    }

}