// user.js - user schema

var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

// define schema for the user
var userSchema = mongoose.Schema({

	local : {
		email : String,
		password : String,
	},
	name: {type: String, default: '', unique: false},
	number: {type: String, default: '', unique: false},
	pctnumber: {type: String, default: '1', unique: false}
});

// generate password hash
userSchema.methods.generateHash = function(password) {
	return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// check if password is correct
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

//create the model
module.exports = mongoose.model('User', userSchema);
