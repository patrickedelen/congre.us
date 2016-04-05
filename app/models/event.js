// event.js - event schema

var mongoose = require('mongoose');

//define model
module.exports = mongoose.model('Event', {
	name: {type: String, default: 'Houston Town Hall Meeting'},
	date: {type: Date, default: '1/1/2016'},
	location: {type: String, default: '901 Bagby St, Houston, TX 77002'},
	longitude: {type: String},
	latitude: {type: String},
	description: {type: String, default: 'A Houston town hall meeting'},
	textalert: {type: String, default: 'A town hall meeting is coming up. See https://congre.us for more info!'},
	emailalert: {type: String, default: 'A town hall meeting is coming up. See https://congre.us for more info!'},
	users: {type: String, default: '', unique: false},
	emails: {type: String, default: '', unique: false}

});