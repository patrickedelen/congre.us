// server.js - nodejs app server

// require all the stuff
var express  = require('express');
var app      = express();
var port     = process.env.PORT || 3000;
var mongoose = require('mongoose');
var passport = require('passport');
var flash    = require('connect-flash');

var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');

var configDB = require('./config/db.js');

// start up mongodb
mongoose.connect(configDB.url, function(err) {
//log database status
	if(err) {
		console.log(err);
	} else {
		console.log("DB connected...");
	}
});

require('./config/passport')(passport);

// express app setup
app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser());

app.set('view engine', 'ejs');

// passport setup
app.use(session({ secret: '<SECRET KEY>' })); //removed for security
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// route file
require('./app/routes.js')(app, passport);

// node startup
app.listen(port, function(err) {
// log status
	if(err) {
		console.log(err);
	} else {
		console.log("Server active on " + port);
	}
});